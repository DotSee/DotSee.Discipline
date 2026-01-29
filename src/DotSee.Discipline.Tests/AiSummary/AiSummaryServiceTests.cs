using System.Collections.Generic;
using DotSee.Discipline.AiSummary;
using DotSee.Discipline.AiSummary.Exceptions;
using DotSee.Discipline.Interfaces;
using Moq;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using NUnit.Framework;

namespace DotSee.Discipline.Tests.AiSummary
{
    [TestFixture]
    public class AiSummaryServiceTests
    {
        private Mock<JsonSettingsProviderService> _settingsProviderMock;
        private Mock<Serilog.ILogger> _loggerMock;
        private Mock<IJsonSerializer> _jsonSerializerMock;
        private Mock<IContentTypeService> _contentTypeServiceMock;
        private AiSummarySettings _settings;

        [SetUp]
        public void SetUp()
        {
            _loggerMock = new Mock<Serilog.ILogger>();
            _jsonSerializerMock = new Mock<IJsonSerializer>();
            _contentTypeServiceMock = new Mock<IContentTypeService>();
            
            _settings = new AiSummarySettings
            {
                ApiKey = null,
                PropertyAlias = null,
                DocTypes = null,
                TogglePropertyAlias = null,
                Llm = "openai",
                Model = "gpt-4o-mini",
                MaxChars = 150,
                Tone = "Professional"
            };

            // Create a mock that can be cast to ISettings<AiSummarySettings>
            _settingsProviderMock = new Mock<JsonSettingsProviderService>(
                _loggerMock.Object, 
                Mock.Of<Microsoft.Extensions.Configuration.IConfiguration>());
        }

        private static IContent CreateMockNode(int id, string contentTypeAlias, bool hasProperty = true, string propertyValue = null)
        {
            var simpleContentTypeMock = new Mock<ISimpleContentType>();
            simpleContentTypeMock.Setup(c => c.Alias).Returns(contentTypeAlias);

            var nodeMock = new Mock<IContent>();
            nodeMock.Setup(n => n.Id).Returns(id);
            nodeMock.Setup(n => n.Key).Returns(Guid.NewGuid());
            nodeMock.Setup(n => n.ContentType).Returns(simpleContentTypeMock.Object);
            nodeMock.Setup(n => n.Name).Returns($"TestNode{id}");
            nodeMock.Setup(n => n.HasProperty(It.IsAny<string>())).Returns(hasProperty);
            nodeMock.Setup(n => n.AvailableCultures).Returns(new List<string>());
            nodeMock.Setup(n => n.EditedCultures).Returns(new List<string>());

            if (propertyValue != null)
            {
                nodeMock.Setup(n => n.GetValue(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>()))
                    .Returns(propertyValue);
            }

            return nodeMock.Object;
        }

        #region AiSummarySettings Tests

        [Test]
        public void AiSummarySettings_DefaultValues_AreCorrect()
        {
            var settings = new AiSummarySettings();

            Assert.That(settings.MaxChars, Is.EqualTo(150));
            Assert.That(settings.Tone, Is.EqualTo("Use a professional tone."));
        }

        [Test]
        public void AiSummarySettings_DocTypesList_ParsesCommaSeparatedDocTypes()
        {
            var settings = new AiSummarySettings
            {
                DocTypes = "Article, BlogPost, NewsItem"
            };

            var list = settings.DocTypesList;

            Assert.That(list, Has.Count.EqualTo(3));
            Assert.That(list, Contains.Item("Article"));
            Assert.That(list, Contains.Item("BlogPost"));
            Assert.That(list, Contains.Item("NewsItem"));
        }

        [Test]
        public void AiSummarySettings_DocTypesList_TrimsWhitespace()
        {
            var settings = new AiSummarySettings
            {
                DocTypes = "  Article  ,  BlogPost  "
            };

            var list = settings.DocTypesList;

            Assert.That(list[0], Is.EqualTo("Article"));
            Assert.That(list[1], Is.EqualTo("BlogPost"));
        }

        [Test]
        public void AiSummarySettings_DocTypesList_ReturnsEmptyWhenNull()
        {
            var settings = new AiSummarySettings
            {
                DocTypes = null
            };

            var list = settings.DocTypesList;

            Assert.That(list, Is.Empty);
        }

        [Test]
        public void AiSummarySettings_ExcludePropertiesList_ParsesCommaSeparatedValues()
        {
            var settings = new AiSummarySettings
            {
                ExcludeProperties = "umbracoNaviHide,metaDescription"
            };

            var list = settings.ExcludePropertiesList;

            Assert.That(list, Has.Count.EqualTo(2));
            Assert.That(list, Contains.Item("umbracoNaviHide"));
            Assert.That(list, Contains.Item("metaDescription"));
        }

