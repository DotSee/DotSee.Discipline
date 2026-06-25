using DotSee.Discipline.Backoffice;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DotSee.Discipline.VariantsHider.ApiControllers
{
    /// <summary>
    /// API controller for VariantsHider settings.
    /// Provides configuration data to the backoffice client.
    /// This endpoint allows anonymous access since it only returns non-sensitive configuration.
    /// </summary>
    [ApiController]
    [Route("umbraco/api/variantshider")]
    public class VariantsHiderApiController : ControllerBase
    {
        private const string DefaultCaption = "Toggle unset variants display";

        private readonly IDisciplineSettingsResolver _resolver;

        public VariantsHiderApiController(IDisciplineSettingsResolver resolver)
        {
            _resolver = resolver;
        }

        [HttpGet("settings")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(VariantsHiderSettingsResponse), StatusCodes.Status200OK)]
        public IActionResult GetSettings()
        {
            var feature = _resolver.GetVariantsHider();

            return Ok(new VariantsHiderSettingsResponse
            {
                Enabled = feature.Enabled,
                Caption = string.IsNullOrEmpty(feature.Caption) ? DefaultCaption : feature.Caption,
            });
        }
    }

    public class VariantsHiderSettingsResponse
    {
        public bool Enabled { get; set; }
        public string Caption { get; set; } = string.Empty;
    }
}
