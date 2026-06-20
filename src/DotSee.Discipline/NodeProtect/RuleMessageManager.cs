using System.Collections.Generic;
using System.Globalization;
using Umbraco.Cms.Core.Services;

namespace DotSee.Discipline.NodeProtect
{
    /// <summary>
    /// Holds messages related to node deletion prevention
    /// </summary>
    public class RuleMessageManager
    {
        private readonly Rule _rule;
        private readonly ILocalizedTextService _localizedTextService;

        public RuleMessageManager(Rule rule, ILocalizedTextService localizedTextService)
        {
            _rule = rule;
            _localizedTextService = localizedTextService;
        }

        /// <summary>
        /// Returns the message to be displayed when a node is protected from deletion
        /// </summary>
        public string GetMessage(Result result)
        {
            //Custom message overrides everything
            if (!string.IsNullOrEmpty(_rule.CustomMessage)) { return (_rule.CustomMessage); }

            return _localizedTextService.Localize(
                "dotseeDiscipline",
                "nodeProtectDefaultMessage",
                CultureInfo.CurrentUICulture,
                new Dictionary<string, string> { { "0", result.NodeName }, { "1", result.NodeId.ToString() } });
        }

        /// <summary>
        /// Returns the literal for the message category
        /// </summary>
        public string GetMessageCategory()
        {
            if (!string.IsNullOrEmpty(_rule.CustomMessageCategory)) { return _rule.CustomMessageCategory; }

            return _localizedTextService.Localize("dotseeDiscipline", "nodeProtectDefaultCategory", CultureInfo.CurrentUICulture);
        }
    }
}
