using DotSee.Discipline.Backoffice;
using DotSee.Discipline.Interfaces;
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

            //Get the parent node.
            var parent = _cs.GetById(node.ParentId);
            string culture = null;

            //If we are publishing a top-level node, skip the whole process.
            if (parent == null) { return null; }

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
                    return CheckRule(customRule, node, culture);
                }
            }
            catch { }

            //If this part is reached, then we haven't found a "special" property at the parent node
            //and we are going to check the rules loaded from the config file.
            foreach (Rule rule in _rules)
            {
                //Check if rule applies
                result = CheckRule(rule, node, culture);

                //Stop at the first rule that applies. 
                if (result != null) { break; }
            }

            return (result);
        }

        #endregion

        #region Private Methods

        /// <summary>
        /// Checks if a given rule applies to a given node
        /// </summary>
        /// <param name="rule">The rule</param>
        /// <param name="node">The node to check against the rule</param>
        /// <returns>Null if the rule does not apply to the node, or a Result object if it does.</returns>
        private Result CheckRule(Rule rule, IContent node, string culture = null)
        {
            IContent parent = _cs.GetById(node.ParentId);
            //If maxnodes not at least equal 1 then skip this rule.
            if (rule.MaxNodes <= 0) { return null; }
            long totalChildren = 0;

            ////See if doctypes for parent and child node match our current scenario
            bool isMatchParent = parent.ContentType.Alias.ToLower().Equals(rule.ParentDocType.ToLower()) || rule.ParentDocType.Equals("*");
            bool isMatchChild = rule.ChildDocType.ToLower().Equals(node.ContentType.Alias.ToLower()) || rule.ChildDocType.Equals("*");
            ////If rule doctypes do not match, skip this rule
            if (!isMatchChild || !isMatchParent) { return null; }


            //If we're checking for children regardless of doctype, then getting a page size equal to 
            //the max nodes limit is enough to check. Otherwise, get everything so we can filter
            var maxNodes = rule.ChildDocType.Equals("*") ? int.MaxValue : rule.MaxNodes;

            IEnumerable<IContent> children = new List<IContent>();
            var filter = GetFilter(rule, culture);
            children = _cs.GetPagedChildren(node.ParentId, 0, maxNodes, out totalChildren, filter)
                .Where(x => culture == null ? x.Published : x.Published && CheckPublishedAndCulture(x, culture));

            if (rule.ParentDocType != "*")
            {
                var _parentTypeToSearch = _contentTypeService.Get(rule.ParentDocType);
                children = children.Where(x => _cs.GetById(x.ParentId).ContentTypeId == _parentTypeToSearch.Id);
            }

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