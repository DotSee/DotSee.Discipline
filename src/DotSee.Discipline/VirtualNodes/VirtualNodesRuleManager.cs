

using DotSee.Discipline.Interfaces;

namespace DotSee.Discipline.VirtualNodes
{
    /// <summary>
    /// Loads rules for VirtualNodesUrlProvider
    /// </summary>
    public sealed class VirtualNodesRuleManager
    {
        public VirtualNodesRuleManager(IRuleProviderService<IEnumerable<String>> ruleProvider)
        {
           _ruleProvider = ruleProvider;
        }

        #region Private Members

        private readonly IRuleProviderService<IEnumerable<string>> _ruleProvider;

        #endregion

        #region Public Members

        /// <summary>
        /// Gets the list of rules.
        /// Read fresh from the rule provider on every access so that enabling/disabling the
        /// feature (or editing rules) from the backoffice takes effect immediately, without an
        /// app restart. The underlying settings store is cached and invalidated on save, so this
        /// is cheap. When the feature is disabled the resolver returns an empty rule set.
        /// </summary>
        public List<string> Rules => _ruleProvider.Rules?.ToList() ?? new List<string>();

        #endregion
    }
}
