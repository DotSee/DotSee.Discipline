using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Umbraco.Cms.Web.Common.Controllers;

namespace DotSee.VariantsHider.ApiControllers
{
    public class TreeVariantSettingsController : UmbracoApiController
    {
        private readonly IConfiguration _configuration;

        public TreeVariantSettingsController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public string HideUnpublishedVariantsFromTree()
        {
            var enableHideVariantsSetting = _configuration.GetSection("VariantsHider:Enabled")?.Value;
            var retVal = string.IsNullOrEmpty(enableHideVariantsSetting) ? "false" : enableHideVariantsSetting;
            return (retVal.ToLower());
        }
    }
}