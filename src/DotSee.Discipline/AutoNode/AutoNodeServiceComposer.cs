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
            builder.Services.AddSingleton<IRuleProviderService< IEnumerable<Rule>>, JsonFileRuleProviderService>();
            builder.Services.AddSingleton<AutoNodeService>();
            builder.Services.AddSingleton<AutoNodeUtils>();
            builder.AddNotificationHandler<ContentPublishedNotification, ContentPublishedHandler>();
        }      
    }
}