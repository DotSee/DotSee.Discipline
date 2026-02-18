using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

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
        private readonly IConfiguration _configuration;

        public VariantsHiderApiController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Gets the VariantsHider settings from configuration.
        /// </summary>
        /// <returns>An object containing the enabled status and caption.</returns>
        [HttpGet("settings")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(VariantsHiderSettingsResponse), StatusCodes.Status200OK)]
        public IActionResult GetSettings()
        {
            var enabledSetting = _configuration.GetSection("DotSee.Discipline:VariantsHider:Enabled")?.Value;
            var captionSetting = _configuration.GetSection("DotSee.Discipline:VariantsHider:Caption")?.Value;

            var enabled = !string.IsNullOrEmpty(enabledSetting) && 
                          enabledSetting.Equals("true", StringComparison.OrdinalIgnoreCase);
            
            var caption = string.IsNullOrEmpty(captionSetting) 
                ? "Toggle unset variants display" 
                : captionSetting;

            return Ok(new VariantsHiderSettingsResponse
            {
                Enabled = enabled,
                Caption = caption
            });
        }
    }

    /// <summary>
    /// Response model for VariantsHider settings.
    /// </summary>
    public class VariantsHiderSettingsResponse
    {
        /// <summary>
        /// Gets or sets whether the VariantsHider feature is enabled.
        /// </summary>
        public bool Enabled { get; set; }

        /// <summary>
        /// Gets or sets the caption text for the toggle action.
        /// </summary>
        public string Caption { get; set; } = string.Empty;
    }
}