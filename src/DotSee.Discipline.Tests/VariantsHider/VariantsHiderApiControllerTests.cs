using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using DotSee.Discipline.VariantsHider.ApiControllers;
using NUnit.Framework;

namespace DotSee.Discipline.Tests.VariantsHider
{
    [TestFixture]
    public class VariantsHiderApiControllerTests
    {
        private IConfiguration BuildConfiguration(Dictionary<string, string> settings)
        {
            return new ConfigurationBuilder()
                .AddInMemoryCollection(settings)
                .Build();
        }

        #region GetSettings - Enabled Tests

        [Test]
        public void GetSettings_WhenEnabledIsTrue_ReturnsEnabledTrue()
        {
            var config = BuildConfiguration(new Dictionary<string, string>
            {
                { "DotSee.Discipline:VariantsHider:Enabled", "true" },
                { "DotSee.Discipline:VariantsHider:Caption", "My Caption" }
            });
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Enabled, Is.True);
        }

        [Test]
        public void GetSettings_WhenEnabledIsFalse_ReturnsEnabledFalse()
        {
            var config = BuildConfiguration(new Dictionary<string, string>
            {
                { "DotSee.Discipline:VariantsHider:Enabled", "false" }
            });
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Enabled, Is.False);
        }

        [Test]
        public void GetSettings_WhenEnabledIsTrueUpperCase_ReturnsEnabledTrue()
        {
            var config = BuildConfiguration(new Dictionary<string, string>
            {
                { "DotSee.Discipline:VariantsHider:Enabled", "TRUE" }
            });
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Enabled, Is.True);
        }

        [Test]
        public void GetSettings_WhenEnabledIsMixedCase_ReturnsEnabledTrue()
        {
            var config = BuildConfiguration(new Dictionary<string, string>
            {
                { "DotSee.Discipline:VariantsHider:Enabled", "True" }
            });
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Enabled, Is.True);
        }

        [Test]
        public void GetSettings_WhenEnabledIsEmpty_ReturnsEnabledFalse()
        {
            var config = BuildConfiguration(new Dictionary<string, string>
            {
                { "DotSee.Discipline:VariantsHider:Enabled", "" }
            });
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Enabled, Is.False);
        }

        [Test]
        public void GetSettings_WhenEnabledKeyIsMissing_ReturnsEnabledFalse()
        {
            var config = BuildConfiguration(new Dictionary<string, string>());
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Enabled, Is.False);
        }

        [Test]
        public void GetSettings_WhenEnabledIsRandomString_ReturnsEnabledFalse()
        {
            var config = BuildConfiguration(new Dictionary<string, string>
            {
                { "DotSee.Discipline:VariantsHider:Enabled", "yes" }
            });
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Enabled, Is.False);
        }

        [Test]
        public void GetSettings_WhenEnabledIs1_ReturnsEnabledFalse()
        {
            var config = BuildConfiguration(new Dictionary<string, string>
            {
                { "DotSee.Discipline:VariantsHider:Enabled", "1" }
            });
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Enabled, Is.False);
        }

        [Test]
        public void GetSettings_WhenEnabledHasWhitespace_ReturnsEnabledFalse()
        {
            var config = BuildConfiguration(new Dictionary<string, string>
            {
                { "DotSee.Discipline:VariantsHider:Enabled", "  true  " }
            });
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            // "  true  " with leading/trailing spaces should not equal "true" with OrdinalIgnoreCase
            Assert.That(response.Enabled, Is.False);
        }

        #endregion

        #region GetSettings - Caption Tests

        [Test]
        public void GetSettings_WhenCaptionIsSet_ReturnsCaptionValue()
        {
            var config = BuildConfiguration(new Dictionary<string, string>
            {
                { "DotSee.Discipline:VariantsHider:Enabled", "true" },
                { "DotSee.Discipline:VariantsHider:Caption", "Custom Toggle Text" }
            });
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Caption, Is.EqualTo("Custom Toggle Text"));
        }

        [Test]
        public void GetSettings_WhenCaptionIsMissing_ReturnsDefaultCaption()
        {
            var config = BuildConfiguration(new Dictionary<string, string>
            {
                { "DotSee.Discipline:VariantsHider:Enabled", "true" }
            });
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Caption, Is.EqualTo("Toggle unset variants display"));
        }

        [Test]
        public void GetSettings_WhenCaptionIsEmpty_ReturnsDefaultCaption()
        {
            var config = BuildConfiguration(new Dictionary<string, string>
            {
                { "DotSee.Discipline:VariantsHider:Enabled", "true" },
                { "DotSee.Discipline:VariantsHider:Caption", "" }
            });
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Caption, Is.EqualTo("Toggle unset variants display"));
        }

        [Test]
        public void GetSettings_WhenCaptionContainsSpecialCharacters_ReturnsExactCaption()
        {
            var config = BuildConfiguration(new Dictionary<string, string>
            {
                { "DotSee.Discipline:VariantsHider:Enabled", "true" },
                { "DotSee.Discipline:VariantsHider:Caption", "Εναλλαγή εμφάνισης <variants> & \"more\"" }
            });
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Caption, Is.EqualTo("Εναλλαγή εμφάνισης <variants> & \"more\""));
        }

        [Test]
        public void GetSettings_WhenCaptionIsWhitespaceOnly_ReturnsWhitespace()
        {
            var config = BuildConfiguration(new Dictionary<string, string>
            {
                { "DotSee.Discipline:VariantsHider:Enabled", "true" },
                { "DotSee.Discipline:VariantsHider:Caption", "   " }
            });
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            // Whitespace-only caption is not empty, so it's returned as-is
            Assert.That(response.Caption, Is.EqualTo("   "));
        }

        #endregion

        #region GetSettings - Entire Section Missing Tests

        [Test]
        public void GetSettings_WhenEntireSectionMissing_ReturnsDisabledWithDefaultCaption()
        {
            var config = BuildConfiguration(new Dictionary<string, string>());
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Enabled, Is.False);
            Assert.That(response.Caption, Is.EqualTo("Toggle unset variants display"));
        }

        [Test]
        public void GetSettings_WhenOnlyCaptionPresent_ReturnsDisabledWithCustomCaption()
        {
            var config = BuildConfiguration(new Dictionary<string, string>
            {
                { "DotSee.Discipline:VariantsHider:Caption", "My Custom Caption" }
            });
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Enabled, Is.False);
            Assert.That(response.Caption, Is.EqualTo("My Custom Caption"));
        }

        #endregion

        #region GetSettings - Response Type Tests

        [Test]
        public void GetSettings_ReturnsOkResult()
        {
            var config = BuildConfiguration(new Dictionary<string, string>());
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings();

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        [Test]
        public void GetSettings_ReturnsCorrectResponseType()
        {
            var config = BuildConfiguration(new Dictionary<string, string>());
            var controller = new VariantsHiderApiController(config);

            var result = controller.GetSettings() as OkObjectResult;

            Assert.That(result?.Value, Is.InstanceOf<VariantsHiderSettingsResponse>());
        }

        #endregion

        #region VariantsHiderSettingsResponse Tests

        [Test]
        public void SettingsResponse_DefaultValues_AreCorrect()
        {
            var response = new VariantsHiderSettingsResponse();

            Assert.That(response.Enabled, Is.False);
            Assert.That(response.Caption, Is.EqualTo(string.Empty));
        }

        [Test]
        public void SettingsResponse_CanSetAllProperties()
        {
            var response = new VariantsHiderSettingsResponse
            {
                Enabled = true,
                Caption = "Test Caption"
            };

            Assert.That(response.Enabled, Is.True);
            Assert.That(response.Caption, Is.EqualTo("Test Caption"));
        }

        #endregion
    }
}
