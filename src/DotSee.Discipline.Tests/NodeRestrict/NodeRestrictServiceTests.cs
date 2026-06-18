using System.Collections.Generic;
using DotSee.Discipline.Backoffice;
using DotSee.Discipline.Interfaces;
using DotSee.Discipline.NodeRestrict;
using Moq;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Persistence.Querying;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Persistence;
using NUnit.Framework;

namespace DotSee.Discipline.Tests.NodeRestrict
{
    [TestFixture]
    public class NodeRestrictServiceTests
    {
        private Mock<IContentService> _contentServiceMock;
        private Mock<ISqlContext> _sqlContextMock;
        private Mock<IRuleProviderService<IEnumerable<Rule>>> _ruleProviderMock;
        private Mock<ISettings<NodeRestrictSettings>> _settingsProviderMock;
        private Mock<IContentTypeService> _contentTypeServiceMock;
        private Mock<IDisciplineSettingsResolver> _settingsResolverMock;
        private NodeRestrictSettings _settings;

        [SetUp]
        public void SetUp()
        {
            _contentServiceMock = new Mock<IContentService>();
            _sqlContextMock = new Mock<ISqlContext>();
            _ruleProviderMock = new Mock<IRuleProviderService<IEnumerable<Rule>>>();
            _settingsProviderMock = _ruleProviderMock.As<ISettings<NodeRestrictSettings>>();
            _contentTypeServiceMock = new Mock<IContentTypeService>();
            _settingsResolverMock = new Mock<IDisciplineSettingsResolver>();
            _settings = new NodeRestrictSettings { PropertyAlias = null, ShowWarnings = false };
            _settingsProviderMock.Setup(s => s.Settings).Returns(_settings);
        }

        private static IContent CreateMockNode(int id, int parentId, string contentTypeAlias, bool published = false)
        {
            var simpleContentTypeMock = new Mock<ISimpleContentType>();
            simpleContentTypeMock.Setup(c => c.Alias).Returns(contentTypeAlias);

            var nodeMock = new Mock<IContent>();
            nodeMock.Setup(n => n.Id).Returns(id);
            nodeMock.Setup(n => n.ParentId).Returns(parentId);
            nodeMock.Setup(n => n.Key).Returns(Guid.NewGuid());
            nodeMock.Setup(n => n.ContentType).Returns(simpleContentTypeMock.Object);
            nodeMock.Setup(n => n.Name).Returns($"TestNode{id}");
            nodeMock.Setup(n => n.Published).Returns(published);
            nodeMock.Setup(n => n.HasProperty(It.IsAny<string>())).Returns(false);
            nodeMock.Setup(n => n.AvailableCultures).Returns(new List<string>());
            nodeMock.Setup(n => n.EditedCultures).Returns(new List<string>());

            return nodeMock.Object;
        }

        private static IContent CreateMockParentNode(int id, string contentTypeAlias)
        {
            var simpleContentTypeMock = new Mock<ISimpleContentType>();
            simpleContentTypeMock.Setup(c => c.Alias).Returns(contentTypeAlias);

            var nodeMock = new Mock<IContent>();
            nodeMock.Setup(n => n.Id).Returns(id);
            nodeMock.Setup(n => n.ParentId).Returns(-1);
            nodeMock.Setup(n => n.Key).Returns(Guid.NewGuid());
            nodeMock.Setup(n => n.ContentType).Returns(simpleContentTypeMock.Object);
            nodeMock.Setup(n => n.ContentTypeId).Returns(100);
            nodeMock.Setup(n => n.Name).Returns($"ParentNode{id}");
            nodeMock.Setup(n => n.Published).Returns(true);
            nodeMock.Setup(n => n.HasProperty(It.IsAny<string>())).Returns(false);

            return nodeMock.Object;
        }

        private NodeRestrictService CreateSut(IEnumerable<Rule> rules = null)
        {
            _ruleProviderMock.Setup(r => r.Rules).Returns(rules ?? new List<Rule>());
            return new NodeRestrictService(
                _contentServiceMock.Object,
                _sqlContextMock.Object,
                _ruleProviderMock.Object,
                _contentTypeServiceMock.Object,
                _settingsResolverMock.Object);
        }

