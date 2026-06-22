using System.Threading;
using System.Threading.Tasks;
using DotSee.Discipline.AiSummary;
using DotSee.Discipline.Backoffice;
using DotSee.Discipline.Backoffice.ApiControllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Umbraco.Cms.Core.Services;

namespace DotSee.Discipline.Tests.Backoffice
{
    /// <summary>
    /// Covers the API-key masking on the settings round-trip: the real key is never sent to the
    /// browser, an unchanged mask preserves the stored key, and the models endpoint resolves the
    /// mask back to the stored key.
    /// </summary>
    [TestFixture]
    public class DisciplineSettingsControllerTests
    {
        private const string StoredKey = "sk-real-secret-key";
        private const string Mask = "********";

        private FakeStore _store = null!;
        private Mock<IAiModelCatalogService> _catalog = null!;

        private DisciplineSettingsController CreateController(string storedApiKey)
        {
            _store = new FakeStore(new DisciplineSettings
            {
                AiSummary = new AiSummaryFeatureSettings { Enabled = true, Llm = "openai", ApiKey = storedApiKey },
            });

            var appSettings = new Mock<IDisciplineAppSettingsReader>();
            appSettings.Setup(a => a.HasAppSettings()).Returns(false);

            _catalog = new Mock<IAiModelCatalogService>();
            _catalog.Setup(c => c.GetModelsAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                    .ReturnsAsync(new AiModelListResult());

            return new DisciplineSettingsController(
                _store,
                appSettings.Object,
                new Mock<IDisciplineSettingsResolver>().Object,
                new Mock<IConfiguration>().Object,
                new Mock<IContentTypeService>().Object,
                new Mock<IContentService>().Object,
                new Mock<ILocalizedTextService>().Object,
                _catalog.Object,
                new Mock<ILogger<DisciplineSettingsController>>().Object);
        }

        [Test]
        public void GetSettings_MasksApiKey_AndKeepsRealKeyInStore()
        {
            var controller = CreateController(StoredKey);

            var response = (DisciplineSettingsResponse)((OkObjectResult)controller.GetSettings()).Value!;

            Assert.That(response.Settings.AiSummary.ApiKey, Is.EqualTo(Mask), "Real key was sent to the UI.");
            // The in-memory store still holds the real key for the feature handlers.
            Assert.That(_store.Load().AiSummary.ApiKey, Is.EqualTo(StoredKey));
        }

        [Test]
        public void SaveSettings_WithMaskUnchanged_PreservesStoredKey()
        {
            var controller = CreateController(StoredKey);

            controller.SaveSettings(new DisciplineSettings
            {
                AiSummary = new AiSummaryFeatureSettings { Enabled = true, ApiKey = Mask },
            });

            Assert.That(_store.Load().AiSummary.ApiKey, Is.EqualTo(StoredKey));
        }

        [Test]
        public void SaveSettings_WithNewKey_StoresNewKey()
        {
            var controller = CreateController(StoredKey);

            controller.SaveSettings(new DisciplineSettings
            {
                AiSummary = new AiSummaryFeatureSettings { Enabled = true, ApiKey = "sk-brand-new" },
            });

            Assert.That(_store.Load().AiSummary.ApiKey, Is.EqualTo("sk-brand-new"));
        }

        [Test]
        public async Task GetAiSummaryModels_WithMask_UsesStoredKey()
        {
            var controller = CreateController(StoredKey);

            await controller.GetAiSummaryModels(
                new AiSummaryModelsRequest { Llm = "openai", ApiKey = Mask },
                CancellationToken.None);

            _catalog.Verify(c => c.GetModelsAsync("openai", StoredKey, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public async Task GetAiSummaryModels_WithExplicitKey_UsesThatKey()
        {
            var controller = CreateController(StoredKey);

            await controller.GetAiSummaryModels(
                new AiSummaryModelsRequest { Llm = "openai", ApiKey = "sk-typed-now" },
                CancellationToken.None);

            _catalog.Verify(c => c.GetModelsAsync("openai", "sk-typed-now", It.IsAny<CancellationToken>()), Times.Once);
        }

        private sealed class FakeStore : IDisciplineSettingsStore
        {
            private DisciplineSettings _settings;
            public FakeStore(DisciplineSettings settings) => _settings = settings;
            public DisciplineSettings Load() => _settings;
            public void Save(DisciplineSettings settings) => _settings = settings;
        }
    }
}