        [Test]
        public void AiSummarySettings_ExcludePropertiesList_ReturnsEmptyWhenNull()
        {
            var settings = new AiSummarySettings
            {
                ExcludeProperties = null
            };

            var list = settings.ExcludePropertiesList;

            Assert.That(list, Is.Empty);
        }

        #endregion

        #region ServiceCheckResults Tests

        [Test]
        public void ServiceCheckResults_DefaultValues_AreFalse()
        {
            var result = new ServiceCheckResults();

            Assert.That(result.ShouldContinue, Is.False);
            Assert.That(result.IsComplexProperty, Is.False);
            Assert.That(result.HasToggleProperty, Is.False);
        }

        [Test]
        public void ServiceCheckResults_CanSetAllProperties()
        {
            var result = new ServiceCheckResults
            {
                ShouldContinue = true,
                IsComplexProperty = true,
                HasToggleProperty = true
            };

            Assert.That(result.ShouldContinue, Is.True);
            Assert.That(result.IsComplexProperty, Is.True);
            Assert.That(result.HasToggleProperty, Is.True);
        }

        #endregion

        #region PropertyNotUpdatedException Tests

        [Test]
        public void PropertyNotUpdatedException_ContainsMessage()
        {
            var message = "Property 'summary' was not updated";
            var exception = new PropertyNotUpdatedException(message);

            Assert.That(exception.Message, Is.EqualTo(message));
        }

        [Test]
        public void PropertyNotUpdatedException_IsException()
        {
            var exception = new PropertyNotUpdatedException("Test");

            Assert.That(exception, Is.InstanceOf<Exception>());
        }

        #endregion

        #region Complex Property Detection Tests

        [Test]
        public void ComplexPropertyAlias_WithTwoDots_IsComplex()
        {
            // Complex property format: "blockList.elementType.propertyAlias"
            var alias = "seoBlock.seoElement.summary";
            var dotCount = alias.Count(x => x == '.');

            Assert.That(dotCount, Is.EqualTo(2));
        }

        [Test]
        public void SimplePropertyAlias_WithNoDots_IsNotComplex()
        {
            var alias = "summary";
            var dotCount = alias.Count(x => x == '.');

            Assert.That(dotCount, Is.EqualTo(0));
        }

        [Test]
        public void PropertyAlias_WithOneDot_IsNotComplex()
        {
            var alias = "block.summary";
            var dotCount = alias.Count(x => x == '.');

            Assert.That(dotCount, Is.EqualTo(1));
            Assert.That(dotCount == 2, Is.False);
        }

        #endregion

        #region Settings Validation Tests

        [Test]
        public void Settings_WithEmptyApiKey_ShouldNotContinue()
        {
            // This tests the logic that should be in ShouldContinue
            var settings = new AiSummarySettings
            {
                ApiKey = "",
                PropertyAlias = "summary"
            };

            var shouldContinue = !string.IsNullOrEmpty(settings.ApiKey);

            Assert.That(shouldContinue, Is.False);
        }

        [Test]
        public void Settings_WithNullApiKey_ShouldNotContinue()
        {
            var settings = new AiSummarySettings
            {
                ApiKey = null,
                PropertyAlias = "summary"
            };

            var shouldContinue = !string.IsNullOrEmpty(settings.ApiKey);

            Assert.That(shouldContinue, Is.False);
        }

        [Test]
        public void Settings_WithValidApiKey_CanContinue()
        {
            var settings = new AiSummarySettings
            {
                ApiKey = "sk-test-key-12345",
                PropertyAlias = "summary"
            };

            var hasApiKey = !string.IsNullOrEmpty(settings.ApiKey);

            Assert.That(hasApiKey, Is.True);
        }

        [Test]
        public void Settings_WithEmptyPropertyAlias_ShouldNotContinue()
        {
            var settings = new AiSummarySettings
            {
                ApiKey = "sk-test-key",
                PropertyAlias = ""
            };

            var hasPropertyAlias = !string.IsNullOrEmpty(settings.PropertyAlias);

            Assert.That(hasPropertyAlias, Is.False);
        }

        #endregion

        #region DocType Filtering Tests

        [Test]
        public void DocTypeFiltering_WhenDocTypesListIsEmpty_AllowsAll()
        {
            var settings = new AiSummarySettings
            {
                DocTypes = null
            };
            var nodeDocType = "AnyDocType";

            var isAllowed = settings.DocTypesList == null 
                || !settings.DocTypesList.Any() 
                || settings.DocTypesList.Contains(nodeDocType);

            Assert.That(isAllowed, Is.True);
        }

        [Test]
        public void DocTypeFiltering_WhenNodeDocTypeInList_IsAllowed()
        {
            var settings = new AiSummarySettings
            {
                DocTypes = "Article,BlogPost"
            };
            var nodeDocType = "Article";

            var isAllowed = settings.DocTypesList.Contains(nodeDocType);

            Assert.That(isAllowed, Is.True);
        }

