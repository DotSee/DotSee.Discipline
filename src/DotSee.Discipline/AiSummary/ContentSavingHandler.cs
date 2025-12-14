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
            foreach (IContent node in notification.SavedEntities)
            {
                //This is where the magic happens. Unicorns. Free burgers. 
                bool success = _svc.Run(node);
                if (!success)
                {
                    notification.Messages.Add(new EventMessage(category: "AI Summary", "Something went wrong. AI summary was not updated. Please check your logs.", EventMessageType.Warning));
                }
            }
        }
    }
}
