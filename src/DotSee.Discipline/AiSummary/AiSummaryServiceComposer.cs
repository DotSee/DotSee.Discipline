using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;

namespace DotSee.Discipline.AiSummary
{
    public class AiSummaryServiceComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddSingleton<AiSummaryService>();
            builder.Services.AddSingleton<JsonSettingsProviderService>();
            builder.AddNotificationHandler<ContentSavingNotification, ContentSavingHandler>();

            // Backs the model dropdown in the backoffice settings UI (lists active OpenAI / Gemini models).
            builder.Services.AddHttpClient();
            builder.Services.AddSingleton<IAiModelCatalogService, AiModelCatalogService>();
        }
    }
}
