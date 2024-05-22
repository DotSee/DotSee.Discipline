using DotSee.Discipline.Interfaces;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace DotSee.Discipline.NodeProtect
{
    /// <summary>
    /// Creates new nodes under a newly created node, according to a set of rules
    /// </summary>
    public class NodeProtectService
    {
        #region Private Members

        private IContentService _cs;
        private readonly IRuleProviderService<IEnumerable<Rule>> _ruleProviderService;
        private List<Rule> _rules;

        #endregion

        #region Constructors

        public NodeProtectService(IContentService contentService, IRuleProviderService<IEnumerable<Rule>> ruleProviderService)
        {
            _cs = contentService;
            _ruleProviderService = ruleProviderService;

            _rules = _ruleProviderService.Rules.ToList();
        }

        #endregion

        #region Public Properties

        /// <summary>
        /// Holds the property alias for the "special" property that can be added to nodes to indicate max number of children
        /// </summary>
        public string PropertyAlias { get; private set; }

        #endregion

        #region Public Methods

        /// <summary>
        /// Registers a new rule object 
        /// </summary>
        /// <param name="rule">The rule object</param>
        public void RegisterRule(Rule rule)
        {
            _rules.Add(rule);
        }

        /// <summary>
        /// Applies all rules on publishing a node. 
        /// </summary>
        /// <param name="node">The newly created node we need to apply rules for</param>
        public bool Run(IContent node)
        {

            bool preventDeletion = false;

            //Check if the document has the (optional) "special" property that defines 
            //whether it should be allowed to be deleted.
            //Swallow any exceptions here. If it's there, it's there. If it's not, don't bother.
            try
            {
                if (
                    PropertyAlias != null
                    && node.HasProperty(PropertyAlias)
                    && node.Properties[PropertyAlias] != null
                    && node.GetValue<int>(PropertyAlias) > 0
                    )
                {
                    return true;
                }
            }
            catch { }

            //If this part is reached, then we haven't found a "special" property at the parent node
            //and we are going to check the rules loaded from the config file.
            foreach (Rule rule in _rules)
            {
                //Check if rule applies
                preventDeletion = CheckRule(rule, node);

                //Stop at the first rule that applies. 
                if (preventDeletion) { break; }
            }

            return (preventDeletion);
        }

        #endregion

        #region Private Methods

        /// <summary>
        /// Checks if a given rule applies to a given node
        /// </summary>
        /// <param name="rule">The rule</param>
        /// <param name="node">The node to check against the rule</param>
        /// <returns>True if a rule that prevents deletion has been found to match.</returns>
        private bool CheckRule(Rule rule, IContent node)
        {
            bool guidsDefined = !string.IsNullOrEmpty(rule.DocumentGuids);
            bool doctypesDefined = !string.IsNullOrEmpty(rule.DocTypeAlias);

            //If nothing has been defined, rule will not apply
            if (!guidsDefined && !doctypesDefined) { return false; }

            var doctypes = rule.DocTypeAlias?.Split(',');
            var guids = rule.DocumentGuids?.Split(",");

            if (doctypesDefined)
            {
                var currContentType = node.ContentType.Alias.ToLowerInvariant();
                foreach (string item in doctypes)
                {
                    if (item.ToLowerInvariant().Equals(currContentType))
                    {
                        return true;
                    }
                }
            }

            if (guidsDefined)
            {
                var currGuid = node.Key.ToString().ToLower();
                foreach (string item in guids)
                {
                    if (item.ToLower().Equals(currGuid))
                    {
                        return true;
                    }
                }
            }

            //No rules have been found to match, so node can be deleted
            return false;
        }
        #endregion
    }
}