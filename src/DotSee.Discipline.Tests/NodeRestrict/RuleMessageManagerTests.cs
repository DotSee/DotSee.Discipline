using System.Globalization;
using DotSee.Discipline.NodeRestrict;
using Moq;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using NUnit.Framework;

namespace DotSee.Discipline.Tests.NodeRestrict
{
    [TestFixture]
    public class RuleMessageManagerTests
    {
        private Mock<IContentTypeService> _contentTypeServiceMock;
        private Mock<ILocalizedTextService> _localizedTextServiceMock;

        [SetUp]
        public void SetUp()
        {
            _contentTypeServiceMock = new Mock<IContentTypeService>();
            _localizedTextServiceMock = new Mock<ILocalizedTextService>();
            SetupLocalizedText();
        }

        private void SetupLocalizedText()
        {
            // Mirrors, verbatim, the strings in the shipped server-side language file
            // (Client/public/lang/en.xml → wwwroot/App_Plugins/DotSee.Discipline/lang/en.xml),
            // including its %0%/%1% token convention, so tests assert on the same default
            // English text the runtime returns.
            SetupText("nodeRestrictDefaultCategory", "Node limit reached");
            SetupText("nodeRestrictDefault", "A maximum of %0% child node(s) %1% is allowed under %2%.");
            SetupText("nodeRestrictFromProperty", "A maximum of %0% child node(s) is allowed under this node.");
            SetupText("nodeRestrictOfAnyType", "of any type");
            SetupText("nodeRestrictOfType", "of type '%0%'");
            SetupText("nodeRestrictAnyNode", "any node");
            SetupText("nodeRestrictAtRoot", "the content root");
            SetupText("nodeRestrictNodesOfType", "nodes of type '%0%'");
            SetupText("nodeRestrictWarningDefault", "%3% under %2% are limited to %0%. You are about to create node number %1%.");
            SetupText("nodeRestrictWarningFromProperty", "You are about to create node number %0% of a maximum of %1% allowed under this node.");
            SetupText("nodeRestrictAnyNodeCap", "Nodes of any type");
            SetupText("nodeRestrictNodesOfTypeCap", "Nodes of type '%0%'");
        }

        private void SetupText(string key, string template)
        {
            _localizedTextServiceMock
                .Setup(x => x.Localize(
                    "dotseeDiscipline",
                    key,
                    It.IsAny<CultureInfo>(),
                    It.IsAny<IDictionary<string, string>>()))
                .Returns<string, string, CultureInfo, IDictionary<string, string>>((area, alias, culture, tokens) =>
                {
                    var result = template;
                    if (tokens != null)
                    {
                        foreach (var kvp in tokens)
                        {
                            result = result.Replace("%" + kvp.Key + "%", kvp.Value);
                        }
                    }
                    return result;
                });
        }

        private RuleMessageManager CreateManager(Rule rule)
        {
            return new RuleMessageManager(rule, _contentTypeServiceMock.Object, _localizedTextServiceMock.Object);
        }

        private void SetupContentTypes(string parentAlias, string parentName, string childAlias, string childName)
        {
            var parentType = new Mock<IContentType>();
            parentType.Setup(x => x.Alias).Returns(parentAlias);
            parentType.Setup(x => x.Name).Returns(parentName);

            var childType = new Mock<IContentType>();
            childType.Setup(x => x.Alias).Returns(childAlias);
            childType.Setup(x => x.Name).Returns(childName);

            _contentTypeServiceMock.Setup(x => x.GetAll())
                .Returns(new List<IContentType> { parentType.Object, childType.Object });
        }

        #region GetMessage Tests

        [Test]
        public void GetMessage_WhenCustomMessageSet_ReturnsCustomMessage()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5, customMessage: "Custom limit message");
            var mgr = CreateManager(rule);

            var result = mgr.GetMessage();