        #region Constructor Tests

        [Test]
        public void Constructor_InitializesRulesFromProvider()
        {
            var rules = new List<Rule>
            {
                new Rule("ParentType", "ChildType", 5),
                new Rule("*", "*", 10)
            };

            var sut = CreateSut(rules);

            Assert.That(sut, Is.Not.Null);
        }

        [Test]
        public void Run_ReadsRulesFreshOnEveryCall()
        {
            // SUT constructed while a rule exists ("enabled")...
            var sut = CreateSut(new List<Rule> { new Rule("*", "*", 1) });
            var node = CreateMockNode(2, 1, "child", published: false);
            _contentServiceMock.Setup(c => c.GetById(1)).Returns(CreateMockParentNode(1, "parent"));

            // ...then the feature is disabled: the provider now returns no rules.
            _ruleProviderMock.Setup(r => r.Rules).Returns(new List<Rule>());

            // No restart and no SettingsChanged event needed — Run reads the current rules.
            Assert.That(sut.Run(node), Is.Null);
            _ruleProviderMock.Verify(r => r.Rules, Times.AtLeastOnce);
        }

        [Test]
        public void RealResolver_DisableViaStoreAndNotify_DropsRulesImmediately()
        {
            // Full path: real DisciplineSettingsResolver + real JsonFileRuleProviderService,
            // backoffice store enabled with one rule. This mirrors what the running app does.
            var store = new FakeStore(new DisciplineSettings
            {
                UseBackoffice = true,
                NodeRestrict = new NodeRestrictFeatureSettings
                {
                    Enabled = true,
                    Rules = { new NodeRestrictRuleDto { ParentDocType = "*", ChildDocType = "*", MaxNodes = 1 } }
                }
            });
            var resolver = new DisciplineSettingsResolver(store, new FakeReader());
            var provider = new DotSee.Discipline.NodeRestrict.JsonFileRuleProviderService(resolver);
            var sut = new NodeRestrictService(
                _contentServiceMock.Object,
                _sqlContextMock.Object,
                provider,
                _contentTypeServiceMock.Object,
                resolver);

            // Sanity: while enabled the rule is visible through the provider.
            Assert.That(provider.Rules.Count(), Is.EqualTo(1));

            // Simulate the controller's SaveSettings: persist a disabled feature, then notify.
            store.Save(new DisciplineSettings { UseBackoffice = true, NodeRestrict = new NodeRestrictFeatureSettings { Enabled = false } });
            resolver.NotifySettingsChanged();

            // The disabled feature collapses to an empty rule set straight away.
            Assert.That(provider.Rules.Count(), Is.EqualTo(0));

            // And the next publish reflects it without a restart.
            var node = CreateMockNode(2, 1, "child", published: false);
            _contentServiceMock.Setup(c => c.GetById(1)).Returns(CreateMockParentNode(1, "parent"));
            Assert.That(sut.Run(node), Is.Null);
        }

        private sealed class FakeStore : IDisciplineSettingsStore
        {
            private DisciplineSettings _settings;
            public FakeStore(DisciplineSettings settings) => _settings = settings;
            public DisciplineSettings Load() => _settings;
            public void Save(DisciplineSettings settings) => _settings = settings;
        }

        private sealed class FakeReader : IDisciplineAppSettingsReader
        {
            public bool HasAppSettings() => false;
            public DisciplineSettings Read() => new DisciplineSettings();
        }

        #endregion

        #region Run - Early Exit Tests

