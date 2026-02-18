using System.Text.Json;
using System.Text.Json.Nodes;
using DotSee.Discipline.AiSummary.Helpers;
using NUnit.Framework;

namespace DotSee.Discipline.Tests.AiSummary
{
    [TestFixture]
    public class JsonHelperTests
    {
        #region LooksLikeJson Tests

        [Test]
        public void LooksLikeJson_WhenValidJsonObject_ReturnsTrue()
        {
            Assert.That(JsonHelper.LooksLikeJson("{\"key\": \"value\"}"), Is.True);
        }

        [Test]
        public void LooksLikeJson_WhenValidJsonArray_ReturnsTrue()
        {
            Assert.That(JsonHelper.LooksLikeJson("[1, 2, 3]"), Is.True);
        }

        [Test]
        public void LooksLikeJson_WhenEmptyObject_ReturnsTrue()
        {
            Assert.That(JsonHelper.LooksLikeJson("{}"), Is.True);
        }

        [Test]
        public void LooksLikeJson_WhenEmptyArray_ReturnsTrue()
        {
            Assert.That(JsonHelper.LooksLikeJson("[]"), Is.True);
        }

        [Test]
        public void LooksLikeJson_WhenPlainText_ReturnsFalse()
        {
            Assert.That(JsonHelper.LooksLikeJson("Hello, world!"), Is.False);
        }

        [Test]
        public void LooksLikeJson_WhenHtmlContent_ReturnsFalse()
        {
            Assert.That(JsonHelper.LooksLikeJson("<p>Some paragraph</p>"), Is.False);
        }

        [Test]
        public void LooksLikeJson_WhenNumericString_ReturnsFalse()
        {
            Assert.That(JsonHelper.LooksLikeJson("42"), Is.False);
        }

        [Test]
        public void LooksLikeJson_WhenEmptyString_ReturnsFalse()
        {
            Assert.That(JsonHelper.LooksLikeJson(""), Is.False);
        }

        [Test]
        public void LooksLikeJson_WhenWhitespaceWrappedObject_ReturnsTrue()
        {
            // Input has leading/trailing whitespace; method trims before checking
            Assert.That(JsonHelper.LooksLikeJson("  {\"key\": 1}  "), Is.True);
        }

        [Test]
        public void LooksLikeJson_WhenWhitespaceWrappedArray_ReturnsTrue()
        {
            Assert.That(JsonHelper.LooksLikeJson("  [1, 2]  "), Is.True);
        }

        [Test]
        public void LooksLikeJson_WhenStartsBraceEndsArray_ReturnsFalse()
        {
            Assert.That(JsonHelper.LooksLikeJson("{something]"), Is.False);
        }

        [Test]
        public void LooksLikeJson_WhenStartsArrayEndsBrace_ReturnsFalse()
        {
            Assert.That(JsonHelper.LooksLikeJson("[something}"), Is.False);
        }

        [Test]
        public void LooksLikeJson_WhenOnlyOpenBrace_ReturnsFalse()
        {
            Assert.That(JsonHelper.LooksLikeJson("{"), Is.False);
        }

        [Test]
        public void LooksLikeJson_WhenOnlyCloseBrace_ReturnsFalse()
        {
            Assert.That(JsonHelper.LooksLikeJson("}"), Is.False);
        }

        [Test]
        public void LooksLikeJson_WhenSingleBraces_ReturnsTrue()
        {
            // "{}" looks like JSON even though it's empty
            Assert.That(JsonHelper.LooksLikeJson("{}"), Is.True);
        }

        [Test]
        public void LooksLikeJson_WhenUrlString_ReturnsFalse()
        {
            Assert.That(JsonHelper.LooksLikeJson("https://example.com"), Is.False);
        }

        #endregion

        #region GetStringsFromJson Tests

        [Test]
        public void GetStringsFromJson_WhenStringValueLongEnough_ReturnsIt()
        {
            // Strings >= 50 chars should be included
            var longString = new string('A', 50);
            var json = JsonDocument.Parse($"\"{longString}\"");

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result[0], Is.EqualTo(longString));
        }

