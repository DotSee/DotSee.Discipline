using Microsoft.AspNetCore.Mvc;
using DotSee.Discipline.Backoffice;
using DotSee.Discipline.VariantsHider.ApiControllers;
using Moq;
using NUnit.Framework;

namespace DotSee.Discipline.Tests.VariantsHider
{
    [TestFixture]
    public class VariantsHiderApiControllerTests
    {
        private static VariantsHiderApiController BuildController(VariantsHiderFeatureSettings feature)
        {
            var resolver = new Mock<IDisciplineSettingsResolver>();
            resolver.Setup(r => r.GetVariantsHider()).Returns(feature);
            return new VariantsHiderApiController(resolver.Object);
        }

        #region GetSettings - Enabled Tests

        [Test]
        public void GetSettings_WhenEnabledIsTrue_ReturnsEnabledTrue()
        {
            var controller = BuildController(new VariantsHiderFeatureSettings
            {
                Enabled = true,
                Caption = "My Caption"
            });

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Enabled, Is.True);
        }

        [Test]
        public void GetSettings_WhenEnabledIsFalse_ReturnsEnabledFalse()
        {
            var controller = BuildController(new VariantsHiderFeatureSettings
            {
                Enabled = false
            });

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Enabled, Is.False);
        }

        #endregion

        #region GetSettings - Caption Tests

        [Test]
        public void GetSettings_WhenCaptionIsSet_ReturnsCaptionValue()
        {
            var controller = BuildController(new VariantsHiderFeatureSettings
            {
                Enabled = true,
                Caption = "Custom Toggle Text"
            });

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Caption, Is.EqualTo("Custom Toggle Text"));
        }

        [Test]
        public void GetSettings_WhenCaptionIsMissing_ReturnsDefaultCaption()
        {
            var controller = BuildController(new VariantsHiderFeatureSettings
            {
                Enabled = true,
                Caption = string.Empty
            });

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Caption, Is.EqualTo("Toggle unset variants display"));
        }

        [Test]
        public void GetSettings_WhenCaptionIsEmpty_ReturnsDefaultCaption()
        {
            var controller = BuildController(new VariantsHiderFeatureSettings
            {
                Enabled = true,
                Caption = string.Empty
            });

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Caption, Is.EqualTo("Toggle unset variants display"));
        }

        [Test]
        public void GetSettings_WhenCaptionContainsSpecialCharacters_ReturnsExactCaption()
        {
            var controller = BuildController(new VariantsHiderFeatureSettings
            {
                Enabled = true,
                Caption = "Εναλλαγή εμφάνισης <variants> & \"more\""
            });

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Caption, Is.EqualTo("Εναλλαγή εμφάνισης <variants> & \"more\""));
        }

        [Test]
        public void GetSettings_WhenCaptionIsWhitespaceOnly_ReturnsWhitespace()
        {
            var controller = BuildController(new VariantsHiderFeatureSettings
            {
                Enabled = true,
                Caption = "   "
            });

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            // Whitespace-only caption is not empty, so it's returned as-is
            Assert.That(response.Caption, Is.EqualTo("   "));
        }

        #endregion

        #region GetSettings - Defaults Tests

        [Test]
        public void GetSettings_WhenFeatureSettingsAreDefault_ReturnsDisabledWithDefaultCaption()
        {
            var controller = BuildController(new VariantsHiderFeatureSettings());

            var result = controller.GetSettings() as OkObjectResult;
            var response = result?.Value as VariantsHiderSettingsResponse;

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Enabled, Is.False);
            Assert.That(response.Caption, Is.EqualTo("Toggle unset variants display"));
        }

        [Test]
        public void GetSettings_WhenDisabledButCaptionPresent_ReturnsDisabledWithCustomCaption()
        {
            var controller = BuildController(new VariantsHiderFeatureSettings
            {
                Enabled = false,
                Caption = "My Custom Caption"
            });

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
            var controller = BuildController(new VariantsHiderFeatureSettings());

            var result = controller.GetSettings();

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        [Test]
        public void GetSettings_ReturnsCorrectResponseType()
        {
            var controller = BuildController(new VariantsHiderFeatureSettings());

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
