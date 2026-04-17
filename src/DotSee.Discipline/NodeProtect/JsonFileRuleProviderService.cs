using DotSee.Discipline.Backoffice;
using DotSee.Discipline.Interfaces;
using System.Collections.Generic;
using System.Linq;

namespace DotSee.Discipline.NodeProtect
{
    public class JsonFileRuleProviderService : ISettings<NodeProtectSettings>, IRuleProviderService<IEnumerable<Rule>>
    {
        private readonly IDisciplineSettingsResolver _resolver;

        public JsonFileRuleProviderService(IDisciplineSettingsResolver resolver)
        {
            _resolver = resolver;
        }

        public NodeProtectSettings Settings
        {
            get
            {
                var feature = _resolver.GetNodeProtect();
                return new NodeProtectSettings
                {
                    PropertyAlias = feature.PropertyAlias,
                };
            }
        }

        public IEnumerable<Rule> Rules
        {
            get
            {
                var feature = _resolver.GetNodeProtect();
                return feature.Rules.Select(r => new Rule
                {
                    DocTypeAlias = r.DocTypeAlias,
                    DocumentGuids = r.DocumentGuids,
                    CustomMessage = r.CustomMessage,
                    CustomMessageCategory = r.CustomMessageCategory,
                }).ToList();
            }
        }

        public void ReloadData()
        {
        }
    }
}
