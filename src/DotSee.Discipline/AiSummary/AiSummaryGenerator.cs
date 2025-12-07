using OpenAI.Chat;
using System.Text;

namespace DotSee.Discipline.AiSummary
{
    public class AiSummaryGenerator
    {
        public string Generate(string apiKey, string aiModel, string tone, int maxChars, string content)
        {
            StringBuilder promptBuilder = new StringBuilder();
            if (tone != null && tone != "")
            {
                promptBuilder.AppendLine($"Tone: {tone}");
            }
            promptBuilder.AppendLine($"Based on the following text, write a short SEO-optimized description suitable for Open Graph meta tags.");
            promptBuilder.AppendLine($"Maximum {maxChars.ToString()} characters.");
            promptBuilder.AppendLine($"Do not use icons. Do not use em dashes. Do not use bullet points. Do not use numbered lists. Just text.");
            promptBuilder.AppendLine($"Make it clear, engaging, and summarise the main value. Do not add anything that isn't in the text.");
            promptBuilder.AppendLine($"Here is the text: {content}");

            ChatClient client = new(model: aiModel, apiKey: apiKey);

            var res = client.CompleteChatAsync(aiModel, promptBuilder.ToString());

            return (res.Result.Value.Content[0].Text);
        }
    }
}
