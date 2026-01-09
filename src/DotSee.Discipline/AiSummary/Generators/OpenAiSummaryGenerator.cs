using OpenAI.Chat;
using System.Text;

namespace DotSee.Discipline.AiSummary.Generators
{
    public class OpenAiSummaryGenerator : ISummaryGenerator
    {
        public string Generate(string apiKey, string aiModel, string tone, int maxChars, string content)
        {
            StringBuilder promptBuilder = new StringBuilder();
            if (tone != null && tone != "")
            {
                promptBuilder.AppendLine($"Tone: {tone}");
            }
            promptBuilder.AppendLine($"Based on the text you will be given, write a short SEO-optimized description suitable for Open Graph meta tags.");
            promptBuilder.AppendLine($"Maximum {maxChars.ToString()} characters.");
            promptBuilder.AppendLine($"Do not use icons. Do not use emojis. Do not use hashtags. Do not use em dashes. Do not use bullet points. Do not use numbered lists. Do not use hashtags. Just text.");
            promptBuilder.AppendLine($"Make it clear, engaging, and summarise the main value. Do not add anything that isn't in the text.");
            promptBuilder.AppendLine($"Take all text under consideration.");
            promptBuilder.AppendLine("Identify the primary language of the text after the 'Here is the text:' part and create a summary in that language. Do not output a response for identification.");
            //promptBuilder.AppendLine($"Here is the text: {content}");

            var forceLang = new SystemChatMessage(promptBuilder.ToString());
            var userPrompt = new UserChatMessage($"Here is the text: {content}");

            ChatClient client = new(model: aiModel, apiKey: apiKey);

            var res = client.CompleteChatAsync(forceLang, userPrompt);

            return (res.Result.Value.Content[0].Text);
        }
    }
}
