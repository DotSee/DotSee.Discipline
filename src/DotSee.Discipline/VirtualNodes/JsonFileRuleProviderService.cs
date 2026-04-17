using DotSee.Discipline.Backoffice;
using DotSee.Discipline.Interfaces;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using Umbraco.Cms.Core.Configuration.Models;

namespace DotSee.Discipline.VirtualNodes
{
    public class JsonFileRuleProviderService : ISettings<GlobalSettings>, IRuleProviderService<IEnumerable<string>>
    {
        private readonly IDisciplineSettingsResolver _resolver;

        public JsonFileRuleProviderService(IDisciplineSettingsResolver resolver, IOptions<GlobalSettings> globalSettings)
        {
            _resolver = resolver;
            Settings = globalSettings.Value;
        }

        public IEnumerable<string> Rules => _resolver.GetVirtualNodes().Rules;

        public GlobalSettings Settings { get; set; }

        public void ReloadData()
        {
        }
    }
}
