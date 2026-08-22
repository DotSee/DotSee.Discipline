using DotSee.Discipline.Backoffice;
using DotSee.Discipline.Interfaces;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Persistence.Querying;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Extensions;

namespace DotSee.Discipline.NodeRestrict
{
    /// <summary>
    /// Creates new nodes under a newly created node, according to a set of rules
    /// </summary>
    public class NodeRestrictService
    {

        #region Private Members

        private IContentService _cs;
        private ISqlContext _sql;
        private readonly IRuleProviderService<IEnumerable<Rule>> _ruleProviderService;
        private readonly IContentTypeService _contentTypeService;
        private List<Rule> _rules;
        private NodeRestrictSettings _settings;

        #endregion

        #region Constructors

        public NodeRestrictService(
            IContentService contentService,
            ISqlContext sqlContext,
            IRuleProviderService<IEnumerable<Rule>> ruleProviderService,
            IContentTypeService contentTypeService,
            IDisciplineSettingsResolver settingsResolver)
        {
            _cs = contentService;
            _sql = sqlContext;
            _ruleProviderService = ruleProviderService;
            _contentTypeService = contentTypeService;
        }

        #endregion

        #region Public Methods

        // Read settings and rules fresh from the provider on every run. The provider reads them
        // from the in-memory settings store (no file I/O), which Save() updates synchronously, so
        // enabling/disabling the feature or editing rules takes effect immediately — no restart.
        private void LoadFromProvider()
        {
            _settings = ((ISettings<NodeRestrictSettings>)_ruleProviderService).Settings;
            _rules = _ruleProviderService.Rules.ToList();
        }

        /// <summary>
        /// Applies all rules on publishing a node. 
        /// </summary>
        /// <param name="node">The newly created node we need to apply rules for</param>
        /// <param name="publishingCultures">
        /// The cultures currently being published, as determined by the notification handler
        /// (e.g. via notification.IsPublishingCulture()). In Umbraco v14+, IContent.EditedCultures
        /// may be null during publish notifications, so the handler must resolve publishing cultures
        /// from the notification object instead.
        /// Pass null for invariant (non-variant) content.
        /// </param>
        public virtual Result Run(IContent node, IEnumerable<string> publishingCultures = null)
        {
            LoadFromProvider();

            //Nodes at the top of the content tree have a parent id of -1 and therefore no parent node.
            //These are handled by rules that have AtRoot set - see CheckRule/IsRuleMatch.
            bool isAtRoot = node.ParentId == Constants.System.Root;

            //Get the parent node.
            var parent = isAtRoot ? null : _cs.GetById(node.ParentId);
            string culture = null;

            //If the parent cannot be resolved (and we're not at the root), skip the whole process.
            if (!isAtRoot && parent == null) { return null; }

            //If the node is already published (and is just being republished) skip the whole process.
            if (node.Published) { return null; }

            Result result = null;

            if (node.AvailableCultures.Any())
            {
                // In Umbraco v14+, EditedCultures may be null during publish notifications.
                // Prefer publishing cultures passed from the notification handler,
                // then fall back to AvailableCultures.
                if (publishingCultures != null && publishingCultures.Any())
                {
                    culture = publishingCultures.First();
                }
                else if (node.EditedCultures != null && node.EditedCultures.Any())
                {
                    culture = node.EditedCultures.First().ToString();
                }
                else
                {
                    culture = node.AvailableCultures.First().ToString();
                }
            }

            //Check if the document's parent has the (optional) "special" property that defines the 
            //maximum number of children. If it does, then this overrides any other rules in effect.
            //Swallow any exceptions here. If it's there, it's there. If it's not, don't bother.
            //This cannot apply at the root, since there is no parent node to carry the property.
            if (!isAtRoot)
            {
                var propertyAlias = _settings.PropertyAlias;
                try
                {
                    if (
                        parent.HasProperty(propertyAlias)
                        && parent.Properties[propertyAlias] != null
                        && parent.GetValue<int>(propertyAlias, culture) > 0
                        )
                    {
                        //Create a rule on the fly and apply it for all children of the parent node.
                        Rule customRule = new Rule(parent.ContentType.Alias, "*", parent.GetValue<int>(propertyAlias, culture), true, _settings.ShowWarnings);
                        return CheckRule(customRule, node, parent, isAtRoot, culture);
                    }
                }
                catch { }
            }

            //If this part is reached, then we haven't found a "special" property at the parent node
            //and we are going to check the rules loaded from the config file.
            foreach (Rule rule in _rules)
            {
                //Check if rule applies
                result = CheckRule(rule, node, parent, isAtRoot, culture);

                //Stop at the first rule that applies. 
                if (result != null) { break; }
            }

            return (result);
        }

