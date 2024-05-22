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
        /// Constructor
        /// </summary>
        /// <param name="rule"></param>
        private Result(Rule rule)
        {
            Rule = rule;
        }

        /// <summary>
        /// Gets a Result object
        /// </summary>
        /// <returns></returns>
        public static Result GetResult(Rule rule)
        {
            return new Result(rule);
        }
    }
}
