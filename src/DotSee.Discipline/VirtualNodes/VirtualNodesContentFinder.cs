using Microsoft.Extensions.Caching.Memory;
using Serilog;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace DotSee.Discipline.VirtualNodes
{
    public class VirtualNodesContentFinder : IContentFinder
    {
        private readonly IMemoryCache _memCache;
        private readonly IUmbracoContextAccessor _contextAccessor;
        private readonly ILogger _logger;
        private static readonly object _lock = new object();

        public VirtualNodesContentFinder(IMemoryCache memCache, IUmbracoContextAccessor contextAccessor, ILogger logger)
        {

            _memCache = memCache;
            _contextAccessor = contextAccessor;
            _logger = logger;
        }

        public Task<bool> TryFindContent(IPublishedRequestBuilder request)
        {
            //Exit early if no Umbraco Context
            if (!_contextAccessor.TryGetUmbracoContext(out var _umb))
            {
                return Task.FromResult(false);
            }

            //Get a cached dictionary of urls and node ids
            var cachedVirtualNodeUrls = _memCache.Get<Dictionary<string, int>>("cachedVirtualNodes");

            //Get the request path
            string path = request.AbsolutePathDecoded;

            // Ignore cache if backoffice save/publish
            if (!_umb.OriginalRequestUrl.AbsolutePath.Contains("/umbraco/backoffice/umbracoapi/content/postsave", StringComparison.OrdinalIgnoreCase))
            {
                //If found in the cached dictionary, get the node id from there
                if (cachedVirtualNodeUrls != null && cachedVirtualNodeUrls.TryGetValue(path, out var nodeId))
                {
                    //That's all folks
                    request.SetPublishedContent(_umb.Content?.GetById(nodeId));
                    return Task.FromResult(true);
                }
            }

            //If not found on the cached dictionary, traverse nodes and find the node that corresponds to the URL
            IPublishedContent item = null;
            var rootNodes = _umb.Content?.GetAtRoot(request.Culture);
            try
            {
                item = rootNodes
                ?.DescendantsOrSelf<IPublishedContent>(request.Culture)
                ?.FirstOrDefault(x =>
                {
                    var url = x.Url(request.Culture);
                    return url == path || url == (path + "/");
                });
            }
            catch (Exception ex)
            {
                _logger.Error(ex, $"Could not get content for URL '{request.Uri}'");
            }

            //If item is found, return it after adding it to the cache so we don't have to go through the same process again.
            if (item != null)
            {
                lock (_lock)
                {
                    cachedVirtualNodeUrls = _memCache.Get<Dictionary<string, int>>("cachedVirtualNodes") ?? new Dictionary<string, int>();

                    if (!cachedVirtualNodeUrls.ContainsKey(path))
                    {
                        //Add the new path and id to the dictionary so that we don't have to go through the tree again next time.
                        cachedVirtualNodeUrls.Add(path, item.Id);
                    }
                    else if (cachedVirtualNodeUrls[path] != item.Id)
                    {
                        // Update dictionary if path is a different node
                        cachedVirtualNodeUrls[path] = item.Id;
                    }

                    //Update cache
                    _memCache.Set("cachedVirtualNodes", cachedVirtualNodeUrls, new MemoryCacheEntryOptions
                    {
                        Priority = CacheItemPriority.High
                    });
                }

                //That's all folks
                request.SetPublishedContent(item);
                return Task.FromResult(true);
            }

            //Abandon all hope ye who enter here. This means that we didn't find a node so we return false to let
            //the next ContentFinder (if any) take over.
            return Task.FromResult(false);
        }
    }
}



