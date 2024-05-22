using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;

namespace DotSee.Discipline.NodeProtect
{
    public class ContentMovingToRecycleBinHandler : INotificationHandler<ContentMovingToRecycleBinNotification>
    {
        private readonly NodeProtectService _nodeProtectService;

        public ContentMovingToRecycleBinHandler(NodeProtectService nodeProtectService)
        {
            _nodeProtectService = nodeProtectService;
        }

        public void Handle(ContentMovingToRecycleBinNotification notification)
        {
            foreach (MoveEventInfo<IContent> item in notification.MoveInfoCollection)
            {
                _nodeProtectService.Run(item.Entity);
            }
        }
    }
}