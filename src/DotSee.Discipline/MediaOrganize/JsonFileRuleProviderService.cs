using DotSee.Discipline.AutoNode;
using DotSee.Discipline.Interfaces;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace DotSee.Discipline.MediaOrganize
{
    public class JsonFileRuleProviderService : ISettings<MediaOrganizeSettings>, IRuleProviderService<IEnumerable<Rule>>
    {

        private MediaOrganizeSettings _settings;
        private List<Rule> _rules;
        private readonly ILogger _logger;
        private readonly IConfiguration _configuration;

        public JsonFileRuleProviderService(ILogger logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public MediaOrganizeSettings Settings
        {
            get
            {
                return (_settings ?? GetSettings());
            }
        }

        public IEnumerable<Rule> Rules
        {
            get
            {
                return (_rules == null || !_rules.Any()) ? GetRules() : _rules;
            }
        }

        public void ReloadData()
        {
            _settings = null;
            _rules = null;
        }

        private MediaOrganizeSettings GetSettings()
        {
            MediaOrganizeSettings r = new();

            try
            {
                _configuration.GetSection("DotSee.Discipline:MediaOrganize:Settings").Bind(r);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, MessageConstants.ErrorLoadConfig);
                return null;
            }
            return r;
        }
        private List<Rule> GetRules()
        {
            List<Rule> r = new();

            try
            {
                _configuration.GetSection("DotSee.Discipline:MediaOrganize:Rules").Bind(r);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, MessageConstants.ErrorLoadConfig);
                return null;
            }

            _logger.Information(string.Format(MessageConstants.InfoLoadConfigComplete, r.Count));

            return r;
        }
    }
}