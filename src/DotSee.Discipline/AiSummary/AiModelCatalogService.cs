using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Google.GenAI;
using Google.GenAI.Types;

namespace DotSee.Discipline.AiSummary
{
    public interface IAiModelCatalogService
    {
        /// <summary>
        /// Lists the chat-capable model names for the given LLM ("openai" or "gemini"), using the
        /// supplied API key, and suggests a sensible (cheapest) default.
        /// </summary>
        Task<AiModelListResult> GetModelsAsync(string llm, string apiKey, CancellationToken cancellationToken = default);
    }

    public sealed class AiModelListResult
    {
        public List<string> Models { get; set; } = new();
        public string DefaultModel { get; set; } = string.Empty;
    }

    public sealed class AiModelCatalogService : IAiModelCatalogService
    {
        private const string OpenAiModelsUrl = "https://api.openai.com/v1/models";

        private readonly IHttpClientFactory _httpClientFactory;

        public AiModelCatalogService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<AiModelListResult> GetModelsAsync(string llm, string apiKey, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException("An API key is required to list models.");
            }

            var raw = string.Equals(llm, "gemini", StringComparison.OrdinalIgnoreCase)
                ? await GetGeminiModelNamesAsync(apiKey)
                : await GetOpenAiModelNamesAsync(apiKey, cancellationToken);

            return BuildResult(raw);
        }

        private async Task<List<string>> GetOpenAiModelNamesAsync(string apiKey, CancellationToken ct)
        {
            HttpClient client = _httpClientFactory.CreateClient();
            using var request = new HttpRequestMessage(HttpMethod.Get, OpenAiModelsUrl);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            using HttpResponseMessage response = await client.SendAsync(request, ct);
            var json = await response.Content.ReadAsStringAsync(ct);
            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException($"OpenAI returned {(int)response.StatusCode}. {ExtractError(json)}");
            }

            return ExtractOpenAiChatModelIds(json);
        }

        private static async Task<List<string>> GetGeminiModelNamesAsync(string apiKey)
        {
            // Use the same SDK client as the summary generator so auth/endpoint/version match.
            // QueryBase = true lists the base (foundation) models rather than tuned models.
            var client = new Client(apiKey: apiKey);
            var config = new ListModelsConfig { QueryBase = true, PageSize = 200 };
            var raw = new List<(string Name, IEnumerable<string>? SupportedActions)>();

            // ListAsync returns a Pager that transparently fetches subsequent pages while enumerating.
            var pager = await client.Models.ListAsync(config);
            await foreach (Model model in pager)
            {
                raw.Add((model.Name, model.SupportedActions));
            }

            return FilterGeminiModelNames(raw);
        }

        /// <summary>
        /// Orders the raw model names cheapest-first and picks the cheapest as the default.
        /// </summary>
        public static AiModelListResult BuildResult(IEnumerable<string> rawNames)
        {
            var ordered = rawNames
                .Where(n => !string.IsNullOrWhiteSpace(n))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(GetCheapnessRank)
                .ThenBy(n => n, StringComparer.OrdinalIgnoreCase)
                .ToList();

            return new AiModelListResult
            {
                Models = ordered,
                DefaultModel = ordered.FirstOrDefault() ?? string.Empty,
            };
        }

        /// <summary>
        /// From the OpenAI /v1/models response, returns only chat-completion models suitable for
        /// summarisation. /v1/models exposes no capability metadata, so this is a name heuristic:
        /// keep gpt-*/chatgpt-* and drop non-chat variants (audio, tts, image, embeddings, etc.).
        /// </summary>
        public static List<string> ExtractOpenAiChatModelIds(string json)
        {
            var result = new List<string>();
            using JsonDocument doc = JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("data", out JsonElement data) && data.ValueKind == JsonValueKind.Array)
            {
                foreach (JsonElement item in data.EnumerateArray())
                {
                    if (item.TryGetProperty("id", out JsonElement idEl) && idEl.ValueKind == JsonValueKind.String)
                    {
                        var id = idEl.GetString();
                        if (!string.IsNullOrWhiteSpace(id) && IsOpenAiChatModel(id!))
                        {
                            result.Add(id!);
                        }
                    }
                }
            }
            return result;
        }

        private static bool IsOpenAiChatModel(string id)
        {
            var x = id.ToLowerInvariant();
            if (!(x.StartsWith("gpt-", StringComparison.Ordinal) || x.StartsWith("chatgpt-", StringComparison.Ordinal)))
            {
                return false;
            }

            string[] excluded = { "instruct", "audio", "realtime", "transcribe", "tts", "image", "search", "embedding", "embed", "moderation" };
            return !excluded.Any(e => x.Contains(e));
        }

        /// <summary>
        /// Keeps Gemini models that support "generateContent" and strips the "models/" name prefix.
        /// </summary>
        public static List<string> FilterGeminiModelNames(IEnumerable<(string Name, IEnumerable<string>? SupportedActions)> models)
        {
            var result = new List<string>();
            foreach (var model in models)
            {
                if (model.SupportedActions != null &&
                    model.SupportedActions.Any(a => string.Equals(a, "generateContent", StringComparison.OrdinalIgnoreCase)))
                {
                    result.Add(StripModelsPrefix(model.Name));
                }
            }
            return result;
        }

        private static string StripModelsPrefix(string name)
        {
            if (string.IsNullOrEmpty(name)) { return string.Empty; }
            return name.StartsWith("models/", StringComparison.Ordinal) ? name.Substring("models/".Length) : name;
        }

        /// <summary>
        /// Lower rank = cheaper / smaller model → preferred as the default selection.
        /// Matches hyphen-delimited segments rather than substrings — otherwise "gemini" would
        /// falsely match the "mini" tier (it contains the letters m-i-n-i).
        /// </summary>
        public static int GetCheapnessRank(string id)
        {
            var segments = id.ToLowerInvariant().Split('-');
            bool Has(string segment) => segments.Contains(segment);

            if (Has("nano")) { return 0; }
            if (Has("mini")) { return 1; }
            if (Has("flash") && Has("lite")) { return 1; }
            if (Has("lite")) { return 2; }
            if (Has("flash")) { return 3; }
            if (Has("pro") || Has("ultra") || Has("opus") || Has("max")) { return 9; }
            return 5;
        }

        private static string ExtractError(string json)
        {
            // OpenAI errors look like { "error": { "message": "..." } }
            try
            {
                using JsonDocument doc = JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("error", out JsonElement error) &&
                    error.TryGetProperty("message", out JsonElement message) &&
                    message.ValueKind == JsonValueKind.String)
                {
                    return message.GetString() ?? string.Empty;
                }
            }
            catch
            {
                /* fall through to raw */
            }
            return json.Length > 300 ? json.Substring(0, 300) : json;
        }
    }
}
