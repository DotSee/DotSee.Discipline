namespace DotSee.NodeRestrict
{
    /// <summary>
    /// Holds rules for restricting node publishing.
    /// </summary>
    public class Rule
    {
        public string ParentDocType { get; private set; }
        public string ChildDocType { get; private set; }
        public int MaxNodes { get; private set; }
        public bool ShowWarnings { get; private set; }
        public string CustomMessage { get; private set; }
        public string CustomMessageCategory { get; private set; }
        public string CustomWarningMessage { get; private set; }
        public string CustomWarningMessageCategory { get; private set; }
        public bool FromProperty { get; private set; }

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
            bool showWarnings=false, 
            string customMessage="", 
            string customMessageCategory="", 
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
