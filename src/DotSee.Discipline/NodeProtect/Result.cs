using Umbraco.Cms.Core.Models;

namespace DotSee.Discipline.NodeProtect
{
    /// <summary>
    /// Holds the result after checking a rule against a node
    /// </summary>
    public class Result
    {
        /// <summary>
        /// The rule that was checked
        /// </summary>
        public Rule Rule { get; private set; }

        /// <summary>
        /// The ID of the node that was checked against the rule
        /// </summary>
        public int NodeId { get; private set; }

        /// <summary>
        /// The name of the node that was checked against the rule
        /// </summary>
        public string NodeName { get; private set; }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="rule"></param>
        private Result(Rule rule, IContent node)
        {
            Rule = rule;
            NodeId = node.Id;
            NodeName = node.Name;
        }

        /// <summary>
        /// Gets a Result object
        /// </summary>
        /// <returns></returns>
        public static Result GetResult(Rule rule, IContent node)
        {
            return new Result(rule, node);
        }
    }
}
