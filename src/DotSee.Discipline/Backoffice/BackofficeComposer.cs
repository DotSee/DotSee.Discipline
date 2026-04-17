using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace DotSee.Discipline.Backoffice
{
    public class BackofficeComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services
                .AddSingleton<IDisciplineSettingsStore, DisciplineSettingsStore>()
                .AddSingleton<IDisciplineAppSettingsReader, DisciplineAppSettingsReader>()
                .AddSingleton<IDisciplineSettingsResolver, DisciplineSettingsResolver>();
        }
    }
}
