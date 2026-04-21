using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
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

        private readonly IDisciplineSettingsStore _store;
        private readonly IDisciplineAppSettingsReader _appSettingsReader;
        private readonly IConfiguration _configuration;
        private readonly IContentTypeService _contentTypeService;

        public DisciplineSettingsController(
            IDisciplineSettingsStore store,
            IDisciplineAppSettingsReader appSettingsReader,
            IConfiguration configuration,
            IContentTypeService contentTypeService)
        {
            _store = store;
            _appSettingsReader = appSettingsReader;
            _configuration = configuration;
            _contentTypeService = contentTypeService;
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
                return BadRequest("Settings payload is required.");
            }

            _store.Save(settings);
            return Ok(BuildResponse(settings));
        }

        [HttpGet("appsettings-snapshot")]
        [ProducesResponseType(typeof(DisciplineSettings), StatusCodes.Status200OK)]
        public IActionResult GetAppSettingsSnapshot()
        {
            return Ok(_appSettingsReader.Read());
        }

        [HttpPost("import-from-appsettings")]
        [Authorize(Policy = AuthorizationPolicies.SectionAccessSettings)]
        [ProducesResponseType(typeof(DisciplineSettingsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public IActionResult ImportFromAppSettings()
        {
            if (!_appSettingsReader.HasAppSettings())
            {
                return Conflict("No DotSee.Discipline section found in appsettings.json.");
            }

            var snapshot = _appSettingsReader.Read();
            var current = _store.Load();
            // Preserve the master toggle — importing appsettings values shouldn't silently
            // switch on the backoffice source.
            snapshot.UseBackoffice = current.UseBackoffice;

            _store.Save(snapshot);
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
                Settings = settings,
            };
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
}
