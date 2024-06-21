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
                Result result = _nodeProtectService.Run(item.Entity);

                //No rule applied, as you were.
                if (result == null) { return; }

                //If a result has come back, see if limit has been reached or not.

                var rmm = new RuleMessageManager(result.Rule);
                //Show message to warn user that he/she has no hope of ever deleting that node.

                notification.CancelOperation(new EventMessage(rmm.GetMessageCategory(), rmm.GetMessage(result), EventMessageType.Error));

            }
        }
    }
}