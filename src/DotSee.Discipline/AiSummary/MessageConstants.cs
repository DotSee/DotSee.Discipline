namespace DotSee.Discipline.AiSummary
{
    public class MessageConstants
    {
        public const string ErrorConfigNotFound = "AiSummary: Configuration file was not found.";
        public const string ErrorLoadConfig = "AiSummary: There was a problem loading AiSummary configuration";
        public const string ErrorNodeAliasNotFound = "AiSummary: Document type '{0}' does not exist. Aborting.";
        public const string ErrorContentSaving = "AiSummary: An error occurred while generating AI summary for content ID {NodeId} with name '{NodeName}'.";
        public const string InfoLoadConfigComplete = "AiSummary: Loading configuration complete.";
        public const string InfoLoadingConfig = "AiSummary: Loading configuration...";
    }
}