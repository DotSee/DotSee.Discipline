using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;

namespace DotSee.Discipline.NodeProtect
{
    public class ContentDeletingHandler : INotificationHandler<ContentDeletingNotification>
    {
        private readonly NodeProtectService _nodeProtectService;

        public ContentDeletingHandler(NodeProtectService nodeProtectService)
        {
            _nodeProtectService = nodeProtectService;
        }

        public void Handle(ContentDeletingNotification notification)
        {
            foreach (IContent node in notification.DeletedEntities)
            {
                _nodeProtectService.Run(node);
            }
        }
    }
}