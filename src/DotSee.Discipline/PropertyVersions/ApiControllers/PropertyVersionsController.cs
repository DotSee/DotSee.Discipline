using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace DotSee.Discipline.PropertyVersions.ApiControllers
{
    [ApiController]
    [Route("umbraco/api/propertyversions")]
    [Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
    public class PropertyVersionsController : ControllerBase
    {
        private readonly IContentService _contentService;

        public PropertyVersionsController(IContentService contentService)
        {
            _contentService = contentService;
        }

        [HttpGet("history")]
        [ProducesResponseType(typeof(IEnumerable<PropertyVersionDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult GetHistory(
            [FromQuery] Guid contentKey,
            [FromQuery] string propertyAlias,
            [FromQuery] string? culture = null,
            [FromQuery] string? parentPropertyAlias = null,
            [FromQuery] string? blockElementKey = null)
        {
            var content = _contentService.GetById(contentKey);
            if (content == null)
            {
                return NotFound("Content not found.");
            }

            var versions = _contentService.GetVersions(content.Id);
            if (versions == null)
            {
                return Ok(Array.Empty<PropertyVersionDto>());
            }

            var isBlockMode = !string.IsNullOrEmpty(parentPropertyAlias) && !string.IsNullOrEmpty(blockElementKey);

            string? previousValue = null;
            var result = new List<PropertyVersionDto>();

            // Versions come newest-first from Umbraco
            foreach (var version in versions)
            {
                string stringValue;

                if (isBlockMode)
                {
                    // Read the block list JSON. Try with culture first (block list
                    // properties can be culture-variant), fall back to invariant.
                    var blockListJson = culture != null
                        ? version.GetValue<string>(parentPropertyAlias!, culture)
                        : null;
                    blockListJson ??= version.GetValue<string>(parentPropertyAlias!);

                    stringValue = ExtractBlockPropertyValue(blockListJson, blockElementKey!, propertyAlias, culture) ?? string.Empty;
                }
                else
                {
                    var value = culture != null
                        ? version.GetValue<string>(propertyAlias, culture)
                        : version.GetValue<string>(propertyAlias);

                    stringValue = value ?? string.Empty;
                }

                // Deduplicate: skip if identical to the previous (newer) version's value
                if (result.Count > 0 && stringValue == previousValue)
                {
                    continue;
                }

                previousValue = stringValue;

                result.Add(new PropertyVersionDto
                {
                    VersionId = version.VersionId,
                    Value = stringValue,
                    VersionDate = version.UpdateDate
                });
            }

            return Ok(result);
        }

        private static string? ExtractBlockPropertyValue(string? blockListJson, string blockElementKey, string propertyAlias, string? culture)
        {
            if (string.IsNullOrEmpty(blockListJson))
            {
                return null;
            }

            try
            {
                using var doc = JsonDocument.Parse(blockListJson);
                var root = doc.RootElement;

                if (!root.TryGetProperty("contentData", out var contentData) || contentData.ValueKind != JsonValueKind.Array)
                {
                    return null;
                }

                foreach (var block in contentData.EnumerateArray())
                {
                    if (!block.TryGetProperty("key", out var keyProp))
                    {
                        continue;
                    }

                    var key = keyProp.GetString();
                    if (!string.Equals(key, blockElementKey, StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    if (!block.TryGetProperty("values", out var values) || values.ValueKind != JsonValueKind.Array)
                    {
                        return null;
                    }

                    foreach (var valueProp in values.EnumerateArray())
                    {
                        if (!valueProp.TryGetProperty("alias", out var aliasProp))
                        {
                            continue;
                        }

                        if (!string.Equals(aliasProp.GetString(), propertyAlias, StringComparison.OrdinalIgnoreCase))
                        {
                            continue;
                        }

                        // Match culture: block values store culture per-entry.
                        // If a specific culture is requested, match it; otherwise
                        // match invariant entries (null/empty culture).
                        if (culture != null)
                        {
                            if (!valueProp.TryGetProperty("culture", out var cultureProp)
                                || !string.Equals(cultureProp.GetString(), culture, StringComparison.OrdinalIgnoreCase))
                            {
                                continue;
                            }
                        }
                        else
                        {
                            if (valueProp.TryGetProperty("culture", out var cultureProp)
                                && !string.IsNullOrEmpty(cultureProp.GetString()))
                            {
                                continue;
                            }
                        }

                        if (!valueProp.TryGetProperty("value", out var val))
                        {
                            return null;
                        }

                        return val.ValueKind == JsonValueKind.String
                            ? val.GetString()
                            : val.GetRawText();
                    }

                    // Block found but property/culture not in values
                    return null;
                }

                // Block element not found in contentData
                return null;
            }
            catch (JsonException)
            {
                return null;
            }
        }
    }

    public class PropertyVersionDto
    {
        public int VersionId { get; set; }
        public string Value { get; set; } = string.Empty;
        public DateTime VersionDate { get; set; }
    }
}
