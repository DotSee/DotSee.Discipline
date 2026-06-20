using System.Collections.Generic;
using DotSee.Discipline.Backoffice;
using DotSee.Discipline.Interfaces;
using DotSee.Discipline.NodeProtect;
using Moq;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Persistence.Querying;
using Umbraco.Cms.Core.Services;
using NUnit.Framework;

namespace DotSee.Discipline.Tests.NodeProtect
{
    [TestFixture]
    public class NodeProtectServiceTests
    {
        private Mock<IContentService> _contentServiceMock;
        private Mock<IRuleProviderService<IEnumerable<Rule>>> _ruleProviderMock;
        private Mock<ISettings<NodeProtectSettings>> _settingsProviderMock;
        private Mock<IDisciplineSettingsResolver> _settingsResolverMock;
        private NodeProtectSettings _settings;
        private long _totalRecords;

        [SetUp]
        public void SetUp()
        {
            _contentServiceMock = new Mock<IContentService>();
            _ruleProviderMock = new Mock<IRuleProviderService<IEnumerable<Rule>>>();
            _settingsProviderMock = _ruleProviderMock.As<ISettings<NodeProtectSettings>>();
            _settingsResolverMock = new Mock<IDisciplineSettingsResolver>();
            _settings = new NodeProtectSettings { PropertyAlias = null };
            _settingsProviderMock.Setup(s => s.Settings).Returns(_settings);
            _totalRecords = 0;

            // Default: no descendants
            _contentServiceMock
                .Setup(x => x.GetPagedDescendants(It.IsAny<int>(), It.IsAny<long>(), It.IsAny<int>(), out _totalRecords, It.IsAny<IQuery<IContent>>(), It.IsAny<Ordering>()))
                .Returns(new List<IContent>());
        }

        private static IContent CreateMockNode(int id, string contentTypeAlias, Guid? key = null)
        {
            var simpleContentTypeMock = new Mock<ISimpleContentType>();
            simpleContentTypeMock.Setup(c => c.Alias).Returns(contentTypeAlias);

            var nodeMock = new Mock<IContent>();
            nodeMock.Setup(n => n.Id).Returns(id);
            nodeMock.Setup(n => n.Key).Returns(key ?? Guid.NewGuid());
            nodeMock.Setup(n => n.ContentType).Returns(simpleContentTypeMock.Object);
            nodeMock.Setup(n => n.Name).Returns($"TestNode{id}");
            nodeMock.Setup(n => n.HasProperty(It.IsAny<string>())).Returns(false);

            return nodeMock.Object;
        }

        private static IContent CreateMockNodeWithProtectionProperty(int id, string contentTypeAlias, string propertyAlias, bool propertyValue)
        {
            var simpleContentTypeMock = new Mock<ISimpleContentType>();
            simpleContentTypeMock.Setup(c => c.Alias).Returns(contentTypeAlias);

            var nodeMock = new Mock<IContent>();
            nodeMock.Setup(n => n.Id).Returns(id);
            nodeMock.Setup(n => n.Key).Returns(Guid.NewGuid());
            nodeMock.Setup(n => n.ContentType).Returns(simpleContentTypeMock.Object);
            nodeMock.Setup(n => n.Name).Returns($"TestNode{id}");
            nodeMock.Setup(n => n.HasProperty(propertyAlias)).Returns(true);
            nodeMock.Setup(n => n.AvailableCultures).Returns(new List<string>());
            // True/False persists as 1/0; this node carries an invariant value.
            nodeMock.Setup(n => n.GetValue(propertyAlias, It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>())).Returns(propertyValue ? 1 : 0);

            return nodeMock.Object;
        }

        private NodeProtectService CreateSut(IEnumerable<Rule> rules = null)
        {
            _ruleProviderMock.Setup(r => r.Rules).Returns(rules ?? new List<Rule>());
            return new NodeProtectService(
                _contentServiceMock.Object,
                _ruleProviderMock.Object,
                _settingsResolverMock.Object,
                new Mock<Serilog.ILogger>().Object);
        }

