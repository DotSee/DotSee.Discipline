namespace DotSee.Discipline.Backoffice
{
    /// <summary>
    /// Master DTO representing all DotSee.Discipline settings. Shared between the JSON
    /// file store, the appsettings reader and the management API.
    /// </summary>
    public class DisciplineSettings
    {
        /// <summary>
        /// Master toggle. When true, settings are loaded from this model (the backoffice store).
        /// When false, settings are loaded from appsettings.json and the backoffice UI is read-only.
        /// </summary>
        public bool UseBackoffice { get; set; }

        public AutoNodeFeatureSettings AutoNode { get; set; } = new();
        public NodeRestrictFeatureSettings NodeRestrict { get; set; } = new();
        public NodeProtectFeatureSettings NodeProtect { get; set; } = new();
        public VirtualNodesFeatureSettings VirtualNodes { get; set; } = new();
        public VariantsHiderFeatureSettings VariantsHider { get; set; } = new();
        public PropertyVersionsFeatureSettings PropertyVersions { get; set; } = new();
        public AiSummaryFeatureSettings AiSummary { get; set; } = new();
    }
}
