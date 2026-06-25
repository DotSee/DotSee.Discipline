using System;
using System.IO;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Serilog;

namespace DotSee.Discipline.Backoffice
{
    /// <summary>
    /// Persists <see cref="DisciplineSettings"/> to a JSON file under umbraco/Data.
    /// Thread-safe via a simple lock.
    /// </summary>
    public class DisciplineSettingsStore : IDisciplineSettingsStore
    {
        private const string RelativeFolder = "umbraco/Data/DotSee.Discipline";
        private const string FileName = "settings.json";

        private static readonly JsonSerializerOptions SerializerOptions = new()
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true,
        };

        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly ILogger _logger;
        private readonly IDataProtector _protector;
        private readonly object _gate = new();

        private DisciplineSettings _cached;

        public DisciplineSettingsStore(
            IWebHostEnvironment hostingEnvironment,
            ILogger logger,
            IDataProtectionProvider dataProtectionProvider)
        {
            _hostingEnvironment = hostingEnvironment;
            _logger = logger;
            _protector = dataProtectionProvider.CreateProtector("DotSee.Discipline.Settings.ApiKey");
        }

        public DisciplineSettings Load()
        {
            // Clone on egress so callers can't mutate the protected cached state. (A cached object
            // is never mutated after publication, so cloning the captured reference is race-safe.)
            var cached = _cached;
            if (cached != null) return Clone(cached);

            lock (_gate)
            {
                if (_cached == null)
                {
                    var path = GetFilePath();
                    if (!File.Exists(path))
                    {
                        _cached = new DisciplineSettings();
                    }
                    else
                    {
                        try
                        {
                            var json = File.ReadAllText(path);
                            _cached = JsonSerializer.Deserialize<DisciplineSettings>(json, SerializerOptions)
                                      ?? new DisciplineSettings();

                            // The API key is stored encrypted at rest; decrypt it for in-memory use.
                            if (_cached.AiSummary != null)
                            {
                                _cached.AiSummary.ApiKey = Unprotect(_cached.AiSummary.ApiKey);
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.Error(ex, "Failed to read DotSee.Discipline backoffice settings from {Path}. Falling back to defaults.", path);
                            _cached = new DisciplineSettings();
                        }
                    }
                }

                return Clone(_cached);
            }
        }

        public void Save(DisciplineSettings settings)
        {
            if (settings == null) throw new ArgumentNullException(nameof(settings));

            lock (_gate)
            {
                var path = GetFilePath();
                var dir = Path.GetDirectoryName(path);
                if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }

                // Persist the API key encrypted at rest, but keep the plaintext value in memory so
                // the feature handlers and the settings UI continue to work with the real key.
                var plaintextApiKey = settings.AiSummary?.ApiKey;
                try
                {
                    if (settings.AiSummary != null)
                    {
                        settings.AiSummary.ApiKey = Protect(plaintextApiKey);
                    }

                    var json = JsonSerializer.Serialize(settings, SerializerOptions);

                    // Write to a temp file in the same directory, then atomically swap it into
                    // place, so an interrupted write can never leave settings.json partially
                    // written or corrupted. File.Replace needs an existing target, so fall back
                    // to File.Move on the first-ever save.
                    var tempPath = path + ".tmp";
                    File.WriteAllText(tempPath, json);
                    if (File.Exists(path))
                    {
                        File.Replace(tempPath, path, null);
                    }
                    else
                    {
                        File.Move(tempPath, path);
                    }
                }
                finally
                {
                    if (settings.AiSummary != null)
                    {
                        settings.AiSummary.ApiKey = plaintextApiKey;
                    }
                }

                // Clone on ingress so the caller can't mutate the cached state after saving.
                _cached = Clone(settings);
            }
        }

        // Deep-clones via a JSON round-trip so the cache is isolated from caller-held references.
        private static DisciplineSettings Clone(DisciplineSettings settings)
        {
            return JsonSerializer.Deserialize<DisciplineSettings>(
                       JsonSerializer.Serialize(settings, SerializerOptions), SerializerOptions)
                   ?? new DisciplineSettings();
        }

        private string GetFilePath()
        {
            return Path.Combine(_hostingEnvironment.ContentRootPath, RelativeFolder, FileName);
        }

        private string Protect(string value)
        {
            return string.IsNullOrEmpty(value) ? value : _protector.Protect(value);
        }

        private string Unprotect(string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return value;
            }

            try
            {
                return _protector.Unprotect(value);
            }
            catch (Exception)
            {
                // Not a protected value (e.g. a legacy plaintext key, or one set directly in the
                // file). Use it as-is; it is re-encrypted on the next save.
                return value;
            }
        }
    }
}
