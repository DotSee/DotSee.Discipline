namespace DotSee.Discipline.NodeRestrict
{
    /// <summary>
    /// Holds rules for restricting node publishing.
    /// </summary>
    public class Rule
    {
        /// <summary>
        /// The parent document type alias
        /// </summary>
        public string ParentDocType { get;  set; }
        /// <summary>
        /// The child document type alias (that is, the document being published)
        /// </summary>
        public string ChildDocType { get;  set; }
        /// <summary>
        /// The maximum number of child nodes allowed for the parent document type alias
        /// </summary>
        public int MaxNodes { get;  set; }
        /// <summary>
        /// Indicates whether the rule has been created on the fly based on the document's special property (true) or is a rule that comes from the config file (false)
        /// </summary>
        public bool ShowWarnings { get;  set; }
        /// <summary>
        /// If true, a warning message will be displayed when a node is published and a rule is in effect, if the limit has not been reached
        /// </summary>
        public string CustomMessage { get;  set; }
        /// <summary>
        /// A custom "limit reached" message. This overrides the standard message.
        /// </summary>
        public string CustomMessageCategory { get;  set; }
        /// <summary>
        /// Custom category for the "limit reached" message. This overrides the standard category literal.
        /// </summary>
        public string CustomWarningMessage { get;  set; }
        /// <summary>
        /// A custom warning message. This overrides the standard message.
        /// </summary>
        public string CustomWarningMessageCategory { get;  set; }
        /// <summary>
        /// Custom category for the warning message. This overrides the standard category literal.
        /// </summary>
        public bool FromProperty { get;  set; }


        public Rule()
        {
                
        }

        /// <summary>
        /// Holds the data for a node restriction rule.
        /// </summary>
        /// <param name="parentDocType">The parent document type alias</param>
        /// <param name="childDocType">The child document type alias (that is, the document being published)</param>
        /// <param name="maxNodes">The maximum number of child nodes allowed for the parent document type alias</param>
        /// <param name="fromProperty">Indicates whether the rule has been created on the fly based on the document's special property (true) or is a rule that comes from the config file (false)</param>
        /// <param name="showWarnings">If true, a warning message will be displayed when a node is published and a rule is in effect, if the limit has not been reached</param>
        /// <param name="customMessage">A custom "limit reached" message. This overrides the standard message.</param>
        /// <param name="customMessageCategory">Custom category for the "limit reached" message. This overrides the standard category literal.</param>
        /// <param name="customWarningMessage">A custom warning message. This overrides the standard message.</param>
        /// <param name="customWarningMessageCategory">Custom category for the warning message. This overrides the standard category literal.</param>
        public Rule(
            string parentDocType,
            string childDocType,
            int maxNodes,
            bool fromProperty = false,
            bool showWarnings = false,
            string customMessage = "",
            string customMessageCategory = "",
            string customWarningMessage = "",
            string customWarningMessageCategory = "")
        {
            ParentDocType = parentDocType;
            ChildDocType = childDocType;
            MaxNodes = maxNodes;
            FromProperty = fromProperty;
            ShowWarnings = showWarnings;
            CustomMessage = customMessage;
            CustomMessageCategory = customMessageCategory;
            CustomWarningMessage = customWarningMessage;
            CustomWarningMessageCategory = customWarningMessageCategory;

        }
    }
}