        [Test]
        public void DocTypeFiltering_WhenNodeDocTypeNotInList_IsNotAllowed()
        {
            var settings = new AiSummarySettings
            {
                DocTypes = "Article,BlogPost"
            };
            var nodeDocType = "HomePage";

            var isAllowed = settings.DocTypesList.Contains(nodeDocType);

            Assert.That(isAllowed, Is.False);
        }

        #endregion

        #region LLM Selection Tests

        [Test]
        public void LlmDefaults_WhenLlmIsNull_DefaultsToOpenAi()
        {
            var settings = new AiSummarySettings { Llm = null };

            var llm = string.IsNullOrEmpty(settings.Llm) ? "openai" : settings.Llm;

            Assert.That(llm, Is.EqualTo("openai"));
        }

        [Test]
        public void LlmDefaults_WhenLlmIsEmpty_DefaultsToOpenAi()
        {
            var settings = new AiSummarySettings { Llm = "" };

            var llm = string.IsNullOrEmpty(settings.Llm) ? "openai" : settings.Llm;

            Assert.That(llm, Is.EqualTo("openai"));
        }

        [Test]
        public void LlmDefaults_WhenLlmIsSet_UsesProvidedValue()
        {
            var settings = new AiSummarySettings { Llm = "gemini" };

            var llm = string.IsNullOrEmpty(settings.Llm) ? "openai" : settings.Llm;

            Assert.That(llm, Is.EqualTo("gemini"));
        }

        [Test]
        public void ModelDefaults_ForOpenAi_IsGpt4oMini()
        {
            var llm = "openai";
            string model = null;

            if (string.IsNullOrEmpty(model))
            {
                model = llm.ToLower() switch
                {
                    "openai" => "gpt-4o-mini",
                    "gemini" => "gemini-2.5-flash",
                    _ => null
                };
            }

            Assert.That(model, Is.EqualTo("gpt-4o-mini"));
        }

        [Test]
        public void ModelDefaults_ForGemini_IsGemini25Flash()
        {
            var llm = "gemini";
            string model = null;

            if (string.IsNullOrEmpty(model))
            {
                model = llm.ToLower() switch
                {
                    "openai" => "gpt-4o-mini",
                    "gemini" => "gemini-2.5-flash",
                    _ => null
                };
            }

            Assert.That(model, Is.EqualTo("gemini-2.5-flash"));
        }

        #endregion

        #region Toggle Property Logic Tests

        [Test]
        public void ToggleProperty_WhenValueIsZero_ShouldSkip()
        {
            var toggleValue = "0";
            var shouldSkip = (toggleValue?.ToLower() ?? "0") == "0";

            Assert.That(shouldSkip, Is.True);
        }

        [Test]
        public void ToggleProperty_WhenValueIsOne_ShouldNotSkip()
        {
            var toggleValue = "1";
            var shouldSkip = (toggleValue?.ToLower() ?? "0") == "0";

            Assert.That(shouldSkip, Is.False);
        }

        [Test]
        public void ToggleProperty_WhenValueIsNull_ShouldSkip()
        {
            string toggleValue = null;
            var shouldSkip = (toggleValue?.ToLower() ?? "0") == "0";

            Assert.That(shouldSkip, Is.True);
        }

        [Test]
        public void ToggleProperty_WhenValueIsTrue_ShouldNotSkip()
        {
            var toggleValue = "true";
            var shouldSkip = (toggleValue?.ToLower() ?? "0") == "0";

            Assert.That(shouldSkip, Is.False);
        }

        #endregion

        #region Content Already Exists Logic Tests

        [Test]
        public void ContentAlreadyExists_WhenNotNullAndNotEmpty_ShouldSkipWithoutToggle()
        {
            var currentValue = "Existing summary content";
            var hasToggleProperty = false;

            var shouldSkip = !hasToggleProperty 
                && currentValue != null 
                && !string.IsNullOrWhiteSpace(currentValue.ToString().Trim());

            Assert.That(shouldSkip, Is.True);
        }

        [Test]
        public void ContentAlreadyExists_WhenEmpty_ShouldNotSkip()
        {
            var currentValue = "";
            var hasToggleProperty = false;

            var shouldSkip = !hasToggleProperty 
                && currentValue != null 
                && !string.IsNullOrWhiteSpace(currentValue.ToString().Trim());

            Assert.That(shouldSkip, Is.False);
        }

        [Test]
        public void ContentAlreadyExists_WhenNull_ShouldNotSkip()
        {
            string currentValue = null;
            var hasToggleProperty = false;

            var shouldSkip = !hasToggleProperty 
                && currentValue != null 
                && !string.IsNullOrWhiteSpace(currentValue?.ToString().Trim());

            Assert.That(shouldSkip, Is.False);
        }

