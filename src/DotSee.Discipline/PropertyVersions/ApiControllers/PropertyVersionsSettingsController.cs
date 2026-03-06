using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Umbraco.Cms.Core.Actions;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Extensions;

namespace DotSee.Discipline.PropertyVersions.ApiControllers
{
    [ApiController]
    [Route("umbraco/api/propertyversions")]
    public class PropertyVersionsSettingsController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IDictionaryItemService _dictionaryItemService;
        private readonly ILanguageService _languageService;
        private readonly IUserService _userService;

        public PropertyVersionsSettingsController(
            IConfiguration configuration,
            IDictionaryItemService dictionaryItemService,
            ILanguageService languageService,
            IUserService userService)
        {
            _configuration = configuration;
            _dictionaryItemService = dictionaryItemService;
            _languageService = languageService;
            _userService = userService;
        }

        [HttpGet("settings")]
        [Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
        [ProducesResponseType(typeof(PropertyVersionsSettingsResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSettings([FromQuery] string culture = null)
        {
            var section = _configuration.GetSection("DotSee.Discipline:PropertyVersions");
            var enabledSetting = section["Enabled"];

            var enabled = !string.IsNullOrEmpty(enabledSetting) &&
                          enabledSetting.Equals("true", StringComparison.OrdinalIgnoreCase);

            // If enabled by config, also check that the current user has the Rollback
            // permission in at least one of their user groups.
            if (enabled)
            {
                enabled = await CurrentUserHasRollbackPermission();
            }

            // Resolve the culture to a proper ISO code that matches dictionary translations.
            var resolvedCulture = await ResolveIsoCode(culture);

            var nextCaption = await ResolveDictionaryValue(section["NextVersionButtonCaptionDictionaryEntry"], resolvedCulture);
            var prevCaption = await ResolveDictionaryValue(section["PreviousVersionButtonCaptionDictionaryEntry"], resolvedCulture);
            var noVersionsCaption = await ResolveDictionaryValue(section["NoVersionsButtonCaptionDictionaryEntry"], resolvedCulture);

            return Ok(new PropertyVersionsSettingsResponse
            {
                Enabled = enabled,
                NextVersionCaption = nextCaption,
                PreviousVersionCaption = prevCaption,
                NoVersionsCaption = noVersionsCaption
            });
        }

        /// <summary>
        /// Resolves a partial culture string (e.g. "en") to a full Umbraco language ISO code (e.g. "en-US").
        /// Falls back to the default language if no match is found.
        /// </summary>
        private async Task<string> ResolveIsoCode(string culture)
        {
            var languages = await _languageService.GetAllAsync();
            var list = languages.ToList();

            if (!string.IsNullOrEmpty(culture))
            {
                // Exact match first (case-insensitive)
                var exact = list.FirstOrDefault(l =>
                    l.IsoCode.Equals(culture, StringComparison.OrdinalIgnoreCase));
                if (exact != null) return exact.IsoCode;

                // Prefix match: "en" matches "en-US"
                var prefix = list.FirstOrDefault(l =>
                    l.IsoCode.StartsWith(culture, StringComparison.OrdinalIgnoreCase));
                if (prefix != null) return prefix.IsoCode;
            }

            // Fall back to default language
            var defaultLang = list.FirstOrDefault(l => l.IsDefault)
                              ?? list.FirstOrDefault();
            return defaultLang?.IsoCode;
        }

        private async Task<string> ResolveDictionaryValue(string dictionaryKey, string isoCode)
        {
            if (string.IsNullOrEmpty(dictionaryKey)) return null;

            try
            {
                var item = await _dictionaryItemService.GetAsync(dictionaryKey);
                if (item == null) return null;

                // Try the resolved culture first
                if (!string.IsNullOrEmpty(isoCode))
                {
                    var value = item.GetTranslatedValue(isoCode);
                    if (!string.IsNullOrWhiteSpace(value)) return value;
                }

                // Fall back to the first non-empty translation
                return item.Translations?
                    .Select(t => t.Value)
                    .FirstOrDefault(v => !string.IsNullOrWhiteSpace(v));
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Checks whether the current backoffice user belongs to at least one
        /// user group that has the Rollback permission enabled.
        /// </summary>
        private async Task<bool> CurrentUserHasRollbackPermission()
        {
            // The user key GUID is in the "sub" (Subject) claim in Umbraco v17's
            // OpenID Connect token, not in NameIdentifier (which holds the legacy int ID).
            var userKeyClaim = User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userKeyClaim) || !Guid.TryParse(userKeyClaim, out var userKey))
            {
                return false;
            }

            var user = await _userService.GetAsync(userKey);
            if (user == null)
            {
                return false;
            }

            var rollbackLetter = ActionRollback.ActionLetter.ToString();

            return user.Groups.Any(g =>
                g.Permissions != null && g.Permissions.Contains(rollbackLetter));
        }
    }

    public class PropertyVersionsSettingsResponse
    {
        public bool Enabled { get; set; }
        public string NextVersionCaption { get; set; }
        public string PreviousVersionCaption { get; set; }
        public string NoVersionsCaption { get; set; }
    }
}
