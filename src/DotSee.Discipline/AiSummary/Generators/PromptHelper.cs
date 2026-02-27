using System.Text;

namespace DotSee.Discipline.AiSummary.Generators
{
    public static class PromptHelper
    {
        public static StringBuilder ConstructPrompt(string tone, int maxChars)
        {
            StringBuilder promptBuilder = new StringBuilder();
            if (tone != null && tone != "")
            {
                promptBuilder.AppendLine($"Tone: {tone}");
            }
            promptBuilder.AppendLine($"Task: Based on the text you will be given, write a short SEO-optimized description suitable for Open Graph meta tags.");
            promptBuilder.AppendLine($"Length: Maximum {maxChars.ToString()} characters.");
            promptBuilder.AppendLine($"Rules: Do not use icons. Do not use emojis. Do not use hashtags. Do not use em dashes. Do not use bullet points. Do not use numbered lists. Do not use hashtags. Just text.");
            promptBuilder.AppendLine($"Make it clear, engaging, and summarise the main value.");
            promptBuilder.AppendLine($"Take all text under consideration.");
            promptBuilder.AppendLine("Accuracy: Do not add facts not present in the text.");

            return promptBuilder;
        }
    }
}
