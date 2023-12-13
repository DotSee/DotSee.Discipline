

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
            _rules = new List<string>();

            if (!_ruleProvider.Rules.Any()) { return; }
            _rules.AddRange(_ruleProvider.Rules);
        }

        #region Private Members



        /// <summary>
        /// The list of rule objects
        /// </summary>
        private List<string> _rules;
        private readonly IRuleProviderService<IEnumerable<string>> _ruleProvider;

        #endregion

        #region Public Members

        /// <summary>
        /// Gets the list of rules
        /// </summary>
        public List<string> Rules { get { return _rules; } }

        #endregion

        #region Constructors



        #endregion
    }
}
