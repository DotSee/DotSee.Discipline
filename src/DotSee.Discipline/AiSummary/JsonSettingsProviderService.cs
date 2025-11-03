using DotSee.Discipline.Interfaces;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace DotSee.Discipline.AiSummary
{
    public class JsonSettingsProviderService : ISettings<AiSummarySettings>, ISettingsProviderService
    {

        private AiSummarySettings _settings;
        private readonly ILogger _logger;
        private readonly IConfiguration _configuration;

        public JsonSettingsProviderService(ILogger logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public AiSummarySettings Settings
        {
            get
            {
                return (_settings ?? GetSettings());
            }
        }

        public void ReloadData()
        {
            _settings = null;
        }

        private AiSummarySettings GetSettings()
        {
            AiSummarySettings r = new();

            try
            {
                _configuration.GetSection("DotSee.Discipline:AiSummary:Settings").Bind(r);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, MessageConstants.ErrorLoadConfig);
                return null;
            }
            return r;
        }
    }
}