using Google.GenAI;
using Google.GenAI.Types;
using System.Text;

namespace DotSee.Discipline.AiSummary.Generators
{
    public class GeminiSummaryGenerator : ISummaryGenerator
    {
        public string Generate(string apiKey, string aiModel, string tone, int maxChars, string culture, string content)
        {
            StringBuilder promptBuilder = PromptHelper.ConstructPrompt(tone, maxChars);
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
                            Identify the primary language of the text after the 'Here is the text:' part and create a summary in that language. 
                            Do not output a response for identification.
                            Do not output any other response than the text summary itself.
                            If language is unclear, always fall back to the page's culture: " + culture
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