        [Test]
        public void GetStringsFromJson_WhenStringValueTooShort_FiltersItOut()
        {
            // Strings < 50 chars should be excluded
            var shortString = new string('A', 49);
            var json = JsonDocument.Parse($"\"{shortString}\"");

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetStringsFromJson_WhenHttpUrl_FiltersItOut()
        {
            var url = "http://example.com/some/path/that/is/definitely/long/enough/to/pass/fifty/characters";
            var json = JsonDocument.Parse($"\"{url}\"");

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetStringsFromJson_WhenHttpsUrl_FiltersItOut()
        {
            var url = "https://example.com/some/path/that/is/definitely/long/enough/to/pass/fifty/characters";
            var json = JsonDocument.Parse($"\"{url}\"");

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetStringsFromJson_WhenMailtoUrl_FiltersItOut()
        {
            var url = "mailto://user@example.com/some/long/path/that/is/definitely/over/fifty/characters/long";
            var json = JsonDocument.Parse($"\"{url}\"");

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetStringsFromJson_WhenUrlWithSpaces_IsNotFiltered()
        {
            // URL containing a space is not treated as a pure link
            var urlWithSpace = "http://example.com/some path with spaces that is long enough to be over fifty chars";
            var json = JsonDocument.Parse($"\"{urlWithSpace}\"");

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            Assert.That(result, Has.Count.EqualTo(1));
        }

        [Test]
        public void GetStringsFromJson_WhenNestedObject_ExtractsStrings()
        {
            var longString = new string('B', 60);
            var jsonStr = $"{{\"outer\": {{\"inner\": \"{longString}\"}}}}";
            var json = JsonDocument.Parse(jsonStr);

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result[0], Is.EqualTo(longString));
        }

        [Test]
        public void GetStringsFromJson_WhenArray_ExtractsStrings()
        {
            var s1 = new string('A', 55);
            var s2 = new string('B', 55);
            var jsonStr = $"[\"{s1}\", \"{s2}\"]";
            var json = JsonDocument.Parse(jsonStr);

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            Assert.That(result, Has.Count.EqualTo(2));
        }

        [Test]
        public void GetStringsFromJson_WhenNumber_ReturnsEmpty()
        {
            var json = JsonDocument.Parse("42");

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetStringsFromJson_WhenBoolean_ReturnsEmpty()
        {
            var json = JsonDocument.Parse("true");

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetStringsFromJson_WhenNull_ReturnsEmpty()
        {
            var json = JsonDocument.Parse("null");

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetStringsFromJson_WhenEmptyString_ReturnsEmpty()
        {
            var json = JsonDocument.Parse("\"\"");

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetStringsFromJson_WhenWhitespaceOnlyString_ReturnsEmpty()
        {
            var whitespace = new string(' ', 60);
            var json = JsonDocument.Parse($"\"{whitespace}\"");

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            // IsNullOrWhiteSpace returns true, so it's filtered out
            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetStringsFromJson_MixedContentObject_OnlyReturnsLongStrings()
        {
            var longText = new string('X', 60);
            var jsonStr = $"{{\"title\": \"Short\", \"body\": \"{longText}\", \"count\": 5, \"active\": true}}";
            var json = JsonDocument.Parse(jsonStr);

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result[0], Is.EqualTo(longText));
        }

        [Test]
        public void GetStringsFromJson_DeeplyNestedArray_ExtractsAllLongStrings()
        {
            var s1 = new string('A', 55);
            var s2 = new string('B', 55);
            var jsonStr = $"[{{\"items\": [\"{s1}\", \"short\"]}}, {{\"items\": [\"{s2}\"]}}]";
            var json = JsonDocument.Parse(jsonStr);

            var result = JsonHelper.GetStringsFromJson(json.RootElement).ToList();

            Assert.That(result, Has.Count.EqualTo(2));
        }

        #endregion

        #region ReplaceProperty Tests

        [Test]
        public void ReplaceProperty_WhenPropertyExists_ReplacesValue()
        {
            var json = JsonNode.Parse("{\"summary\": \"old value\", \"title\": \"keep\"}");

            var replaced = JsonHelper.ReplaceProperty(json, "summary", "new value");

            Assert.That(replaced, Is.True);
            Assert.That(json["summary"]?.ToString(), Is.EqualTo("new value"));
            Assert.That(json["title"]?.ToString(), Is.EqualTo("keep"));
        }

        [Test]
        public void ReplaceProperty_WhenPropertyDoesNotExist_AddsIt()
        {
            var json = JsonNode.Parse("{\"title\": \"keep\"}");

            var replaced = JsonHelper.ReplaceProperty(json, "summary", "added value");

            Assert.That(replaced, Is.True);
            Assert.That(json["summary"]?.ToString(), Is.EqualTo("added value"));
        }

        [Test]
        public void ReplaceProperty_WhenNestedObject_FindsAndReplacesDeep()
        {
            var json = JsonNode.Parse("{\"outer\": {\"summary\": \"old\"}}");

            var replaced = JsonHelper.ReplaceProperty(json, "summary", "new");

            Assert.That(replaced, Is.True);
            Assert.That(json["outer"]["summary"]?.ToString(), Is.EqualTo("new"));
        }

        [Test]
        public void ReplaceProperty_WhenArray_SearchesInsideArrayItems()
        {
            var json = JsonNode.Parse("[{\"summary\": \"old\"}, {\"other\": \"value\"}]");

            var replaced = JsonHelper.ReplaceProperty(json, "summary", "new");

            Assert.That(replaced, Is.True);
            Assert.That(json[0]["summary"]?.ToString(), Is.EqualTo("new"));
        }

        [Test]
        public void ReplaceProperty_WhenNull_ReturnsFalse()
        {
            var replaced = JsonHelper.ReplaceProperty(null, "summary", "value");

            Assert.That(replaced, Is.False);
        }

        [Test]
        public void ReplaceProperty_OnlyReplacesFirstOccurrence()
        {
            // The method returns true at the first match and stops
            var json = JsonNode.Parse("[{\"summary\": \"first\"}, {\"summary\": \"second\"}]");

            var replaced = JsonHelper.ReplaceProperty(json, "summary", "replaced");

            Assert.That(replaced, Is.True);
            Assert.That(json[0]["summary"]?.ToString(), Is.EqualTo("replaced"));
            Assert.That(json[1]["summary"]?.ToString(), Is.EqualTo("second"));
        }

        [Test]
        public void ReplaceProperty_WhenValueIsNull_SetsNull()
        {
            var json = JsonNode.Parse("{\"summary\": \"old\"}");

            var replaced = JsonHelper.ReplaceProperty(json, "summary", null);

            Assert.That(replaced, Is.True);
        }

        #endregion

        #region GetBlockPropertyValue Tests

        [Test]
        public void GetBlockPropertyValue_WhenPropertyExists_ReturnsValue()
        {
            var json = JsonNode.Parse("{\"summary\": \"found value\"}");

            var result = JsonHelper.GetBlockPropertyValue(json, "summary");

            Assert.That(result, Is.EqualTo("found value"));
        }

        [Test]
        public void GetBlockPropertyValue_WhenPropertyDoesNotExist_ReturnsNull()
        {
            var json = JsonNode.Parse("{\"title\": \"some title\"}");

            var result = JsonHelper.GetBlockPropertyValue(json, "summary");

            Assert.That(result, Is.Null);
        }

        [Test]
        public void GetBlockPropertyValue_WhenNestedObject_FindsDeep()
        {
            var json = JsonNode.Parse("{\"outer\": {\"inner\": {\"summary\": \"deep value\"}}}");

            var result = JsonHelper.GetBlockPropertyValue(json, "summary");

            Assert.That(result, Is.EqualTo("deep value"));
        }

        [Test]
        public void GetBlockPropertyValue_WhenArray_SearchesInsideItems()
        {
            var json = JsonNode.Parse("[{\"other\": \"x\"}, {\"summary\": \"found in array\"}]");

            var result = JsonHelper.GetBlockPropertyValue(json, "summary");

            Assert.That(result, Is.EqualTo("found in array"));
        }

        [Test]
        public void GetBlockPropertyValue_WhenNull_ReturnsNull()
        {
            var result = JsonHelper.GetBlockPropertyValue(null, "summary");

            Assert.That(result, Is.Null);
        }

        [Test]
        public void GetBlockPropertyValue_WhenPropertyValueIsNull_ReturnsNull()
        {
            var json = JsonNode.Parse("{\"summary\": null}");

            var result = JsonHelper.GetBlockPropertyValue(json, "summary");

            Assert.That(result, Is.Null);
        }

        [Test]
        public void GetBlockPropertyValue_WhenPropertyValueIsNumber_ReturnsStringRepresentation()
        {
            var json = JsonNode.Parse("{\"count\": 42}");

            var result = JsonHelper.GetBlockPropertyValue(json, "count");

            Assert.That(result, Is.EqualTo("42"));
        }

        [Test]
        public void GetBlockPropertyValue_ReturnsFirstMatchInOrder()
        {
            var json = JsonNode.Parse("[{\"summary\": \"first\"}, {\"summary\": \"second\"}]");

            var result = JsonHelper.GetBlockPropertyValue(json, "summary");

            Assert.That(result, Is.EqualTo("first"));
        }

        [Test]
        public void GetBlockPropertyValue_WhenEmptyObject_ReturnsNull()
        {
            var json = JsonNode.Parse("{}");

            var result = JsonHelper.GetBlockPropertyValue(json, "summary");

            // Property not found, so it's added by ReplaceProperty — but GetBlockPropertyValue only reads
            Assert.That(result, Is.Null);
        }

        [Test]
        public void GetBlockPropertyValue_WhenEmptyArray_ReturnsNull()
        {
            var json = JsonNode.Parse("[]");

            var result = JsonHelper.GetBlockPropertyValue(json, "summary");

            Assert.That(result, Is.Null);
        }

        #endregion
    }
}
