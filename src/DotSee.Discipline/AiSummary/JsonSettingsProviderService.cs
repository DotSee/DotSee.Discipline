using DotSee.Discipline.Backoffice;
using DotSee.Discipline.Interfaces;

namespace DotSee.Discipline.AiSummary
{
    public class JsonSettingsProviderService : ISettings<AiSummarySettings>, ISettingsProviderService
    {
        private readonly IDisciplineSettingsResolver _resolver;

        public JsonSettingsProviderService(IDisciplineSettingsResolver resolver)
        {
            _resolver = resolver;
        }

        public AiSummarySettings Settings
        {
            get
            {
                var feature = _resolver.GetAiSummary();
                return new AiSummarySettings
                {
                    Llm = feature.Llm,
                    ApiKey = feature.ApiKey,
                    Model = feature.Model,
                    MaxChars = feature.MaxChars,
                    Tone = feature.Tone,
                    DocTypes = feature.DocTypes,
                    ExcludeProperties = feature.ExcludeProperties,
                    PropertyAlias = feature.PropertyAlias,
                    TogglePropertyAlias = feature.TogglePropertyAlias,
                };
            }
        }

        public void ReloadData()
        {
        }
    }
}
