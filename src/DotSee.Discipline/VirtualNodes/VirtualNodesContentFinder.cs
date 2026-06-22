using DotSee.Discipline.Backoffice;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace DotSee.Discipline.VirtualNodes
{
    public class VirtualNodesContentFinder : IContentFinder, IDisposable
    {
        private const string CacheKey = "cachedVirtualNodes";

        private readonly IMemoryCache _memCache;
        private readonly IUmbracoContextAccessor _contextAccessor;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly ILogger _logger;
        private readonly IDisciplineSettingsResolver _settingsResolver;

        public VirtualNodesContentFinder(IMemoryCache memCache, IUmbracoContextAccessor contextAccessor, IServiceScopeFactory serviceScopeFactory, ILogger logger, IDisciplineSettingsResolver settingsResolver)
        {
            _memCache = memCache;
            _contextAccessor = contextAccessor;
            _serviceScopeFactory = serviceScopeFactory;
            _logger = logger;
            _settingsResolver = settingsResolver;

            // Backoffice saves drop the cached URL->nodeId map so that enabling/disabling the
            // feature (or editing rules) takes effect immediately, without an app restart.
            _settingsResolver.SettingsChanged += OnSettingsChanged;
        }

        private void OnSettingsChanged() => _memCache.Remove(CacheKey);

        public void Dispose()
        {
            _settingsResolver.SettingsChanged -= OnSettingsChanged;
        }

        public Task<bool> TryFindContent(IPublishedRequestBuilder request)
        {
            //Exit early if no Umbraco Context
            if (!_contextAccessor.TryGetUmbracoContext(out var _umb))
            {
                return Task.FromResult(false);
            }

            //Get a cached dictionary of urls and node ids
            var cachedVirtualNodeUrls = _memCache.Get<Dictionary<string, int>>(CacheKey);

            //Get the request path
            string path = request.AbsolutePathDecoded;

            // Ignore cache if backoffice save/publish
            if (!_umb.OriginalRequestUrl.AbsolutePath.ToLower().Contains("/umbraco/backoffice/umbracoapi/content/postsave"))
            {
                //If found in the cached dictionary, get the node id from there
                if (cachedVirtualNodeUrls != null && cachedVirtualNodeUrls.ContainsKey(path))
                {
                    //That's all folks
                    int nodeId = cachedVirtualNodeUrls[path];
                    request.SetPublishedContent(_umb.Content?.GetById(nodeId));
                    return Task.FromResult(true);
                }
            }

            //If not found on the cached dictionary, traverse nodes and find the node that corresponds to the URL
            IPublishedContent item = null;
            try
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var publishedContentQuery = scope.ServiceProvider.GetRequiredService<IPublishedContentQuery>();
                var rootNodes = publishedContentQuery.ContentAtRoot();
                
                item = rootNodes
                ?.DescendantsOrSelf<IPublishedContent>(request.Culture)
                ?.Where(x => x.Url(request.Culture) == (path + "/") || x.Url(request.Culture) == path)
                .FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.Error(ex, string.Format("Could not get content for URL '{0}'", request.Uri.ToString()));
            }

            //If item is found, return it after adding it to the cache so we don't have to go through the same process again.
            if (cachedVirtualNodeUrls == null) { cachedVirtualNodeUrls = new Dictionary<string, int>(); }

            //If we have found a node that corresponds to the URL given
            if (item != null)
            {
                //This check is redundant, but better to be on the safe side.
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
                _memCache.Set(CacheKey, cachedVirtualNodeUrls, new MemoryCacheEntryOptions
                {
                    Priority = CacheItemPriority.High
                });

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



