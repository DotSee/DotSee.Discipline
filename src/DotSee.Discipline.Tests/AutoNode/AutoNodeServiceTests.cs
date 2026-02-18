// Suppress obsolete warnings for CreateContentFromBlueprint - scheduled for removal in V18
#pragma warning disable CS0618

using System.Collections.Generic;
using DotSee.Discipline.AutoNode;
using DotSee.Discipline.Interfaces;
using Moq;
using Serilog;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Persistence.Querying;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Extensions;
using NUnit.Framework;

namespace DotSee.Discipline.Tests.AutoNode
{
    [TestFixture]
    public class AutoNodeServiceTests
    {
        private Mock<IContentService> _contentServiceMock;
        private Mock<IContentTypeService> _contentTypeServiceMock;
        private Mock<Serilog.ILogger> _loggerMock;
        private Mock<IRuleProviderService<IEnumerable<Rule>>> _ruleProviderMock;
        private Mock<ISqlContext> _sqlContextMock;
        private AutoNodeUtils _autoNodeUtils;
        private long _totalRecords;

        [SetUp]
        public void SetUp()
        {
            _contentServiceMock = new Mock<IContentService>();
            _contentTypeServiceMock = new Mock<IContentTypeService>();
            _loggerMock = new Mock<Serilog.ILogger>();
            _ruleProviderMock = new Mock<IRuleProviderService<IEnumerable<Rule>>>();
            _sqlContextMock = new Mock<ISqlContext>();
            var langMock = new Mock<ILanguageService>();
            var dictMock = new Mock<IDictionaryItemService>();
            _autoNodeUtils = new AutoNodeUtils(_loggerMock.Object, langMock.Object, dictMock.Object);
            _totalRecords = 0;

            // Default: no children
            _contentServiceMock
                .Setup(x => x.GetPagedChildren(It.IsAny<int>(), It.IsAny<long>(), It.IsAny<int>(), out _totalRecords))
                .Returns(new List<IContent>());
        }

        private static IContent CreateMockNode(int id, string contentTypeAlias, bool published = true)
        {
            var simpleContentTypeMock = new Mock<ISimpleContentType>();
            simpleContentTypeMock.Setup(c => c.Alias).Returns(contentTypeAlias);
            var nodeMock = new Mock<IContent>();
            nodeMock.Setup(n => n.Id).Returns(id);
            nodeMock.Setup(n => n.Key).Returns(System.Guid.NewGuid());
            nodeMock.Setup(n => n.ContentType).Returns(simpleContentTypeMock.Object);
            nodeMock.Setup(n => n.Name).Returns("TestNode");
            nodeMock.Setup(n => n.Published).Returns(published);
            nodeMock.Setup(n => n.CultureInfos).Returns(new ContentCultureInfosCollection());
            nodeMock.Setup(n => n.AvailableCultures).Returns(new List<string>());
            nodeMock.Setup(n => n.Edited).Returns(false);
            return nodeMock.Object;
        }

        private static IContentType CreateMockContentType(int id, string alias)
        {
            var ct = new Mock<IContentType>();
            ct.Setup(c => c.Id).Returns(id);
            ct.Setup(c => c.Alias).Returns(alias);
            return ct.Object;
        }

        private AutoNodeService CreateSut(IEnumerable<Rule> rules = null)
        {
            _ruleProviderMock.Setup(r => r.Rules).Returns(rules ?? Array.Empty<Rule>());
            return new AutoNodeService(
                _contentServiceMock.Object,
                _contentTypeServiceMock.Object,
                _loggerMock.Object,
                _ruleProviderMock.Object,
                _sqlContextMock.Object,
                _autoNodeUtils);
        }

        [Test]
        public void Run_WhenNoRules_ReturnsFalse()
        {
            var sut = CreateSut(new List<Rule>());
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.False);
        }

