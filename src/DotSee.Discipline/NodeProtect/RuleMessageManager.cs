namespace DotSee.Discipline.NodeProtect
{
    /// <summary>
    /// Holds messages related to node deletion prevention
    /// </summary>
    public class RuleMessageManager
    {
        private Rule _rule;

        public RuleMessageManager(Rule rule)
        {
            _rule = rule;
        }
        /// <summary>
        /// Returns the message to be displayed when a node is protected from deletion
        /// </summary>
        /// <returns></returns>
        public string GetMessage(Result result)
        {
            //Custom message overrides everything
            if (!string.IsNullOrEmpty(_rule.CustomMessage)) { return (_rule.CustomMessage); }

            //This is the message that is returned when a rule is in the config file, and no custom message has been defined.
            return $"Node '{result.NodeName}' (id: {result.NodeId}) is protected and cannot be deleted.";
        }

        /// <summary>
        /// Returns the literal for the message category
        /// </summary>
        /// <returns></returns>
        public string GetMessageCategory()
        {
            return (string.IsNullOrEmpty(_rule.CustomMessageCategory) ? "Delete" : _rule.CustomMessageCategory);
        }
    }
}
