using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

namespace DotSee.Discipline.NodeProtect
{
    public class ContentMovingToRecycleBinHandler : INotificationHandler<ContentMovingToRecycleBinNotification>
    {
        private readonly NodeProtectService _nodeProtectService;
        private readonly ILocalizedTextService _localizedTextService;

        public ContentMovingToRecycleBinHandler(NodeProtectService nodeProtectService, ILocalizedTextService localizedTextService)
        {
            _nodeProtectService = nodeProtectService;
            _localizedTextService = localizedTextService;
        }

        public void Handle(ContentMovingToRecycleBinNotification notification)
        {
            foreach (MoveToRecycleBinEventInfo<IContent> item in notification.MoveInfoCollection)
            {
                Result result = _nodeProtectService.Run(item.Entity);

                //No rule applied, as you were.
                if (result == null) { continue; }

                //If a result has come back, see if limit has been reached or not.

                var rmm = new RuleMessageManager(result.Rule, _localizedTextService);
                //Show message to warn user that he/she has no hope of ever deleting that node.

                notification.CancelOperation(new EventMessage(rmm.GetMessageCategory(), rmm.GetMessage(result), EventMessageType.Error));

            }
        }
    }
}