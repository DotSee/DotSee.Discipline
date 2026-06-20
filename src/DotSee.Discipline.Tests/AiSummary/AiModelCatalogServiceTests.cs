using System.Collections.Generic;
using System.Linq;
using DotSee.Discipline.AiSummary;
using NUnit.Framework;

namespace DotSee.Discipline.Tests.AiSummary
{
    [TestFixture]
    public class AiModelCatalogServiceTests
    {
        private const string OpenAiJson = @"{
            ""object"": ""list"",
            ""data"": [
                { ""id"": ""gpt-4o"", ""object"": ""model"" },
                { ""id"": ""gpt-4o-mini"", ""object"": ""model"" },
                { ""id"": ""gpt-5-nano"", ""object"": ""model"" },
                { ""id"": ""gpt-3.5-turbo-instruct"", ""object"": ""model"" },
                { ""id"": ""gpt-4o-audio-preview"", ""object"": ""model"" },
                { ""id"": ""text-embedding-3-small"", ""object"": ""model"" },
                { ""id"": ""dall-e-3"", ""object"": ""model"" },
                { ""id"": ""whisper-1"", ""object"": ""model"" },
                { ""id"": ""tts-1"", ""object"": ""model"" },
                { ""id"": ""o1"", ""object"": ""model"" }
            ]
        }";

        [Test]
        public void ExtractOpenAiChatModelIds_KeepsOnlyChatModels()
        {
            var ids = AiModelCatalogService.ExtractOpenAiChatModelIds(OpenAiJson);

            Assert.That(ids, Is.EquivalentTo(new[] { "gpt-4o", "gpt-4o-mini", "gpt-5-nano" }));
        }

        [Test]
        public void FilterGeminiModelNames_KeepsGenerateContent_AndStripsPrefix()
        {
            var models = new (string Name, IEnumerable<string>? SupportedActions)[]
            {
                ("models/gemini-2.5-flash", new[] { "generateContent", "countTokens" }),
                ("models/gemini-2.5-flash-lite", new[] { "generateContent" }),
                ("models/gemini-2.5-pro", new[] { "generateContent" }),
                ("models/text-embedding-004", new[] { "embedContent" }),
                ("models/aqa", new[] { "generateAnswer" }),
                ("models/no-actions", null),
            };

            var names = AiModelCatalogService.FilterGeminiModelNames(models);

            Assert.That(names, Is.EquivalentTo(new[] { "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro" }));
        }

        [Test]
        public void BuildResult_OrdersCheapestFirst_AndDefaultsToCheapest_OpenAi()
        {
            var result = AiModelCatalogService.BuildResult(new[] { "gpt-4o", "gpt-4o-mini", "gpt-5-nano" });

            Assert.That(result.DefaultModel, Is.EqualTo("gpt-5-nano")); // nano is the cheapest tier
            Assert.That(result.Models.First(), Is.EqualTo("gpt-5-nano"));
            Assert.That(result.Models, Is.EqualTo(new[] { "gpt-5-nano", "gpt-4o-mini", "gpt-4o" }));
        }

        [Test]
        public void BuildResult_OrdersCheapestFirst_AndDefaultsToCheapest_Gemini()
        {
            var result = AiModelCatalogService.BuildResult(new[] { "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro" });

            Assert.That(result.DefaultModel, Is.EqualTo("gemini-2.5-flash-lite"));
            Assert.That(result.Models.First(), Is.EqualTo("gemini-2.5-flash-lite"));
            Assert.That(result.Models.Last(), Is.EqualTo("gemini-2.5-pro"));
        }

        [Test]
        public void BuildResult_DeduplicatesAndIgnoresBlanks()
        {
            var result = AiModelCatalogService.BuildResult(new[] { "gpt-4o", "gpt-4o", "", "  ", "gpt-4o-mini" });

            Assert.That(result.Models, Is.EqualTo(new[] { "gpt-4o-mini", "gpt-4o" }));
        }

        [TestCase("gpt-5-nano", 0)]
        [TestCase("gpt-4o-mini", 1)]
        [TestCase("gemini-2.5-flash-lite", 1)]
        [TestCase("gemini-2.5-flash", 3)]
        [TestCase("gemini-2.5-pro", 9)]
        [TestCase("gpt-4o", 5)]
        public void GetCheapnessRank_RanksByTier(string id, int expected)
        {
            Assert.That(AiModelCatalogService.GetCheapnessRank(id), Is.EqualTo(expected));
        }
    }
}