            Assert.That(result, Is.EqualTo("Custom limit message"));
        }

        [Test]
        public void GetMessage_WhenFromProperty_ReturnsPropertyMessage()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 10, fromProperty: true);
            var mgr = CreateManager(rule);

            var result = mgr.GetMessage();

            Assert.That(result, Is.EqualTo("A maximum of 10 child node(s) is allowed under this node."));
        }

        [Test]
        public void GetMessage_WhenStandardRule_ReturnsFormattedMessage()
        {
            SetupContentTypes("parentAlias", "Parent Type", "childAlias", "Child Type");
            var rule = new Rule("parentAlias", "childAlias", 3);
            var mgr = CreateManager(rule);

            var result = mgr.GetMessage();

            Assert.That(result, Does.Contain("3"));
            Assert.That(result, Does.Contain("Child Type"));
            Assert.That(result, Does.Contain("Parent Type"));
        }

        [Test]
        public void GetMessage_WhenWildcardChildDocType_UsesAnyTypeLabel()
        {
            SetupContentTypes("parentAlias", "Parent Type", "*", "");
            var rule = new Rule("parentAlias", "*", 5);
            var mgr = CreateManager(rule);

            var result = mgr.GetMessage();

            Assert.That(result, Does.Contain("of any type"));
        }

        [Test]
        public void GetMessage_WhenWildcardParentDocType_UsesAnyNodeLabel()
        {
            SetupContentTypes("*", "", "childAlias", "Child Type");
            var rule = new Rule("*", "childAlias", 5);
            var mgr = CreateManager(rule);

            var result = mgr.GetMessage();

            Assert.That(result, Does.Contain("any node"));
        }

        [Test]
        public void GetMessage_WhenBothWildcard_UsesGenericLabels()
        {
            _contentTypeServiceMock.Setup(x => x.GetAll()).Returns(new List<IContentType>());
            var rule = new Rule("*", "*", 1);
            var mgr = CreateManager(rule);

            var result = mgr.GetMessage();

            Assert.That(result, Does.Contain("of any type"));
            Assert.That(result, Does.Contain("any node"));
        }

        [Test]
        public void GetMessage_CustomMessageOverridesFromProperty()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5, fromProperty: true, customMessage: "Priority custom");
            var mgr = CreateManager(rule);

            var result = mgr.GetMessage();

            // Custom message takes priority even when fromProperty is true
            Assert.That(result, Is.EqualTo("Priority custom"));
        }

        #endregion

        #region GetMessageCategory Tests

        [Test]
        public void GetMessageCategory_WhenCustomCategorySet_ReturnsCustom()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5, customMessageCategory: "Error");
            var mgr = CreateManager(rule);

            var result = mgr.GetMessageCategory();

            Assert.That(result, Is.EqualTo("Error"));
        }

        [Test]
        public void GetMessageCategory_WhenNoCustomCategory_ReturnsDefaultCategory()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5);
            var mgr = CreateManager(rule);

            var result = mgr.GetMessageCategory();

            Assert.That(result, Is.EqualTo("Node limit reached"));
        }

        [Test]
        public void GetMessageCategory_WhenEmptyCustomCategory_ReturnsDefaultCategory()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5, customMessageCategory: "");
            var mgr = CreateManager(rule);

            var result = mgr.GetMessageCategory();

            Assert.That(result, Is.EqualTo("Node limit reached"));
        }

        #endregion

        #region GetWarningMessage Tests

        [Test]
        public void GetWarningMessage_WhenCustomWarningSet_ReturnsCustom()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5, customWarningMessage: "Custom warning!");
            var mgr = CreateManager(rule);

            var result = mgr.GetWarningMessage(3);

            Assert.That(result, Is.EqualTo("Custom warning!"));
        }

        [Test]
        public void GetWarningMessage_WhenFromProperty_ReturnsPropertyWarningMessage()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 10, fromProperty: true);
            var mgr = CreateManager(rule);

            var result = mgr.GetWarningMessage(4);

            // currentNodeCount + 1 = 5
            Assert.That(result, Does.Contain("5"));
            Assert.That(result, Does.Contain("10"));
        }

        [Test]
        public void GetWarningMessage_WhenStandardRule_ReturnsFormattedWarning()
        {
            SetupContentTypes("parentAlias", "Parent Type", "childAlias", "Child Type");
            var rule = new Rule("parentAlias", "childAlias", 8);
            var mgr = CreateManager(rule);

            var result = mgr.GetWarningMessage(5);

            // currentNodeCount + 1 = 6
            Assert.That(result, Does.Contain("6"));
            Assert.That(result, Does.Contain("8"));
        }

        [Test]
        public void GetWarningMessage_WhenCurrentNodeCountIsZero_ShowsOnePublished()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5, fromProperty: true);
            var mgr = CreateManager(rule);

            var result = mgr.GetWarningMessage(0);

            // 0 + 1 = 1
            Assert.That(result, Does.Contain("1"));
        }

        [Test]
        public void GetWarningMessage_WhenWildcardChild_UsesAnyTypeCapLabel()
        {
            _contentTypeServiceMock.Setup(x => x.GetAll()).Returns(new List<IContentType>());
            var rule = new Rule("*", "*", 10);
            var mgr = CreateManager(rule);

            var result = mgr.GetWarningMessage(5);

            Assert.That(result, Does.Contain("Nodes of any type"));
        }

        [Test]
        public void GetWarningMessage_CustomWarningOverridesFromProperty()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5, fromProperty: true, customWarningMessage: "Priority warning");
            var mgr = CreateManager(rule);

            var result = mgr.GetWarningMessage(3);

            Assert.That(result, Is.EqualTo("Priority warning"));
        }

        #endregion

        #region GetWarningMessageCategory Tests

        [Test]
        public void GetWarningMessageCategory_WhenCustomSet_ReturnsCustom()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5, customWarningMessageCategory: "Info");
            var mgr = CreateManager(rule);

            var result = mgr.GetWarningMessageCategory();

            Assert.That(result, Is.EqualTo("Info"));
        }

        [Test]
        public void GetWarningMessageCategory_WhenNotSet_ReturnsDefaultCategory()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5);
            var mgr = CreateManager(rule);

            var result = mgr.GetWarningMessageCategory();

            Assert.That(result, Is.EqualTo("Node limit reached"));
        }

        [Test]
        public void GetWarningMessageCategory_WhenEmpty_ReturnsDefaultCategory()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5, customWarningMessageCategory: "");
            var mgr = CreateManager(rule);

            var result = mgr.GetWarningMessageCategory();

            Assert.That(result, Is.EqualTo("Node limit reached"));
        }

        #endregion

        #region Constructor Content Type Name Resolution Tests

        [Test]
        public void Constructor_WhenContentTypeNotFound_HandlesGracefully()
        {
            // No content types registered - names will be null
            _contentTypeServiceMock.Setup(x => x.GetAll()).Returns(new List<IContentType>());
            var rule = new Rule("nonExistentParent", "nonExistentChild", 5);

            var mgr = CreateManager(rule);
            var result = mgr.GetMessage();

            // Should still produce a message, just with null names in the format string
            Assert.That(result, Is.Not.Null);
        }

        #endregion

        #region Content Root Rule Tests

        [Test]
        public void GetMessage_WhenRuleIsAtRoot_DescribesTheContentRoot()
        {
            SetupContentTypes("parentAlias", "Parent Type", "childAlias", "Child Type");
            var rule = new Rule(null, "childAlias", 1, atRoot: true);
            var mgr = CreateManager(rule);

            var result = mgr.GetMessage();

            Assert.That(result, Is.EqualTo("A maximum of 1 child node(s) of type 'Child Type' is allowed under the content root."));
        }

        [Test]
        public void GetMessage_WhenRuleIsAtRootWithAnyChildDocType_DescribesTheContentRoot()
        {
            SetupContentTypes("parentAlias", "Parent Type", "childAlias", "Child Type");
            var rule = new Rule(null, "*", 3, atRoot: true);
            var mgr = CreateManager(rule);

            var result = mgr.GetMessage();

            Assert.That(result, Is.EqualTo("A maximum of 3 child node(s) of any type is allowed under the content root."));
        }

        [Test]
        public void GetWarningMessage_WhenRuleIsAtRoot_DescribesTheContentRoot()
        {
            SetupContentTypes("parentAlias", "Parent Type", "childAlias", "Child Type");
            var rule = new Rule(null, "childAlias", 3, atRoot: true);
            var mgr = CreateManager(rule);

            var result = mgr.GetWarningMessage(1);

            Assert.That(result, Is.EqualTo("Nodes of type 'Child Type' under the content root are limited to 3. You are about to create node number 2."));
        }

        [Test]
        public void Constructor_WhenRuleIsAtRootWithNullParentDocType_DoesNotThrow()
        {
            SetupContentTypes("parentAlias", "Parent Type", "childAlias", "Child Type");
            var rule = new Rule { AtRoot = true, ChildDocType = "childAlias", MaxNodes = 1 };

            Assert.DoesNotThrow(() => CreateManager(rule));
        }

        [Test]
        public void GetMessage_WhenRuleIsAtRootWithCustomMessage_StillReturnsCustomMessage()
        {
            SetupContentTypes("parentAlias", "Parent Type", "childAlias", "Child Type");
            var rule = new Rule(null, "childAlias", 1, customMessage: "Only one site root allowed.", atRoot: true);
            var mgr = CreateManager(rule);

            var result = mgr.GetMessage();

            Assert.That(result, Is.EqualTo("Only one site root allowed."));
        }

        #endregion
    }
}
