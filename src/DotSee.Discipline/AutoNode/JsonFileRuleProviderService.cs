using Lucene.Net.Util.Fst;
using Microsoft.Extensions.Configuration;
using Serilog;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;

namespace DotSee.Discipline.AutoNode
{
    public class JsonFileRuleProviderService : IRuleProviderService<AutoNodeJsonRules>
    {
        private Dictionary<string, string> _settings;
        private List<Rule> _rules;
        private AutoNodeJsonRules _configType = null;
        private readonly IConfigSource _configSource;
        private readonly ILogger _logger;
        private readonly IConfiguration _configuration;

        public JsonFileRuleProviderService(ILogger logger, IConfigSource configSource, IConfiguration configuration)
        {
            _logger = logger;
            _configSource = configSource;
            _settings = new Dictionary<string, string>();
            _configuration = configuration;
        }

        public Dictionary<string, string> Settings
        {
            get
            {
                return (_settings == null || !_settings.Any()) ? this.ConfigType.Settings : _settings;
            }
        }

        public IEnumerable<Rule> Rules
        {
            get
            {
                return (_rules == null || !_rules.Any()) ? GetRules() : _rules;
            }
        }

        IConfigSource IRuleProviderService.ConfigSource { get => _configSource; }

        public AutoNodeJsonRules ConfigType => _configType ?? GetConfigFromJson();

        public void ReloadData()
        {
            _rules = null;
            _settings = new Dictionary<string, string>();
            _configType = null;
        }

        private List<Rule> GetRules()
        {
            List<Rule> r = new();

            try
            {
                _configuration.GetSection("DotSee.Discipline:AutoNode:Rules").Bind(r);
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