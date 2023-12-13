using DotSee.Discipline.AutoNode;
using DotSee.Discipline.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;

namespace DotSee.Discipline.NodeRestrict
{
    public class NodeRestrictServiceComposer : IComposer
    {

        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services
                .AddSingleton<IRuleProviderService<IEnumerable<Rule>>, JsonFileRuleProviderService>()
                .AddSingleton<NodeRestricService>();
            builder.AddNotificationHandler<ContentPublishingNotification, ContentPublishingHandler>();

        }
    }
}
