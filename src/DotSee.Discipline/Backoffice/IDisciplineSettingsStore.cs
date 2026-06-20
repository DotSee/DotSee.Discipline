namespace DotSee.Discipline.Backoffice
{
    public interface IDisciplineSettingsStore
    {
        /// <summary>
        /// Loads the currently persisted settings from disk. If no file exists yet, returns
        /// a fresh <see cref="DisciplineSettings"/> with all features disabled.
        /// </summary>
        DisciplineSettings Load();

        /// <summary>
        /// Persists the provided settings to disk.
        /// </summary>
        void Save(DisciplineSettings settings);
    }
}
