using DotSee.Discipline.Interfaces;
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
    public class JsonFileRuleProviderService :ISettings<RuleSettings>, IRuleProviderService<IEnumerable<Rule>>
    {
        private RuleSettings _settings;
        private List<Rule> _rules;
        private readonly ILogger _logger;
        private readonly IConfiguration _configuration;

        public JsonFileRuleProviderService(ILogger logger, IConfiguration configuration)
        {
            _logger = logger;
            _settings = null;
            _rules = null;
            _configuration = configuration;
        }

        public RuleSettings Settings
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
            _rules = null;
            _settings = null;
        }

        private RuleSettings GetSettings()
        {
            RuleSettings r = new();

            try
            {
                _configuration.GetSection("DotSee.Discipline:AutoNode:Settings").Bind(r);
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