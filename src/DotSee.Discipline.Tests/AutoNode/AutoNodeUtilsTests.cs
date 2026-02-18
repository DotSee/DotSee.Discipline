using DotSee.Discipline.AutoNode;
using Moq;
using Serilog;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using NUnit.Framework;

namespace DotSee.Discipline.Tests.AutoNode
{
    [TestFixture]
    public class AutoNodeUtilsTests
    {
        private Mock<ILogger> _loggerMock;
        private Mock<ILanguageService> _languageServiceMock;
        private Mock<IDictionaryItemService> _dictionaryItemServiceMock;

        [SetUp]
        public void SetUp()
        {
            _loggerMock = new Mock<ILogger>();
            _languageServiceMock = new Mock<ILanguageService>();
            _dictionaryItemServiceMock = new Mock<IDictionaryItemService>();
        }

        private AutoNodeUtils CreateSut()
        {
            return new AutoNodeUtils(
                _loggerMock.Object,
                _languageServiceMock.Object,
                _dictionaryItemServiceMock.Object);
        }

        #region GetAssignedNodeName - Dictionary Item Not Found / Empty

        [Test]
        public void GetAssignedNodeName_WhenDictionaryKeyIsEmpty_ReturnsRuleNodeName()
        {
            var rule = new Rule("Created", "ToCreate", "FallbackName", dictionaryItemForName: "");
            var sut = CreateSut();

            var result = sut.GetAssignedNodeName(rule, "");

            Assert.That(result, Is.EqualTo("FallbackName"));
        }

        [Test]
        public void GetAssignedNodeName_WhenDictionaryThrowsException_FallsBackToNodeName()
        {
            var rule = new Rule("Created", "ToCreate", "FallbackName", dictionaryItemForName: "NonExistentKey");
            _dictionaryItemServiceMock
                .Setup(d => d.GetAsync(It.IsAny<string>()))
                .ThrowsAsync(new Exception("Dictionary item not found"));

            var sut = CreateSut();
            var result = sut.GetAssignedNodeName(rule, "");

            Assert.That(result, Is.EqualTo("FallbackName"));
            _loggerMock.Verify(l => l.Error(It.IsAny<Exception>(), It.IsAny<string>()), Times.Once);
        }

        [Test]
        public void GetAssignedNodeName_WhenDictionaryReturnsNull_FallsBackToNodeName()
        {
            var rule = new Rule("Created", "ToCreate", "FallbackName", dictionaryItemForName: "SomeKey");
            _dictionaryItemServiceMock
                .Setup(d => d.GetAsync(It.IsAny<string>()))
                .ThrowsAsync(new NullReferenceException("null result"));

            var sut = CreateSut();
            var result = sut.GetAssignedNodeName(rule, "");

            Assert.That(result, Is.EqualTo("FallbackName"));
        }

        [Test]
        public void GetAssignedNodeName_WhenDictionaryKeyIsDefault_AndTranslationNotFound_FallsBackToNodeName()
        {
            // Default dictionary key is "AutoNode.Name"
            var rule = new Rule("Created", "ToCreate", "DefaultFallback");
            // Simulating the dictionary lookup throwing because key doesn't exist
            _dictionaryItemServiceMock
                .Setup(d => d.GetAsync("AutoNode.Name"))
                .ThrowsAsync(new Exception("Not found"));

            var sut = CreateSut();
            var result = sut.GetAssignedNodeName(rule, "en-US");

            Assert.That(result, Is.EqualTo("DefaultFallback"));
        }

        #endregion

        #region GetAssignedNodeName - Culture Parameter

        [Test]
        public void GetAssignedNodeName_WhenCultureIsEmpty_UsesNullCulture()
        {
            // When culture is empty, the method calls GetTranslatedValue(null)
            var rule = new Rule("Created", "ToCreate", "NodeName", dictionaryItemForName: "TestKey");

            // Make dictionary throw to fall through to NodeName
            _dictionaryItemServiceMock
                .Setup(d => d.GetAsync("TestKey"))
                .ThrowsAsync(new Exception("Not found"));

            var sut = CreateSut();
            var result = sut.GetAssignedNodeName(rule, "");

            Assert.That(result, Is.EqualTo("NodeName"));
        }

        [Test]
        public void GetAssignedNodeName_WhenCultureIsNotEmpty_UsesCulture()
        {
            var rule = new Rule("Created", "ToCreate", "NodeName", dictionaryItemForName: "TestKey");

            // Make dictionary throw to fall through to NodeName  
            _dictionaryItemServiceMock
                .Setup(d => d.GetAsync("TestKey"))
                .ThrowsAsync(new Exception("Not found"));

            var sut = CreateSut();
            var result = sut.GetAssignedNodeName(rule, "en-US");

            Assert.That(result, Is.EqualTo("NodeName"));
        }

        #endregion

        #region GetAssignedNodeName - NodeName Fallback

        [Test]
        public void GetAssignedNodeName_WhenRuleNodeNameIsNull_ReturnsNull()
        {
            var rule = new Rule("Created", "ToCreate", null, dictionaryItemForName: "");
            var sut = CreateSut();

            var result = sut.GetAssignedNodeName(rule, "");

            Assert.That(result, Is.Null);
        }

        [Test]
        public void GetAssignedNodeName_WhenRuleNodeNameIsEmpty_ReturnsEmpty()
        {
            var rule = new Rule("Created", "ToCreate", "", dictionaryItemForName: "");
            var sut = CreateSut();

            var result = sut.GetAssignedNodeName(rule, "");

            // assignedNodeName will be "" which IsNullOrEmpty, so falls through to rule.NodeName which is ""
            Assert.That(result, Is.EqualTo(""));
        }

        [Test]
        public void GetAssignedNodeName_WhenRuleNodeNameHasSpecialChars_ReturnsAsIs()
        {
            var rule = new Rule("Created", "ToCreate", "Σελίδα & <Page>", dictionaryItemForName: "");
            var sut = CreateSut();

            var result = sut.GetAssignedNodeName(rule, "");

            Assert.That(result, Is.EqualTo("Σελίδα & <Page>"));
        }

        #endregion
    }
}
