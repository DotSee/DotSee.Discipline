namespace DotSee.Discipline.NodeProtect
{
    public class MessageConstants
    {
        public const string ErrorConfigNotFound = "NodeProtect: Configuration file was not found.";
        public const string ErrorLoadConfig = "NodeProtect: There was a problem loading NodeProtect configuration";
        public const string ErrorNodeAliasNotFound = "NodeProtect: Document type '{0}' does not exist. Aborting.";
        public const string InfoLoadConfigComplete = "NodeProtect: Loading configuration complete. {0} rule(s) loaded.";
        public const string InfoLoadingConfig = "NodeProtect: Loading configuration...";
        public const string InfoDeleteAttempt = "User {0} attempted to delete the protected node '{1}' but the rule prevented it from being deleted.";
    }
}