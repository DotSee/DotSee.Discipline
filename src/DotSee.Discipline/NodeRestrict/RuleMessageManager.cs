using System.Collections.Generic;
using System.Globalization;
using Umbraco.Cms.Core.Services;

namespace DotSee.Discipline.NodeRestrict
{
    /// <summary>
    /// Holds rules for restricting node publishing.
    /// </summary>
    public class RuleMessageManager
    {
        private readonly Rule _rule;
        private readonly string _parentDocTypeName;
        private readonly string _childDocTypeName;
        private readonly ILocalizedTextService _localizedTextService;

        public RuleMessageManager(Rule rule, IContentTypeService contentTypeService, ILocalizedTextService localizedTextService)
        {
            _rule = rule;
            _localizedTextService = localizedTextService;
            IContentTypeService _cst = contentTypeService;

            //ParentDocType is empty for rules that apply at the content tree root.
            _parentDocTypeName = string.IsNullOrEmpty(_rule.ParentDocType)
                ? null
                : _cst.GetAll().Where(x => x.Alias.ToLower() == _rule.ParentDocType.ToLower()).FirstOrDefault()?.Name;
            _childDocTypeName = _cst.GetAll().Where(x => x.Alias.ToLower() == _rule.ChildDocType.ToLower()).FirstOrDefault()?.Name;
        }

        /// <summary>
        /// Returns the phrase describing where the rule applies ("the content root", "any node" or "nodes of type '...'").
        /// </summary>
        private string GetParentPart()
        {
            if (_rule.AtRoot) { return Localize("nodeRestrictAtRoot"); }

            return _rule.ParentDocType.Equals("*")
                ? Localize("nodeRestrictAnyNode")
                : Localize("nodeRestrictNodesOfType", _parentDocTypeName);
        }

        /// <summary>
        /// Returns the message to be displayed when a node publishing limit has been reached
        /// </summary>
        public string GetMessage()
        {
            //Custom message overrides everything
            if (!string.IsNullOrEmpty(_rule.CustomMessage)) { return (_rule.CustomMessage); }

            //Return a standard message if this rule is created on the fly based on a special document property value
            if (_rule.FromProperty)
            {
                return Localize("nodeRestrictFromProperty", _rule.MaxNodes.ToString());
            }

            var childPart = _rule.ChildDocType.Equals("*")
                ? Localize("nodeRestrictOfAnyType")
                : Localize("nodeRestrictOfType", _childDocTypeName);

            var parentPart = GetParentPart();

            return Localize("nodeRestrictDefault", _rule.MaxNodes.ToString(), childPart, parentPart);
        }

        /// <summary>
        /// Returns the literal for the message category
        /// </summary>
        public string GetMessageCategory()
        {
            if (!string.IsNullOrEmpty(_rule.CustomMessageCategory)) { return _rule.CustomMessageCategory; }

            return Localize("nodeRestrictDefaultCategory");
        }

        /// <summary>
        /// Returns the warning message to be displayed on publishing a node when a rule is in effect but the limit has not been reached.
        /// </summary>
        public string GetWarningMessage(int currentNodeCount)
        {
            //Custom message overrides everything
            if (!string.IsNullOrEmpty(_rule.CustomWarningMessage)) { return (_rule.CustomWarningMessage); }

            //Return a standard message if this rule is created on the fly based on a special document property value
            if (_rule.FromProperty)
            {
                return Localize("nodeRestrictWarningFromProperty", (currentNodeCount + 1).ToString(), _rule.MaxNodes.ToString());
            }

            var parentPart = GetParentPart();

            var childPart = _rule.ChildDocType.Equals("*")
                ? Localize("nodeRestrictAnyNodeCap")
                : Localize("nodeRestrictNodesOfTypeCap", _childDocTypeName);

            return Localize("nodeRestrictWarningDefault", _rule.MaxNodes.ToString(), (currentNodeCount + 1).ToString(), parentPart, childPart);
        }

        /// <summary>
        /// Returns the literal for the warning message category
        /// </summary>
        public string GetWarningMessageCategory()
        {
            if (!string.IsNullOrEmpty(_rule.CustomWarningMessageCategory)) { return _rule.CustomWarningMessageCategory; }

            return Localize("nodeRestrictDefaultCategory");
        }

        private string Localize(string key, params string[] tokens)
        {
            if (tokens.Length == 0)
            {
                return _localizedTextService.Localize("dotseeDiscipline", key, CultureInfo.CurrentUICulture);
            }

            var dict = new Dictionary<string, string>(tokens.Length);
            for (int i = 0; i < tokens.Length; i++)
            {
                dict[i.ToString()] = tokens[i];
            }

            return _localizedTextService.Localize("dotseeDiscipline", key, CultureInfo.CurrentUICulture, dict);
        }
    }
}
