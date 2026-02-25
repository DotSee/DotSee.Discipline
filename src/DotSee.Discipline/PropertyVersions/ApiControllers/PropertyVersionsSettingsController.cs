using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace DotSee.Discipline.PropertyVersions.ApiControllers
{
    [ApiController]
    [Route("umbraco/api/propertyversions")]
    public class PropertyVersionsSettingsController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public PropertyVersionsSettingsController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet("settings")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(PropertyVersionsSettingsResponse), StatusCodes.Status200OK)]
        public IActionResult GetSettings()
        {
            var enabledSetting = _configuration.GetSection("DotSee.Discipline:PropertyVersions:Enabled")?.Value;

            var enabled = !string.IsNullOrEmpty(enabledSetting) &&
                          enabledSetting.Equals("true", StringComparison.OrdinalIgnoreCase);

            return Ok(new PropertyVersionsSettingsResponse
            {
                Enabled = enabled
            });
        }
    }

    public class PropertyVersionsSettingsResponse
    {
        public bool Enabled { get; set; }
    }
}
