using System;
using System.IO;
using System.Text.Json;
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
        private readonly object _gate = new();

        private DisciplineSettings _cached;

        public DisciplineSettingsStore(IWebHostEnvironment hostingEnvironment, ILogger logger)
        {
            _hostingEnvironment = hostingEnvironment;
            _logger = logger;
        }

        public DisciplineSettings Load()
        {
            if (_cached != null) return _cached;

            lock (_gate)
            {
                if (_cached != null) return _cached;

                var path = GetFilePath();
                if (!File.Exists(path))
                {
                    _cached = new DisciplineSettings();
                    return _cached;
                }

                try
                {
                    var json = File.ReadAllText(path);
                    _cached = JsonSerializer.Deserialize<DisciplineSettings>(json, SerializerOptions)
                              ?? new DisciplineSettings();
                }
                catch (Exception ex)
                {
                    _logger.Error(ex, "Failed to read DotSee.Discipline backoffice settings from {Path}. Falling back to defaults.", path);
                    _cached = new DisciplineSettings();
                }

                return _cached;
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

                var json = JsonSerializer.Serialize(settings, SerializerOptions);
                File.WriteAllText(path, json);
                _cached = settings;
            }
        }

        private string GetFilePath()
        {
            return Path.Combine(_hostingEnvironment.ContentRootPath, RelativeFolder, FileName);
        }
    }
}