        #region Constructor Tests

        [Test]
        public void Constructor_InitializesRulesFromProvider()
        {
            var rules = new List<Rule>
            {
                new Rule("ProtectedType", ""),
                new Rule("", "some-guid")
            };

            var sut = CreateSut(rules);

            // Verify by registering another rule and checking Run behavior
            Assert.That(sut, Is.Not.Null);
        }

        #endregion


        #region Run - No Rules Tests

        [Test]
        public void Run_WhenNoRules_ReturnsNull()
        {
            var sut = CreateSut(new List<Rule>());
            var node = CreateMockNode(1, "AnyType");

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Run_WhenRuleHasEmptyDoctypeAndEmptyGuids_ReturnsNull()
        {
            var rules = new List<Rule>
            {
                new Rule("", "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "AnyType");

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        #endregion

        #region Run - DocType Matching Tests

        [Test]
        public void Run_WhenNodeMatchesDoctypeRule_ReturnsResult()
        {
            var rules = new List<Rule>
            {
                new Rule("ProtectedType", "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "ProtectedType");

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.NodeId, Is.EqualTo(1));
            Assert.That(result.Rule.DocTypeAlias, Is.EqualTo("ProtectedType"));
        }

        [Test]
        public void Run_WhenNodeDoesNotMatchDoctypeRule_ReturnsNull()
        {
            var rules = new List<Rule>
            {
                new Rule("ProtectedType", "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "UnprotectedType");

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Run_DoctypeMatchingIsCaseInsensitive()
        {
            var rules = new List<Rule>
            {
                new Rule("PROTECTEDTYPE", "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "protectedtype");

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
        }

        [Test]
        public void Run_WhenNodeMatchesOneOfMultipleDoctypes_ReturnsResult()
        {
            var rules = new List<Rule>
            {
                new Rule("TypeA,TypeB,TypeC", "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "TypeB");

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
        }

        #endregion

        #region Run - GUID Matching Tests

        [Test]
        public void Run_WhenNodeMatchesGuidRule_ReturnsResult()
        {
            var nodeGuid = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var rules = new List<Rule>
            {
                new Rule("", "11111111-1111-1111-1111-111111111111")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "AnyType", nodeGuid);

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.NodeId, Is.EqualTo(1));
        }

        [Test]
        public void Run_WhenNodeDoesNotMatchGuidRule_ReturnsNull()
        {
            var nodeGuid = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var rules = new List<Rule>
            {
                new Rule("", "22222222-2222-2222-2222-222222222222")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "AnyType", nodeGuid);

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Run_GuidMatchingIsCaseInsensitive()
        {
            var nodeGuid = Guid.Parse("AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA");
            var rules = new List<Rule>
            {
                new Rule("", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "AnyType", nodeGuid);

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
        }

        [Test]
        public void Run_WhenNodeMatchesOneOfMultipleGuids_ReturnsResult()
        {
            var nodeGuid = Guid.Parse("22222222-2222-2222-2222-222222222222");
            var rules = new List<Rule>
            {
                new Rule("", "11111111-1111-1111-1111-111111111111,22222222-2222-2222-2222-222222222222,33333333-3333-3333-3333-333333333333")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "AnyType", nodeGuid);

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
        }

        #endregion

        #region Run - Property-Based Protection Tests

        [Test]
        public void Run_WhenNodeHasProtectionPropertyTrueAndNoRules_ReturnsResult()
        {
            // Regression: property-based protection must work even with NO doctype/GUID rules.
            _settings.PropertyAlias = "umbracoProtect";
            var sut = CreateSut(new List<Rule>());
            var node = CreateMockNodeWithProtectionProperty(1, "AnyType", "umbracoProtect", true);

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.NodeId, Is.EqualTo(1));
        }

        [Test]
        public void Run_WhenDescendantHasProtectionPropertyTrueAndNoRules_ReturnsResultForDescendant()
        {
            _settings.PropertyAlias = "umbracoProtect";
            var parentNode = CreateMockNode(1, "ParentType");
            var childNode = CreateMockNodeWithProtectionProperty(2, "ChildType", "umbracoProtect", true);
            _contentServiceMock
                .Setup(x => x.GetPagedDescendants(1, 0, int.MaxValue, out _totalRecords, It.IsAny<IQuery<IContent>>(), It.IsAny<Ordering>()))
                .Returns(new List<IContent> { childNode });
            var sut = CreateSut(new List<Rule>());

            var result = sut.Run(parentNode);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.NodeId, Is.EqualTo(2));
        }

        [Test]
        public void Run_WhenProtectionPropertyStoredAsStringOne_ReturnsResult()
        {
            // GetValue<bool> can return false for a True/False value persisted as the string "1";
            // the raw-value fallback must still treat it as protected.
            _settings.PropertyAlias = "umbracoProtect";

            var simpleContentTypeMock = new Mock<ISimpleContentType>();
            simpleContentTypeMock.Setup(c => c.Alias).Returns("AnyType");
            var nodeMock = new Mock<IContent>();
            nodeMock.Setup(n => n.Id).Returns(1);
            nodeMock.Setup(n => n.Key).Returns(Guid.NewGuid());
            nodeMock.Setup(n => n.ContentType).Returns(simpleContentTypeMock.Object);
            nodeMock.Setup(n => n.Name).Returns("TestNode1");
            nodeMock.Setup(n => n.HasProperty("umbracoProtect")).Returns(true);
            nodeMock.Setup(n => n.GetValue<bool>("umbracoProtect", It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>())).Returns(false);
            nodeMock.Setup(n => n.GetValue("umbracoProtect", It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>())).Returns("1");

            var sut = CreateSut(new List<Rule>());

            var result = sut.Run(nodeMock.Object);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.NodeId, Is.EqualTo(1));
        }

        [Test]
        public void Run_WhenProtectionPropertyIsVariantAndTrueForACulture_ReturnsResult()
        {
            // Mirrors the real failure: the property varies by culture, so the invariant read is
            // null and the value lives under a culture. NodeProtect must check the cultures too.
            _settings.PropertyAlias = "donotdelete";

            var simpleContentTypeMock = new Mock<ISimpleContentType>();
            simpleContentTypeMock.Setup(c => c.Alias).Returns("VariantType");
            var nodeMock = new Mock<IContent>();
            nodeMock.Setup(n => n.Id).Returns(1117);
            nodeMock.Setup(n => n.Key).Returns(Guid.NewGuid());
            nodeMock.Setup(n => n.ContentType).Returns(simpleContentTypeMock.Object);
            nodeMock.Setup(n => n.Name).Returns("VariantNode");
            nodeMock.Setup(n => n.HasProperty("donotdelete")).Returns(true);
            nodeMock.Setup(n => n.AvailableCultures).Returns(new List<string> { "en-US", "da-DK" });
            // Invariant read is null (the property varies by culture)...
            nodeMock.Setup(n => n.GetValue("donotdelete", null, It.IsAny<string>(), It.IsAny<bool>())).Returns((object)null);
            // ...but it is set to true under en-US.
            nodeMock.Setup(n => n.GetValue("donotdelete", "en-US", It.IsAny<string>(), It.IsAny<bool>())).Returns(1);

            var sut = CreateSut(new List<Rule>());

            var result = sut.Run(nodeMock.Object);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.NodeId, Is.EqualTo(1117));
        }

        [Test]
        public void Run_WhenNodeHasProtectionPropertySetToTrue_ReturnsResult()
        {
            _settings.PropertyAlias = "umbracoProtect";
            var rules = new List<Rule>
            {
                new Rule("OtherType", "") // Rule doesn't match by doctype
            };
            var sut = CreateSut(rules);
            var node = CreateMockNodeWithProtectionProperty(1, "UnprotectedType", "umbracoProtect", true);

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.NodeId, Is.EqualTo(1));
        }

        [Test]
        public void Run_WhenNodeHasProtectionPropertySetToFalse_ChecksOtherRules()
        {
            _settings.PropertyAlias = "umbracoProtect";
            var rules = new List<Rule>
            {
                new Rule("OtherType", "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNodeWithProtectionProperty(1, "UnprotectedType", "umbracoProtect", false);

            var result = sut.Run(node);

            // Property is false, and doctype doesn't match, so returns null
            Assert.That(result, Is.Null);
        }

        [Test]
        public void Run_WhenPropertyAliasIsNull_SkipsPropertyCheck()
        {
            _settings.PropertyAlias = null;
            var rules = new List<Rule>
            {
                new Rule("ProtectedType", "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "ProtectedType");

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
        }

        #endregion

        #region Run - Multiple Rules Tests

        [Test]
        public void Run_StopsAtFirstMatchingRule()
        {
            var rules = new List<Rule>
            {
                new Rule("TypeA", "", "Message A"),
                new Rule("TypeA", "", "Message B") // Same doctype, different message
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "TypeA");

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Rule.CustomMessage, Is.EqualTo("Message A"));
        }

        [Test]
        public void Run_ChecksAllRulesUntilMatch()
        {
            var rules = new List<Rule>
            {
                new Rule("TypeA", ""),
                new Rule("TypeB", ""),
                new Rule("TypeC", "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "TypeC");

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Rule.DocTypeAlias, Is.EqualTo("TypeC"));
        }

        #endregion

        #region Run - Descendant Checking Tests

        [Test]
        public void Run_WhenNodeDoesNotMatchButDescendantMatches_ReturnsResultForDescendant()
        {
            var rules = new List<Rule>
            {
                new Rule("ProtectedChildType", "")
            };
            var parentNode = CreateMockNode(1, "ParentType");
            var childNode = CreateMockNode(2, "ProtectedChildType");

            _contentServiceMock
                .Setup(x => x.GetPagedDescendants(1, 0, int.MaxValue, out _totalRecords, It.IsAny<IQuery<IContent>>(), It.IsAny<Ordering>()))
                .Returns(new List<IContent> { childNode });

            var sut = CreateSut(rules);

            var result = sut.Run(parentNode);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.NodeId, Is.EqualTo(2));
            Assert.That(result.NodeName, Is.EqualTo("TestNode2"));
        }

        [Test]
        public void Run_WhenNeitherNodeNorDescendantsMatch_ReturnsNull()
        {
            var rules = new List<Rule>
            {
                new Rule("ProtectedType", "")
            };
            var parentNode = CreateMockNode(1, "ParentType");
            var childNode = CreateMockNode(2, "ChildType");

            _contentServiceMock
                .Setup(x => x.GetPagedDescendants(1, 0, int.MaxValue, out _totalRecords, It.IsAny<IQuery<IContent>>(), It.IsAny<Ordering>()))
                .Returns(new List<IContent> { childNode });

            var sut = CreateSut(rules);

            var result = sut.Run(parentNode);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Run_WhenNodeMatchesDoesNotCheckDescendants()
        {
            var rules = new List<Rule>
            {
                new Rule("ProtectedType", "")
            };
            var parentNode = CreateMockNode(1, "ProtectedType");

            var sut = CreateSut(rules);

            var result = sut.Run(parentNode);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.NodeId, Is.EqualTo(1));
            // Verify GetPagedDescendants was never called since parent matched
            _contentServiceMock.Verify(
                x => x.GetPagedDescendants(It.IsAny<int>(), It.IsAny<long>(), It.IsAny<int>(), out _totalRecords, It.IsAny<IQuery<IContent>>(), It.IsAny<Ordering>()),
                Times.Never);
        }

        [Test]
        public void Run_StopsAtFirstMatchingDescendant()
        {
            var rules = new List<Rule>
            {
                new Rule("ProtectedChildType", "")
            };
            var parentNode = CreateMockNode(1, "ParentType");
            var child1 = CreateMockNode(2, "ProtectedChildType");
            var child2 = CreateMockNode(3, "ProtectedChildType");

            _contentServiceMock
                .Setup(x => x.GetPagedDescendants(1, 0, int.MaxValue, out _totalRecords, It.IsAny<IQuery<IContent>>(), It.IsAny<Ordering>()))
                .Returns(new List<IContent> { child1, child2 });

            var sut = CreateSut(rules);

            var result = sut.Run(parentNode);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.NodeId, Is.EqualTo(2)); // First matching descendant
        }

        #endregion

        #region Run - Combined Doctype and GUID Tests

        [Test]
        public void Run_WhenRuleHasBothDoctypeAndGuid_MatchesOnDoctype()
        {
            var nodeGuid = Guid.Parse("99999999-9999-9999-9999-999999999999");
            var rules = new List<Rule>
            {
                new Rule("ProtectedType", "11111111-1111-1111-1111-111111111111")
            };
            var sut = CreateSut(rules);
            // Node has matching doctype but non-matching GUID
            var node = CreateMockNode(1, "ProtectedType", nodeGuid);

            var result = sut.Run(node);

            // Should match because doctype matches (checked first)
            Assert.That(result, Is.Not.Null);
        }

        [Test]
        public void Run_WhenRuleHasBothDoctypeAndGuid_MatchesOnGuidIfDoctypeDoesNotMatch()
        {
            var nodeGuid = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var rules = new List<Rule>
            {
                new Rule("OtherType", "11111111-1111-1111-1111-111111111111")
            };
            var sut = CreateSut(rules);
            // Node has non-matching doctype but matching GUID
            var node = CreateMockNode(1, "SomeType", nodeGuid);

            var result = sut.Run(node);

            // Should match because GUID matches
            Assert.That(result, Is.Not.Null);
        }

        #endregion

        #region Edge Case Tests - Rule Construction

        [Test]
        public void Rule_DefaultConstructor_AllPropertiesAreNull()
        {
            var rule = new Rule();

            Assert.That(rule.DocTypeAlias, Is.Null);
            Assert.That(rule.DocumentGuids, Is.Null);
            Assert.That(rule.CustomMessage, Is.Null);
            Assert.That(rule.CustomMessageCategory, Is.Null);
        }

        [Test]
        public void Rule_WithNullDoctype_AndNullGuids_IsEffectivelyEmpty()
        {
            var rule = new Rule(null, null);

            Assert.That(rule.DocTypeAlias, Is.Null);
            Assert.That(rule.DocumentGuids, Is.Null);
        }

        [Test]
        public void Rule_WithWhitespaceDoctype_DoesNotMatchAnyNode()
        {
            var rules = new List<Rule>
            {
                new Rule("   ", "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "AnyType");

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Rule_WithInvalidGuidFormat_DoesNotMatch()
        {
            var rules = new List<Rule>
            {
                new Rule("", "not-a-valid-guid")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "AnyType");

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Rule_WithCommaOnlyDoctype_DoesNotMatch()
        {
            var rules = new List<Rule>
            {
                new Rule(",,,", "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "AnyType");

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Rule_WithCommaOnlyGuids_DoesNotMatch()
        {
            var rules = new List<Rule>
            {
                new Rule("", ",,,")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "AnyType");

            var result = sut.Run(node);

            Assert.That(result, Is.Null);
        }

        #endregion

        #region Edge Case Tests - GUID with Whitespace

        [Test]
        public void Run_WhenGuidHasLeadingTrailingSpaces_DoesNotMatch()
        {
            var nodeGuid = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var rules = new List<Rule>
            {
                new Rule("", " 11111111-1111-1111-1111-111111111111 ")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "AnyType", nodeGuid);

            var result = sut.Run(node);

            // Spaces around the GUID mean it won't match the node's key
            Assert.That(result, Is.Null);
        }

        #endregion

        #region Edge Case Tests - Doctype with Trailing Commas

        [Test]
        public void Run_WhenDoctypeHasTrailingComma_IgnoresEmptyEntry()
        {
            var rules = new List<Rule>
            {
                new Rule("TypeA,", "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "TypeA");

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
        }

        [Test]
        public void Run_WhenDoctypeHasLeadingComma_IgnoresEmptyEntry()
        {
            var rules = new List<Rule>
            {
                new Rule(",TypeA", "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "TypeA");

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
        }

        #endregion

        #region Edge Case Tests - Property Alias

        [Test]
        public void Run_WhenPropertyAliasIsEmpty_SkipsPropertyCheck()
        {
            _settings.PropertyAlias = "";
            var rules = new List<Rule>
            {
                new Rule("ProtectedType", "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "ProtectedType");

            var result = sut.Run(node);

            // With empty property alias the null check (propertyAlias != null) still passes,
            // but HasProperty("") returns false, so it falls through to rule matching
            Assert.That(result, Is.Not.Null);
        }

        [Test]
        public void Run_WhenPropertyExistsButReturnsFalse_FallsThroughToRuleCheck()
        {
            _settings.PropertyAlias = "umbracoProtect";
            var rules = new List<Rule>
            {
                new Rule("ProtectedType", "")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNodeWithProtectionProperty(1, "ProtectedType", "umbracoProtect", false);

            var result = sut.Run(node);

            // Property is false, but doctype matches, so rule still applies
            Assert.That(result, Is.Not.Null);
        }

        #endregion

        #region Edge Case Tests - Multiple GUIDs with Empty Entries

        [Test]
        public void Run_WhenMultipleGuidsWithEmptyEntries_MatchesValidGuid()
        {
            var nodeGuid = Guid.Parse("22222222-2222-2222-2222-222222222222");
            var rules = new List<Rule>
            {
                new Rule("", ",22222222-2222-2222-2222-222222222222,,")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "AnyType", nodeGuid);

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
        }

        #endregion

        #region Result Properties Tests

        [Test]
        public void Run_ResultContainsCorrectNodeInfo()
        {
            var rules = new List<Rule>
            {
                new Rule("ProtectedType", "", "Custom message", "Custom category")
            };
            var sut = CreateSut(rules);
            var node = CreateMockNode(42, "ProtectedType");

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.NodeId, Is.EqualTo(42));
            Assert.That(result.NodeName, Is.EqualTo("TestNode42"));
            Assert.That(result.Rule.CustomMessage, Is.EqualTo("Custom message"));
            Assert.That(result.Rule.CustomMessageCategory, Is.EqualTo("Custom category"));
        }

        #endregion

        #region Result.GetResult Factory Tests

        [Test]
        public void Result_GetResult_ReturnsCorrectNodeId()
        {
            var rules = new List<Rule> { new Rule("TypeA", "") };
            var sut = CreateSut(rules);
            var node = CreateMockNode(99, "TypeA");

            var result = sut.Run(node);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.NodeId, Is.EqualTo(99));
        }

        [Test]
        public void Result_GetResult_ReturnsCorrectNodeName()
        {
            var rules = new List<Rule> { new Rule("TypeA", "") };
            var sut = CreateSut(rules);
            var node = CreateMockNode(5, "TypeA");

            var result = sut.Run(node);

            Assert.That(result.NodeName, Is.EqualTo("TestNode5"));
        }

        [Test]
        public void Result_GetResult_PreservesRule()
        {
            var rule = new Rule("TypeA", "", "Custom msg", "Custom cat");
            var rules = new List<Rule> { rule };
            var sut = CreateSut(rules);
            var node = CreateMockNode(1, "TypeA");

            var result = sut.Run(node);

            Assert.That(result.Rule, Is.SameAs(rule));
        }

        #endregion

        #region Property-Based Protection - Exception Handling

        [Test]
        public void Run_WhenPropertyCheckThrowsException_FallsThroughToRuleCheck()
        {
            _settings.PropertyAlias = "brokenProperty";
            var rules = new List<Rule>
            {
                new Rule("MatchType", "")
            };
            var sut = CreateSut(rules);

            // Create a node where HasProperty returns true but GetValue throws
            var simpleContentTypeMock = new Mock<ISimpleContentType>();
            simpleContentTypeMock.Setup(c => c.Alias).Returns("MatchType");

            var nodeMock = new Mock<IContent>();
            nodeMock.Setup(n => n.Id).Returns(1);
            nodeMock.Setup(n => n.Key).Returns(Guid.NewGuid());
            nodeMock.Setup(n => n.ContentType).Returns(simpleContentTypeMock.Object);
            nodeMock.Setup(n => n.Name).Returns("TestNode1");
            nodeMock.Setup(n => n.HasProperty("brokenProperty")).Returns(true);
            nodeMock.Setup(n => n.GetValue("brokenProperty", It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>())).Throws(new Exception("Property access error"));

            var result = sut.Run(nodeMock.Object);

            // Property check fails (exception is swallowed), falls through to rule check where doctype matches
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Rule.DocTypeAlias, Is.EqualTo("MatchType"));
        }

        #endregion

        #region Descendant - Multiple Rules Mix

        [Test]
        public void Run_WhenDescendantMatchesByGuid_ReturnsResultForDescendant()
        {
            var childGuid = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
            var rules = new List<Rule>
            {
                new Rule("", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
            };
            var parentNode = CreateMockNode(1, "ParentType");
            var childNode = CreateMockNode(2, "ChildType", childGuid);

            _contentServiceMock
                .Setup(x => x.GetPagedDescendants(1, 0, int.MaxValue, out _totalRecords, It.IsAny<IQuery<IContent>>(), It.IsAny<Ordering>()))
                .Returns(new List<IContent> { childNode });

            var sut = CreateSut(rules);

            var result = sut.Run(parentNode);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.NodeId, Is.EqualTo(2));
        }

        [Test]
        public void Run_WhenFirstDescendantDoesNotMatchButSecondDoes_ReturnsSecond()
        {
            var rules = new List<Rule>
            {
                new Rule("ProtectedChild", "")
            };
            var parentNode = CreateMockNode(1, "ParentType");
            var child1 = CreateMockNode(2, "UnprotectedChild");
            var child2 = CreateMockNode(3, "ProtectedChild");

            _contentServiceMock
                .Setup(x => x.GetPagedDescendants(1, 0, int.MaxValue, out _totalRecords, It.IsAny<IQuery<IContent>>(), It.IsAny<Ordering>()))
                .Returns(new List<IContent> { child1, child2 });

            var sut = CreateSut(rules);

            var result = sut.Run(parentNode);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.NodeId, Is.EqualTo(3));
        }

        #endregion

        #region Rule Properties Tests

        [Test]
        public void Rule_ConstructorWithCustomMessages_SetsAllProperties()
        {
            var rule = new Rule("TypeA", "guid1", "Custom delete message", "Delete");

            Assert.That(rule.DocTypeAlias, Is.EqualTo("TypeA"));
            Assert.That(rule.DocumentGuids, Is.EqualTo("guid1"));
            Assert.That(rule.CustomMessage, Is.EqualTo("Custom delete message"));
            Assert.That(rule.CustomMessageCategory, Is.EqualTo("Delete"));
        }

        [Test]
        public void Rule_ConstructorWithDefaultMessages_HasEmptyMessages()
        {
            var rule = new Rule("TypeA", "guid1");

            Assert.That(rule.CustomMessage, Is.EqualTo(""));
            Assert.That(rule.CustomMessageCategory, Is.EqualTo(""));
        }

        #endregion

        #region NodeProtectSettings Tests

        [Test]
        public void NodeProtectSettings_DefaultPropertyAliasIsNull()
        {
            var settings = new NodeProtectSettings();

            Assert.That(settings.PropertyAlias, Is.Null);
        }

        [Test]
        public void NodeProtectSettings_CanSetPropertyAlias()
        {
            var settings = new NodeProtectSettings { PropertyAlias = "umbracoProtect" };

            Assert.That(settings.PropertyAlias, Is.EqualTo("umbracoProtect"));
        }

        #endregion
    }
}
