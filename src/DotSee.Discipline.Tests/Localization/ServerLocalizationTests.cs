using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Xml.Linq;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Abstractions;
using NUnit.Framework;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Services;

namespace DotSee.Discipline.Tests.Localization
{
    [TestFixture]
    public class ServerLocalizationTests
    {
        // The shipped server-side language file (static web asset source).
        private static string ShippedLangFile()
            => Path.GetFullPath(Path.Combine(
                AppContext.BaseDirectory, "..", "..", "..", "..",
                "DotSee.Discipline", "Client", "public", "lang", "en.xml"));

        private static readonly string[] RequiredKeys =
        {
            "aiSummaryCategory", "aiSummaryGenerated", "aiSummaryError",
            "nodeProtectDefaultCategory", "nodeProtectDefaultMessage",
            "nodeRestrictDefaultCategory", "nodeRestrictDefault", "nodeRestrictFromProperty",
            "nodeRestrictOfAnyType", "nodeRestrictOfType", "nodeRestrictAnyNode", "nodeRestrictAtRoot", "nodeRestrictNodesOfType",
            "nodeRestrictWarningDefault", "nodeRestrictWarningFromProperty",
            "nodeRestrictAnyNodeCap", "nodeRestrictNodesOfTypeCap",
            "apiSettingsRequired", "apiNoAppsettingsFound",
        };

        [Test]
        public void ShippedLanguageFile_IsWellFormed_AndContainsAllServerSideKeys()
        {
            var path = ShippedLangFile();
            if (!File.Exists(path)) { Assert.Ignore($"Shipped lang file not found at {path}"); }

            var doc = XDocument.Load(path);
            var area = doc.Root?.Elements("area").FirstOrDefault(a => (string)a.Attribute("alias") == "dotseeDiscipline");
            Assert.That(area, Is.Not.Null, "Missing <area alias=\"dotseeDiscipline\">.");

            var keys = area!.Elements("key").Select(k => (string)k.Attribute("alias")).ToHashSet();
            foreach (var required in RequiredKeys)
            {
                Assert.That(keys, Does.Contain(required), $"Missing key '{required}' in shipped en.xml.");
            }
        }

        [Test]
        public void LocalizedTextService_ResolvesDotseeDisciplineKeys_FromShippedFile()
        {
            var shipped = ShippedLangFile();
            if (!File.Exists(shipped)) { Assert.Ignore($"Shipped lang file not found at {shipped}"); }

            // Master 'en-US' culture (as Umbraco core ships) in one folder; the supplementary file in another.
            var masterDir = Path.Combine(Path.GetTempPath(), "dotsee-master-" + Guid.NewGuid().ToString("N"));
            var langDir = Path.Combine(Path.GetTempPath(), "dotsee-lang-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(masterDir);
            Directory.CreateDirectory(langDir);
            File.WriteAllText(Path.Combine(masterDir, "en-US.xml"),
                "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
                "<language alias=\"en\" culture=\"en-US\"><area alias=\"testArea\"><key alias=\"k\">v</key></area></language>");
            File.Copy(shipped, Path.Combine(langDir, "en.xml"));

            try
            {
                // Dispose the provider (releasing any file-system watcher) before the finally block
                // recursively deletes langDir. The returned PhysicalFileInfo wraps the path
                // independently, so it keeps working after the provider is disposed.
                using var fileProvider = new PhysicalFileProvider(langDir);
                var supplementary = new LocalizedTextServiceSupplementaryFileSource(
                    fileProvider.GetFileInfo("en.xml"), false);

                var sources = new LocalizedTextServiceFileSources(
                    NullLogger<LocalizedTextServiceFileSources>.Instance,
                    AppCaches.NoCache,
                    new DirectoryInfo(masterDir),
                    new[] { supplementary },
                    new NotFoundDirectoryContents());

                var service = new LocalizedTextService(
                    new Lazy<LocalizedTextServiceFileSources>(() => sources),
                    NullLogger<LocalizedTextService>.Instance);

                var enUs = CultureInfo.GetCultureInfo("en-US");

                Assert.Multiple(() =>
                {
                    Assert.That(service.Localize("dotseeDiscipline", "aiSummaryError", enUs),
                        Is.EqualTo("The AI summary could not be generated. See the log for details."));
                    Assert.That(service.Localize("dotseeDiscipline", "aiSummaryCategory", enUs),
                        Is.EqualTo("AI Summarization"));
                    Assert.That(service.Localize("dotseeDiscipline", "nodeProtectDefaultMessage", enUs,
                            new Dictionary<string, string> { { "0", "Home" }, { "1", "1117" } }),
                        Is.EqualTo("The node 'Home' (id 1117) is protected and cannot be deleted."));
                });
            }
            finally
            {
                Directory.Delete(masterDir, true);
                Directory.Delete(langDir, true);
            }
        }
    }
}
