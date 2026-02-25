using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
            [FromQuery] string? culture = null)
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

            string? previousValue = null;
            var result = new List<PropertyVersionDto>();

            // Versions come newest-first from Umbraco
            foreach (var version in versions)
            {
                var value = culture != null
                    ? version.GetValue<string>(propertyAlias, culture)
                    : version.GetValue<string>(propertyAlias);

                var stringValue = value ?? string.Empty;

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
    }

    public class PropertyVersionDto
    {
        public int VersionId { get; set; }
        public string Value { get; set; } = string.Empty;
        public DateTime VersionDate { get; set; }
    }
}
