namespace DotSee.Discipline.Backoffice
{
    public class DisciplineSettingsResolver : IDisciplineSettingsResolver
    {
        private readonly IDisciplineSettingsStore _store;
        private readonly IDisciplineAppSettingsReader _reader;

        public DisciplineSettingsResolver(
            IDisciplineSettingsStore store,
            IDisciplineAppSettingsReader reader)
        {
            _store = store;
            _reader = reader;
        }

        public AutoNodeFeatureSettings GetAutoNode() => UseBackoffice()
            ? Active(_store.Load().AutoNode)
            : _reader.Read().AutoNode;

        public NodeRestrictFeatureSettings GetNodeRestrict() => UseBackoffice()
            ? Active(_store.Load().NodeRestrict)
            : _reader.Read().NodeRestrict;

        public NodeProtectFeatureSettings GetNodeProtect() => UseBackoffice()
            ? Active(_store.Load().NodeProtect)
            : _reader.Read().NodeProtect;

        public VirtualNodesFeatureSettings GetVirtualNodes() => UseBackoffice()
            ? Active(_store.Load().VirtualNodes)
            : _reader.Read().VirtualNodes;

        public VariantsHiderFeatureSettings GetVariantsHider() => UseBackoffice()
            ? Active(_store.Load().VariantsHider)
            : _reader.Read().VariantsHider;

        public PropertyVersionsFeatureSettings GetPropertyVersions() => UseBackoffice()
            ? Active(_store.Load().PropertyVersions)
            : _reader.Read().PropertyVersions;

        public AiSummaryFeatureSettings GetAiSummary() => UseBackoffice()
            ? Active(_store.Load().AiSummary)
            : _reader.Read().AiSummary;

        public void NotifySettingsChanged()
        {
            // The store invalidates its own cache inside Save(). Nothing else to do here —
            // feature providers delegate directly to this resolver without caching.
        }

        private bool UseBackoffice() => _store.Load().UseBackoffice;

        // When the master toggle is on but a feature is disabled, return an empty shell so
        // downstream services behave as if the feature is off.
        private static AutoNodeFeatureSettings Active(AutoNodeFeatureSettings s) =>
            s.Enabled ? s : new AutoNodeFeatureSettings();

        private static NodeRestrictFeatureSettings Active(NodeRestrictFeatureSettings s) =>
            s.Enabled ? s : new NodeRestrictFeatureSettings();

        private static NodeProtectFeatureSettings Active(NodeProtectFeatureSettings s) =>
            s.Enabled ? s : new NodeProtectFeatureSettings();

        private static VirtualNodesFeatureSettings Active(VirtualNodesFeatureSettings s) =>
            s.Enabled ? s : new VirtualNodesFeatureSettings();

        private static VariantsHiderFeatureSettings Active(VariantsHiderFeatureSettings s) =>
            s.Enabled ? s : new VariantsHiderFeatureSettings { Caption = s.Caption };

        private static PropertyVersionsFeatureSettings Active(PropertyVersionsFeatureSettings s) =>
            s.Enabled ? s : new PropertyVersionsFeatureSettings();

        private static AiSummaryFeatureSettings Active(AiSummaryFeatureSettings s) =>
            s.Enabled ? s : new AiSummaryFeatureSettings();
    }
}
