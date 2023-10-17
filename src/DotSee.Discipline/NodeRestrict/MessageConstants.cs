namespace DotSee.Discipline.NodeRestrict
{
    public class MessageConstants
    {
        public const string ErrorConfigNotFound = "NodeRestrict: Configuration file was not found.";
        public const string ErrorCreateNode = "NodeRestrict: There was a problem creating node '{0}' under node '{1}'.";
        public const string ErrorDictionaryKeyNotFound = "NodeRestrict: The dictionary key specified in autoNode.config was not found.";
        public const string ErrorGeneric = "NodeRestrict: There was a problem with new node creation. Please check that the doctype alias you have defined in rules actually exists";
        public const string ErrorLoadConfig = "NodeRestrict: There was a problem loading AutoNode configuration";
        public const string ErrorNodeAliasNotFound = "NodeRestrict: Document type '{0}' does not exist. Aborting.";
        public const string ErrorRepublishNoSuccess = "NodeRestrict: Node '{0}' was not republished successfully under node '{1}'.";
        public const string ErrorSortFailed = "NodeRestrict: Bring new node first failed.";
        public const string InfoAbortCreateNodeNodeExists = "NodeRestrict: Aborting node creation since node already exists";
        public const string InfoAbortCreateNodeRuleRestrictions = "NodeRestrict: Aborting node creation due to rule restrictions. Parent node already has children, rule indicates that parent node should not have children";
        public const string InfoCreateNodeSuccess = "NodeRestrict: Node '{0}' was created successfully under node '{1}'.";
        public const string InfoLoadConfigComplete = "NodeRestrict: Loading configuration complete. {0} rule(s) loaded.";
        public const string InfoLoadingConfig = "NodeRestrict: Loading configuration...";
        public const string InfoRepublishingExistingNode = "NodeRestrict: Republishing already existing child node...";
        public const string InfoSortingNodes = "NodeRestrict: Bringing newly created node first...";
        public const string InfoTryCreateNode = "NodeRestrict: Trying to automatically create node of type {0} for node {1} of type {2}...";
        public const string InfoNotRepublishingExistingNode = "NodeRestrict: Skip republishing node {0} since it already exists and settings disallow republishing of existing nodes";
    }
}