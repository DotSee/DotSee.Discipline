using DotSee.Discipline.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;

namespace DotSee.Discipline.NodeProtect
{
    public class NodeProtectServiceComposer : IComposer
    {

        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services
                .AddSingleton<IRuleProviderService<IEnumerable<Rule>>, JsonFileRuleProviderService>()
                .AddSingleton<NodeProtectService>();
            builder.AddNotificationHandler<ContentMovingToRecycleBinNotification, ContentMovingToRecycleBinHandler>();

        }
    }
}
