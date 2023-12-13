using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;

namespace DotSee.Discipline.VariantsHider
{
    public class VariantsHiderService : INotificationHandler<MenuRenderingNotification>
    {
        private readonly IConfiguration _configuration;

        public VariantsHiderService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void Handle(MenuRenderingNotification notification)
        {
            if (notification.TreeAlias == "content" && _configuration.GetSection("DotSee.Discipline:VariantsHider:Enabled")?.Value?.ToLower() == "true")
            {
                if (string.IsNullOrEmpty(notification.NodeId) || notification.NodeId.Equals(Constants.System.RecycleBinContentString)) { return; }

                if (notification.NodeId == "-1")
                {
                    string caption = _configuration.GetSection("DotSee.Discipline:VariantsHider:Caption")?.Value;

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
