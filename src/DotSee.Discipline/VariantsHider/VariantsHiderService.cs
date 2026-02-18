// NOTE: In Umbraco v14+, the VariantsHider functionality has been moved to the client side.
// The context menu item is now registered via a TypeScript entity action extension.
// See the Client folder for the TypeScript implementation.
//
// This file is kept for reference of the v13 implementation which used MenuRenderingNotification.
// The API controller (VariantsHiderApiController) still provides the configuration settings
// to the client-side extension.

namespace DotSee.Discipline.VariantsHider
{
    /// <summary>
    /// In Umbraco v14+, the VariantsHider menu injection is handled entirely on the client side.
    /// This class is no longer needed as the entity action is registered via TypeScript.
    /// Configuration is provided via the VariantsHiderApiController.
    /// </summary>
    /// <remarks>
    /// The old v13 implementation used MenuRenderingNotification to add a context menu item
    /// that would call a JavaScript function. In v14+, this is replaced by:
    /// - TypeScript entity action extensions
    /// - A client-side service that manipulates the DOM
    /// </remarks>
    public static class VariantsHiderServiceInfo
    {
        public const string Version = "2.0.0";
        public const string Description = "Hides unset language variants from the content tree in multilingual setups.";
    }
}
