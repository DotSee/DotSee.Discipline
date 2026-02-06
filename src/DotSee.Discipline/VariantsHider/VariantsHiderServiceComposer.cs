// NOTE: In Umbraco v14+, the VariantsHider functionality has been moved to the client side.
// No composer is needed anymore as the extension is registered via the umbraco-package.json manifest.
// See the Client folder for the TypeScript implementation.

namespace DotSee.Discipline.VariantsHider
{
    /// <summary>
    /// In Umbraco v14+, no composer is needed for VariantsHider.
    /// The backoffice extension is automatically discovered via umbraco-package.json.
    /// </summary>
    /// <remarks>
    /// The old v13 implementation registered MenuRenderingNotification handler here.
    /// In v14+, client-side extensions are discovered from App_Plugins folders
    /// containing umbraco-package.json files.
    /// </remarks>
    public static class VariantsHiderComposerInfo
    {
        public const string Note = "No composer needed in v14+ - extensions are discovered via umbraco-package.json";
    }
}