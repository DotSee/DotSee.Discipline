using System.Text.Json;
using System.Text.Json.Nodes;
using Umbraco.Cms.Core.Models;
using Umbraco.Extensions;

namespace DotSee.Discipline.AiSummary.Helpers
{
    public static class JsonHelper
    {
        public static bool LooksLikeJson(string s)
        {
            s = s.Trim();
            return (s.StartsWith("{") && s.EndsWith("}")) || (s.StartsWith("[") && s.EndsWith("]"));
        }

        public static IEnumerable<string> GetStringsFromJson(JsonElement element)
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

        public static void ReplaceProperty(JsonNode? node, string propAlias, string newValue)
        {
            bool replaced = false;
            if (node is JsonObject obj)
            {
                foreach (var prop in obj.ToList())
                {
                    if (prop.Key == propAlias)
                    {
                        obj[propAlias] = newValue;
                        replaced = true;
                        return;
                    }

                    ReplaceProperty(prop.Value, propAlias, newValue);
                }

                //Property was not found (block item was saved without it being filled), so add it. 
                //This can add a property to a block that doesn't have it, so be careful.
                if (!replaced)
                {
                    obj.Add(propAlias, newValue);
                    replaced = true;
                    return;
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

        public static string GetBlockPropertyValue(JsonNode? node, string propAlias)
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

        public static JsonNode GetJsonFromNode(IContent node, string propertyAlias, string culture)
        {
            JsonNode bl = null;
            var blockList = node.GetValue(propertyAlias, culture);
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
    }
}
