using DotSee.Discipline.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;

namespace DotSee.Discipline.AutoNode
{
    public class AutoNodeServiceComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services
                .AddSingleton<IRuleProviderService<IEnumerable<Rule>>, JsonFileRuleProviderService>()
                .AddSingleton<AutoNodeService>()
                .AddSingleton<AutoNodeUtils>();
            builder.AddNotificationHandler<ContentPublishedNotification, ContentPublishedHandler>();
        }
    }
}