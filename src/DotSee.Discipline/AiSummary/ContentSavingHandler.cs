using System.Globalization;
using Serilog;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

namespace DotSee.Discipline.AiSummary
{
    public class ContentSavingHandler : INotificationHandler<ContentSavingNotification>
    {
        private readonly AiSummaryService _svc;
        private readonly ILogger _logger;
        private readonly ILocalizedTextService _localizedTextService;

        public ContentSavingHandler(AiSummaryService svc, ILogger logger, ILocalizedTextService localizedTextService)
        {
            _svc = svc;
            _logger = logger;
            _localizedTextService = localizedTextService;
        }

        public void Handle(ContentSavingNotification notification)
        {
            var category = _localizedTextService.Localize("dotseeDiscipline", "aiSummaryCategory", CultureInfo.CurrentUICulture);

            foreach (IContent node in notification.SavedEntities)
            {
                //This is where the magic happens. Unicorns. Free burgers.
                try
                {
                    // In Umbraco v14+, EditedCultures may be null during save notifications.
                    // Use notification.IsSavingCulture() to reliably determine which cultures are being saved.
                    var savingCultures = node.AvailableCultures?
                        .Where(culture => notification.IsSavingCulture(node, culture))
                        .ToList();

                    bool summaryGenerated = _svc.Run(node, savingCultures);

                    if (summaryGenerated)
                    {
                        var message = _localizedTextService.Localize("dotseeDiscipline", "aiSummaryGenerated", CultureInfo.CurrentUICulture);
                        notification.Messages.Add(new EventMessage(category, message, EventMessageType.Success));
                    }
                }
                catch (Exception ex)
                {
                    _logger.Error(ex, MessageConstants.ErrorContentSaving, node.Id, node.Name);
                    var message = _localizedTextService.Localize("dotseeDiscipline", "aiSummaryError", CultureInfo.CurrentUICulture);
                    notification.Messages.Add(new EventMessage(category, message, EventMessageType.Warning));
                }
            }
        }
    }
}
