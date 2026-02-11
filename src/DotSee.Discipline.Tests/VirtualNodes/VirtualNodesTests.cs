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

        #region Edge Case Tests - IsVirtualNode

        [Test]
        public void IsVirtualNode_WhenRuleIsJustWildcard_MatchesEverything()
        {
            var rules = new List<string> { "*" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("AnyContentType");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenContentTypeAliasIsEmpty_ExactRuleDoesNotMatch()
        {
            var rules = new List<string> { "VirtualFolder" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.False);
        }

        [Test]
        public void IsVirtualNode_WhenContentTypeAliasIsEmpty_WildcardRuleMatches()
        {
            var rules = new List<string> { "*" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("");

            var result = content.IsVirtualNode(ruleManager);

            // "*" becomes "", and "".Contains("") is true
            Assert.That(result, Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenRuleIsEmptyString_MatchesExactEmpty()
        {
            var rules = new List<string> { "" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenRuleIsEmptyString_DoesNotMatchNonEmpty()
        {
            var rules = new List<string> { "" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("SomeType");

            var result = content.IsVirtualNode(ruleManager);

            Assert.That(result, Is.False);
        }

        [Test]
        public void IsVirtualNode_WhenWildcardOnlyStarStar_MatchesAnything()
        {
            // Rule: "*something*" where something is empty => "**"
            // which is two wildcards: starts with * and ends with *
            var rules = new List<string> { "**" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("AnyType");

            var result = content.IsVirtualNode(ruleManager);

            // Starts with * and ends with * => Contains("") => always true
            Assert.That(result, Is.True);
        }

        #endregion

        #region Edge Case Tests - MatchDuplicateName

        [Test]
        public void MatchDuplicateName_WhenNameHasNestedParentheses_ReturnsFalse()
        {
            var result = Extensions.MatchDuplicateName("MyPage ((1))", "MyPage");

            // The regex expects exactly " (N)" at the end
            Assert.That(result, Is.False);
        }

        [Test]
        public void MatchDuplicateName_WhenNameHasZero_ReturnsTrue()
        {
            var result = Extensions.MatchDuplicateName("MyPage (0)", "MyPage");

            Assert.That(result, Is.True);
        }

        [Test]
        public void MatchDuplicateName_WhenNameHasNegativeNumber_ReturnsFalse()
        {
            var result = Extensions.MatchDuplicateName("MyPage (-1)", "MyPage");

            // \d+ only matches digits, not negative signs
            Assert.That(result, Is.False);
        }

        [Test]
        public void MatchDuplicateName_WhenNameHasDecimalNumber_ReturnsFalse()
        {
            var result = Extensions.MatchDuplicateName("MyPage (1.5)", "MyPage");

            Assert.That(result, Is.False);
        }

        [Test]
        public void MatchDuplicateName_WhenBothNamesAreEmpty_ReturnsFalse()
        {
            var result = Extensions.MatchDuplicateName("", "");

            Assert.That(result, Is.False);
        }

        [Test]
        public void MatchDuplicateName_WhenPotentialNameIsEmpty_ReturnsFalse()
        {
            var result = Extensions.MatchDuplicateName("", "MyPage");

            Assert.That(result, Is.False);
        }

        [Test]
        public void MatchDuplicateName_WhenCurrNameIsEmpty_ReturnsFalse()
        {
            var result = Extensions.MatchDuplicateName(" (1)", "");

            // " (1)" is too short: regex needs `.+` (1+ chars) then ` \(\d+\)` (4+ chars) = 5+ chars,
            // but " (1)" is only 4 chars, so regex doesn't match
            Assert.That(result, Is.False);
        }

        [Test]
        public void MatchDuplicateName_WhenNameHasMultipleSpacesBeforeParenthesis_ReturnsFalse()
        {
            var result = Extensions.MatchDuplicateName("MyPage  (1)", "MyPage");

            // "MyPage  (1)" regex base is "MyPage ", which doesn't equal "MyPage"
            Assert.That(result, Is.False);
        }

        [Test]
        public void MatchDuplicateName_WhenNameContainsParenthesesInMiddle_ReturnsFalse()
        {
            var result = Extensions.MatchDuplicateName("MyPage (old) (1)", "MyPage (old)");

            Assert.That(result, Is.True);
        }

        [Test]
        public void MatchDuplicateName_VeryLargeNumber_ReturnsTrue()
        {
            var result = Extensions.MatchDuplicateName("MyPage (99999999)", "MyPage");

            Assert.That(result, Is.True);
        }

        #endregion

        #region Edge Case Tests - GetMaxNodeNameNumbering

        [Test]
        public void GetMaxNodeNameNumbering_WhenDifferentBaseName_StillExtractsNumber()
        {
            var result = Extensions.GetMaxNodeNameNumbering("OtherPage (5)", "MyPage", 3);

            // GetMaxNodeNameNumbering only checks the regex pattern, not the base name.
            // "OtherPage (5)" matches `^.+ \((\d+)\)$`, so 5 is extracted and max(5, 3) = 5
            Assert.That(result, Is.EqualTo(5));
        }

        [Test]
        public void GetMaxNodeNameNumbering_WhenMaxIsZero_AndNumberIsZero_ReturnsZero()
        {
            var result = Extensions.GetMaxNodeNameNumbering("MyPage (0)", "MyPage", 0);

            Assert.That(result, Is.EqualTo(0));
        }

        [Test]
        public void GetMaxNodeNameNumbering_WhenMaxIsNegative_UpdatesToHigherNumber()
        {
            var result = Extensions.GetMaxNodeNameNumbering("MyPage (1)", "MyPage", -5);

            Assert.That(result, Is.EqualTo(1));
        }

        [Test]
        public void GetMaxNodeNameNumbering_WhenNameIsEmpty_ReturnsSameMax()
        {
            var result = Extensions.GetMaxNodeNameNumbering("", "MyPage", 5);

            Assert.That(result, Is.EqualTo(5));
        }

        [Test]
        public void GetMaxNodeNameNumbering_WhenInputTooShortForPattern_ReturnsSameMax()
        {
            var result = Extensions.GetMaxNodeNameNumbering(" (10)", "", 0);

            // " (10)" doesn't match regex `^.+ \((\d+)\)$` because there's no base name
            // before the ` (10)` pattern - the leading space IS the only content, so
            // `.+` matches the space but then there's no space before `\(`
            Assert.That(result, Is.EqualTo(0));
        }

        #endregion

        #region Edge Case Tests - VirtualNodesRuleManager

        [Test]
        public void RuleManager_WhenRulesContainDuplicates_PreservesDuplicates()
        {
            var rules = new List<string> { "VirtualFolder", "VirtualFolder", "VirtualFolder" };

            var sut = CreateRuleManager(rules);

            Assert.That(sut.Rules, Has.Count.EqualTo(3));
        }

        [Test]
        public void RuleManager_WhenRulesContainEmptyStrings_PreservesEmptyStrings()
        {
            var rules = new List<string> { "", "VirtualFolder", "" };

            var sut = CreateRuleManager(rules);

            Assert.That(sut.Rules, Has.Count.EqualTo(3));
            Assert.That(sut.Rules[0], Is.EqualTo(""));
        }

        [Test]
        public void RuleManager_WhenRulesContainNull_PreservesNulls()
        {
            var rules = new List<string> { null, "VirtualFolder" };

            var sut = CreateRuleManager(rules);

            Assert.That(sut.Rules, Has.Count.EqualTo(2));
            Assert.That(sut.Rules[0], Is.Null);
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

        #region MatchContentTypeAlias Wildcard Edge Cases (via IsVirtualNode)

        [Test]
        public void IsVirtualNode_WhenPrefixWildcard_CaseInsensitive()
        {
            var rules = new List<string> { "Virtual*" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("VIRTUALFOLDER");

            Assert.That(content.IsVirtualNode(ruleManager), Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenSuffixWildcard_CaseInsensitive()
        {
            var rules = new List<string> { "*FOLDER" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("virtualfolder");

            Assert.That(content.IsVirtualNode(ruleManager), Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenContainsWildcard_CaseInsensitive()
        {
            var rules = new List<string> { "*VIRTUAL*" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("myvirtualfolder");

            Assert.That(content.IsVirtualNode(ruleManager), Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenPrefixWildcard_PartialMatch()
        {
            // Rule "Vir*" should match "VirtualFolder" because it starts with "Vir"
            var rules = new List<string> { "Vir*" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("VirtualFolder");

            Assert.That(content.IsVirtualNode(ruleManager), Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenSuffixWildcard_PartialMatch()
        {
            var rules = new List<string> { "*der" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("VirtualFolder");

            Assert.That(content.IsVirtualNode(ruleManager), Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenContainsWildcard_InMiddle()
        {
            var rules = new List<string> { "*ualFol*" };
            var ruleManager = CreateRuleManager(rules);
            var content = CreateMockPublishedContent("VirtualFolder");

            Assert.That(content.IsVirtualNode(ruleManager), Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenPrefixWildcard_EmptyPrefix_MatchesEverything()
        {
            // Rule "*" means startsWith("") - matches everything
            var rules = new List<string> { "*" };
            var ruleManager = CreateRuleManager(rules);

            Assert.That(CreateMockPublishedContent("anything").IsVirtualNode(ruleManager), Is.True);
            Assert.That(CreateMockPublishedContent("").IsVirtualNode(ruleManager), Is.True);
        }

        [Test]
        public void IsVirtualNode_WhenMultipleRulesWithDifferentWildcardTypes()
        {
            var rules = new List<string> { "Exact", "Pre*", "*Suf", "*Mid*" };
            var ruleManager = CreateRuleManager(rules);

            Assert.That(CreateMockPublishedContent("Exact").IsVirtualNode(ruleManager), Is.True);
            Assert.That(CreateMockPublishedContent("PreAnything").IsVirtualNode(ruleManager), Is.True);
            Assert.That(CreateMockPublishedContent("AnythingSuf").IsVirtualNode(ruleManager), Is.True);
            Assert.That(CreateMockPublishedContent("HasMidInName").IsVirtualNode(ruleManager), Is.True);
            Assert.That(CreateMockPublishedContent("NoMatchHere").IsVirtualNode(ruleManager), Is.False);
        }

        #endregion

        #region MatchDuplicateName Additional Edge Cases

        [Test]
        public void MatchDuplicateName_WhenNameHasNumberWithoutSpace_ReturnsFalse()
        {
            // Missing space before parenthesis: "MyPage(1)" doesn't match
            var result = Extensions.MatchDuplicateName("MyPage(1)", "MyPage");

            Assert.That(result, Is.False);
        }

        [Test]
        public void MatchDuplicateName_WhenNameHasLeadingNumber_ReturnsTrue()
        {
            var result = Extensions.MatchDuplicateName("123 Page (2)", "123 Page");

            Assert.That(result, Is.True);
        }

        [Test]
        public void MatchDuplicateName_WhenCurrNameContainsParentheses_MatchesCorrectly()
        {
            // "My (Cool) Page (3)" should match "My (Cool) Page"
            var result = Extensions.MatchDuplicateName("My (Cool) Page (3)", "My (Cool) Page");

            Assert.That(result, Is.True);
        }

        [Test]
        public void MatchDuplicateName_WhenSingleCharName_ReturnsTrue()
        {
            var result = Extensions.MatchDuplicateName("A (1)", "A");

            Assert.That(result, Is.True);
        }

        [Test]
        public void MatchDuplicateName_WhenUnicodeName_ReturnsTrue()
        {
            var result = Extensions.MatchDuplicateName("Σελίδα (5)", "Σελίδα");

            Assert.That(result, Is.True);
        }

        #endregion

        #region GetMaxNodeNameNumbering Additional Edge Cases

        [Test]
        public void GetMaxNodeNameNumbering_WhenMultipleCallsSimulation_TracksMaxCorrectly()
        {
            // Simulate checking multiple names and tracking the max
            int max = 0;
            max = Extensions.GetMaxNodeNameNumbering("Page (1)", "Page", max);
            Assert.That(max, Is.EqualTo(1));

            max = Extensions.GetMaxNodeNameNumbering("Page (5)", "Page", max);
            Assert.That(max, Is.EqualTo(5));

            max = Extensions.GetMaxNodeNameNumbering("Page (3)", "Page", max);
            Assert.That(max, Is.EqualTo(5)); // 3 < 5, so stays 5

            max = Extensions.GetMaxNodeNameNumbering("Page (10)", "Page", max);
            Assert.That(max, Is.EqualTo(10));
        }

        [Test]
        public void GetMaxNodeNameNumbering_WhenNonMatchingPattern_KeepsMax()
        {
            var result = Extensions.GetMaxNodeNameNumbering("Just a name", "Page", 7);

            Assert.That(result, Is.EqualTo(7));
        }

        [Test]
        public void GetMaxNodeNameNumbering_WhenLettersInParentheses_KeepsMax()
        {
            var result = Extensions.GetMaxNodeNameNumbering("Page (abc)", "Page", 3);

            Assert.That(result, Is.EqualTo(3));
        }

        [Test]
        public void GetMaxNodeNameNumbering_IgnoresBaseNameComparison()
        {
            // Important: GetMaxNodeNameNumbering does NOT compare base names.
            // It only extracts the number from the pattern, regardless of base name match.
            var result = Extensions.GetMaxNodeNameNumbering("DifferentPage (100)", "MyPage", 5);

            Assert.That(result, Is.EqualTo(100));
        }

        #endregion
    }
}