        #endregion

        #region Private Methods

        /// <summary>
        /// Checks whether a rule's parent/child document type criteria match the node being published.
        /// </summary>
        /// <param name="rule">The rule</param>
        /// <param name="parentAlias">The document type alias of the parent node, or null when publishing at the root</param>
        /// <param name="childAlias">The document type alias of the node being published</param>
        /// <param name="isAtRoot">True when the node is being published at the content tree root</param>
        /// <remarks>
        /// A rule with AtRoot set matches only at the root and ignores ParentDocType. A rule without it never
        /// matches at the root - not even with a "*" parent document type, which means "any content parent".
        /// </remarks>
        public static bool IsRuleMatch(Rule rule, string parentAlias, string childAlias, bool isAtRoot)
        {
            bool isMatchParent = isAtRoot
                ? rule.AtRoot
                : !rule.AtRoot
                    && (rule.ParentDocType == "*"
                        || string.Equals(rule.ParentDocType, parentAlias, StringComparison.OrdinalIgnoreCase));

            bool isMatchChild = rule.ChildDocType == "*"
                || string.Equals(rule.ChildDocType, childAlias, StringComparison.OrdinalIgnoreCase);

            return isMatchParent && isMatchChild;
        }

        /// <summary>
        /// Checks if a given rule applies to a given node
        /// </summary>
        /// <param name="rule">The rule</param>
        /// <param name="node">The node to check against the rule</param>
        /// <param name="parent">The parent node, or null when publishing at the content tree root</param>
        /// <param name="isAtRoot">True when the node is being published at the content tree root</param>
        /// <param name="culture">The culture being published, or null for invariant content</param>
        /// <returns>Null if the rule does not apply to the node, or a Result object if it does.</returns>
        private Result CheckRule(Rule rule, IContent node, IContent parent, bool isAtRoot, string culture = null)
        {
            //If maxnodes not at least equal 1 then skip this rule.
            if (rule.MaxNodes <= 0) { return null; }
            long totalChildren = 0;

            ////If rule doctypes do not match, skip this rule
            if (!IsRuleMatch(rule, parent?.ContentType.Alias, node.ContentType.Alias, isAtRoot)) { return null; }

            //If we're checking for children regardless of doctype, then getting a page size equal to
            //the max nodes limit is enough to check. Otherwise, get everything so we can filter
            var maxNodes = rule.ChildDocType.Equals("*") ? int.MaxValue : rule.MaxNodes;

            //Every node returned here shares node.ParentId, so it already sits under the parent whose
            //document type the rule just matched - no further parent filtering is needed.
            var filter = GetFilter(rule, culture);
            IEnumerable<IContent> children = _cs.GetPagedChildren(node.ParentId, 0, maxNodes, out totalChildren, filter)
                .Where(x => culture == null ? x.Published : x.Published && CheckPublishedAndCulture(x, culture));

            return Result.GetResult(children.Count(), rule);
        }

        private bool CheckPublishedAndCulture(IContent node, string culture)
        {
            //Only include published nodes.
            if (!node.Published) { return false; }

            //Check if node is variant or invariant. Invariant nodes should count anyway.
            //Variant nodes only count if they're in the right culture.
            if (
                    _contentTypeService.Get(node.ContentTypeId).VariesByCulture()
                    && node.AvailableCultures.Any())
            {
                return node.AvailableCultures.Contains(culture);
            }
            else
            {
                return true;
            }
        }

        private IQuery<IContent> GetFilter(Rule rule, string culture)
        {
            switch (rule.ChildDocType)
            {
                case "*":

                    return _sql.Query<IContent>()
                        .Where(x => x.Published);
                default:
                    var _contentTypeToSearch = _contentTypeService.Get(rule.ChildDocType);

                    return _sql.Query<IContent>()
                        .Where(x =>
                                x.Published
                                && (x.ContentTypeId == _contentTypeToSearch.Id));
            }
        }
        #endregion
    }
}