        [Test]
        public void Run_WhenNodeIsTopLevel_ReturnsNull()
        {
            var rules = new List<Rule>
            {
                new Rule("*", "*", 1)
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, -1, "AnyType"); // ParentId = -1 means top-level

            // GetById returns null for top-level parent
            _contentServiceMock.Setup(x => x.GetById(-1)).Returns((IContent)null);

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Run_WhenNodeIsAlreadyPublished_ReturnsNull()
        {
            var rules = new List<Rule>
            {
                new Rule("*", "*", 1)
            };
            var sut = CreateSut(rules);
            var parentNode = CreateMockParentNode(1, "ParentType");
            var node = CreateMockNode(2, 1, "ChildType", published: true); // Already published

            _contentServiceMock.Setup(x => x.GetById(1)).Returns(parentNode);

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Run_WhenNoRules_ReturnsNull()
        {
            var sut = CreateSut(new List<Rule>());
            var parentNode = CreateMockParentNode(1, "ParentType");
            var node = CreateMockNode(2, 1, "ChildType", published: false);

            _contentServiceMock.Setup(x => x.GetById(1)).Returns(parentNode);

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        #endregion

        #region Run - Rule MaxNodes Tests

        [Test]
        public void Run_WhenRuleMaxNodesIsZero_SkipsRule()
        {
            var rules = new List<Rule>
            {
                new Rule("ParentType", "ChildType", 0) // MaxNodes = 0, should be skipped
            };
            var sut = CreateSut(rules);
            var parentNode = CreateMockParentNode(1, "ParentType");
            var node = CreateMockNode(2, 1, "ChildType", published: false);

            _contentServiceMock.Setup(x => x.GetById(1)).Returns(parentNode);

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Run_WhenRuleMaxNodesIsNegative_SkipsRule()
        {
            var rules = new List<Rule>
            {
                new Rule("ParentType", "ChildType", -5) // MaxNodes negative, should be skipped
            };
            var sut = CreateSut(rules);
            var parentNode = CreateMockParentNode(1, "ParentType");
            var node = CreateMockNode(2, 1, "ChildType", published: false);

            _contentServiceMock.Setup(x => x.GetById(1)).Returns(parentNode);

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        #endregion

        #region Run - DocType Matching Tests

        [Test]
        public void Run_WhenParentDoctypeDoesNotMatch_SkipsRule()
        {
            var rules = new List<Rule>
            {
                new Rule("DifferentParentType", "ChildType", 5)
            };
            var sut = CreateSut(rules);
            var parentNode = CreateMockParentNode(1, "ParentType");
            var node = CreateMockNode(2, 1, "ChildType", published: false);

            _contentServiceMock.Setup(x => x.GetById(1)).Returns(parentNode);

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Run_WhenChildDoctypeDoesNotMatch_SkipsRule()
        {
            var rules = new List<Rule>
            {
                new Rule("ParentType", "DifferentChildType", 5)
            };
            var sut = CreateSut(rules);
            var parentNode = CreateMockParentNode(1, "ParentType");
            var node = CreateMockNode(2, 1, "ChildType", published: false);

            _contentServiceMock.Setup(x => x.GetById(1)).Returns(parentNode);

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        #endregion

        #region Run - Multiple Rules Tests

        [Test]
        public void Run_ChecksRulesInOrder()
        {
            var rules = new List<Rule>
            {
                new Rule("DifferentType", "ChildType", 1), // Won't match
                new Rule("OtherType", "ChildType", 2),     // Won't match
            };
            var sut = CreateSut(rules);
            var parentNode = CreateMockParentNode(1, "ParentType");
            var node = CreateMockNode(2, 1, "ChildType", published: false);

            _contentServiceMock.Setup(x => x.GetById(1)).Returns(parentNode);

            var result = sut.Run(node);

            // No matching rule, returns null
            Assert.That(result, Is.Null);
        }

        #endregion

        #region Result Properties Tests

        [Test]
        public void Result_LimitReached_WhenNodeCountEqualsMaxNodes()
        {
            var rule = new Rule("ParentType", "ChildType", 5);
            var result = Result.GetResult(5, rule);

            Assert.That(result.LimitReached, Is.True);
            Assert.That(result.NodeCount, Is.EqualTo(5));
        }

        [Test]
        public void Result_LimitReached_WhenNodeCountExceedsMaxNodes()
        {
            var rule = new Rule("ParentType", "ChildType", 5);
            var result = Result.GetResult(10, rule);

            Assert.That(result.LimitReached, Is.True);
        }

        [Test]
        public void Result_LimitNotReached_WhenNodeCountBelowMaxNodes()
        {
            var rule = new Rule("ParentType", "ChildType", 5);
            var result = Result.GetResult(3, rule);

            Assert.That(result.LimitReached, Is.False);
            Assert.That(result.NodeCount, Is.EqualTo(3));
        }

        [Test]
        public void Result_ContainsCorrectRule()
        {
            var rule = new Rule("ParentType", "ChildType", 5, showWarnings: true, customMessage: "Custom");
            var result = Result.GetResult(3, rule);

            Assert.That(result.Rule, Is.SameAs(rule));
            Assert.That(result.Rule.ParentDocType, Is.EqualTo("ParentType"));
            Assert.That(result.Rule.ChildDocType, Is.EqualTo("ChildType"));
            Assert.That(result.Rule.MaxNodes, Is.EqualTo(5));
            Assert.That(result.Rule.ShowWarnings, Is.True);
            Assert.That(result.Rule.CustomMessage, Is.EqualTo("Custom"));
        }

        #endregion

        #region Rule Tests

        [Test]
        public void Rule_DefaultConstructor_CreatesEmptyRule()
        {
            var rule = new Rule();

            Assert.That(rule.ParentDocType, Is.Null);
            Assert.That(rule.ChildDocType, Is.Null);
            Assert.That(rule.MaxNodes, Is.EqualTo(0));
        }

        [Test]
        public void Rule_ParameterizedConstructor_SetsAllProperties()
        {
            var rule = new Rule(
                "ParentType",
                "ChildType",
                10,
                fromProperty: true,
                showWarnings: true,
                customMessage: "Limit reached!",
                customMessageCategory: "Warning",
                customWarningMessage: "Getting close",
                customWarningMessageCategory: "Info");

            Assert.That(rule.ParentDocType, Is.EqualTo("ParentType"));
            Assert.That(rule.ChildDocType, Is.EqualTo("ChildType"));
            Assert.That(rule.MaxNodes, Is.EqualTo(10));
            Assert.That(rule.FromProperty, Is.True);
            Assert.That(rule.ShowWarnings, Is.True);
            Assert.That(rule.CustomMessage, Is.EqualTo("Limit reached!"));
            Assert.That(rule.CustomMessageCategory, Is.EqualTo("Warning"));
            Assert.That(rule.CustomWarningMessage, Is.EqualTo("Getting close"));
            Assert.That(rule.CustomWarningMessageCategory, Is.EqualTo("Info"));
        }

        #endregion

        // NOTE: Testing scenarios that involve CheckRule with actual child counting
        // requires integration testing because GetFilter uses _sql.Query<IContent>()
        // which needs Umbraco's database mapper infrastructure (IMapperCollection)
        // that cannot be easily mocked in unit tests.

        #region Edge Case Tests - Rule Construction

        [Test]
        public void Rule_DefaultConstructor_AllPropertiesHaveDefaults()
        {
            var rule = new Rule();

            Assert.That(rule.ParentDocType, Is.Null);
            Assert.That(rule.ChildDocType, Is.Null);
            Assert.That(rule.MaxNodes, Is.EqualTo(0));
            Assert.That(rule.FromProperty, Is.False);
            Assert.That(rule.ShowWarnings, Is.False);
            Assert.That(rule.CustomMessage, Is.Null);
            Assert.That(rule.CustomMessageCategory, Is.Null);
            Assert.That(rule.CustomWarningMessage, Is.Null);
            Assert.That(rule.CustomWarningMessageCategory, Is.Null);
        }

        [Test]
        public void Rule_WithEmptyStrings_PreservesEmptyStrings()
        {
            var rule = new Rule("", "", 5, customMessage: "", customMessageCategory: "", customWarningMessage: "", customWarningMessageCategory: "");

            Assert.That(rule.ParentDocType, Is.EqualTo(""));
            Assert.That(rule.ChildDocType, Is.EqualTo(""));
            Assert.That(rule.CustomMessage, Is.EqualTo(""));
            Assert.That(rule.CustomMessageCategory, Is.EqualTo(""));
            Assert.That(rule.CustomWarningMessage, Is.EqualTo(""));
            Assert.That(rule.CustomWarningMessageCategory, Is.EqualTo(""));
        }

        [Test]
        public void Rule_WithNullDocTypes_SetsNullValues()
        {
            var rule = new Rule(null, null, 10);

            Assert.That(rule.ParentDocType, Is.Null);
            Assert.That(rule.ChildDocType, Is.Null);
        }

        [Test]
        public void Rule_MaxNodesAtIntMaxValue_IsAccepted()
        {
            var rule = new Rule("ParentType", "ChildType", int.MaxValue);

            Assert.That(rule.MaxNodes, Is.EqualTo(int.MaxValue));
        }

        #endregion

        #region Edge Case Tests - Result Edge Cases

        [Test]
        public void Result_LimitReached_WhenNodeCountIsZeroAndMaxNodesIsZero()
        {
            var rule = new Rule("ParentType", "ChildType", 0);
            var result = Result.GetResult(0, rule);

            // 0 >= 0 means limit reached
            Assert.That(result.LimitReached, Is.True);
        }

        [Test]
        public void Result_LimitNotReached_WhenNodeCountIsZeroAndMaxNodesIsOne()
        {
            var rule = new Rule("ParentType", "ChildType", 1);
            var result = Result.GetResult(0, rule);

            Assert.That(result.LimitReached, Is.False);
            Assert.That(result.NodeCount, Is.EqualTo(0));
        }

        [Test]
        public void Result_WithLargeNodeCount_CalculatesCorrectly()
        {
            var rule = new Rule("ParentType", "ChildType", 1000);
            var result = Result.GetResult(999, rule);

            Assert.That(result.LimitReached, Is.False);
            Assert.That(result.NodeCount, Is.EqualTo(999));
        }

        [Test]
        public void Result_ExactlyAtLimit_IsLimitReached()
        {
            var rule = new Rule("ParentType", "ChildType", 1);
            var result = Result.GetResult(1, rule);

            Assert.That(result.LimitReached, Is.True);
        }

        #endregion

        #region Edge Case Tests - NodeRestrictSettings

        [Test]
        public void NodeRestrictSettings_DefaultValues()
        {
            var settings = new NodeRestrictSettings();

            Assert.That(settings.PropertyAlias, Is.Null);
            Assert.That(settings.ShowWarnings, Is.False);
        }

        [Test]
        public void NodeRestrictSettings_WithEmptyPropertyAlias()
        {
            var settings = new NodeRestrictSettings { PropertyAlias = "" };

            Assert.That(settings.PropertyAlias, Is.EqualTo(""));
        }

        [Test]
        public void NodeRestrictSettings_WithShowWarningsTrue()
        {
            var settings = new NodeRestrictSettings { ShowWarnings = true, PropertyAlias = "maxChildren" };

            Assert.That(settings.ShowWarnings, Is.True);
            Assert.That(settings.PropertyAlias, Is.EqualTo("maxChildren"));
        }

        #endregion

        #region Edge Case Tests - Run with Wildcard Rules

        [Test]
        public void Run_WhenWildcardParentAndWildcardChild_AndNodeIsTopLevel_ReturnsNull()
        {
            var rules = new List<Rule>
            {
                new Rule("*", "*", 1)
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, -1, "AnyType");

            _contentServiceMock.Setup(x => x.GetById(-1)).Returns((IContent)null);

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Run_WhenParentIdIsZero_AndParentDoesNotExist_ReturnsNull()
        {
            var rules = new List<Rule>
            {
                new Rule("*", "*", 1)
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(2, 0, "ChildType");

            _contentServiceMock.Setup(x => x.GetById(0)).Returns((IContent)null);

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        #endregion

    }
}

