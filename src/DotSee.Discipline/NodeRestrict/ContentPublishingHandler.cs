using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

namespace DotSee.Discipline.NodeRestrict
{
    public class ContentPublishingHandler : INotificationHandler<ContentPublishingNotification>
    {
        private readonly NodeRestrictService _restrictor;
        private readonly IContentTypeService _contentTypeService;
        private readonly ILocalizedTextService _localizedTextService;

        public ContentPublishingHandler(NodeRestrictService restrictor, IContentTypeService contentTypeService, ILocalizedTextService localizedTextService)
        {
            _restrictor = restrictor;
            _contentTypeService = contentTypeService;
            _localizedTextService = localizedTextService;
        }
        public void Handle(ContentPublishingNotification notification)
        {
            Result result = null;

            foreach (IContent node in notification.PublishedEntities)
            {
                //This is where the magic happens. Unicorns. Free burgers. 
                // In Umbraco v14+, EditedCultures may be null during publish notifications.
                // Use notification.IsPublishingCulture() to reliably determine which cultures are being published.
                var publishingCultures = node.AvailableCultures?
                    .Where(culture => notification.IsPublishingCulture(node, culture))
                    .ToList();

                result = _restrictor.Run(node, publishingCultures);
            }

            //No rule applied, as you were.
            if (result == null) { return; }

            //If a result has come back, see if limit has been reached or not.
            if (result.LimitReached)
            {
                var rmm = new RuleMessageManager(result.Rule, _contentTypeService, _localizedTextService);
                //Show limit reached message to warn user that he/she has no hope of ever publishing another node.
                notification.CancelOperation(new EventMessage(rmm.GetMessageCategory(), rmm.GetMessage(), EventMessageType.Error));
            }
            else if (result.Rule.ShowWarnings)
            {
                var rmm = new RuleMessageManager(result.Rule, _contentTypeService, _localizedTextService);
                //Show warning message to let the user know how many nodes can still be published.
                notification.Messages.Add(new EventMessage(rmm.GetWarningMessageCategory(), rmm.GetWarningMessage(result.NodeCount), EventMessageType.Warning));
            }
        }
    }
}
