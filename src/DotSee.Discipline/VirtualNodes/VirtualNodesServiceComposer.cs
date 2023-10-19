using DotSee.Discipline.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace DotSee.Discipline.VirtualNodes
{
    public class VirtualNodesServiceComposer:IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services
                .AddTransient<IRuleProviderService<IEnumerable<string>>, JsonFileRuleProviderService>()
                .AddTransient<VirtualNodesRuleManager>();         
            builder.UrlProviders().Insert<VirtualNodesUrlProvider>();
            builder.ContentFinders().Append<VirtualNodesContentFinder>();
        }      
    }
}
