using System.Linq;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;

namespace DotSee.Discipline.AutoNode
{
    public class ContentPublishedHandler : INotificationHandler<ContentPublishedNotification>
    {
        private readonly AutoNodeService _autoNodeService;

        public ContentPublishedHandler(AutoNodeService autoNodeService)
        {
            _autoNodeService = autoNodeService;
        }

        public void Handle(ContentPublishedNotification notification)
        {
            foreach (IContent node in notification.PublishedEntities)
            {
                if (!node.PublishedCultures.Any())
                {
                    _autoNodeService.Run(node);
                }
                else
                {
                    foreach (var culture in node.PublishedCultures)
                    {
                        //This is the PARENT node's culture, so we assume that generally the child node
                        //will be a variant as well (which is not always the case). 
                        //See the service for handling variant parents with invariant children.
                        _autoNodeService.Run(node, culture);
                    }
                }
            }
        }
    }
}