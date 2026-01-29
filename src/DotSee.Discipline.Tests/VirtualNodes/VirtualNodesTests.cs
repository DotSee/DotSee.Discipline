using System.Collections.Generic;
using DotSee.Discipline.Interfaces;
using DotSee.Discipline.VirtualNodes;
using Moq;
using Umbraco.Cms.Core.Models.PublishedContent;
using NUnit.Framework;

namespace DotSee.Discipline.Tests.VirtualNodes
{
    [TestFixture]
    public class VirtualNodesRuleManagerTests
    {
        private Mock<IRuleProviderService<IEnumerable<string>>> _ruleProviderMock;

        [SetUp]
        public void SetUp()
        {
            _ruleProviderMock = new Mock<IRuleProviderService<IEnumerable<string>>>();
        }

        private VirtualNodesRuleManager CreateSut(IEnumerable<string> rules = null)
        {
            _ruleProviderMock.Setup(r => r.Rules).Returns(rules ?? new List<string>());
            return new VirtualNodesRuleManager(_ruleProviderMock.Object);
        }

        #region Constructor Tests

        [Test]
        public void Constructor_InitializesRulesFromProvider()
        {
            var rules = new List<string> { "VirtualFolder", "VirtualContainer" };

            var sut = CreateSut(rules);

            Assert.That(sut.Rules, Has.Count.EqualTo(2));
            Assert.That(sut.Rules, Contains.Item("VirtualFolder"));
            Assert.That(sut.Rules, Contains.Item("VirtualContainer"));
        }

        [Test]
        public void Constructor_WhenNoRules_InitializesEmptyList()
        {
            var sut = CreateSut(new List<string>());

            Assert.That(sut.Rules, Is.Empty);
        }

        [Test]
        public void Constructor_WhenRulesContainWildcards_PreservesWildcards()
        {
            var rules = new List<string> { "Virtual*", "*Container", "*Folder*" };

            var sut = CreateSut(rules);

            Assert.That(sut.Rules, Has.Count.EqualTo(3));
            Assert.That(sut.Rules, Contains.Item("Virtual*"));
            Assert.That(sut.Rules, Contains.Item("*Container"));
            Assert.That(sut.Rules, Contains.Item("*Folder*"));
        }

        #endregion

        #region Rules Property Tests

        [Test]
        public void Rules_ReturnsAllLoadedRules()
        {
            var rules = new List<string> { "Rule1", "Rule2", "Rule3" };
            var sut = CreateSut(rules);

            var result = sut.Rules;

            Assert.That(result, Has.Count.EqualTo(3));
        }

        #endregion
    }

    [TestFixture]
    public class VirtualNodesExtensionsTests
    {
        private Mock<IRuleProviderService<IEnumerable<string>>> _ruleProviderMock;

        [SetUp]
        public void SetUp()
        {
            _ruleProviderMock = new Mock<IRuleProviderService<IEnumerable<string>>>();
        }

        private VirtualNodesRuleManager CreateRuleManager(IEnumerable<string> rules)
        {
            _ruleProviderMock.Setup(r => r.Rules).Returns(rules);
            return new VirtualNodesRuleManager(_ruleProviderMock.Object);
        }

        private static IPublishedContent CreateMockPublishedContent(string contentTypeAlias)
        {
            var contentTypeMock = new Mock<IPublishedContentType>();
            contentTypeMock.Setup(c => c.Alias).Returns(contentTypeAlias);

            var contentMock = new Mock<IPublishedContent>();
            contentMock.Setup(c => c.ContentType).Returns(contentTypeMock.Object);

            return contentMock.Object;
        }

        #region IsVirtualNode - Exact Match Tests

