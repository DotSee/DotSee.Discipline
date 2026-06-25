using System;

namespace DotSee.Discipline.Backoffice
{
    /// <summary>
    /// Central decider for where each feature's settings come from: the backoffice store
    /// (when the master toggle is on and the feature is enabled) or appsettings.json.
    /// </summary>
    public interface IDisciplineSettingsResolver
    {
        AutoNodeFeatureSettings GetAutoNode();

        NodeRestrictFeatureSettings GetNodeRestrict();

        NodeProtectFeatureSettings GetNodeProtect();

        VirtualNodesFeatureSettings GetVirtualNodes();

        VariantsHiderFeatureSettings GetVariantsHider();

        PropertyVersionsFeatureSettings GetPropertyVersions();

        AiSummaryFeatureSettings GetAiSummary();

        /// <summary>
        /// Raised after <see cref="NotifySettingsChanged"/> fires. Feature services that
        /// cache rules or settings should subscribe and invalidate their caches.
        /// </summary>
        event Action SettingsChanged;

        /// <summary>
        /// Invalidates any caches held by feature-level providers so the next read
        /// reflects the latest stored / config values.
        /// </summary>
        void NotifySettingsChanged();
    }
}
