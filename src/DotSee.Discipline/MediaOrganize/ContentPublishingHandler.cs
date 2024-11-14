using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

namespace DotSee.Discipline.MediaOrganize
{
    public class ContentPublishingHandler : INotificationHandler<ContentPublishingNotification>
    {
        private readonly MediaOrganizeService _mediaOrganizeService;
        private readonly IContentTypeService _contentTypeService;

        public ContentPublishingHandler(
            MediaOrganizeService mediaOrganizeService
            , IContentTypeService contentTypeService)
        {
            _mediaOrganizeService = mediaOrganizeService;
            _contentTypeService = contentTypeService;
        }
        public void Handle(ContentPublishingNotification notification)
        {
            Result result = null;

            foreach (IContent node in notification.PublishedEntities)
            {
                //This is where the magic happens. Unicorns. Free burgers. 
                result = _mediaOrganizeService.Run(node);
            }

            //No rule applied, as you were.
            if (result == null) { return; }

            ////If a result has come back, see if limit has been reached or not.
            //if (result.LimitReached)
            //{
            //    var rmm = new RuleMessageManager(result.Rule, _contentTypeService);
            //    //Show limit reached message to warn user that he/she has no hope of ever publishing another node.
            //    notification.CancelOperation(new EventMessage(rmm.GetMessageCategory(), rmm.GetMessage(), EventMessageType.Error));
            //}
            //else if (result.Rule.ShowWarnings)
            //{
            //    var rmm = new RuleMessageManager(result.Rule, _contentTypeService);
            //    //Show warning message to let the user know how many nodes can still be published.
            //    notification.Messages.Add(new EventMessage(rmm.GetWarningMessageCategory(), rmm.GetWarningMessage(result.NodeCount), EventMessageType.Warning));
            //}
        }
    }
}
