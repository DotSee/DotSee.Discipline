namespace DotSee.Discipline.NodeProtect
{
    /// <summary>
    /// Holds rules for protecting nodes from deletion
    /// </summary>
    public class Rule
    {
        /// <summary>
        /// Doctype alias that will not be allowed to be deleted
        /// </summary>
        public string DocTypeAlias { get; set; }
        /// <summary>
        /// Document GUIDs that will not be allowed to be deleted
        /// </summary>
        public string DocumentGuids { get; set; }
        /// <summary>
        /// A custom "node protected" message. This overrides the standard message.
        /// </summary>
        public string CustomMessage { get; set; }
        /// <summary>
        /// A custom message category for the "node protected" message.
        /// </summary>
        public string CustomMessageCategory { get; set; }
        /// <summary>
        /// Set this to true to make the rule be ignored if the user performing the action is an admin
        /// </summary>
        public bool? IgnoreForAdmins { get; set; } = false;

        public Rule()
        { }

        /// <summary>
        /// Holds the data for a node restriction rule.
        /// </summary>
        /// <param name="docTypeAlias">Doctype alias that will not be allowed to be deleted</param>
        /// <param name="documentGuids">Document GUIDs that will not be allowed to be deleted</param>
        /// <param name="ignoreForAdmins">Set this to true to make the rule be ignored if the user performing the action is an admin</param>
        /// <param name="customMessage">A custom "node protected" message. This overrides the standard message.</param>
        /// <param name="customMessageCategory">A custom message category for the "node protected" message.</param>
        public Rule(
            string docTypeAlias,
            string documentGuids,
            bool? ignoreForAdmins = false,
            string customMessage = "",
            string customMessageCategory = "")
        {
            DocTypeAlias = docTypeAlias;
            DocumentGuids = documentGuids;
            IgnoreForAdmins = ignoreForAdmins;
            CustomMessage = customMessage;
            CustomMessageCategory = customMessageCategory;
        }
    }
}
