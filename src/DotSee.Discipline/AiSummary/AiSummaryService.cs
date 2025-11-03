using DotSee.Discipline.Interfaces;
using Serilog;
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
        private ILogger _logger;

        #endregion

        #region Constructors

        public AiSummaryService(
            IContentService contentService,
            IContentTypeService contentTypeService,
            JsonSettingsProviderService settingsProviderService,
            ILogger logger)
        {
            _cs = contentService;
            _contentTypeService = contentTypeService;
            _settingsProviderService = settingsProviderService;
            _settings = ((ISettings<AiSummarySettings>)_settingsProviderService).Settings;
            _logger = logger;
        }

        #endregion

        #region Public Methods

        public bool Run(IContent node)
        {
            string culture = null;

            bool result = false;
            _logger.Information("AiSummaryService ran for ID {NodeId} with Name {NodeName}", node.Id, node.Name);
            return (result);
        }

        #endregion

        #region Private Methods




        #endregion
    }
}