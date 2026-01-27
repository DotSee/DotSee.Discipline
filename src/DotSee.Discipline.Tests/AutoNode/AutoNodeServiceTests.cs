using System.Collections.Generic;
using DotSee.Discipline.AutoNode;
using DotSee.Discipline.Interfaces;
using Moq;
using Serilog;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Extensions;
using Xunit;

namespace DotSee.Discipline.Tests.AutoNode
{
    public class AutoNodeServiceTests
    {
        private readonly Mock<IContentService> _contentServiceMock;
        private readonly Mock<IContentTypeService> _contentTypeServiceMock;
        private readonly Mock<Serilog.ILogger> _loggerMock;
        private readonly Mock<IRuleProviderService<IEnumerable<Rule>>> _ruleProviderMock;
        private readonly Mock<ISqlContext> _sqlContextMock;
        private readonly AutoNodeUtils _autoNodeUtils;
        private long _totalRecords;

        public AutoNodeServiceTests()
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

        [Fact]
        public void Run_WhenNoRules_ReturnsFalse()
        {
            var sut = CreateSut(new List<Rule>());
            var node = CreateMockNode(1, "HomePage");

            var result = sut.Run(node);

            Assert.False(result);
        }

        [Fact]
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

            Assert.False(result);
        }

        [Fact]
        public void Run_WhenNodeContentTypeDoesNotMatchAnyRule_ReturnsTrue()
        {
            var rules = new List<Rule>
            {
                new Rule("OtherType", "ChildDoc", "Child", onlyCreateIfNoChildren: false)
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "HomePage"); // alias is HomePage, rule expects OtherType

            var result = sut.Run(node);

            Assert.True(result);
            _contentServiceMock.Verify(x => x.Create(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string>()), Times.Never);
        }

        [Fact]
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

            Assert.False(result);
            _contentServiceMock.Verify(x => x.Create(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string>()), Times.Never);
        }

        [Fact]
        public void RegisterRule_AddsRuleToRulesList()
        {
            var sut = CreateSut(new List<Rule>());
            var rule = new Rule("HomePage", "ChildDoc", "Child");

            sut.RegisterRule(rule);

            Assert.Single(sut.Rules);
            Assert.Same(rule, sut.Rules[0]);
        }

        [Fact]
        public void ClearRules_RemovesAllRules()
        {
            var rules = new List<Rule> { new Rule("A", "B", "C") };
            var sut = CreateSut(rules);
            Assert.Single(sut.Rules);

            sut.ClearRules();

            Assert.Empty(sut.Rules);
        }

        [Fact]
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

            Assert.False(result);
            _loggerMock.Verify(
                x => x.Error(It.IsAny<string>()),
                Times.Once);
        }

        [Fact]
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

            Assert.True(result);
            _contentServiceMock.Verify(x => x.Create("ChildName", It.IsAny<Guid>(), "ChildDoc"), Times.Once);
            _contentServiceMock.Verify(x => x.Publish(It.IsAny<IContent>(), It.IsAny<string[]>()), Times.Once);
        }
    }
}
