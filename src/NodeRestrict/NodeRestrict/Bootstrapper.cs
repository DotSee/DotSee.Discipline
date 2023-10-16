using Umbraco.Core;
using Umbraco.Core.Composing;
using Umbraco.Core.Events;
using Umbraco.Core.Models;
using Umbraco.Core.Services;
using Umbraco.Core.Services.Implement;
using Umbraco.Core.Logging;

namespace DotSee.NodeRestrict
{

    public class NodeRestrictComposer : IUserComposer
    {
        public void Compose(Composition composition)
        {
            composition.Components().Append<NodeRestrictBootstrapper>();
        }
    }

    public class NodeRestrictBootstrapper : IComponent
    {
        private readonly ILogger _logger;
       

        public NodeRestrictBootstrapper(ILogger logger)
        {
            _logger = logger;
        
        }

        public void Initialize()
        {
            ContentService.Publishing += ContentService_Publishing; 
        }

        private void ContentService_Publishing(IContentService sender, ContentPublishingEventArgs e)
        {         
            Result result = null;

            foreach (IContent node in e.PublishedEntities)
            {
                //This is where the magic happens. Unicorns. Free burgers. 
                result = Restrictor.Instance.Run(node);
            }

            //No rule applied, as you were.
            if (result == null) { return; }

            //If a result has come back, see if limit has been reached or not.
            if (result.LimitReached)
            {
                var rmm = new RuleMessageManager(result.Rule);
                //Show limit reached message to warn user that he/she has no hope of ever publishing another node.
                e.CancelOperation(new EventMessage(rmm.GetMessageCategory(), rmm.GetMessage(), EventMessageType.Error));
            }
            else if (result.Rule.ShowWarnings)
            {
                var rmm = new RuleMessageManager(result.Rule);
                //Show warning message to let the user know how many nodes can still be published.
                e.Messages.Add(new EventMessage(rmm.GetWarningMessageCategory(), rmm.GetWarningMessage(result.NodeCount), EventMessageType.Warning));
            }
        }

        public void Terminate()
        {
        }
    }

      
}
