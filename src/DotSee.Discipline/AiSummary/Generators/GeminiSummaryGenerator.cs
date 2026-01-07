using Google.GenAI;
using Google.GenAI.Types;
using System.Text;

namespace DotSee.Discipline.AiSummary.Generators
{
    public class GeminiSummaryGenerator : ISummaryGenerator
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
            promptBuilder.AppendLine($"Do not use icons. Do not use emojis. Do not use hashtags. Do not use em dashes. Do not use bullet points. Do not use numbered lists. Just text.");
            promptBuilder.AppendLine($"Make it clear, engaging, and summarise the main value. Do not add anything that isn't in the text.");
            promptBuilder.AppendLine($"Take all text under consideration.");
            promptBuilder.AppendLine($"Here is the text: {content}");

            var config = new GenerateContentConfig
            {
                SystemInstruction = new Content
                {
                    Parts = new List<Part>
                    {
                        new Part
                        {
                            Text =
                            @"Always respond in the SAME language as the input text.
                            Never translate unless the user explicitly asks for translation.
                            Identify the primary language of the text after the 'Here is the text:' part and create a summary in that language. Do not output a response for identification."
                        }
                    }
                }
            };

            var client = new Client(apiKey: apiKey);

            var res = client.Models.GenerateContentAsync(model: aiModel, contents: promptBuilder.ToString(), config: config);

            return (res.Result.Candidates[0].Content.Parts[0].Text);
        }
    }
}
