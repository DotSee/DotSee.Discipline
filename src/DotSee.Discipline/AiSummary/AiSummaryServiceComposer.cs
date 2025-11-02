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
            builder.AddNotificationHandler<ContentPublishingNotification, ContentPublishingHandler>();
        }
    }
}
