using Microsoft.Extensions.Configuration;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Extensions;

namespace DotSee.VariantsHider
{
    public class VariantsHiderComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.AddNotificationHandler<MenuRenderingNotification, VariantsHider>();
        }
    }

    public class VariantsHider : INotificationHandler<MenuRenderingNotification>
    {
        private readonly IConfiguration _configuration;

        public VariantsHider(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void Handle(MenuRenderingNotification notification)
        {
            if (notification.TreeAlias == "content" && _configuration.GetSection("VariantsHider:Enabled")?.Value?.ToLower() == "true")
            {
                if (string.IsNullOrEmpty(notification.NodeId) || notification.NodeId.Equals(Constants.System.RecycleBinContentString)) { return; }

                if (notification.NodeId == "-1")
                {
                    string caption = _configuration.GetSection("VariantsHider:Caption")?.Value;
                    
                    if (string.IsNullOrEmpty(caption)) 
                    {
                        caption = "Toggle unset variants display";
                    }

                    var toggleMenuItem = new Umbraco.Cms.Core.Models.Trees.MenuItem("toggleMlNodes", caption);
                    toggleMenuItem.Icon = "axis-rotation";
                    toggleMenuItem.SeparatorBefore = true;
                    toggleMenuItem.ExecuteJsMethod("HideShowTreeNodes()");
                    notification.Menu.Items.Insert(notification.Menu.Items.Count, toggleMenuItem);
                }
            }
        }
    }
}