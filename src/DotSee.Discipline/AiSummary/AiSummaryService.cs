using DotSee.Discipline.AiSummary.Exceptions;
using DotSee.Discipline.AiSummary.Generators;
using DotSee.Discipline.AiSummary.Helpers;
using DotSee.Discipline.Interfaces;
using Newtonsoft.Json.Linq;
using NPoco;
using Serilog;
using System.Text.Json;
using System.Text.Json.Nodes;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace DotSee.Discipline.AiSummary
{
    public class AiSummaryService
    {
        #region Private Members

        private AiSummarySettings _settings;
        private readonly JsonSettingsProviderService _settingsProviderService;
        private ILogger _logger;
        private readonly IJsonSerializer _jsonSerializer;
        private readonly IContentTypeService _contentTypeService;

        #endregion

        #region Constructors
        public AiSummaryService(
            JsonSettingsProviderService settingsProviderService,
            ILogger logger,
            IJsonSerializer jsonSerializer,
            IContentTypeService contentTypeService)
        {
            _settingsProviderService = settingsProviderService;
            _settings = ((ISettings<AiSummarySettings>)_settingsProviderService).Settings;
            _logger = logger;
            _jsonSerializer = jsonSerializer;
            _contentTypeService = contentTypeService;
        }
        #endregion

        #region Public Methods

        public virtual void Run(IContent node)
        {
            //Make all the necessary checks to decide if we should continue. 
            //If so, return an object with other useful info to use further down the line.
            ServiceCheckResults checkResults = ShouldContinue(node);

            if (!checkResults.ShouldContinue)
            {
                return;
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
                throw;
            }

            _logger.Information("AiSummaryService ran for ID {NodeId} with Name {NodeName}", node.Id, node.Name);

            return;
        }
        #endregion

        #region Private Methods
        private void DoRun(IContent node, ServiceCheckResults checkResults, string culture)
        {
            //Check if toggle property exists in current node and whether is has been set to true.
            if (checkResults.HasToggleProperty && (node.GetValue(_settings.TogglePropertyAlias, culture)?.ToString()?.ToLower() ?? "0") == "0")
            {
                return;
            }

            //Get the current value of the property to update.
            //If it's a block or nested content, it will return null if either the property value is null
            //or the property does not exist at all. We'll handle that on attempting to write to the property later.
            var currentValue = checkResults.IsComplexProperty
                ? JsonHelper.GetBlockPropertyValue(JsonHelper.GetJsonFromNode(node, _settings.PropertyAlias.Split('.')[0], culture), _settings.PropertyAlias.Split('.')[2])
                : node.GetValue(_settings.PropertyAlias, culture);

            //Do not update if content already in and no toggle property is set.
            //Toggle property set to true will force the update, even with content already in.
            if (!checkResults.HasToggleProperty && currentValue != null && !currentValue.ToString().Trim().IsNullOrWhiteSpace())
            {
                return;
            }

            bool propertyUpdated = false;
            if (checkResults.IsComplexProperty)
            {
                try
                {
                    var bl = AddSummaryToBlockProperty(node, culture);
                    if (bl != null)
                    {
                        node.SetValue(_settings.PropertyAlias.Split('.')[0], bl, culture);
                        propertyUpdated = true;
                    }
                }
                catch
                {
                    _logger.Warning("AiSummaryService could not update block property for ID {NodeId} with Name {NodeName}. Falling back to nested content", node.Id, node.Name);

                    //This is extremely ugly, but it's here only for v13 and for the case that it's an NC property
                    //instead of a blocklist. 
                    try
                    {
                        var bl = AddSummaryToNcProperty(node, culture);
                        if (bl != null)
                        {
                            node.SetValue(_settings.PropertyAlias.Split('.')[0], bl, culture);
                            propertyUpdated = true;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.Error("AiSummaryService could not update complex property (with fallback to nested content) for ID {NodeId} with Name {NodeName}. Exception message: {message}", node.Id, node.Name, ex.Message);
                    }
                }
            }
            else
            {
                //Get the AI summary as close to the update operation as possible to avoid wasting tokens
                //if a problem is encountered.
                var aiResult = GetAiResults(node, culture);
                node.SetValue(_settings.PropertyAlias, aiResult, culture);
                propertyUpdated = true;
            }

            //If you've reached this far there's a toggle property and it was set to true, set it to false
            if (checkResults.HasToggleProperty)
            {
                node.SetValue(_settings.TogglePropertyAlias, false, culture);
            }

            if (!propertyUpdated)
            {
                throw new PropertyNotUpdatedException($"Property '{_settings.PropertyAlias}' was not updated with AI Summary value. Possible reason is that property does not exist.");
            }
            return;
        }

        private string GetAiResults(IContent node, string culture)
        {
            //Get all candidate string values from the document.
            var allStrings = GetAllStringValues(node, culture);

            if (allStrings == null || !allStrings.Any())
            {
                return null;
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

            return aiResult;
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
        private string AddSummaryToBlockProperty(IContent node, string culture)
        {
            string[] aliases = _settings.PropertyAlias.Split('.');

            var blockListPropertyAlias = aliases[0];
            var elementTypeAlias = aliases[1];
            var blockAiSummaryPropertyAlias = aliases[2];

            var blockModelRaw = node.GetValue(blockListPropertyAlias, culture);
            var blockValue = _jsonSerializer.Deserialize<BlockValue>(blockModelRaw.ToString());

            foreach (var layoutEntry in blockValue.Layout.Values)
            {
                if (layoutEntry is not JArray layoutArray) continue;

                foreach (var li in layoutArray.OfType<JObject>())
                {
                    var contentUdiStr = li["contentUdi"]?.Value<string>();
                    if (string.IsNullOrWhiteSpace(contentUdiStr)) continue;

                    var block = blockValue.ContentData.FirstOrDefault(x => x.Udi?.ToString() == contentUdiStr);
                    if (block is null) continue;

                    //The content type alias is NOT stored in the JSON, so we need to get it from the block 
                    //using the content type service.
                    var blockTypeAlias = GetElementTypeAlias(block);
                    if (blockTypeAlias != elementTypeAlias && (blockTypeAlias != elementTypeAlias)) continue;

                    //Check if property exists
                    var blockDef = _contentTypeService.Get(blockTypeAlias);
                    var propExists = blockDef.PropertyTypeExists(blockAiSummaryPropertyAlias);

                    if (!propExists) continue;

                    //Get the AI summary as close to the update operation as possible to avoid wasting tokens
                    //if a problem is encountered.
                    string summary = GetAiResults(node, culture);

                    // IMPORTANT: if summary wasn't present (because empty), just add it
                    block.RawPropertyValues ??= new();
                    block.RawPropertyValues[blockAiSummaryPropertyAlias] = summary;

                    var updatedJson = _jsonSerializer.Serialize(blockValue);

                    //Job done, exit everything.
                    return updatedJson;
                }
            }
            return null;
        }

        public string? GetElementTypeAlias(BlockItemData block)
        {
            if (block.ContentTypeKey == Guid.Empty) return null;

            var ct = _contentTypeService.Get(block.ContentTypeKey);
            return ct?.Alias;
        }

        private JsonNode AddSummaryToNcProperty(IContent node, string culture)
        {
            JsonNode bl = JsonHelper.GetJsonFromNode(node, _settings.PropertyAlias.Split('.')[0], culture);
            if (bl == null)
            {
                return null;
            }

            // Look for contentData array
            JsonArray contentData = null;


            //Fallback to NC (V13 specific)
            try
            {
                contentData = bl as JsonArray;
            }
            catch { }


            if (contentData == null)
            {
                return null;
            }

            //Get the AI summary as close to the update operation as possible to avoid wasting tokens
            //if a problem is encountered.
            string summary = GetAiResults(node, culture);

            JsonHelper.ReplaceProperty(contentData, _settings.PropertyAlias.Split('.')[2], summary);

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

            //Check if property to update has been specified
            if (string.IsNullOrEmpty(_settings.PropertyAlias))
            {
                result.ShouldContinue = false;
                return result;
            }

            //Check if it is a complex property (blocklist) - if so check if it exists
            if (_settings.PropertyAlias.Count(x => x == '.') == 2)
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

            //Check if toggle property exists in current node.
            result.HasToggleProperty = node.HasProperty(_settings.TogglePropertyAlias ?? "");

            return result;
        }

        //Check if property editor alias is allowed. This is V13 specific.
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
                {
                    continue;
                }

                if (value is string str)
                {
                    // Try to detect if it's JSON
                    if (JsonHelper.LooksLikeJson(str))
                    {
                        try
                        {
                            var json = JsonDocument.Parse(str);
                            results.AddRange(JsonHelper.GetStringsFromJson(json.RootElement));
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


        #endregion
    }
}



