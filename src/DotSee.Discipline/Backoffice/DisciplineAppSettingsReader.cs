using System;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace DotSee.Discipline.Backoffice
{
    public class DisciplineAppSettingsReader : IDisciplineAppSettingsReader
    {
        public const string RootSection = "DotSee.Discipline";

        private readonly IConfiguration _configuration;
        private readonly ILogger _logger;

        public DisciplineAppSettingsReader(IConfiguration configuration, ILogger logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public bool HasAppSettings()
        {
            var section = _configuration.GetSection(RootSection);
            return section != null && section.Exists();
        }

        public DisciplineSettings Read()
        {
            var result = new DisciplineSettings();

            if (!HasAppSettings())
            {
                return result;
            }

            TryBind($"{RootSection}:AutoNode", result.AutoNode, section =>
            {
                var settingsSection = section.GetSection("Settings");
                if (settingsSection.Exists())
                {
                    result.AutoNode.LogLevel = settingsSection.GetValue<string>("LogLevel") ?? result.AutoNode.LogLevel;
                    result.AutoNode.RepublishExistingNodes = settingsSection.GetValue<bool>("RepublishExistingNodes");
                }
                var rulesSection = section.GetSection("Rules");
                if (rulesSection.Exists())
                {
                    rulesSection.Bind(result.AutoNode.Rules);
                }
                result.AutoNode.Enabled = true;
            });

            TryBind($"{RootSection}:NodeRestrict", result.NodeRestrict, section =>
            {
                var settingsSection = section.GetSection("Settings");
                if (settingsSection.Exists())
                {
                    result.NodeRestrict.PropertyAlias = settingsSection.GetValue<string>("PropertyAlias") ?? string.Empty;
                    result.NodeRestrict.ShowWarnings = settingsSection.GetValue<bool>("ShowWarnings");
                }
                var rulesSection = section.GetSection("Rules");
                if (rulesSection.Exists())
                {
                    rulesSection.Bind(result.NodeRestrict.Rules);
                }
                result.NodeRestrict.Enabled = true;
            });

            TryBind($"{RootSection}:NodeProtect", result.NodeProtect, section =>
            {
                var settingsSection = section.GetSection("Settings");
                if (settingsSection.Exists())
                {
                    result.NodeProtect.PropertyAlias = settingsSection.GetValue<string>("PropertyAlias") ?? string.Empty;
                }
                var rulesSection = section.GetSection("Rules");
                if (rulesSection.Exists())
                {
                    rulesSection.Bind(result.NodeProtect.Rules);
                }
                result.NodeProtect.Enabled = true;
            });

            TryBind($"{RootSection}:VirtualNodes", result.VirtualNodes, section =>
            {
                var rulesSection = section.GetSection("Rules");
                if (rulesSection.Exists())
                {
                    rulesSection.Bind(result.VirtualNodes.Rules);
                }
                result.VirtualNodes.Enabled = true;
            });

            TryBind($"{RootSection}:VariantsHider", result.VariantsHider, section =>
            {
                section.Bind(result.VariantsHider);
                result.VariantsHider.Enabled = section.GetValue<bool?>("Enabled") ?? true;
            });

            TryBind($"{RootSection}:PropertyVersions", result.PropertyVersions, section =>
            {
                section.Bind(result.PropertyVersions);
                result.PropertyVersions.Enabled = section.GetValue<bool?>("Enabled") ?? true;
            });

            TryBind($"{RootSection}:AiSummary", result.AiSummary, section =>
            {
                section.Bind(result.AiSummary);
                result.AiSummary.Enabled = true;
            });

            return result;
        }

        private void TryBind(string key, object target, Action<IConfigurationSection> binder)
        {
            try
            {
                var section = _configuration.GetSection(key);
                if (!section.Exists())
                {
                    return;
                }
                binder(section);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to read DotSee.Discipline section {Key} from appsettings.", key);
            }
        }
    }
}
