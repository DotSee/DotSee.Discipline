using System.Collections.Generic;
using DotSee.Discipline.Backoffice;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;
using Serilog;

namespace DotSee.Discipline.Tests.Backoffice
{
    [TestFixture]
    public class DisciplineAppSettingsReaderTests
    {
        private static DisciplineAppSettingsReader CreateReader(IDictionary<string, string> values)
        {
            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(values)
                .Build();

            return new DisciplineAppSettingsReader(configuration, new Mock<ILogger>().Object);
        }

        [Test]
        public void Read_BindsNodeRestrictAtRootRuleFromAppSettings()
        {
            var reader = CreateReader(new Dictionary<string, string>
            {
                ["DotSee.Discipline:NodeRestrict:Settings:ShowWarnings"] = "true",
                ["DotSee.Discipline:NodeRestrict:Rules:0:AtRoot"] = "true",
                ["DotSee.Discipline:NodeRestrict:Rules:0:ChildDocType"] = "pageHome",
                ["DotSee.Discipline:NodeRestrict:Rules:0:MaxNodes"] = "1",
            });

            var settings = reader.Read();

            Assert.That(settings.NodeRestrict.Enabled, Is.True);
            Assert.That(settings.NodeRestrict.Rules, Has.Count.EqualTo(1));
            Assert.That(settings.NodeRestrict.Rules[0].AtRoot, Is.True);
            Assert.That(settings.NodeRestrict.Rules[0].ChildDocType, Is.EqualTo("pageHome"));
            Assert.That(settings.NodeRestrict.Rules[0].MaxNodes, Is.EqualTo(1));
        }

        [Test]
        public void Read_NodeRestrictRuleWithoutAtRoot_DefaultsToFalse()
        {
            var reader = CreateReader(new Dictionary<string, string>
            {
                ["DotSee.Discipline:NodeRestrict:Rules:0:ParentDocType"] = "pageHome",
                ["DotSee.Discipline:NodeRestrict:Rules:0:ChildDocType"] = "page404",
                ["DotSee.Discipline:NodeRestrict:Rules:0:MaxNodes"] = "1",
            });

            var settings = reader.Read();

            Assert.That(settings.NodeRestrict.Rules, Has.Count.EqualTo(1));
            Assert.That(settings.NodeRestrict.Rules[0].AtRoot, Is.False);
            Assert.That(settings.NodeRestrict.Rules[0].ParentDocType, Is.EqualTo("pageHome"));
        }
    }
}
