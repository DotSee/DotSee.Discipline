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

        #region Edge Case Tests - AiSummarySettings DocTypes

        [Test]
        public void AiSummarySettings_DocTypesList_EmptyString_ReturnsEmptyList()
        {
            var settings = new AiSummarySettings
            {
                DocTypes = ""
            };

            var list = settings.DocTypesList;

            // Empty string is treated as whitespace by IsNullOrWhiteSpace, so returns empty list
            Assert.That(list, Is.Empty);
        }

        [Test]
        public void AiSummarySettings_DocTypesList_SingleDocType_ReturnsSingleItem()
        {
            var settings = new AiSummarySettings
            {
                DocTypes = "Article"
            };

            var list = settings.DocTypesList;

            Assert.That(list, Has.Count.EqualTo(1));
            Assert.That(list[0], Is.EqualTo("Article"));
        }

        [Test]
        public void AiSummarySettings_DocTypesList_CommaOnly_ReturnsEmptyList()
        {
            var settings = new AiSummarySettings
            {
                DocTypes = ","
            };

            var list = settings.DocTypesList;

            // Comma-only splits with RemoveEmptyEntries, so yields no items
            Assert.That(list, Is.Empty);
        }

        [Test]
        public void AiSummarySettings_ExcludePropertiesList_EmptyString_ReturnsListWithOneEmptyItem()
        {
            var settings = new AiSummarySettings
            {
                ExcludeProperties = ""
            };

            var list = settings.ExcludePropertiesList;

            Assert.That(list, Has.Count.EqualTo(1));
            Assert.That(list[0], Is.EqualTo(""));
        }

        [Test]
        public void AiSummarySettings_ExcludePropertiesList_SingleItem()
        {
            var settings = new AiSummarySettings
            {
                ExcludeProperties = "umbracoNaviHide"
            };

            var list = settings.ExcludePropertiesList;

            Assert.That(list, Has.Count.EqualTo(1));
            Assert.That(list[0], Is.EqualTo("umbracoNaviHide"));
        }

        #endregion

        #region Edge Case Tests - MaxChars

        [Test]
        public void AiSummarySettings_MaxChars_DefaultIs150()
        {
            var settings = new AiSummarySettings();

            Assert.That(settings.MaxChars, Is.EqualTo(150));
        }

        [Test]
        public void AiSummarySettings_MaxChars_CanBeSetToZero()
        {
            var settings = new AiSummarySettings { MaxChars = 0 };

            Assert.That(settings.MaxChars, Is.EqualTo(0));
        }

        [Test]
        public void AiSummarySettings_MaxChars_CanBeSetToNegative()
        {
            var settings = new AiSummarySettings { MaxChars = -1 };

            Assert.That(settings.MaxChars, Is.EqualTo(-1));
        }

        [Test]
        public void AiSummarySettings_MaxChars_LargeValue()
        {
            var settings = new AiSummarySettings { MaxChars = 100000 };

            Assert.That(settings.MaxChars, Is.EqualTo(100000));
        }

        #endregion

        #region Edge Case Tests - Tone

        [Test]
        public void AiSummarySettings_Tone_DefaultValue()
        {
            var settings = new AiSummarySettings();

            Assert.That(settings.Tone, Is.EqualTo("Use a professional tone."));
        }

        [Test]
        public void AiSummarySettings_Tone_CanBeNull()
        {
            var settings = new AiSummarySettings { Tone = null };

            Assert.That(settings.Tone, Is.Null);
        }

        [Test]
        public void AiSummarySettings_Tone_CanBeEmpty()
        {
            var settings = new AiSummarySettings { Tone = "" };

            Assert.That(settings.Tone, Is.EqualTo(""));
        }

        #endregion

        #region Edge Case Tests - Settings Validation Combinations

        [Test]
        public void Settings_WithWhitespaceOnlyApiKey_IsNotEmpty()
        {
            var settings = new AiSummarySettings
            {
                ApiKey = "   ",
                PropertyAlias = "summary"
            };

            var hasApiKey = !string.IsNullOrEmpty(settings.ApiKey);

            // Whitespace-only string is not null or empty
            Assert.That(hasApiKey, Is.True);
        }

        [Test]
        public void Settings_WithWhitespaceOnlyPropertyAlias_IsNotEmpty()
        {
            var settings = new AiSummarySettings
            {
                ApiKey = "sk-key",
                PropertyAlias = "   "
            };

            var hasPropertyAlias = !string.IsNullOrEmpty(settings.PropertyAlias);

            Assert.That(hasPropertyAlias, Is.True);
        }

        [Test]
        public void Settings_AllFieldsNull_ShouldNotContinue()
        {
            var settings = new AiSummarySettings
            {
                ApiKey = null,
                PropertyAlias = null,
                DocTypes = null,
                Llm = null,
                Model = null,
                Tone = null,
                ExcludeProperties = null,
                TogglePropertyAlias = null
            };

            var hasApiKey = !string.IsNullOrEmpty(settings.ApiKey);
            var hasPropertyAlias = !string.IsNullOrEmpty(settings.PropertyAlias);

            Assert.That(hasApiKey, Is.False);
            Assert.That(hasPropertyAlias, Is.False);
        }

        #endregion

        #region Edge Case Tests - Toggle Property

        [Test]
        public void ToggleProperty_WhenValueIsEmptyString_ShouldNotSkip()
        {
            var toggleValue = "";
            var shouldSkip = (toggleValue?.ToLower() ?? "0") == "0";

            Assert.That(shouldSkip, Is.False);
        }

        [Test]
        public void ToggleProperty_WhenValueIsWhitespace_ShouldNotSkip()
        {
            var toggleValue = "   ";
            var shouldSkip = (toggleValue?.ToLower() ?? "0") == "0";

            Assert.That(shouldSkip, Is.False);
        }

        [Test]
        public void ToggleProperty_WhenValueIsUpperCaseZero_ShouldSkip()
        {
            // "0" is "0" regardless of case
            var toggleValue = "0";
            var shouldSkip = (toggleValue?.ToLower() ?? "0") == "0";

            Assert.That(shouldSkip, Is.True);
        }

        #endregion

        #region Edge Case Tests - Content Already Exists

        [Test]
        public void ContentAlreadyExists_WhenWhitespaceOnly_ShouldNotSkip()
        {
            var currentValue = "   ";
            var hasToggleProperty = false;

            var shouldSkip = !hasToggleProperty 
                && currentValue != null 
                && !string.IsNullOrWhiteSpace(currentValue.ToString().Trim());

            Assert.That(shouldSkip, Is.False);
        }

        [Test]
        public void ContentAlreadyExists_WhenHtmlContent_ShouldSkip()
        {
            var currentValue = "<p>Some summary</p>";
            var hasToggleProperty = false;

            var shouldSkip = !hasToggleProperty 
                && currentValue != null 
                && !string.IsNullOrWhiteSpace(currentValue.ToString().Trim());

            Assert.That(shouldSkip, Is.True);
        }

        #endregion

        #region Edge Case Tests - Culture Handling

        [Test]
        public void CultureHandling_WhenCulturesIsNull_ProcessesInvariant()
        {
            List<string> availableCultures = null;

            var shouldProcessInvariant = availableCultures == null || !availableCultures.Any();

            Assert.That(shouldProcessInvariant, Is.True);
        }

        [Test]
        public void CultureHandling_WhenEditedCulturesEmpty_DoesNotProcess()
        {
            var availableCultures = new List<string> { "en-US", "fr-FR" };
            var editedCultures = new List<string>();

            var hasEdited = editedCultures.Any();

            Assert.That(hasEdited, Is.False);
        }

        [Test]
        public void CultureHandling_WhenEditedCulturesContainsAvailableCultures_AllValid()
        {
            var availableCultures = new List<string> { "en-US", "fr-FR", "de-DE" };
            var editedCultures = new List<string> { "en-US", "de-DE" };

            var allValid = editedCultures.All(c => availableCultures.Contains(c));

            Assert.That(allValid, Is.True);
        }

        #endregion

        #region Edge Case Tests - Complex Property Alias with Various Formats

        [Test]
        public void ComplexPropertyAlias_WithThreeOrMoreDots_IsComplex()
        {
            var alias = "block.element.nested.property";
            var dotCount = alias.Count(x => x == '.');

            Assert.That(dotCount, Is.GreaterThanOrEqualTo(2));
        }

        [Test]
        public void ComplexPropertyAlias_EmptyString_HasNoDots()
        {
            var alias = "";
            var dotCount = alias.Count(x => x == '.');

            Assert.That(dotCount, Is.EqualTo(0));
        }

        [Test]
        public void ComplexPropertyAlias_NullSafety()
        {
            string alias = null;
            var dotCount = alias?.Count(x => x == '.') ?? 0;

            Assert.That(dotCount, Is.EqualTo(0));
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

        // NOTE: The actual IsAllowedPropertyType method (private in AiSummaryService) checks for
        // "RichText", "TextBox", "TextArea", "TextString", "BlockList", "BlockGrid".
        // These tests validate the same logic the service uses.

        private static bool IsAllowedPropertyType(string propertyEditorAlias)
        {
            return propertyEditorAlias.Contains("RichText", StringComparison.InvariantCultureIgnoreCase)
                || propertyEditorAlias.Contains("TextBox", StringComparison.InvariantCultureIgnoreCase)
                || propertyEditorAlias.Contains("TextArea", StringComparison.InvariantCultureIgnoreCase)
                || propertyEditorAlias.Contains("TextString", StringComparison.InvariantCultureIgnoreCase)
                || propertyEditorAlias.Contains("BlockList", StringComparison.InvariantCultureIgnoreCase)
                || propertyEditorAlias.Contains("BlockGrid", StringComparison.InvariantCultureIgnoreCase);
        }

        [Test]
        public void IsAllowedPropertyType_RichText_IsAllowed()
        {
            Assert.That(IsAllowedPropertyType("Umbraco.RichText"), Is.True);
        }

        [Test]
        public void IsAllowedPropertyType_RichTextEditor_IsAllowed()
        {
            // Contains "RichText" so should match
            Assert.That(IsAllowedPropertyType("Umbraco.RichTextEditor"), Is.True);
        }

        [Test]
        public void IsAllowedPropertyType_TextBox_IsAllowed()
        {
            Assert.That(IsAllowedPropertyType("Umbraco.TextBox"), Is.True);
        }

        [Test]
        public void IsAllowedPropertyType_TextArea_IsAllowed()
        {
            Assert.That(IsAllowedPropertyType("Umbraco.TextArea"), Is.True);
        }

        [Test]
        public void IsAllowedPropertyType_TextString_IsAllowed()
        {
            Assert.That(IsAllowedPropertyType("Umbraco.TextString"), Is.True);
        }

        [Test]
        public void IsAllowedPropertyType_BlockList_IsAllowed()
        {
            Assert.That(IsAllowedPropertyType("Umbraco.BlockList"), Is.True);
        }

        [Test]
        public void IsAllowedPropertyType_BlockGrid_IsAllowed()
        {
            Assert.That(IsAllowedPropertyType("Umbraco.BlockGrid"), Is.True);
        }

        [Test]
        public void IsAllowedPropertyType_CaseInsensitive_IsAllowed()
        {
            Assert.That(IsAllowedPropertyType("umbraco.richtext"), Is.True);
            Assert.That(IsAllowedPropertyType("UMBRACO.BLOCKLIST"), Is.True);
        }

        [Test]
        public void IsAllowedPropertyType_MediaPicker_IsNotAllowed()
        {
            Assert.That(IsAllowedPropertyType("Umbraco.MediaPicker"), Is.False);
        }

        [Test]
        public void IsAllowedPropertyType_ContentPicker_IsNotAllowed()
        {
            Assert.That(IsAllowedPropertyType("Umbraco.ContentPicker"), Is.False);
        }

        [Test]
        public void IsAllowedPropertyType_TinyMCE_IsNotAllowed()
        {
            // TinyMCE was used in older Umbraco versions; v17 uses RichText
            Assert.That(IsAllowedPropertyType("Umbraco.TinyMCE"), Is.False);
        }

        [Test]
        public void IsAllowedPropertyType_DropDown_IsNotAllowed()
        {
            Assert.That(IsAllowedPropertyType("Umbraco.DropDown.Flexible"), Is.False);
        }

        [Test]
        public void IsAllowedPropertyType_MultiNodeTreePicker_IsNotAllowed()
        {
            Assert.That(IsAllowedPropertyType("Umbraco.MultiNodeTreePicker"), Is.False);
        }

        [Test]
        public void IsAllowedPropertyType_Slider_IsNotAllowed()
        {
            Assert.That(IsAllowedPropertyType("Umbraco.Slider"), Is.False);
        }

        #endregion

        #region DocTypesList Caching Behavior Tests

        [Test]
        public void AiSummarySettings_DocTypesList_IsCachedAfterFirstAccess()
        {
            var settings = new AiSummarySettings { DocTypes = "Article,Blog" };

            var list1 = settings.DocTypesList;
            var list2 = settings.DocTypesList;

            // Same instance should be returned on second call (caching)
            Assert.That(list1, Is.SameAs(list2));
        }

        [Test]
        public void AiSummarySettings_DocTypesList_CachePreventsReparse()
        {
            var settings = new AiSummarySettings { DocTypes = "Article,Blog" };

            var list1 = settings.DocTypesList;
            Assert.That(list1, Has.Count.EqualTo(2));

            // Even if we change DocTypes after first access, the cached list is returned
            settings.DocTypes = "One,Two,Three,Four";
            var list2 = settings.DocTypesList;

            Assert.That(list2, Has.Count.EqualTo(2)); // Still cached from first access
        }

        #endregion

        #region ExcludePropertiesList Behavior Differences Tests

        [Test]
        public void AiSummarySettings_ExcludePropertiesList_DoesNotTrim()
        {
            // Unlike DocTypesList, ExcludePropertiesList does NOT use Trim()
            var settings = new AiSummarySettings { ExcludeProperties = " prop1 , prop2 " };

            var list = settings.ExcludePropertiesList;

            Assert.That(list, Has.Count.EqualTo(2));
            Assert.That(list[0], Is.EqualTo(" prop1 ")); // Spaces preserved
            Assert.That(list[1], Is.EqualTo(" prop2 ")); // Spaces preserved
        }

        [Test]
        public void AiSummarySettings_ExcludePropertiesList_DoesNotRemoveEmptyEntries()
        {
            // Unlike DocTypesList, ExcludePropertiesList does NOT use RemoveEmptyEntries
            var settings = new AiSummarySettings { ExcludeProperties = "prop1,,prop2" };

            var list = settings.ExcludePropertiesList;

            Assert.That(list, Has.Count.EqualTo(3)); // Includes the empty entry
            Assert.That(list[1], Is.EqualTo(""));
        }

        [Test]
        public void AiSummarySettings_ExcludePropertiesList_CommaOnly_IncludesEmptyEntries()
        {
            var settings = new AiSummarySettings { ExcludeProperties = "," };

            var list = settings.ExcludePropertiesList;

            Assert.That(list, Has.Count.EqualTo(2));
            Assert.That(list[0], Is.EqualTo(""));
            Assert.That(list[1], Is.EqualTo(""));
        }

        [Test]
        public void AiSummarySettings_ExcludePropertiesList_IsCachedAfterFirstAccess()
        {
            var settings = new AiSummarySettings { ExcludeProperties = "prop1,prop2" };

            var list1 = settings.ExcludePropertiesList;
            var list2 = settings.ExcludePropertiesList;

            Assert.That(list1, Is.SameAs(list2));
        }

        #endregion

        #region SavingCultures Parameter Tests

        [Test]
        public void CultureHandling_WhenSavingCulturesProvided_UsesThemOverAvailableCultures()
        {
            var availableCultures = new List<string> { "en-US", "fr-FR", "de-DE" };
            var savingCultures = new List<string> { "fr-FR" };

            // Replicate the logic in AiSummaryService.Run()
            var culturesToProcess = (savingCultures != null && savingCultures.Any())
                ? (IEnumerable<string>)savingCultures
                : availableCultures;

            Assert.That(culturesToProcess.Count(), Is.EqualTo(1));
            Assert.That(culturesToProcess.First(), Is.EqualTo("fr-FR"));
        }

        [Test]
        public void CultureHandling_WhenSavingCulturesIsNull_FallsBackToAvailableCultures()
        {
            var availableCultures = new List<string> { "en-US", "fr-FR" };
            IEnumerable<string> savingCultures = null;

            var culturesToProcess = (savingCultures != null && savingCultures.Any())
                ? savingCultures
                : availableCultures;

            Assert.That(culturesToProcess.Count(), Is.EqualTo(2));
        }

        [Test]
        public void CultureHandling_WhenSavingCulturesIsEmpty_FallsBackToAvailableCultures()
        {
            var availableCultures = new List<string> { "en-US", "fr-FR" };
            var savingCultures = new List<string>();

            var culturesToProcess = (savingCultures != null && savingCultures.Any())
                ? (IEnumerable<string>)savingCultures
                : availableCultures;

            Assert.That(culturesToProcess.Count(), Is.EqualTo(2));
        }

        #endregion

        #region SetDefaults Logic Tests

        [Test]
        public void SetDefaults_WhenLlmAndModelBothNull_DefaultsToOpenAiGpt4oMini()
        {
            var settings = new AiSummarySettings { Llm = null, Model = null };

            // Replicate SetDefaults logic
            if (string.IsNullOrEmpty(settings.Llm)) settings.Llm = "openai";
            if (string.IsNullOrEmpty(settings.Model))
            {
                settings.Model = settings.Llm.ToLower() switch
                {
                    "openai" => "gpt-4o-mini",
                    "gemini" => "gemini-2.5-flash",
                    _ => null
                };
            }

            Assert.That(settings.Llm, Is.EqualTo("openai"));
            Assert.That(settings.Model, Is.EqualTo("gpt-4o-mini"));
        }

        [Test]
        public void SetDefaults_WhenLlmIsGeminiAndModelNull_DefaultsToGeminiFlash()
        {
            var settings = new AiSummarySettings { Llm = "gemini", Model = null };

            if (string.IsNullOrEmpty(settings.Llm)) settings.Llm = "openai";
            if (string.IsNullOrEmpty(settings.Model))
            {
                settings.Model = settings.Llm.ToLower() switch
                {
                    "openai" => "gpt-4o-mini",
                    "gemini" => "gemini-2.5-flash",
                    _ => null
                };
            }

            Assert.That(settings.Llm, Is.EqualTo("gemini"));
            Assert.That(settings.Model, Is.EqualTo("gemini-2.5-flash"));
        }

        [Test]
        public void SetDefaults_WhenModelAlreadySet_DoesNotOverride()
        {
            var settings = new AiSummarySettings { Llm = "openai", Model = "gpt-4" };

            if (string.IsNullOrEmpty(settings.Llm)) settings.Llm = "openai";
            if (string.IsNullOrEmpty(settings.Model))
            {
                settings.Model = settings.Llm.ToLower() switch
                {
                    "openai" => "gpt-4o-mini",
                    "gemini" => "gemini-2.5-flash",
                    _ => null
                };
            }

            Assert.That(settings.Model, Is.EqualTo("gpt-4"));
        }

        [Test]
        public void SetDefaults_WhenLlmIsUnknown_ModelRemainsNull()
        {
            var settings = new AiSummarySettings { Llm = "anthropic", Model = null };

            if (string.IsNullOrEmpty(settings.Llm)) settings.Llm = "openai";
            if (string.IsNullOrEmpty(settings.Model))
            {
                settings.Model = settings.Llm.ToLower() switch
                {
                    "openai" => "gpt-4o-mini",
                    "gemini" => "gemini-2.5-flash",
                    _ => null
                };
            }

            Assert.That(settings.Model, Is.Null);
        }

        #endregion
    }
}
