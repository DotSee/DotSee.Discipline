namespace DotSee.Discipline.MediaOrganize
{
    /// <summary>
    /// Holds rules for restricting node publishing.
    /// </summary>
    public class Rule
    {
        /// <summary>
        /// The parent document type alias
        /// </summary>
        public string DocumentGuid { get; set; }
        /// <summary>
        /// The child document type alias (that is, the document being published)
        /// </summary>


        public Rule()
        {

        }

        /// <summary>
        /// Holds the data for a node restriction rule.
        /// </summary>
        public Rule(
            string documentGuid)
        {
            DocumentGuid = documentGuid;
        }
    }
}
