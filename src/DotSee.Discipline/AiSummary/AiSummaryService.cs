using DotSee.Discipline.Interfaces;
using NUglify.JavaScript.Syntax;
using OpenAI.Chat;
using Serilog;
using System.Text.Json;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;
using static Umbraco.Cms.Core.Collections.TopoGraph;

namespace DotSee.Discipline.AiSummary
{
    public class AiSummaryService
    {

        #region Private Members

        private IContentService _cs;
        private readonly IContentTypeService _contentTypeService;
        private AiSummarySettings _settings;
        private readonly JsonSettingsProviderService _settingsProviderService;
        private ILogger _logger;

        #endregion

        #region Constructors
        public AiSummaryService(
            IContentService contentService,
            IContentTypeService contentTypeService,
            JsonSettingsProviderService settingsProviderService,
            ILogger logger)
        {
            _cs = contentService;
            _contentTypeService = contentTypeService;
            _settingsProviderService = settingsProviderService;
            _settings = ((ISettings<AiSummarySettings>)_settingsProviderService).Settings;
            _logger = logger;
        }

        #endregion

        #region Public Methods

        public virtual bool Run(IContent node)
        {
            //Check if node type is allowed. If no doctypes have been specified, allow all.
            if (
                _settings.DocTypesList != null
                && _settings.DocTypesList.Any()
                && !_settings.DocTypesList.Contains(node.ContentType.Alias))
            {
                return false;
            }

            //Check if property to update exists in current node.
            if (!node.HasProperty(_settings.PropertyAlias))
            {
                return false;
            }

            bool hasToggleProperty = node.HasProperty(_settings.TogglePropertyAlias);

            if (hasToggleProperty && (node.GetValue(_settings.TogglePropertyAlias)?.ToString()?.ToLower() ?? "false") == "false")            {
                return false;
            }

            foreach (string culture in node.EditedCultures)
            {

                //Do not update if content already in
                var currentValue = node.GetValue(_settings.PropertyAlias, culture);
                if (currentValue != null && !currentValue.ToString().Trim().IsNullOrWhiteSpace())
                {
                    continue;
                }

                //Get all candidate string values from the document.
                var allStrings = GetAllStringValues(node, culture);

                if (allStrings == null || !allStrings.Any())
                {
                    continue;
                }

                var singleString = string.Join("", allStrings);

                try
                {
                    //Magic.
                    //ChatClient client = new(model: _settings.Model, apiKey: _settings.OpenAiKey);

                    //var res = client.CompleteChatAsync(
                    //_settings.Model,
                    //$"{_settings.Tone} Based on the following text, write a short SEO-optimized description suitable for Open Graph meta tags. Maximum {_settings.MaxChars.ToString()} characters. Make it clear, engaging, and summarise the main value. Do not add anything that isn't in the text. Here is the text: " + singleString.StripHtml()
                    // );

                    //node.SetValue(_settings.PropertyAlias, res.Result.Value.Content[0].Text, culture);
                    node.SetValue(_settings.PropertyAlias, "value from AI", culture);

                    if (hasToggleProperty) 
                    { 
                        node.SetValue(_settings.TogglePropertyAlias, false);
                    }

                }
                catch (Exception ex)
                {
                    _logger.Error(ex, "AiSummaryService failed for ID {NodeId} with Name {NodeName}. Exception: {ExceptionMessage}", node.Id, node.Name, ex.Message);
                    return false;
                }
            }

            _logger.Information("AiSummaryService ran for ID {NodeId} with Name {NodeName}", node.Id, node.Name);
            return true;
        }

        #endregion

        #region Private Methods

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
                        x=>
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
                    var s = element.GetString().Trim();
                    
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

        #endregion
    }
}