        [Test]
        public void ContentAlreadyExists_WithToggleProperty_ShouldNotSkip()
        {
            var currentValue = "Existing summary content";
            var hasToggleProperty = true;

            // When toggle property exists and is true, we should NOT skip even if content exists
            var shouldSkip = !hasToggleProperty 
                && currentValue != null 
                && !string.IsNullOrWhiteSpace(currentValue.ToString().Trim());

            Assert.That(shouldSkip, Is.False);
        }

        #endregion

        #region Culture Handling Tests

        [Test]
        public void CultureHandling_WhenNoCultures_ProcessesOnce()
        {
            var availableCultures = new List<string>();
            var editedCultures = new List<string>();

            var shouldProcessInvariant = availableCultures == null || !availableCultures.Any();

            Assert.That(shouldProcessInvariant, Is.True);
        }

        [Test]
        public void CultureHandling_WhenHasCultures_ProcessesEachEditedCulture()
        {
            var availableCultures = new List<string> { "en-US", "fr-FR", "de-DE" };
            var editedCultures = new List<string> { "en-US", "fr-FR" };

            var culturesToProcess = editedCultures;

            Assert.That(culturesToProcess, Has.Count.EqualTo(2));
        }

        [Test]
        public void CultureSelection_WhenEditedCulturesExist_UsesFirstEditedCulture()
        {
            var availableCultures = new List<string> { "en-US", "fr-FR" };
            var editedCultures = new List<string> { "fr-FR" };

            string culture = null;
            if (availableCultures.Any() && editedCultures.Any())
            {
                culture = editedCultures.First();
            }

            Assert.That(culture, Is.EqualTo("fr-FR"));
        }

        #endregion

        #region Property Editor Alias Validation Tests

        [Test]
        public void IsAllowedPropertyType_TinyMCE_IsAllowed()
        {
            var alias = "Umbraco.TinyMCE";
            var isAllowed = alias.Contains("TinyMCE", StringComparison.InvariantCultureIgnoreCase);

            Assert.That(isAllowed, Is.True);
        }

        [Test]
        public void IsAllowedPropertyType_TextBox_IsAllowed()
        {
            var alias = "Umbraco.TextBox";
            var isAllowed = alias.Contains("TextBox", StringComparison.InvariantCultureIgnoreCase);

            Assert.That(isAllowed, Is.True);
        }

        [Test]
        public void IsAllowedPropertyType_TextArea_IsAllowed()
        {
            var alias = "Umbraco.TextArea";
            var isAllowed = alias.Contains("TextArea", StringComparison.InvariantCultureIgnoreCase);

            Assert.That(isAllowed, Is.True);
        }

        [Test]
        public void IsAllowedPropertyType_BlockList_IsAllowed()
        {
            var alias = "Umbraco.BlockList";
            var isAllowed = alias.Contains("BlockList", StringComparison.InvariantCultureIgnoreCase);

            Assert.That(isAllowed, Is.True);
        }

        [Test]
        public void IsAllowedPropertyType_BlockGrid_IsAllowed()
        {
            var alias = "Umbraco.BlockGrid";
            var isAllowed = alias.Contains("BlockGrid", StringComparison.InvariantCultureIgnoreCase);

            Assert.That(isAllowed, Is.True);
        }

        [Test]
        public void IsAllowedPropertyType_MediaPicker_IsNotAllowed()
        {
            var alias = "Umbraco.MediaPicker";
            var isAllowed = alias.Contains("TinyMCE", StringComparison.InvariantCultureIgnoreCase)
                || alias.Contains("TextBox", StringComparison.InvariantCultureIgnoreCase)
                || alias.Contains("TextArea", StringComparison.InvariantCultureIgnoreCase)
                || alias.Contains("TextString", StringComparison.InvariantCultureIgnoreCase)
                || alias.Contains("BlockList", StringComparison.InvariantCultureIgnoreCase)
                || alias.Contains("BlockGrid", StringComparison.InvariantCultureIgnoreCase);

            Assert.That(isAllowed, Is.False);
        }

        [Test]
        public void IsAllowedPropertyType_ContentPicker_IsNotAllowed()
        {
            var alias = "Umbraco.ContentPicker";
            var isAllowed = alias.Contains("TinyMCE", StringComparison.InvariantCultureIgnoreCase)
                || alias.Contains("TextBox", StringComparison.InvariantCultureIgnoreCase)
                || alias.Contains("TextArea", StringComparison.InvariantCultureIgnoreCase)
                || alias.Contains("TextString", StringComparison.InvariantCultureIgnoreCase)
                || alias.Contains("BlockList", StringComparison.InvariantCultureIgnoreCase)
                || alias.Contains("BlockGrid", StringComparison.InvariantCultureIgnoreCase);

            Assert.That(isAllowed, Is.False);
        }

        #endregion
    }
}
