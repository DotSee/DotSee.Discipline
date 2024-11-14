

namespace DotSee.Discipline.MediaOrganize
{
    /// <summary>
    /// Holds the result after checking a rule against a node
    /// </summary>
    public class Result
    {
        /// <summary>
        /// The count of nodes found at the time of checking. Applies to child node doctypes defined by the rule
        /// </summary>
        public int MediaCount { get; private set; }

        /// <summary>
        /// The rule that was checked
        /// </summary>
        public Rule Rule { get; private set; }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="nodeCount"></param>
        /// <param name="rule"></param>
        private Result(int mediaCount, Rule rule)
        {
            MediaCount = mediaCount;
            Rule = rule;
        }

        /// <summary>
        /// Gets a Result object
        /// </summary>
        /// <param name="nodeCount">The count of nodes found at the time of checking. Applies to child node doctypes defined by the rule</param>
        /// <param name="rule">The rule that was checked</param>
        /// <returns></returns>
        public static Result GetResult(int mediaCount, Rule rule)
        {
            return new Result(mediaCount, rule);
        }
    }

}
