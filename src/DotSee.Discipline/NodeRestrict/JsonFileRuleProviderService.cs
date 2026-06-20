using DotSee.Discipline.Backoffice;
using DotSee.Discipline.Interfaces;
using System.Collections.Generic;
using System.Linq;

namespace DotSee.Discipline.NodeRestrict
{
    public class JsonFileRuleProviderService : ISettings<NodeRestrictSettings>, IRuleProviderService<IEnumerable<Rule>>
    {
        private readonly IDisciplineSettingsResolver _resolver;

        public JsonFileRuleProviderService(IDisciplineSettingsResolver resolver)
        {
            _resolver = resolver;
        }

        public NodeRestrictSettings Settings
        {
            get
            {
                var feature = _resolver.GetNodeRestrict();
                return new NodeRestrictSettings
                {
                    PropertyAlias = feature.PropertyAlias,
                    ShowWarnings = feature.ShowWarnings,
                };
            }
        }

        public IEnumerable<Rule> Rules
        {
            get
            {
                var feature = _resolver.GetNodeRestrict();
                return feature.Rules.Select(r => new Rule
                {
                    ParentDocType = r.ParentDocType,
                    ChildDocType = r.ChildDocType,
                    MaxNodes = r.MaxNodes,
                    ShowWarnings = r.ShowWarnings,
                    CustomMessage = r.CustomMessage,
                    CustomMessageCategory = r.CustomMessageCategory,
                    CustomWarningMessage = r.CustomWarningMessage,
                    CustomWarningMessageCategory = r.CustomWarningMessageCategory,
                }).ToList();
            }
        }

        public void ReloadData()
        {
        }
    }
}
