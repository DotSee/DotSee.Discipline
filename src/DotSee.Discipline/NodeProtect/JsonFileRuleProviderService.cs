using DotSee.Discipline.AutoNode;
using DotSee.Discipline.Interfaces;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace DotSee.Discipline.NodeProtect
{
    public class JsonFileRuleProviderService : ISettings<NodeProtectSettings>, IRuleProviderService<IEnumerable<Rule>>
    {

        private NodeProtectSettings _settings;
        private List<Rule> _rules;
        private readonly ILogger _logger;
        private readonly IConfiguration _configuration;

        public JsonFileRuleProviderService(ILogger logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public NodeProtectSettings Settings
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

        private NodeProtectSettings GetSettings()
        {
            NodeProtectSettings r = new();

            try
            {
                _configuration.GetSection("DotSee.Discipline:NodeProtect:Settings").Bind(r);
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
                _configuration.GetSection("DotSee.Discipline:NodeProtect:Rules").Bind(r);
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