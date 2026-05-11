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
            // Mirrors the strings in wwwroot/App_Plugins/DotSee.Discipline/Lang/en.xml
            // so tests can assert on the same default English text the runtime returns.
            SetupText("nodeRestrictDefaultCategory", "Publish");
            SetupText("nodeRestrictFromProperty", "Node saved but not published. Max allowed children: {0}.");
            SetupText("nodeRestrictDefault", "Node saved but not published. Max allowed children {1} directly under {2}: {0}.");
            SetupText("nodeRestrictWarningFromProperty", "Restrictions for this node are in place. You have published {0} out {1} allowed child nodes.");
            SetupText("nodeRestrictWarningDefault", "Restrictions in place. {3} directly under {2}: {1} of {0} allowed.");
            SetupText("nodeRestrictAnyNode", "any node");
            SetupText("nodeRestrictNodesOfType", "nodes of type \"{0}\"");
            SetupText("nodeRestrictOfAnyType", "of any type");
            SetupText("nodeRestrictOfType", "of type \"{0}\"");
            SetupText("nodeRestrictAnyNodeCap", "Any node");
            SetupText("nodeRestrictNodesOfTypeCap", "Nodes of type \"{0}\"");
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
                            result = result.Replace("{" + kvp.Key + "}", kvp.Value);
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

            Assert.That(result, Is.EqualTo("Node saved but not published. Max allowed children: 10."));
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
        public void GetMessageCategory_WhenNoCustomCategory_ReturnsPublish()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5);
            var mgr = CreateManager(rule);

            var result = mgr.GetMessageCategory();

            Assert.That(result, Is.EqualTo("Publish"));
        }

        [Test]
        public void GetMessageCategory_WhenEmptyCustomCategory_ReturnsPublish()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5, customMessageCategory: "");
            var mgr = CreateManager(rule);

            var result = mgr.GetMessageCategory();

            Assert.That(result, Is.EqualTo("Publish"));
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
        public void GetWarningMessage_WhenWildcardChild_UsesAnyNodeLabel()
        {
            _contentTypeServiceMock.Setup(x => x.GetAll()).Returns(new List<IContentType>());
            var rule = new Rule("*", "*", 10);
            var mgr = CreateManager(rule);

            var result = mgr.GetWarningMessage(5);

            Assert.That(result, Does.Contain("Any node"));
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
        public void GetWarningMessageCategory_WhenNotSet_ReturnsPublish()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5);
            var mgr = CreateManager(rule);

            var result = mgr.GetWarningMessageCategory();

            Assert.That(result, Is.EqualTo("Publish"));
        }

        [Test]
        public void GetWarningMessageCategory_WhenEmpty_ReturnsPublish()
        {
            SetupContentTypes("parentAlias", "Parent", "childAlias", "Child");
            var rule = new Rule("parentAlias", "childAlias", 5, customWarningMessageCategory: "");
            var mgr = CreateManager(rule);

            var result = mgr.GetWarningMessageCategory();

            Assert.That(result, Is.EqualTo("Publish"));
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
    }
}
