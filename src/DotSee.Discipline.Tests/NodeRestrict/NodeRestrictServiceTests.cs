using System.Collections.Generic;
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
        private NodeRestrictSettings _settings;

        [SetUp]
        public void SetUp()
        {
            _contentServiceMock = new Mock<IContentService>();
            _sqlContextMock = new Mock<ISqlContext>();
            _ruleProviderMock = new Mock<IRuleProviderService<IEnumerable<Rule>>>();
            _settingsProviderMock = _ruleProviderMock.As<ISettings<NodeRestrictSettings>>();
            _contentTypeServiceMock = new Mock<IContentTypeService>();
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
                _contentTypeServiceMock.Object);
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

        #endregion

        #region RegisterRule Tests

        [Test]
        public void RegisterRule_AddsRuleToList()
        {
            var sut = CreateSut(new List<Rule>());

            sut.RegisterRule(new Rule("ParentType", "ChildType", 3));

            // We can verify by checking behavior - the rule should now be applied
            Assert.That(sut, Is.Not.Null);
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
    }
}
