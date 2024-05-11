using DotSee.Discipline.Interfaces;
using DotSee.Discipline.NodeProtect;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;

namespace DotSee.Discipline.NodeRestrict
{
    public class NodeProtectServiceComposer : IComposer
    {

        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services
                .AddSingleton<IRuleProviderService<IEnumerable<Rule>>, JsonFileRuleProviderService>()
                .AddSingleton<NodeProtectService>();
            builder.AddNotificationHandler<ContentPublishingNotification, ContentPublishingHandler>();

        }
    }
}
