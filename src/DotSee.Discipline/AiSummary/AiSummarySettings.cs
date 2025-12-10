namespace DotSee.Discipline.AiSummary
{
    public class AiSummarySettings
    {
        private List<string> _docTypesList = new();
        private List<string> _excludePropertiesList = new();

        public string Llm { get; set; }
        public string PropertyAlias { get; set; }
        public string ApiKey { get; set; }
        public string TogglePropertyAlias { get; set; }
        public string DocTypes { get; set; }
        public string ExcludeProperties { get; set; }
        public string Model { get; set; } = "gpt-5-nano";
        public int MaxChars { get; set; } = 150;
        public string Tone { get; set; } = "Use a professional tone.";
        public List<string> DocTypesList
        {
            get
            {
                if (_docTypesList.Count == 0 && DocTypes != null)
                {
                    _docTypesList = DocTypes.Split(',').ToList();
                }
                return _docTypesList;
            }
        }
        public List<string> ExcludePropertiesList
        {
            get
            {
                if (_excludePropertiesList.Count == 0 && ExcludeProperties != null)
                {
                    _excludePropertiesList = ExcludeProperties.Split(',').ToList();
                }
                return _excludePropertiesList;
            }
        }
    }
}
