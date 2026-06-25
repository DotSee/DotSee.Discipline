namespace DotSee.Discipline.Backoffice
{
    public interface IDisciplineAppSettingsReader
    {
        /// <summary>
        /// True when the root DotSee.Discipline section is present in appsettings.json.
        /// When false, the backoffice UI hides the "use backoffice" switch and the
        /// "load from appsettings" button.
        /// </summary>
        bool HasAppSettings();

        /// <summary>
        /// Builds a <see cref="DisciplineSettings"/> instance from appsettings.json.
        /// Returns an empty instance if the section is missing. The per-feature Enabled
        /// flag reflects whether the feature's sub-section is present.
        /// </summary>
        DisciplineSettings Read();
    }
}
