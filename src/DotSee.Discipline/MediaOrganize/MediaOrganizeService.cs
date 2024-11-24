using DotSee.Discipline.Interfaces;
using Newtonsoft.Json;
using Serilog;
using System.Text.RegularExpressions;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace DotSee.Discipline.MediaOrganize
{


    /// <summary>
    /// Creates new nodes under a newly created node, according to a set of rules
    /// </summary>
    public class MediaOrganizeService
    {

        #region Private Members

        private readonly IContentService _cs;
        private readonly IRuleProviderService<IEnumerable<Rule>> _ruleProviderService;
        private readonly IContentTypeService _contentTypeService;
        private readonly IMediaService _mediaService;
        private List<Rule> _rules;
        private readonly ILogger _logger;

        #endregion

        #region Constructors

        public MediaOrganizeService(
            IContentService contentService
            , IContentTypeService contentTypeService
            , IMediaService mediaService
            , ILogger logger
            , IRuleProviderService<IEnumerable<Rule>> ruleProviderService
            )
        {
            _cs = contentService;
            _logger = logger;
            _ruleProviderService = ruleProviderService;
            _contentTypeService = contentTypeService;
            _mediaService = mediaService;
            ///Get rules from the config file. Any rules programmatically declared later on will be added too.

            _rules = _ruleProviderService.Rules.ToList();
        }

        #endregion

        #region Public Properties


        #endregion

        #region Public Methods

        /// <summary>
        /// Registers a new rule object 
        /// </summary>
        /// <param name="rule">The rule object</param>
        public void RegisterRule(Rule rule)
        {
            _rules.Add(rule);
        }

        /// <summary>
        /// Applies all rules on publishing a node. 
        /// </summary>
        /// <param name="node">The newly created node we need to apply rules for</param>
        public Result Run(IContent node)
        {
            //Get the parent node.
            var parent = _cs.GetById(node.ParentId);

            //If we are publishing a top-level node, skip the whole process.
            if (parent == null) { return null; }


            Result result = null;

            //If this part is reached, then we haven't found a "special" property at the parent node
            //and we are going to check the rules loaded from the config file.
            foreach (Rule rule in _rules)
            {
                //Check if rule applies
                result = CheckRule(rule, node);

                //Stop at the first rule that applies. 
                if (result != null) { break; }
            }

            return (result);
        }

        #endregion

        #region Private Methods

        /// <summary>
        /// Checks if a given rule applies to a given node
        /// </summary>
        /// <param name="rule">The rule</param>
        /// <param name="node">The node to check against the rule</param>
        /// <returns>Null if the rule does not apply to the node, or a Result object if it does.</returns>
        private Result CheckRule(Rule rule, IContent node, string culture = null)
        {
            if (!IsInPath(node, rule))
            {
                return null;
            }

            List<IMedia> media = new List<IMedia>();

            //foreach (var child in _cs.GetPagedDescendants(node.Id, 0, int.MaxValue, out long totalRecords))
            //{
            foreach (var img in GetImagesFromSerializedNode(node))
            {
                if (img == string.Empty) { continue; }
                var g = new Guid(img);
                media.Add(_mediaService.GetById(g));
            } //var images = GetImagesFromSerializedNode(child);
              //}

            return Result.GetResult(1, rule);
        }

        private IEnumerable<string> GetImagesFromSerializedNode(IContent node)
        {

            var s = JsonConvert.SerializeObject(node);
            Regex r = new Regex("\\\\\"mediaKey\\\\\":\\\\\"(.*?)\\\\\"");

            var matches = r.Matches(s);

            if (matches.Count == 0) { yield return string.Empty; }

            foreach (Match m in r.Matches(s))
            {
                var img = m.Groups[1].Value;
                yield return img;
            }
        }

        private bool IsInPath(IContent node, Rule rule)
        {
            if (node.Key.ToString().Equals(rule.DocumentGuid, comparisonType: StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
            foreach (var parent in _cs.GetAncestors(node.Id))
            {
                if (parent.Key.ToString().Equals(rule.DocumentGuid, comparisonType: StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
            return false;
        }

        //public void ClearRules()
        //{
        //    _rules.RemoveAll<Rule>(x => true);
        //    _rulesLoaded = false;
        //}
        #endregion
    }
}