        [Test]
        public void Run_WhenRulesIsNullFromProvider_ReturnsFalse()
        {
            _ruleProviderMock.Setup(r => r.Rules).Returns((IEnumerable<Rule>)null);
            var sut = new AutoNodeService(
                _contentServiceMock.Object,
                _contentTypeServiceMock.Object,
                _loggerMock.Object,
                _ruleProviderMock.Object,
                _sqlContextMock.Object,
                _autoNodeUtils);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.False);
        }

        [Test]
        public void Run_WhenNodeContentTypeDoesNotMatchAnyRule_ReturnsTrue()
        {
            var rules = new List<Rule>
            {
                new Rule("OtherType", "ChildDoc", "Child", onlyCreateIfNoChildren: false)
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage"); // alias is HomePage, rule expects OtherType

            var result = sut.Run(node);

            Assert.That(result, Is.True);
            _contentServiceMock.Verify(x => x.Create(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string>()), Times.Never);
        }

        [Test]
        public void Run_WhenRuleMatchesAndOnlyCreateIfNoChildrenTrueAndHasChildren_SkipsCreation()
        {
            var rules = new List<Rule>
            {
                new Rule("HomePage", "ChildDoc", "Child", onlyCreateIfNoChildren: true)
            };
            _contentServiceMock
                .Setup(x => x.GetPagedChildren(It.IsAny<int>(), 0, 1, out _totalRecords))
                .Returns(new List<IContent> { CreateMockNode(2, "ChildDoc") });
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.False);
            _contentServiceMock.Verify(x => x.Create(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string>()), Times.Never);
        }

        [Test]
        public void RegisterRule_AddsRuleToRulesList()
        {
            var sut = CreateSut(new List<Rule>());
            var rule = new Rule("HomePage", "ChildDoc", "Child");

            sut.RegisterRule(rule);

            Assert.That(sut.Rules, Has.Count.EqualTo(1));
            Assert.That(sut.Rules[0], Is.SameAs(rule));
        }

        [Test]
        public void ClearRules_RemovesAllRules()
        {
            var rules = new List<Rule> { new Rule("A", "B", "C") };
            var sut = CreateSut(rules);
            Assert.That(sut.Rules, Has.Count.EqualTo(1));

            sut.ClearRules();

            Assert.That(sut.Rules, Is.Empty);
        }

        [Test]
        public void Run_WhenDocTypeToCreateDoesNotExist_ReturnsFalseAndLogsError()
        {
            var rules = new List<Rule>
            {
                new Rule("HomePage", "NonExistentType", "Child")
            };
            _contentTypeServiceMock.Setup(x => x.Get("NonExistentType")).Returns((IContentType)null);
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.False);
            _loggerMock.Verify(
                x => x.Error(It.IsAny<string>()),
                Times.Once);
        }

        [Test]
        public void Run_WhenRuleMatchesAndNoChildren_CreatesAndPublishesNode()
        {
            // Use DictionaryItemForName "" so AutoNodeUtils returns rule.NodeName without calling dictionary
            var rules = new List<Rule>
            {
                new Rule("HomePage", "ChildDoc", "ChildName", dictionaryItemForName: "", onlyCreateIfNoChildren: false)
            };
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc")).Returns(CreateMockContentType(2, "ChildDoc"));
            _contentServiceMock.Setup(x => x.HasChildren(It.IsAny<int>())).Returns(false);
            var newContent = CreateMockNode(99, "ChildDoc");
            _contentServiceMock.Setup(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc")).Returns(newContent);
            var publishResult = new PublishResult(PublishResultType.SuccessPublish, null, newContent);
            _contentServiceMock.Setup(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>())).Returns(publishResult);
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.True);
            _contentServiceMock.Verify(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc"), Times.Once);
            _contentServiceMock.Verify(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>()), Times.Once);
        }

        [Test]
        public void Run_WhenBlueprintSpecified_UsesCreateContentFromBlueprint()
        {
            var rules = new List<Rule>
            {
                new Rule("HomePage", "ChildDoc", "ChildName", dictionaryItemForName: "", blueprint: "MyBlueprint")
            };
            var contentType = CreateMockContentType(2, "ChildDoc");
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc")).Returns(contentType);
            _contentTypeServiceMock.Setup(x => x.GetAllContentTypeIds(It.IsAny<string[]>())).Returns(new[] { 2 });
            _contentServiceMock.Setup(x => x.HasChildren(It.IsAny<int>())).Returns(false);

            var blueprintContent = CreateMockNode(50, "ChildDoc");
            var blueprintMock = new Mock<IContent>();
            blueprintMock.Setup(b => b.Name).Returns("MyBlueprint");
            _contentServiceMock.Setup(x => x.GetBlueprintsForContentTypes(2)).Returns(new List<IContent> { blueprintMock.Object });

            var newContent = CreateMockNode(99, "ChildDoc");
            _contentServiceMock.Setup(x => x.CreateContentFromBlueprint(blueprintMock.Object, "ChildName")).Returns(newContent);
            var publishResult = new PublishResult(PublishResultType.SuccessPublish, null, newContent);
            _contentServiceMock.Setup(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>())).Returns(publishResult);

            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.True);
            _contentServiceMock.Verify(x => x.CreateContentFromBlueprint(blueprintMock.Object, "ChildName"), Times.Once);
            _contentServiceMock.Verify(x => x.Create(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string>()), Times.Never);
        }

        [Test]
        public void Run_WhenBlueprintNotFound_FallsBackToRegularCreate()
        {
            var rules = new List<Rule>
            {
                new Rule("HomePage", "ChildDoc", "ChildName", dictionaryItemForName: "", blueprint: "NonExistentBlueprint")
            };
            var contentType = CreateMockContentType(2, "ChildDoc");
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc")).Returns(contentType);
            _contentTypeServiceMock.Setup(x => x.GetAllContentTypeIds(It.IsAny<string[]>())).Returns(new[] { 2 });
            _contentServiceMock.Setup(x => x.HasChildren(It.IsAny<int>())).Returns(false);
            _contentServiceMock.Setup(x => x.GetBlueprintsForContentTypes(2)).Returns(new List<IContent>());

            var newContent = CreateMockNode(99, "ChildDoc");
            _contentServiceMock.Setup(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc")).Returns(newContent);
            var publishResult = new PublishResult(PublishResultType.SuccessPublish, null, newContent);
            _contentServiceMock.Setup(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>())).Returns(publishResult);

            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.True);
            _contentServiceMock.Verify(x => x.CreateContentFromBlueprint(It.IsAny<IContent>(), It.IsAny<string>()), Times.Never);
            _contentServiceMock.Verify(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc"), Times.Once);
        }

        [Test]
        public void Run_WhenKeepNewNodeUnpublishedTrue_SavesInsteadOfPublishing()
        {
            var rules = new List<Rule>
            {
                new Rule("HomePage", "ChildDoc", "ChildName", dictionaryItemForName: "", keepNewNodeUnpublished: true)
            };
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc")).Returns(CreateMockContentType(2, "ChildDoc"));
            _contentServiceMock.Setup(x => x.HasChildren(It.IsAny<int>())).Returns(false);
            var newContent = CreateMockNode(99, "ChildDoc");
            _contentServiceMock.Setup(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc")).Returns(newContent);
            var saveResult = OperationResult.Succeed(null);
            _contentServiceMock.Setup(x => x.Save(It.IsAny<IContent>(), It.IsAny<int?>(), It.IsAny<ContentScheduleCollection>())).Returns(saveResult);

            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.True);
            _contentServiceMock.Verify(x => x.Save(It.IsAny<IContent>(), It.IsAny<int?>(), It.IsAny<ContentScheduleCollection>()), Times.Once);
            _contentServiceMock.Verify(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>()), Times.Never);
        }

        [Test]
        public void Run_WhenBringNewNodeFirstTrue_CallsSort()
        {
            var rules = new List<Rule>
            {
                new Rule("HomePage", "ChildDoc", "ChildName", bringNodeFirst: true, dictionaryItemForName: "")
            };
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc")).Returns(CreateMockContentType(2, "ChildDoc"));
            _contentServiceMock.Setup(x => x.HasChildren(It.IsAny<int>())).Returns(false);
            _contentServiceMock.Setup(x => x.CountChildren(It.IsAny<int>())).Returns(2);

            var newContent = CreateMockNode(99, "ChildDoc");
            _contentServiceMock.Setup(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc")).Returns(newContent);
            var publishResult = new PublishResult(PublishResultType.SuccessPublish, null, newContent);
            _contentServiceMock.Setup(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>())).Returns(publishResult);

            var childNodes = new List<IContent> { CreateMockNode(98, "OtherDoc"), CreateMockNode(99, "ChildDoc") };
            _contentServiceMock.Setup(x => x.GetPagedChildren(It.IsAny<int>(), 0, It.IsAny<int>(), out _totalRecords))
                .Returns(childNodes);

            var sortResult = OperationResult.Succeed(null);
            _contentServiceMock.Setup(x => x.Sort(It.IsAny<IEnumerable<int>>())).Returns(sortResult);

            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.True);
            _contentServiceMock.Verify(x => x.Sort(It.IsAny<IEnumerable<int>>()), Times.Once);
        }

        [Test]
        public void Run_WhenPublishFails_ReturnsFalseAndLogsError()
        {
            var rules = new List<Rule>
            {
                new Rule("HomePage", "ChildDoc", "ChildName", dictionaryItemForName: "")
            };
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc")).Returns(CreateMockContentType(2, "ChildDoc"));
            _contentServiceMock.Setup(x => x.HasChildren(It.IsAny<int>())).Returns(false);
            var newContent = CreateMockNode(99, "ChildDoc");
            _contentServiceMock.Setup(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc")).Returns(newContent);
            var failedPublishResult = new PublishResult(PublishResultType.FailedPublish, null, newContent);
            _contentServiceMock.Setup(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>())).Returns(failedPublishResult);

            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.False);
            _loggerMock.Verify(x => x.Error(It.IsAny<string>()), Times.Once);
        }

        [Test]
        public void Run_WhenMultipleMatchingRules_ProcessesAllMatchingRules()
        {
            var rules = new List<Rule>
            {
                new Rule("HomePage", "ChildDoc1", "Child1", dictionaryItemForName: ""),
                new Rule("HomePage", "ChildDoc2", "Child2", dictionaryItemForName: ""),
                new Rule("OtherType", "ChildDoc3", "Child3", dictionaryItemForName: "") // Should not match
            };
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc1")).Returns(CreateMockContentType(2, "ChildDoc1"));
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc2")).Returns(CreateMockContentType(3, "ChildDoc2"));
            _contentServiceMock.Setup(x => x.HasChildren(It.IsAny<int>())).Returns(false);

            var newContent1 = CreateMockNode(99, "ChildDoc1");
            var newContent2 = CreateMockNode(100, "ChildDoc2");
            _contentServiceMock.Setup(x => x.Create("Child1", It.IsAny<Guid>(), "ChildDoc1")).Returns(newContent1);
            _contentServiceMock.Setup(x => x.Create("Child2", It.IsAny<Guid>(), "ChildDoc2")).Returns(newContent2);

            var publishResult1 = new PublishResult(PublishResultType.SuccessPublish, null, newContent1);
            var publishResult2 = new PublishResult(PublishResultType.SuccessPublish, null, newContent2);
            _contentServiceMock.SetupSequence(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>()))
                .Returns(publishResult1)
                .Returns(publishResult2);

            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.True);
            _contentServiceMock.Verify(x => x.Create("Child1", It.IsAny<Guid>(), "ChildDoc1"), Times.Once);
            _contentServiceMock.Verify(x => x.Create("Child2", It.IsAny<Guid>(), "ChildDoc2"), Times.Once);
            _contentServiceMock.Verify(x => x.Create("Child3", It.IsAny<Guid>(), "ChildDoc3"), Times.Never);
        }

        [Test]
        public void Run_WhenOneRuleFailsAmongMultiple_ReturnsFalse()
        {
            var rules = new List<Rule>
            {
                new Rule("HomePage", "ChildDoc1", "Child1", dictionaryItemForName: ""),
                new Rule("HomePage", "ChildDoc2", "Child2", dictionaryItemForName: "")
            };
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc1")).Returns(CreateMockContentType(2, "ChildDoc1"));
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc2")).Returns(CreateMockContentType(3, "ChildDoc2"));
            _contentServiceMock.Setup(x => x.HasChildren(It.IsAny<int>())).Returns(false);

            var newContent1 = CreateMockNode(99, "ChildDoc1");
            var newContent2 = CreateMockNode(100, "ChildDoc2");
            _contentServiceMock.Setup(x => x.Create("Child1", It.IsAny<Guid>(), "ChildDoc1")).Returns(newContent1);
            _contentServiceMock.Setup(x => x.Create("Child2", It.IsAny<Guid>(), "ChildDoc2")).Returns(newContent2);

            var publishResultSuccess = new PublishResult(PublishResultType.SuccessPublish, null, newContent1);
            var publishResultFail = new PublishResult(PublishResultType.FailedPublish, null, newContent2);
            _contentServiceMock.SetupSequence(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>()))
                .Returns(publishResultSuccess)
                .Returns(publishResultFail);

            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.False);
        }

        // NOTE: Testing "existing child node found" scenarios requires integration testing
        // because GetExistingChildNode uses Query<IContent> with ISqlContext which needs
        // Umbraco's database mapper infrastructure (IMapperCollection) that cannot be
        // easily mocked in unit tests. The Query.Where() method uses ModelToSqlExpressionVisitor
        // which requires proper SQL column mappings for IContent properties.

        #region Edge Case Tests - Rule Construction

        [Test]
        public void Rule_DefaultConstructor_AllPropertiesHaveDefaults()
        {
            var rule = new Rule();

            Assert.That(rule.CreatedDocTypeAlias, Is.Null);
            Assert.That(rule.DocTypeAliasToCreate, Is.Null);
            Assert.That(rule.NodeName, Is.Null);
            Assert.That(rule.BringNewNodeFirst, Is.False);
            Assert.That(rule.OnlyCreateIfNoChildren, Is.False);
            Assert.That(rule.CreateIfExistsWithDifferentName, Is.True);
            Assert.That(rule.DictionaryItemForName, Is.EqualTo("AutoNode.Name"));
            Assert.That(rule.KeepNewNodeUnpublished, Is.False);
            Assert.That(rule.Blueprint, Is.EqualTo(string.Empty));
        }

        [Test]
        public void Rule_WithNullBoolProperties_DefaultsToFalse()
        {
            var rule = new Rule("Type", "Create", "Name", 
                bringNodeFirst: null, 
                onlyCreateIfNoChildren: null, 
                keepNewNodeUnpublished: null);

            Assert.That(rule.BringNewNodeFirst, Is.Null);
            Assert.That(rule.OnlyCreateIfNoChildren, Is.Null);
            Assert.That(rule.KeepNewNodeUnpublished, Is.Null);
        }

        [Test]
        public void Rule_WithEmptyStrings_PreservesEmptyStrings()
        {
            var rule = new Rule("", "", "", dictionaryItemForName: "", blueprint: "");

            Assert.That(rule.CreatedDocTypeAlias, Is.EqualTo(""));
            Assert.That(rule.DocTypeAliasToCreate, Is.EqualTo(""));
            Assert.That(rule.NodeName, Is.EqualTo(""));
            Assert.That(rule.DictionaryItemForName, Is.EqualTo(""));
            Assert.That(rule.Blueprint, Is.EqualTo(""));
        }

        #endregion

        #region Edge Case Tests - Run Method

        [Test]
        public void Run_WhenRulesEmptyList_ReturnsFalse()
        {
            var sut = CreateSut(Enumerable.Empty<Rule>());
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.False);
        }

        [Test]
        public void Run_WhenNodeAliasIsEmpty_DoesNotMatchRule()
        {
            var rules = new List<Rule>
            {
                new Rule("HomePage", "ChildDoc", "Child", dictionaryItemForName: "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "");

            var result = sut.Run(node);

            Assert.That(result, Is.True);
            _contentServiceMock.Verify(x => x.Create(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string>()), Times.Never);
        }

        [Test]
        public void Run_WhenRuleAliasMatchIsCaseInsensitive_MatchesAndCreatesNode()
        {
            var rules = new List<Rule>
            {
                new Rule("HOMEPAGE", "ChildDoc", "ChildName", dictionaryItemForName: "")
            };
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc")).Returns(CreateMockContentType(2, "ChildDoc"));
            _contentServiceMock.Setup(x => x.HasChildren(It.IsAny<int>())).Returns(false);
            var newContent = CreateMockNode(99, "ChildDoc");
            _contentServiceMock.Setup(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc")).Returns(newContent);
            var publishResult = new PublishResult(PublishResultType.SuccessPublish, null, newContent);
            _contentServiceMock.Setup(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>())).Returns(publishResult);
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "homepage"); // lowercase

            var result = sut.Run(node);

            Assert.That(result, Is.True);
            _contentServiceMock.Verify(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc"), Times.Once);
        }

        #endregion

        #region Edge Case Tests - RegisterRule / ClearRules

        [Test]
        public void RegisterRule_MultipleRules_AllAdded()
        {
            var sut = CreateSut(new List<Rule>());

            sut.RegisterRule(new Rule("A", "B", "C"));
            sut.RegisterRule(new Rule("D", "E", "F"));
            sut.RegisterRule(new Rule("G", "H", "I"));

            Assert.That(sut.Rules, Has.Count.EqualTo(3));
        }

        [Test]
        public void ClearRules_ThenRegisterNew_OnlyNewRuleExists()
        {
            var rules = new List<Rule> { new Rule("A", "B", "C"), new Rule("D", "E", "F") };
            var sut = CreateSut(rules);

            sut.ClearRules();
            sut.RegisterRule(new Rule("X", "Y", "Z"));

            Assert.That(sut.Rules, Has.Count.EqualTo(1));
            Assert.That(sut.Rules[0].CreatedDocTypeAlias, Is.EqualTo("X"));
        }

        #endregion

        #region Edge Case Tests - RuleSettings

        [Test]
        public void RuleSettings_DefaultValues()
        {
            var settings = new RuleSettings();

            Assert.That(settings.LogLevel, Is.EqualTo("Normal"));
            Assert.That(settings.RepublishExistingNodes, Is.False);
        }

        [Test]
        public void RuleSettings_SetVerbose()
        {
            var settings = new RuleSettings { LogLevel = "Verbose", RepublishExistingNodes = true };

            Assert.That(settings.LogLevel, Is.EqualTo("Verbose"));
            Assert.That(settings.RepublishExistingNodes, Is.True);
        }

        [Test]
        public void RuleSettings_NullLogLevel()
        {
            var settings = new RuleSettings { LogLevel = null };

            Assert.That(settings.LogLevel, Is.Null);
        }

        #endregion

        [Test]
        public void Run_WhenOnlyCreateIfNoChildrenFalseAndHasChildren_StillCreatesNode()
        {
            var rules = new List<Rule>
            {
                new Rule("HomePage", "ChildDoc", "ChildName", dictionaryItemForName: "", onlyCreateIfNoChildren: false)
            };
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc")).Returns(CreateMockContentType(2, "ChildDoc"));
            _contentServiceMock.Setup(x => x.HasChildren(It.IsAny<int>())).Returns(false);
            
            // Setup to show parent has children but rule allows creation
            _contentServiceMock
                .Setup(x => x.GetPagedChildren(It.IsAny<int>(), 0, 1, out _totalRecords))
                .Returns(new List<IContent> { CreateMockNode(2, "OtherType") });

            var newContent = CreateMockNode(99, "ChildDoc");
            _contentServiceMock.Setup(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc")).Returns(newContent);
            var publishResult = new PublishResult(PublishResultType.SuccessPublish, null, newContent);
            _contentServiceMock.Setup(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>())).Returns(publishResult);

            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.True);
            _contentServiceMock.Verify(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc"), Times.Once);
        }

        [Test]
        public void Run_WhenBlueprintSpecifiedButContentTypeIdNotFound_FallsBackToRegularCreate()
        {
            var rules = new List<Rule>
            {
                new Rule("HomePage", "ChildDoc", "ChildName", dictionaryItemForName: "", blueprint: "MyBlueprint")
            };
            var contentType = CreateMockContentType(2, "ChildDoc");
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc")).Returns(contentType);
            _contentTypeServiceMock.Setup(x => x.GetAllContentTypeIds(It.IsAny<string[]>())).Returns(new int[] { });
            _contentServiceMock.Setup(x => x.HasChildren(It.IsAny<int>())).Returns(false);

            var newContent = CreateMockNode(99, "ChildDoc");
            _contentServiceMock.Setup(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc")).Returns(newContent);
            var publishResult = new PublishResult(PublishResultType.SuccessPublish, null, newContent);
            _contentServiceMock.Setup(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>())).Returns(publishResult);

            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.True);
            _contentServiceMock.Verify(x => x.CreateContentFromBlueprint(It.IsAny<IContent>(), It.IsAny<string>()), Times.Never);
            _contentServiceMock.Verify(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc"), Times.Once);
        }

        [Test]
        public void Run_WhenEmptyBlueprintString_UsesRegularCreate()
        {
            var rules = new List<Rule>
            {
                new Rule("HomePage", "ChildDoc", "ChildName", dictionaryItemForName: "", blueprint: "")
            };
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc")).Returns(CreateMockContentType(2, "ChildDoc"));
            _contentServiceMock.Setup(x => x.HasChildren(It.IsAny<int>())).Returns(false);

            var newContent = CreateMockNode(99, "ChildDoc");
            _contentServiceMock.Setup(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc")).Returns(newContent);
            var publishResult = new PublishResult(PublishResultType.SuccessPublish, null, newContent);
            _contentServiceMock.Setup(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>())).Returns(publishResult);

            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.True);
            _contentServiceMock.Verify(x => x.GetBlueprintsForContentTypes(It.IsAny<int[]>()), Times.Never);
            _contentServiceMock.Verify(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc"), Times.Once);
        }

        [Test]
        public void Run_WhenSortFails_LogsErrorButStillReturnsTrue()
        {
            var rules = new List<Rule>
            {
                new Rule("HomePage", "ChildDoc", "ChildName", bringNodeFirst: true, dictionaryItemForName: "")
            };
            _contentTypeServiceMock.Setup(x => x.Get("ChildDoc")).Returns(CreateMockContentType(2, "ChildDoc"));
            _contentServiceMock.Setup(x => x.HasChildren(It.IsAny<int>())).Returns(false);
            _contentServiceMock.Setup(x => x.CountChildren(It.IsAny<int>())).Returns(2);

            var newContent = CreateMockNode(99, "ChildDoc");
            _contentServiceMock.Setup(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc")).Returns(newContent);
            var publishResult = new PublishResult(PublishResultType.SuccessPublish, null, newContent);
            _contentServiceMock.Setup(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>())).Returns(publishResult);

            var childNodes = new List<IContent> { CreateMockNode(98, "OtherDoc"), CreateMockNode(99, "ChildDoc") };
            _contentServiceMock.Setup(x => x.GetPagedChildren(It.IsAny<int>(), 0, It.IsAny<int>(), out _totalRecords))
                .Returns(childNodes);

            var sortResultFailed = new OperationResult(OperationResultType.Failed, null);
            _contentServiceMock.Setup(x => x.Sort(It.IsAny<IEnumerable<int>>())).Returns(sortResultFailed);

            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.That(result, Is.True);
            _loggerMock.Verify(x => x.Error(It.IsAny<string>()), Times.Once);
        }
    }
}
