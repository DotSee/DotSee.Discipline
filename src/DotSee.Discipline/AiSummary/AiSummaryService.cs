using DotSee.Discipline.AiSummary.Generators;
using DotSee.Discipline.Interfaces;
using NPoco;
using Serilog;
using System.Text.Json;
using System.Text.Json.Nodes;
using Umbraco.Cms.Core.Models;
using Umbraco.Extensions;

namespace DotSee.Discipline.AiSummary
{
    public class AiSummaryService
    {

        #region Private Members

        private AiSummarySettings _settings;
        private readonly JsonSettingsProviderService _settingsProviderService;
        private ILogger _logger;

        #endregion

        #region Constructors
        public AiSummaryService(
            JsonSettingsProviderService settingsProviderService,
            ILogger logger)
        {
            _settingsProviderService = settingsProviderService;
            _settings = ((ISettings<AiSummarySettings>)_settingsProviderService).Settings;
            _logger = logger;
        }

        #endregion

        #region Public Methods

        public virtual bool Run(IContent node)
        {
            //Make all the necessary checks to decide if we should continue. 
            //If so, return an object with other useful info to use further down the line.
            ServiceCheckResults checkResults = ShouldContinue(node);

            if (!checkResults.ShouldContinue)
            {
                return true;
            }

            try
            {
                if (node.AvailableCultures == null || node.AvailableCultures?.Count() == 0)
                {
                    DoRun(node, checkResults, null);
                }
                else
                {
                    foreach (string culture in node.EditedCultures)
                    {
                        DoRun(node, checkResults, culture);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "AiSummaryService failed for ID {NodeId} with Name {NodeName}. Exception: {ExceptionMessage}", node.Id, node.Name, ex.Message);
                return false;
            }

            _logger.Information("AiSummaryService ran for ID {NodeId} with Name {NodeName}", node.Id, node.Name);
            return true;
        }

        #endregion

        #region Private Methods
        private void DoRun(IContent node, ServiceCheckResults checkResults, string culture)
        {
            //Get the current value of the property to update.
            var currentValue = checkResults.IsComplexProperty
                ? GetBlockPropertyValue(GetJsonFromNode(node, culture), _settings.PropertyAlias.Split('.')[1])
                : node.GetValue(_settings.PropertyAlias, culture);

            //Do not update if content already in and no toggle property is set.
            //Toggle property set to true will force the update, even with content already in.
            if (!checkResults.HasToggleProperty && currentValue != null && !currentValue.ToString().Trim().IsNullOrWhiteSpace())
            {
                return;
            }

            //Get all candidate string values from the document.
            var allStrings = GetAllStringValues(node, culture);

            if (allStrings == null || !allStrings.Any())
            {
                return;
            }

            var singleString = string.Join("", allStrings);


            //Do the thing with a copy of the shared settings to avoid race conditions on concurrent saves
            //since we're changing settings via SetDefaults.
            var settings = SetDefaults();

            var gen = GetGenerator(settings.Llm);
            string aiResult = gen.Generate(
                apiKey: settings.ApiKey,
                aiModel: settings.Model,
                tone: settings.Tone,
                maxChars: settings.MaxChars,
                content: singleString.StripHtml()
                );


            if (checkResults.IsComplexProperty)
            {
                JsonNode bl = AddSummaryToBlockProperty(node, culture, aiResult);
                if (bl == null)
                {
                    return;
                }
                node.SetValue(_settings.PropertyAlias.Split('.')[0], bl.ToString(), culture);
            }
            else
            {
                node.SetValue(_settings.PropertyAlias, aiResult, culture);
            }

            //If you've reached this far there's a toggle property and it was set to true, set it to false
            if (checkResults.HasToggleProperty)
            {
                node.SetValue(_settings.TogglePropertyAlias, false);
            }
        }

        private AiSummarySettings SetDefaults()
        {
            //Get a copy of settings to avoid having race conditions with concurrent saves.
            var _settingsCopy = _settings.Copy();

            if (string.IsNullOrEmpty(_settings.Llm))
            {
                _settingsCopy.Llm = "openai";
            }
            if (string.IsNullOrEmpty(_settings.Model))
            {
                switch (_settingsCopy.Llm.ToLower())
                {
                    case "openai":
                        _settingsCopy.Model = "gpt-4o-mini";
                        break;
                    case "gemini":
                        _settingsCopy.Model = "gemini-2.5-flash";
                        break;
                }
            }
            return _settingsCopy;
        }

        private static ISummaryGenerator GetGenerator(string llm)
        {
            switch (llm.ToLower())
            {
                case "openai":
                    return new OpenAiSummaryGenerator();
                case "gemini":
                    return new GeminiSummaryGenerator();
                default:
                    throw new NotImplementedException($"The specified LLM '{llm}' is not implemented.");
            }
        }

        private JsonNode AddSummaryToBlockProperty(IContent node, string culture, string summary)
        {
            JsonNode bl = GetJsonFromNode(node, culture);
            if (bl == null)
            {
                return null;
            }

            // Look for contentData array
            JsonArray contentData = null;

            //Try in blocks
            try
            {
                contentData = bl["contentData"] as JsonArray;
            }
            catch
            {
                //Fallback to NC (just for V13)
                try
                {
                    contentData = bl as JsonArray;
                }
                catch { }
            }

            if (contentData == null)
            {
                return null;
            }

            ReplaceProperty(bl, _settings.PropertyAlias.Split('.')[1], summary);
            return bl;

        }

        private JsonNode GetJsonFromNode(IContent node, string culture)
        {
            JsonNode bl = null;
            var blockList = node.GetValue(_settings.PropertyAlias.Split('.')[0], culture);
            if (blockList == null)
            {
                return null;
            }
            else
            {
                bl = JsonNode.Parse(blockList.ToString())!;
            }
            return bl;
        }


        private ServiceCheckResults ShouldContinue(IContent node)
        {
            ServiceCheckResults result = new ServiceCheckResults();
            result.ShouldContinue = true;

            if (string.IsNullOrEmpty(_settings.ApiKey))
            {
                result.ShouldContinue = false;
                return result;
            }

            //Check if node type is allowed. If no doctypes have been specified, allow all.
            if (
                _settings.DocTypesList != null
                && _settings.DocTypesList.Any()
                && !_settings.DocTypesList.Contains(node.ContentType.Alias))
            {
                result.ShouldContinue = false;
                return result;
            }

            if (string.IsNullOrEmpty(_settings.PropertyAlias))
            {
                result.ShouldContinue = false;
                return result;
            }

            //Check if it is a complex property (blocklist) - if so check if it exists
            if (_settings.PropertyAlias.Count(x => x == '.') == 1)
            {
                var aliases = _settings.PropertyAlias.Split('.');
                if (!node.HasProperty(aliases[0]))
                {
                    result.ShouldContinue = false;
                    return result;
                }
                result.IsComplexProperty = true;
            }

            //If not a complex property, check if property to update exists in current node.
            if (!result.IsComplexProperty && !node.HasProperty(_settings.PropertyAlias))
            {
                result.ShouldContinue = false;
                return result;
            }

            //Check if toggle property exists in current node and whether is has been set to true.
            bool hasToggleProperty = node.HasProperty(_settings.TogglePropertyAlias ?? "");
            result.HasToggleProperty = hasToggleProperty;

            if (hasToggleProperty && (node.GetValue(_settings.TogglePropertyAlias)?.ToString()?.ToLower() ?? "0") == "0")
            {
                result.ShouldContinue = false;
                return result;
            }

            return result;
        }

        private static bool IsAllowedPropertyType(string propertyEditorAlias)
        {
            if (
                propertyEditorAlias.Contains("TinyMCE", StringComparison.InvariantCultureIgnoreCase)
                || propertyEditorAlias.Contains("TextBox", StringComparison.InvariantCultureIgnoreCase)
                || propertyEditorAlias.Contains("TextArea", StringComparison.InvariantCultureIgnoreCase)
                || propertyEditorAlias.Contains("TextString", StringComparison.InvariantCultureIgnoreCase)
                || propertyEditorAlias.Contains("BlockList", StringComparison.InvariantCultureIgnoreCase)
                || propertyEditorAlias.Contains("BlockGrid", StringComparison.InvariantCultureIgnoreCase))
            {
                return true;
            }
            return false;
        }

        private IEnumerable<string> GetAllStringValues(IContent content, string culture = null)
        {
            var results = new List<string>();

            foreach (
                    var prop in content.Properties
                    .Where(
                        x =>
                        !x.Alias.Equals(_settings.PropertyAlias, StringComparison.InvariantCultureIgnoreCase)
                        && (!(_settings.ExcludePropertiesList.Any() && _settings.ExcludePropertiesList.Contains(x.Alias)))
                        )

                    )
            {
                if (!IsAllowedPropertyType(prop.PropertyType.PropertyEditorAlias))
                {
                    continue;
                }
                var value = prop.GetValue(culture);

                if (value == null)
                    continue;

                if (value is string str)
                {
                    // Try to detect if it's JSON
                    if (LooksLikeJson(str))
                    {
                        try
                        {
                            var json = JsonDocument.Parse(str);
                            results.AddRange(GetStringsFromJson(json.RootElement));
                        }
                        catch
                        {
                            // Not valid JSON, treat as plain string
                            results.Add(str);
                        }
                    }
                    else
                    {
                        results.Add(str);
                    }
                }
            }

            return results;
        }

        private static bool LooksLikeJson(string s)
        {
            s = s.Trim();
            return (s.StartsWith("{") && s.EndsWith("}")) || (s.StartsWith("[") && s.EndsWith("]"));
        }

        private static IEnumerable<string> GetStringsFromJson(JsonElement element)
        {
            var list = new List<string>();

            //It may seem silly, but it'll block all umb:// links and also numeric values since they're of smaller lenghts. 
            switch (element.ValueKind)
            {
                case JsonValueKind.String:
                    var s = element.GetString()?.Trim();

                    //Stop if empty or very small.
                    if (s.IsNullOrWhiteSpace()) break;
                    if (s.Length < 50) break;

                    //Just to make sure no rogue links without other content get through
                    if (s.StartsWith("http://", StringComparison.InvariantCultureIgnoreCase) && !s.Contains(" ")) break;
                    if (s.StartsWith("https://", StringComparison.InvariantCultureIgnoreCase) && !s.Contains(" ")) break;
                    if (s.StartsWith("mailto://", StringComparison.InvariantCultureIgnoreCase) && !s.Contains(" ")) break;

                    list.Add(s);
                    break;

                case JsonValueKind.Object:
                    foreach (var property in element.EnumerateObject())
                        list.AddRange(GetStringsFromJson(property.Value));
                    break;

                case JsonValueKind.Array:
                    foreach (var item in element.EnumerateArray())
                        list.AddRange(GetStringsFromJson(item));
                    break;
            }

            return list;
        }


        private static void ReplaceProperty(JsonNode? node, string propAlias, string newValue)
        {
            if (node is JsonObject obj)
            {
                foreach (var prop in obj.ToList())
                {
                    if (prop.Key == propAlias)
                    {
                        obj[propAlias] = newValue;
                        return;
                    }

                    ReplaceProperty(prop.Value, propAlias, newValue);
                }
            }
            else if (node is JsonArray arr)
            {
                foreach (var item in arr)
                {
                    ReplaceProperty(item, propAlias, newValue);
                }
            }
        }

        private static string GetBlockPropertyValue(JsonNode? node, string propAlias)
        {

            if (node is JsonObject obj)
            {
                foreach (var prop in obj.ToList())
                {
                    if (prop.Key == propAlias)
                    {
                        return obj[propAlias]?.ToString();

                    }
                    var retVal = GetBlockPropertyValue(prop.Value, propAlias);
                    if (retVal != null)
                    {
                        return retVal;
                    }

                }
            }
            else if (node is JsonArray arr)
            {
                foreach (var item in arr)
                {
                    var retVal = GetBlockPropertyValue(item, propAlias);
                    if (retVal != null)
                    {
                        return retVal;
                    }

                }
            }
            return null;

        }
        #endregion
    }
}



