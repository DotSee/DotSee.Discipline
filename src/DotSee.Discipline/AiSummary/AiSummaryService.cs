using DotSee.Discipline.Interfaces;
using Serilog;
using System.Text.Json;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

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

        public bool Run(IContent node)
        {
            string culture = node.EditedCultures.First();

            var allStrings = GetAllStringValues(node, culture);
            var singleString = string.Join("", allStrings);

            //foreach (var p in node.Properties)
            //{
            //    var pinfo = _contentTypeService.GetPropertyInfo(p=> p);
            //    bool isprimitive = pinfo.PropertyType.IsPrimitive;
            //}

            bool result = false;
            _logger.Information("AiSummaryService ran for ID {NodeId} with Name {NodeName}, value: {SingleString}", node.Id, node.Name, singleString.StripHtml());
            return (result);
        }

        #endregion

        #region Private Methods

        private static bool IsTextProperty(string propertyEditorAlias)
        {
            if (propertyEditorAlias.Contains("TinyMCE", StringComparison.InvariantCultureIgnoreCase) ||
                propertyEditorAlias.Contains("TextBox", StringComparison.InvariantCultureIgnoreCase) ||
                propertyEditorAlias.Contains("TextArea", StringComparison.InvariantCultureIgnoreCase) ||
                propertyEditorAlias.Contains("TextString", StringComparison.InvariantCultureIgnoreCase))
            {
                return true;
            }
            return false;
        }

        private static bool IsComplexProperty(string propertyEditorAlias)
        {
            if (propertyEditorAlias.Contains("BlockList", StringComparison.InvariantCultureIgnoreCase) ||
                propertyEditorAlias.Contains("BlockGrid", StringComparison.InvariantCultureIgnoreCase))
            {
                return true;
            }
            return false;
        }

        private void GetAllComplexValues(IContent content, string culture = null)
        {
            foreach (var prop in content.Properties)
            {
                if (!IsComplexProperty(prop.PropertyType.PropertyEditorAlias))
                {
                    continue;
                }

                // Handle complex property value extraction here
            }
        }

        private IEnumerable<string> GetAllStringValues(IContent content, string culture = null)
        {
            var results = new List<string>();

            foreach (var prop in content.Properties)
            {
                if (!IsTextProperty(prop.PropertyType.PropertyEditorAlias))
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

            switch (element.ValueKind)
            {
                case JsonValueKind.String:
                    list.Add(element.GetString());
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



