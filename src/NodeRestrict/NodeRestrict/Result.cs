using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Web.Models;

namespace DotSee.NodeRestrict
{
    /// <summary>
    /// Holds the result after checking a rule against a node
    /// </summary>
    public class Result
    {
        /// <summary>
        /// The count of nodes found at the time of checking. Applies to child node doctypes defined by the rule
        /// </summary>
        public int NodeCount { get; private set; }
        
        /// <summary>
        /// The rule that was checked
        /// </summary>
        public Rule Rule { get; private set; }

        /// <summary>
        /// Returns true if the max number of allowed nodes (as defined by the rule) has been reached.
        /// </summary>
        public bool LimitReached { get { return (NodeCount >= Rule.MaxNodes); } }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="nodeCount"></param>
        /// <param name="rule"></param>
        private Result(int nodeCount, Rule rule)
        {
            NodeCount = nodeCount;
            Rule = rule;
        }

        /// <summary>
        /// Gets a Result object
        /// </summary>
        /// <param name="nodeCount">The count of nodes found at the time of checking. Applies to child node doctypes defined by the rule</param>
        /// <param name="rule">The rule that was checked</param>
        /// <returns></returns>
        public static Result GetResult(int nodeCount, Rule rule) {
            return new Result(nodeCount,rule);
        }
    }

}
