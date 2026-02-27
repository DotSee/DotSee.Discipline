using OpenAI.Chat;
using System.Text;

namespace DotSee.Discipline.AiSummary.Generators
{
    public class OpenAiSummaryGenerator : ISummaryGenerator
    {
        public string Generate(string apiKey, string aiModel, string tone, int maxChars, string culture, string content)
        {
            StringBuilder promptBuilder = PromptHelper.ConstructPrompt(tone, maxChars);
            promptBuilder.AppendLine("Identify the primary language of the text after the 'Here is the text:' part and create a summary in that language. Do not output a response for identification.");
            promptBuilder.AppendLine("Do not output any other response than the text summary itself.");
            promptBuilder.AppendLine("If unclear, always fall back to the page's culture: " + culture);
            var forceLang = new SystemChatMessage(promptBuilder.ToString());
            var userPrompt = new UserChatMessage($"Here is the text: {content}");

            ChatClient client = new(model: aiModel, apiKey: apiKey);

            var res = client.CompleteChatAsync(forceLang, userPrompt);

            return (res.Result.Value.Content[0].Text);
        }
    }
}
