using DotSee.Discipline.Backoffice;
using DotSee.Discipline.Interfaces;
using System.Collections.Generic;
using System.Linq;

namespace DotSee.Discipline.AutoNode
{
    public class JsonFileRuleProviderService : ISettings<RuleSettings>, IRuleProviderService<IEnumerable<Rule>>
    {
        private readonly IDisciplineSettingsResolver _resolver;

        public JsonFileRuleProviderService(IDisciplineSettingsResolver resolver)
        {
            _resolver = resolver;
        }

        public RuleSettings Settings
        {
            get
            {
                var feature = _resolver.GetAutoNode();
                return new RuleSettings
                {
                    LogLevel = feature.LogLevel,
                    RepublishExistingNodes = feature.RepublishExistingNodes,
                };
            }
        }

        public IEnumerable<Rule> Rules
        {
            get
            {
                var feature = _resolver.GetAutoNode();
                return feature.Rules.Select(r => new Rule
                {
                    CreatedDocTypeAlias = r.CreatedDocTypeAlias,
                    DocTypeAliasToCreate = r.DocTypeAliasToCreate,
                    NodeName = r.NodeName,
                    BringNewNodeFirst = r.BringNewNodeFirst,
                    OnlyCreateIfNoChildren = r.OnlyCreateIfNoChildren,
                    CreateIfExistsWithDifferentName = r.CreateIfExistsWithDifferentName,
                    DictionaryItemForName = r.DictionaryItemForName,
                    KeepNewNodeUnpublished = r.KeepNewNodeUnpublished,
                    Blueprint = r.Blueprint,
                }).ToList();
            }
        }

        public void ReloadData()
        {
            // Data is read directly from the resolver on every access — nothing to invalidate here.
        }
    }
}
