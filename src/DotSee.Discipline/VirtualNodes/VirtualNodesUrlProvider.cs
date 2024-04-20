using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace DotSee.Discipline.VirtualNodes
{
    public class VirtualNodesUrlProvider : DefaultUrlProvider
    {
        private readonly GlobalSettings _globalSettings;
        private readonly VirtualNodesRuleManager _virtualNodesRuleManager;
        private readonly IUmbracoContextFactory _umbContextFactory;

        public VirtualNodesUrlProvider(IOptionsMonitor<RequestHandlerSettings> requestSettings, ILogger<DefaultUrlProvider> logger, ISiteDomainMapper siteDomainMapper, IUmbracoContextAccessor umbracoContextAccessor, UriUtility uriUtility, ILocalizationService localizationService, IOptions<GlobalSettings> globalSettings, VirtualNodesRuleManager virtualNodesRuleManager, IUmbracoContextFactory umbContextFactory) : base(requestSettings, logger, siteDomainMapper, umbracoContextAccessor, uriUtility, localizationService)
        {
            _globalSettings = globalSettings.Value;
            _virtualNodesRuleManager = virtualNodesRuleManager;
            _umbContextFactory = umbContextFactory;
        }

        public override UrlInfo GetUrl(IPublishedContent content, UrlMode mode, string culture, Uri current)
        {
            //Just in case
            if (content == null) { return null; }

            //If this is a virtual node itself, no need to handle it - should return normal URL
            bool hasVirtualNodeInPath = false;
            foreach (IPublishedContent item in content.Ancestors()) //.Union(content.Children())
            {
                if (item.IsVirtualNode(_virtualNodesRuleManager))
                {
                    hasVirtualNodeInPath = true;
                    break;
                }
            }
            using (var umb = _umbContextFactory.EnsureUmbracoContext())
            {
                var _urlInfo = hasVirtualNodeInPath ? ConstructUrl(umb.UmbracoContext, content.Id, current, mode, content, culture) : null;
                return _urlInfo;
            }
        }

        private UrlInfo ConstructUrl(IUmbracoContext umbracoContext, int id, Uri current, UrlMode mode, IPublishedContent content, string culture)
        {
            string path = content.Path;

            //Keep path items in par with path segments in url
            //If we are hiding the top node from path, then we'll have to skip one path item (the root). 
            //If we are not, then we'll have to skip two path items (root and home)
            int pathItemsToSkip = (_globalSettings.HideTopLevelNodeFromPath == true) ? 2 : 1;

            //Get the path ids but skip what's needed in order to have the same number of elements in url and path ids.
            string[] pathIds = path.Split(',').Skip(pathItemsToSkip).Reverse().ToArray();

            //Get the default url 
            //DO NOT USE THIS - RECURSES: string url = content.Url;
            //https://our.umbraco.org/forum/developers/extending-umbraco/73533-custom-url-provider-stackoverflowerror
            //https://our.umbraco.org/forum/developers/extending-umbraco/66741-iurlprovider-cannot-evaluate-expression-because-the-current-thread-is-in-a-stack-overflow-state
            string url = null;
            try
            {
                url = base.GetUrl(content, mode, culture, current).Text;
            }
            catch (NullReferenceException ex)
            {
                return null;
            }
            //If we come from an absolute URL, strip the host part and keep it so that we can append
            //it again when returing the URL. 
            string hostPart = "";
            if (url.StartsWith("http"))
            {
                Uri u = new Uri(url);
                url = url.Replace(u.GetLeftPart(UriPartial.Authority), "");
                hostPart = u.GetLeftPart(UriPartial.Authority);
            }

            //Strip leading and trailing slashes 
            if ((url.EndsWith("/")))
            {
                url = url.Substring(0, url.Length - 1);
            }
            if ((url.StartsWith("/")))
            {
                url = url.Substring(1, url.Length - 1);
            }

            //Now split the url. We should have as many elements as those in pathIds.
            string[] urlParts = url.Split('/').Reverse().ToArray();

            //Iterate the url parts. Check the corresponding path id and if the document that corresponds there
            //is of a type that must be excluded from the path, just make that url part an empty string.
            int cnt = 0;
            foreach (string p in urlParts)
            {
                if (cnt + 1 > pathIds.Length)
                {
                    cnt++;
                    continue;
                }
                IPublishedContent currItem = umbracoContext.Content.GetById(int.Parse(pathIds[cnt]));

                //Omit any virtual node unless it's leaf level (we still need this otherwise it will be pointing to parent's URL)
                if (currItem.IsVirtualNode(_virtualNodesRuleManager) && cnt > 0)
                {
                    urlParts[cnt] = "";
                }
                cnt++;
            }

            //Reconstruct the url, leaving out all parts that we emptied above. This 
            //will be our final url, without the parts that correspond to excluded nodes.
            string finalUrl = string.Join("/", urlParts.Reverse().Where(x => x != "").ToArray());

            //Just in case - check if there are trailing and leading slashes and add them if not.
            if (!(finalUrl.EndsWith("/")))
            {
                finalUrl += "/";
            }
            if (!(finalUrl.StartsWith("/")))
            {
                finalUrl = "/" + finalUrl;
            }

            finalUrl = string.Concat(hostPart, finalUrl);
            var _urlInfo = new UrlInfo(finalUrl, true, culture);

            //Voila.
            return _urlInfo;
        }
    }
}
