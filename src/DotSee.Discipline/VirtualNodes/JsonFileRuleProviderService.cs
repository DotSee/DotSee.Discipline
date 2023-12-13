using DotSee.Discipline.AutoNode;
using DotSee.Discipline.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Serilog;
using Umbraco.Cms.Core.Configuration.Models;

namespace DotSee.Discipline.VirtualNodes
{
    public class JsonFileRuleProviderService :ISettings<GlobalSettings>, IRuleProviderService< IEnumerable<String>>
    {

      
        private IEnumerable<String> _rules;
        private readonly ILogger _logger;
        private readonly IConfiguration _configuration;

        public JsonFileRuleProviderService(ILogger logger, IConfiguration configuration, IOptions<GlobalSettings> globalSettings)
        {
            _logger = logger;
            _configuration = configuration;
            Settings = globalSettings.Value;
        }

      

        public IEnumerable<String> Rules
        {
            get
            {
                return (_rules == null || !_rules.Any()) ? GetRules() : _rules;
            }
        }

        public GlobalSettings Settings { get; set; }

        public void ReloadData()
        {
          
            _rules = null;
        }

       
        private List<String> GetRules()
        {
            List<String> r = new();

            try
            {
                _configuration.GetSection("DotSee.Discipline:VirtualNodes:Rules").Bind(r);
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