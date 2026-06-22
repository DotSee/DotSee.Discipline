using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using DotSee.Discipline.AiSummary;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace DotSee.Discipline.Backoffice.ApiControllers
{
    /// <summary>
    /// Management API for the DotSee.Discipline backoffice settings UI.
    /// </summary>
    [ApiController]
    [Route("umbraco/api/discipline")]
    [Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
    public class DisciplineSettingsController : ControllerBase
    {
        /// <summary>
        /// appsettings key that controls whether the backoffice UI is rendered at all.
        /// Defaults to true when missing.
        /// </summary>
        public const string UiEnabledConfigKey = "DotSee.Discipline:Backoffice:Enabled";

        /// <summary>
        /// Placeholder sent to the UI in place of a stored API key, so the real secret never reaches
        /// the browser. When the UI sends this value back unchanged, the stored key is preserved.
        /// </summary>
        private const string MaskedApiKey = "********";

        private readonly IDisciplineSettingsStore _store;
        private readonly IDisciplineAppSettingsReader _appSettingsReader;
        private readonly IDisciplineSettingsResolver _settingsResolver;
        private readonly IConfiguration _configuration;
        private readonly IContentTypeService _contentTypeService;
        private readonly IContentService _contentService;
        private readonly ILocalizedTextService _localizedTextService;
        private readonly IAiModelCatalogService _aiModelCatalog;
        private readonly ILogger<DisciplineSettingsController> _logger;

        public DisciplineSettingsController(
            IDisciplineSettingsStore store,
            IDisciplineAppSettingsReader appSettingsReader,
            IDisciplineSettingsResolver settingsResolver,
            IConfiguration configuration,
            IContentTypeService contentTypeService,
            IContentService contentService,
            ILocalizedTextService localizedTextService,
            IAiModelCatalogService aiModelCatalog,
            ILogger<DisciplineSettingsController> logger)
        {
            _store = store;
            _appSettingsReader = appSettingsReader;
            _settingsResolver = settingsResolver;
            _configuration = configuration;
            _contentTypeService = contentTypeService;
            _contentService = contentService;
            _localizedTextService = localizedTextService;
            _aiModelCatalog = aiModelCatalog;
            _logger = logger;
        }

        [HttpGet("settings")]
        [ProducesResponseType(typeof(DisciplineSettingsResponse), StatusCodes.Status200OK)]
        public IActionResult GetSettings()
        {
            return Ok(BuildResponse(_store.Load()));
        }

        [HttpPut("settings")]
        [Authorize(Policy = AuthorizationPolicies.SectionAccessSettings)]
        [ProducesResponseType(typeof(DisciplineSettingsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult SaveSettings([FromBody] DisciplineSettings settings)
        {
            if (settings == null)
            {
                return BadRequest(_localizedTextService.Localize("dotseeDiscipline", "apiSettingsRequired", CultureInfo.CurrentUICulture));
            }

            // The UI never receives the real API key (it gets a mask). If it sends the mask back
            // unchanged, keep the currently-stored key instead of overwriting it with the placeholder.
            if (settings.AiSummary != null && settings.AiSummary.ApiKey == MaskedApiKey)
            {
                settings.AiSummary.ApiKey = _store.Load().AiSummary?.ApiKey ?? string.Empty;
            }

            _store.Save(settings);
            _settingsResolver.NotifySettingsChanged();
            return Ok(BuildResponse(settings));
        }

        [HttpGet("appsettings-snapshot")]
        [ProducesResponseType(typeof(DisciplineSettings), StatusCodes.Status200OK)]
        public IActionResult GetAppSettingsSnapshot()
        {
            return Ok(WithMaskedApiKey(_appSettingsReader.Read()));
        }

        [HttpPost("import-from-appsettings")]
        [Authorize(Policy = AuthorizationPolicies.SectionAccessSettings)]
        [ProducesResponseType(typeof(DisciplineSettingsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public IActionResult ImportFromAppSettings()
        {
            if (!_appSettingsReader.HasAppSettings())
            {
                return Conflict(_localizedTextService.Localize("dotseeDiscipline", "apiNoAppsettingsFound", CultureInfo.CurrentUICulture));
            }

            var snapshot = _appSettingsReader.Read();
            var current = _store.Load();
            // Preserve the master toggle — importing appsettings values shouldn't silently
            // switch on the backoffice source.
            snapshot.UseBackoffice = current.UseBackoffice;

            _store.Save(snapshot);
            _settingsResolver.NotifySettingsChanged();
            return Ok(BuildResponse(snapshot));
        }

        [HttpGet("doctypes")]
        [ProducesResponseType(typeof(IEnumerable<DocTypeOption>), StatusCodes.Status200OK)]
        public IActionResult GetDocTypes()
        {
            var options = _contentTypeService.GetAll()
                .Select(ct => new DocTypeOption { Name = ct.Name ?? ct.Alias, Alias = ct.Alias })
                .OrderBy(o => o.Name, StringComparer.OrdinalIgnoreCase)
                .ToList();
            return Ok(options);
        }

        [HttpGet("blueprints")]
        [ProducesResponseType(typeof(IEnumerable<BlueprintOption>), StatusCodes.Status200OK)]
        public IActionResult GetBlueprints()
        {
            var contentTypesByAlias = _contentTypeService.GetAll()
                .ToDictionary(ct => ct.Id, ct => ct.Alias);

            var blueprints = _contentService.GetBlueprintsForContentTypes()
                .Where(bp => contentTypesByAlias.ContainsKey(bp.ContentTypeId))
                .Select(bp => new BlueprintOption
                {
                    Name = bp.Name ?? string.Empty,
                    DocTypeAlias = contentTypesByAlias[bp.ContentTypeId],
                })
                .Where(o => !string.IsNullOrWhiteSpace(o.Name))
                .OrderBy(o => o.Name, StringComparer.OrdinalIgnoreCase)
                .ToList();

            return Ok(blueprints);
        }

        [HttpGet("properties/truefalse")]
        [ProducesResponseType(typeof(IEnumerable<PropertyOption>), StatusCodes.Status200OK)]
        public IActionResult GetTrueFalseProperties()
        {
            return Ok(GetPropertiesByEditorAliases("Umbraco.TrueFalse"));
        }

        [HttpGet("properties/text-content")]
        [ProducesResponseType(typeof(IEnumerable<PropertyOption>), StatusCodes.Status200OK)]
        public IActionResult GetTextContentProperties()
        {
            return Ok(GetPropertiesByEditorAliases(
                "Umbraco.RichText",
                "Umbraco.TinyMCE",
                "Umbraco.TextBox",
                "Umbraco.TextArea"));
        }

        [HttpGet("properties/text-input")]
        [ProducesResponseType(typeof(IEnumerable<PropertyOption>), StatusCodes.Status200OK)]
        public IActionResult GetTextInputProperties()
        {
            return Ok(GetPropertiesByEditorAliases("Umbraco.TextBox", "Umbraco.TextArea"));
        }

        /// <summary>
        /// Lists the available chat models for the selected AiSummary LLM, used to populate the model
        /// dropdown. Requires the API key (supplied from the settings form) to query the provider.
        /// </summary>
        [HttpPost("aisummary/models")]
        [Authorize(Policy = AuthorizationPolicies.SectionAccessSettings)]
        [ProducesResponseType(typeof(AiModelListResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetAiSummaryModels([FromBody] AiSummaryModelsRequest request, CancellationToken cancellationToken)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.ApiKey))
            {
                return BadRequest(new { message = _localizedTextService.Localize("dotseeDiscipline", "aiSummaryModelsApiKeyRequired", CultureInfo.CurrentUICulture) });
            }

            // The settings form holds a mask in place of the saved key; resolve it to the real,
            // decrypted key so the provider can be queried without ever exposing the key to the UI.
            var apiKey = request.ApiKey == MaskedApiKey
                ? _store.Load().AiSummary?.ApiKey ?? string.Empty
                : request.ApiKey;

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return BadRequest(new { message = _localizedTextService.Localize("dotseeDiscipline", "aiSummaryModelsApiKeyRequired", CultureInfo.CurrentUICulture) });
            }

            try
            {
                AiModelListResult result = await _aiModelCatalog.GetModelsAsync(request.Llm, apiKey, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // Log the real provider reason for diagnostics, but show only a generic message to the editor.
                _logger.LogWarning(ex, "DotSee.Discipline: could not load AiSummary models for LLM '{Llm}'.", request.Llm);
                return BadRequest(new
                {
                    message = _localizedTextService.Localize("dotseeDiscipline", "aiSummaryModelsLoadFailed", CultureInfo.CurrentUICulture),
                });
            }
        }

        private List<PropertyOption> GetPropertiesByEditorAliases(params string[] editorAliases)
        {
            var aliasSet = new HashSet<string>(editorAliases, StringComparer.OrdinalIgnoreCase);
            return _contentTypeService.GetAll()
                .SelectMany(ct => ct.CompositionPropertyTypes)
                .Where(pt => aliasSet.Contains(pt.PropertyEditorAlias))
                .GroupBy(pt => pt.Alias, StringComparer.OrdinalIgnoreCase)
                .Select(g => new PropertyOption
                {
                    Alias = g.Key,
                    Name = g.Select(p => p.Name).FirstOrDefault(n => !string.IsNullOrWhiteSpace(n)) ?? g.Key,
                })
                .OrderBy(o => o.Name, StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        private DisciplineSettingsResponse BuildResponse(DisciplineSettings settings)
        {
            return new DisciplineSettingsResponse
            {
                UiEnabled = IsUiEnabled(),
                HasAppSettings = _appSettingsReader.HasAppSettings(),
                Settings = WithMaskedApiKey(settings),
            };
        }

        /// <summary>
        /// Returns a clone of the settings with the AiSummary API key replaced by a mask, so the
        /// real key is never serialized to the browser. The cloning leaves the in-memory cache
        /// (which holds the real, decrypted key for the feature handlers) untouched.
        /// </summary>
        private static DisciplineSettings WithMaskedApiKey(DisciplineSettings settings)
        {
            if (settings == null)
            {
                return settings;
            }

            var clone = JsonSerializer.Deserialize<DisciplineSettings>(JsonSerializer.Serialize(settings))!;
            if (clone.AiSummary != null && !string.IsNullOrEmpty(clone.AiSummary.ApiKey))
            {
                clone.AiSummary.ApiKey = MaskedApiKey;
            }

            return clone;
        }

        private bool IsUiEnabled()
        {
            var raw = _configuration[UiEnabledConfigKey];
            if (string.IsNullOrWhiteSpace(raw)) return true;
            return !raw.Equals("false", StringComparison.OrdinalIgnoreCase);
        }
    }

    public class DisciplineSettingsResponse
    {
        public bool UiEnabled { get; set; }
        public bool HasAppSettings { get; set; }
        public DisciplineSettings Settings { get; set; }
    }

    public class DocTypeOption
    {
        public string Name { get; set; } = string.Empty;
        public string Alias { get; set; } = string.Empty;
    }

    public class PropertyOption
    {
        public string Name { get; set; } = string.Empty;
        public string Alias { get; set; } = string.Empty;
    }

    public class BlueprintOption
    {
        public string Name { get; set; } = string.Empty;
        public string DocTypeAlias { get; set; } = string.Empty;
    }

    public class AiSummaryModelsRequest
    {
        public string Llm { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
    }
}
