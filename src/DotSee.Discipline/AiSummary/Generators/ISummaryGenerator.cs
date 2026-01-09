namespace DotSee.Discipline.AiSummary.Generators
{
    public interface ISummaryGenerator
    {
        string Generate(string apiKey, string aiModel, string tone, int maxChars, string content);
    }
}