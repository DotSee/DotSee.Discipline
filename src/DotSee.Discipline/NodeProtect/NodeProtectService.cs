using System;
using DotSee.Discipline.Backoffice;
using DotSee.Discipline.Interfaces;
using Serilog;
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
        private readonly ILogger _logger;

        #endregion

        #region Constructors

        public NodeProtectService(
            IContentService contentService,
            IRuleProviderService<IEnumerable<Rule>> ruleProviderService,
            IDisciplineSettingsResolver settingsResolver,
            ILogger logger
            )
        {
            _cs = contentService;
            _ruleProviderService = ruleProviderService;
            _logger = logger;
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Applies all rules on publishing a node.
        /// </summary>
        /// <param name="node">The newly created node we need to apply rules for</param>
        public virtual Result Run(IContent node)
        {
            // Read settings and rules fresh from the provider on every run, into locals. The service
            // is a singleton invoked concurrently, so per-run state must not live in instance fields.
            // The provider reads from the in-memory settings store (no file I/O), which Save() updates
            // synchronously, so enabling/disabling the feature or editing rules takes effect
            // immediately — no restart.
            List<Rule> rules = _ruleProviderService.Rules.ToList();
            NodeProtectSettings settings = ((ISettings<NodeProtectSettings>)_ruleProviderService).Settings;

            // A node is protected if it — or any of its descendants — matches a configured rule
            // OR carries the "protected" property set to true. Stop at the first match.
            Result result = CheckNode(node, rules, settings);
            if (result != null) { return result; }

            foreach (var subnode in _cs.GetPagedDescendants(node.Id, 0, int.MaxValue, out long total))
            {
                result = CheckNode(subnode, rules, settings);
                if (result != null) { return result; }
            }

            return null;
        }

        #endregion

        #region Private Methods

        /// <summary>
        /// Evaluates a single node: the property-based protection first (which is independent of
        /// the configured rules and must run even when no doctype/GUID rules are defined), then
        /// each configured rule.
        /// </summary>
        private Result CheckNode(IContent node, List<Rule> rules, NodeProtectSettings settings)
        {
            if (IsProtectedByProperty(node, settings))
            {
                return Result.GetResult(new Rule("", node.Key.ToString()), node);
            }

            foreach (Rule rule in rules)
            {
                Result result = CheckRule(rule, node);
                if (result != null) { return result; }
            }

            return null;
        }

        /// <summary>
        /// True when the node carries the configured (optional) "protected" true/false property
        /// set to true. Returns false when no alias is configured or the property is missing.
        /// </summary>
        private bool IsProtectedByProperty(IContent node, NodeProtectSettings settings)
        {
            var propertyAlias = settings.PropertyAlias;
            if (string.IsNullOrEmpty(propertyAlias)) { return false; }

            // Swallow exceptions — if the property is missing or unreadable, the node simply isn't
            // protected by it and rule matching still applies.
            try
            {
                if (!node.HasProperty(propertyAlias)) { return false; }

                // Read the invariant value first (covers invariant properties). The True/False
                // editor persists its value as 1/0 — sometimes as an int, sometimes as the string
                // "1"/"0" — so coerce the raw value rather than relying on a typed conversion.
                if (IsTruthy(node.GetValue(propertyAlias))) { return true; }

                // If the property varies by culture, the invariant read above is null and the
                // value lives under one of the node's cultures — check each of them.
                foreach (var culture in node.AvailableCultures ?? Enumerable.Empty<string>())
                {
                    if (IsTruthy(node.GetValue(propertyAlias, culture))) { return true; }
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger?.Warning(ex, "NodeProtect could not read property '{Alias}' on node {NodeId}; treating it as not protected.", propertyAlias, node.Id);
                return false;
            }
        }

        // Interprets the various ways a True/False value can be persisted as a boolean.
        private static bool IsTruthy(object value)
        {
            if (value is bool b) { return b; }
            if (value is int i) { return i != 0; }
            var s = value?.ToString()?.Trim().ToLowerInvariant();
            return s == "1" || s == "true";
        }

        /// <summary>
        /// Checks if a given rule applies to a given node
        /// </summary>
        /// <param name="rule">The rule</param>
        /// <param name="node">The node to check against the rule</param>
        /// <returns>True if a rule that prevents deletion has been found to match.</returns>
        private Result CheckRule(Rule rule, IContent node)
        {
            bool guidsDefined = !string.IsNullOrEmpty(rule.DocumentGuids);
            bool doctypesDefined = !string.IsNullOrEmpty(rule.DocTypeAlias);

            //If nothing has been defined, rule will not apply
            if (!guidsDefined && !doctypesDefined) { return null; }

            var doctypes = rule.DocTypeAlias?.Split(',');
            var guids = rule.DocumentGuids?.Split(",");

            if (doctypesDefined)
            {
                var currContentType = node.ContentType.Alias.ToLowerInvariant();
                foreach (string item in doctypes)
                {
                    if (item.ToLowerInvariant().Equals(currContentType))
                    {
                        return Result.GetResult(rule, node);
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
                        return Result.GetResult(rule, node);
                    }
                }
            }

            //No rules have been found to match, so node can be deleted
            return null;
        }
        #endregion
    }
}