using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;

namespace DotSee.Discipline.AiSummary
{
    public class ContentSavingHandler : INotificationHandler<ContentSavingNotification>
    {
        private readonly AiSummaryService _svc;

        public ContentSavingHandler(AiSummaryService svc)
        {
            _svc = svc;
        }
        public void Handle(ContentSavingNotification notification)
        {
            bool result = false;

            foreach (IContent node in notification.SavedEntities)
            {
                //This is where the magic happens. Unicorns. Free burgers. 
                result = _svc.Run(node);
            }
            //Not applied, as you were.
            if (result == false) { return; }
        }
    }
}
