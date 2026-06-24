using System;
using System.IO;
using DotSee.Discipline.Backoffice;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Moq;
using NUnit.Framework;

namespace DotSee.Discipline.Tests.Backoffice
{
    [TestFixture]
    public class DisciplineSettingsStoreTests
    {
        private const string PlainKey = "sk-super-secret-key-123";
        private string _tempRoot = string.Empty;

        [SetUp]
        public void SetUp()
        {
            _tempRoot = Path.Combine(Path.GetTempPath(), "dotsee-store-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(_tempRoot);
        }

        [TearDown]
        public void TearDown()
        {
            if (Directory.Exists(_tempRoot)) { Directory.Delete(_tempRoot, true); }
        }

        private string SettingsFilePath()
            => Path.Combine(_tempRoot, "umbraco", "Data", "DotSee.Discipline", "settings.json");

        private DisciplineSettingsStore CreateStore(IDataProtectionProvider provider)
        {
            var env = new Mock<IWebHostEnvironment>();
            env.Setup(e => e.ContentRootPath).Returns(_tempRoot);
            return new DisciplineSettingsStore(env.Object, new Mock<Serilog.ILogger>().Object, provider);
        }

        [Test]
        public void Save_EncryptsApiKeyAtRest_AndLoadDecryptsIt()
        {
            // One provider instance shared between the two stores so they share protection keys.
            var provider = new EphemeralDataProtectionProvider();

            var store = CreateStore(provider);
            var settings = new DisciplineSettings
            {
                AiSummary = new AiSummaryFeatureSettings { Enabled = true, ApiKey = PlainKey },
            };
            store.Save(settings);

            // The in-memory value stays plaintext so the handlers / UI keep working.
            Assert.That(settings.AiSummary.ApiKey, Is.EqualTo(PlainKey));

            // The persisted file must NOT contain the plaintext key.
            var onDisk = File.ReadAllText(SettingsFilePath());
            Assert.That(onDisk, Does.Not.Contain(PlainKey), "API key was written to disk in plaintext.");

            // A fresh store reading the file decrypts the key back to plaintext.
            var freshStore = CreateStore(provider);
            var loaded = freshStore.Load();
            Assert.That(loaded.AiSummary.ApiKey, Is.EqualTo(PlainKey));
        }

        [Test]
        public void Load_LegacyPlaintextApiKey_IsReturnedAsIs()
        {
            // A settings.json written before encryption existed (plaintext key).
            Directory.CreateDirectory(Path.GetDirectoryName(SettingsFilePath())!);
            File.WriteAllText(SettingsFilePath(), "{\"aiSummary\":{\"enabled\":true,\"apiKey\":\"legacy-plain-key\"}}");

            var store = CreateStore(new EphemeralDataProtectionProvider());
            var loaded = store.Load();

            Assert.That(loaded.AiSummary.ApiKey, Is.EqualTo("legacy-plain-key"));
        }

        [Test]
        public void Save_EmptyApiKey_StaysEmpty()
        {
            var provider = new EphemeralDataProtectionProvider();
            var store = CreateStore(provider);
            store.Save(new DisciplineSettings { AiSummary = new AiSummaryFeatureSettings { ApiKey = string.Empty } });

            var loaded = CreateStore(provider).Load();
            Assert.That(loaded.AiSummary.ApiKey, Is.EqualTo(string.Empty));
        }

        [Test]
        public void Save_Twice_AtomicallyReplaces_AndLoadReadsLatest_WithoutTempLeftover()
        {
            var provider = new EphemeralDataProtectionProvider();
            var store = CreateStore(provider);

            // First save creates the file (File.Move); second overwrites it (File.Replace).
            store.Save(new DisciplineSettings { AiSummary = new AiSummaryFeatureSettings { ApiKey = "first-key" } });
            store.Save(new DisciplineSettings { AiSummary = new AiSummaryFeatureSettings { ApiKey = "second-key" } });

            Assert.That(File.Exists(SettingsFilePath() + ".tmp"), Is.False, "Temp file was left behind.");
            var loaded = CreateStore(provider).Load();
            Assert.That(loaded.AiSummary.ApiKey, Is.EqualTo("second-key"));
        }
    }
}
