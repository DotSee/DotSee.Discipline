using System.Linq;
using Umbraco.Core.Composing;
using Umbraco.Core.Services;

namespace DotSee.NodeRestrict
{
    /// <summary>
    /// Holds rules for restricting node publishing.
    /// </summary>
    public class RuleMessageManager
    {
        private Rule _rule;
        private string _parentDocTypeName;
        private string _childDocTypeName;

        public RuleMessageManager(Rule rule)
        {
            _rule = rule;
            IContentTypeService _cst = Current.Services.ContentTypeService;

            _parentDocTypeName = _cst.GetAll().Where(x => x.Alias.ToLower() == _rule.ParentDocType.ToLower()).FirstOrDefault()?.Name;
            _childDocTypeName = _cst.GetAll().Where(x => x.Alias.ToLower() == _rule.ChildDocType.ToLower()).FirstOrDefault()?.Name;
        }
        /// <summary>
        /// Returns the message to be displayed when a node publishing limit has been reached
        /// </summary>
        /// <returns></returns>
        public string GetMessage()
        {
            //Custom message overrides everything
            if (!string.IsNullOrEmpty(_rule.CustomMessage)) {return (_rule.CustomMessage);}

            //Return a standard message if this rule is created on the fly based on a special document property value
            if (_rule.FromProperty)
            {
                return (string.Format("Node saved but not published. Max allowed children: {0}.", _rule.MaxNodes.ToString()));
            }
            
            //This is the message that is returned when a rule is in the config file, and no custom message has been defined.
            return string.Format(
                "Node saved but not published. Max allowed children {1} directly under {2}: {0}."
                , _rule.MaxNodes.ToString()
                , _rule.ChildDocType.Equals("*") ? "of any type" : string.Format("of type \"{0}\"", _childDocTypeName)
                , _rule.ParentDocType.Equals("*") ? "any node" : string.Format("nodes of type \"{0}\"", _parentDocTypeName)
                );
        }

        /// <summary>
        /// Returns the literal for the message category
        /// </summary>
        /// <returns></returns>
        public string GetMessageCategory()
        {
            return (string.IsNullOrEmpty(_rule.CustomMessageCategory) ? "Publish" : _rule.CustomMessageCategory);
        }

        /// <summary>
        /// Returns the warning message to be displayed on publishing a node when a rule is in effect but the limit has not been reached.
        /// </summary>
        /// <param name="currentNodeCount"></param>
        /// <returns></returns>
        public string GetWarningMessage(int currentNodeCount)
        {
            //Custom message overrides everything
            if (!string.IsNullOrEmpty(_rule.CustomWarningMessage)) { return (_rule.CustomWarningMessage); }

            //Return a standard message if this rule is created on the fly based on a special document property value
            if (_rule.FromProperty)
            {
                return (string.Format("Restrictions for this node are in place. You have published {0} out {1} allowed child nodes.", (currentNodeCount+1).ToString(), _rule.MaxNodes.ToString()));
            }

            //This is the message that is returned when a rule is in the config file, and no custom message has been defined.
            return string.Format(
                "Restrictions in place. {3} directly under {2}: {1} of {0} allowed."
                , _rule.MaxNodes.ToString()
                , (currentNodeCount + 1).ToString()
                , _rule.ParentDocType.Equals("*") ? "any node" : string.Format("nodes of type \"{0}\"", _parentDocTypeName)
                , _rule.ChildDocType.Equals("*") ? "Any node" : string.Format("Nodes of type \"{0}\"", _childDocTypeName)
                );
            
        }
        /// <summary>
        /// Returns the literal for the warning message category
        /// </summary>
        /// <returns></returns>
        public string GetWarningMessageCategory()
        {
            return (string.IsNullOrEmpty(_rule.CustomWarningMessageCategory) ? "Publish" : _rule.CustomWarningMessageCategory);
        }

    }
}