        [Test]
        public void IsVirtualNode_WhenExactMatch_ReturnsTrue()
        {
            var rules = new List<string> { "VirtualFolder" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("VirtualFolder");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenNoMatch_ReturnsFalse()
        {
            var rules = new List<string> { "VirtualFolder" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("RegularPage");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.False);
        }

        [Test]
        public void IsVirtualNode_MatchIsCaseInsensitive()
        {
            var rules = new List<string> { "VIRTUALFOLDER" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("virtualfolder");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.True);
        }

        #endregion

        #region IsVirtualNode - Wildcard Tests

        [Test]
        public void IsVirtualNode_WhenRuleEndsWithWildcard_MatchesPrefix()
        {
            var rules = new List<string> { "Virtual*" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("VirtualFolder");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenRuleEndsWithWildcard_DoesNotMatchDifferentPrefix()
        {
            var rules = new List<string> { "Virtual*" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("RegularFolder");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.False);
        }

        [Test]
        public void IsVirtualNode_WhenRuleStartsWithWildcard_MatchesSuffix()
        {
            var rules = new List<string> { "*Container" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("VirtualContainer");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenRuleStartsWithWildcard_DoesNotMatchDifferentSuffix()
        {
            var rules = new List<string> { "*Container" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("VirtualFolder");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.False);
        }

        [Test]
        public void IsVirtualNode_WhenRuleHasWildcardsOnBothEnds_MatchesContains()
        {
            var rules = new List<string> { "*Virtual*" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("MyVirtualFolder");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenRuleHasWildcardsOnBothEnds_DoesNotMatchIfNotContained()
        {
            var rules = new List<string> { "*Virtual*" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("RegularFolder");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.False);
        }

        #endregion

        #region IsVirtualNode - Multiple Rules Tests

        [Test]
        public void IsVirtualNode_MatchesAnyRule()
        {
            var rules = new List<string> { "VirtualFolder", "VirtualContainer", "VirtualPage" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("VirtualContainer");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenNoRules_ReturnsFalse()
        {
            var rules = new List<string>();
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("AnyType");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.False);
        }

        #endregion

        #region MatchDuplicateName Tests

        [Test]
        public void MatchDuplicateName_WhenNameHasDuplicatePattern_ReturnsTrue()
        {
            var result = Extensions.MatchDuplicateName("MyPage (1)", "MyPage");

            Assert.That(result, Is.True);
        }

        [Test]
        public void MatchDuplicateName_WhenNameHasHigherNumber_ReturnsTrue()
        {
            var result = Extensions.MatchDuplicateName("MyPage (42)", "MyPage");

            Assert.That(result, Is.True);
        }

        [Test]
        public void MatchDuplicateName_WhenNameDoesNotMatch_ReturnsFalse()
        {
            var result = Extensions.MatchDuplicateName("OtherPage (1)", "MyPage");

            Assert.That(result, Is.False);
        }

        [Test]
        public void MatchDuplicateName_WhenNoParentheses_ReturnsFalse()
        {
            var result = Extensions.MatchDuplicateName("MyPage", "MyPage");

            Assert.That(result, Is.False);
        }

        [Test]
        public void MatchDuplicateName_WhenParenthesesButNoNumber_ReturnsFalse()
        {
            var result = Extensions.MatchDuplicateName("MyPage (abc)", "MyPage");

            Assert.That(result, Is.False);
        }

        [Test]
        public void MatchDuplicateName_WhenExactSameName_ReturnsFalse()
        {
            var result = Extensions.MatchDuplicateName("MyPage", "MyPage");

            Assert.That(result, Is.False);
        }

        #endregion

        #region GetMaxNodeNameNumbering Tests

        [Test]
        public void GetMaxNodeNameNumbering_WhenNumberIsHigher_ReturnsNewMax()
        {
            var result = Extensions.GetMaxNodeNameNumbering("MyPage (5)", "MyPage", 3);

            Assert.That(result, Is.EqualTo(5));
        }

        [Test]
        public void GetMaxNodeNameNumbering_WhenNumberIsLower_ReturnsSameMax()
        {
            var result = Extensions.GetMaxNodeNameNumbering("MyPage (2)", "MyPage", 5);

            Assert.That(result, Is.EqualTo(5));
        }

        [Test]
        public void GetMaxNodeNameNumbering_WhenNumberIsEqual_ReturnsSameMax()
        {
            var result = Extensions.GetMaxNodeNameNumbering("MyPage (5)", "MyPage", 5);

            Assert.That(result, Is.EqualTo(5));
        }

        [Test]
        public void GetMaxNodeNameNumbering_WhenNoNumber_ReturnsSameMax()
        {
            var result = Extensions.GetMaxNodeNameNumbering("MyPage", "MyPage", 3);

            Assert.That(result, Is.EqualTo(3));
        }

        [Test]
        public void GetMaxNodeNameNumbering_WhenHighNumber_ReturnsHighNumber()
        {
            var result = Extensions.GetMaxNodeNameNumbering("MyPage (999)", "MyPage", 1);

            Assert.That(result, Is.EqualTo(999));
        }

        #endregion
    }
}
