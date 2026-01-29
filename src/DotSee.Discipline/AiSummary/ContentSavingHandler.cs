using Serilog;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;

namespace DotSee.Discipline.AiSummary
{
    public class ContentSavingHandler : INotificationHandler<ContentSavingNotification>
    {
        private readonly AiSummaryService _svc;
        private readonly ILogger _logger;

        public ContentSavingHandler(AiSummaryService svc, ILogger logger)
        {
            _svc = svc;
            _logger = logger;
        }

        public void Handle(ContentSavingNotification notification)
        {
            foreach (IContent node in notification.SavedEntities)
            {
                //This is where the magic happens. Unicorns. Free burgers. 
                try
                {
                    _svc.Run(node);
                }
                catch (Exception ex)
                {
                    _logger.Error(ex, MessageConstants.ErrorContentSaving, node.Id, node.Name);
                    notification.Messages.Add(new EventMessage(category: "AI Summary", "Something went wrong. AI summary was not updated. Please check your logs.", EventMessageType.Warning));
                }
            }
        }
    }
}
