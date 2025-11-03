using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;

namespace DotSee.Discipline.AiSummary
{
    public class ContentPublishingHandler : INotificationHandler<ContentPublishingNotification>
    {
        private readonly AiSummaryService _svc;

        public ContentPublishingHandler(AiSummaryService svc)
        {
            _svc = svc;
        }
        public void Handle(ContentPublishingNotification notification)
        {
            bool result = false;

            foreach (IContent node in notification.PublishedEntities)
            {
                //This is where the magic happens. Unicorns. Free burgers. 
                result = _svc.Run(node);

            }

            //Not applied, as you were.
            if (result == false) { return; }
        }
    }
}
