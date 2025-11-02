using DotSee.Discipline.Interfaces;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace DotSee.Discipline.AiSummary
{
    public class AiSummaryService
    {

        #region Private Members

        private IContentService _cs;
        private readonly IContentTypeService _contentTypeService;
        private AiSummarySettings _settings;
        private readonly JsonSettingsProviderService _settingsProviderService;

        #endregion

        #region Constructors

        public AiSummaryService(
            IContentService contentService,
            IContentTypeService contentTypeService,
            JsonSettingsProviderService settingsProviderService)
        {
            _cs = contentService;
            _contentTypeService = contentTypeService;
            settingsProviderService = _settingsProviderService;
            _settings = ((ISettings<AiSummarySettings>)settingsProviderService).Settings;
            _settingsProviderService = settingsProviderService;
        }

        #endregion

        #region Public Methods

        public bool Run(IContent node)
        {
            string culture = null;

            bool result = false;

            return (result);
        }

        #endregion

        #region Private Methods




        #endregion
    }
}