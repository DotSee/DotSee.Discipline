using System.Collections.Generic;

namespace DotSee.Discipline.Backoffice
{
    public class AutoNodeFeatureSettings
    {
        public bool Enabled { get; set; }
        public string LogLevel { get; set; } = "Normal";
        public bool RepublishExistingNodes { get; set; }
        public List<AutoNodeRuleDto> Rules { get; set; } = new();
    }

    public class AutoNodeRuleDto
    {
        public string CreatedDocTypeAlias { get; set; }
        public string DocTypeAliasToCreate { get; set; }
        public string NodeName { get; set; }
        public bool BringNewNodeFirst { get; set; }
        public bool OnlyCreateIfNoChildren { get; set; }
        public bool CreateIfExistsWithDifferentName { get; set; }
        public string DictionaryItemForName { get; set; } = string.Empty;
        public bool KeepNewNodeUnpublished { get; set; }
        public string Blueprint { get; set; } = string.Empty;
    }

    public class NodeRestrictFeatureSettings
    {
        public bool Enabled { get; set; }
        public string PropertyAlias { get; set; } = string.Empty;
        public bool ShowWarnings { get; set; }
        public List<NodeRestrictRuleDto> Rules { get; set; } = new();
    }

    public class NodeRestrictRuleDto
    {
        public string ParentDocType { get; set; }
        public string ChildDocType { get; set; }
        public int MaxNodes { get; set; }
        public bool ShowWarnings { get; set; }
        public string CustomMessage { get; set; } = string.Empty;
        public string CustomMessageCategory { get; set; } = string.Empty;
        public string CustomWarningMessage { get; set; } = string.Empty;
        public string CustomWarningMessageCategory { get; set; } = string.Empty;
    }

    public class NodeProtectFeatureSettings
    {
        public bool Enabled { get; set; }
        public string PropertyAlias { get; set; } = string.Empty;
        public List<NodeProtectRuleDto> Rules { get; set; } = new();
    }

    public class NodeProtectRuleDto
    {
        public string DocTypeAlias { get; set; } = string.Empty;
        public string DocumentGuids { get; set; } = string.Empty;
        public string CustomMessage { get; set; } = string.Empty;
        public string CustomMessageCategory { get; set; } = string.Empty;
    }

    public class VirtualNodesFeatureSettings
    {
        public bool Enabled { get; set; }
        public List<string> Rules { get; set; } = new();
    }

    public class VariantsHiderFeatureSettings
    {
        public bool Enabled { get; set; }
        public string Caption { get; set; } = string.Empty;
    }

    public class PropertyVersionsFeatureSettings
    {
        public bool Enabled { get; set; }
        public string NextVersionButtonCaptionDictionaryEntry { get; set; } = string.Empty;
        public string PreviousVersionButtonCaptionDictionaryEntry { get; set; } = string.Empty;
        public string NoVersionsButtonCaptionDictionaryEntry { get; set; } = string.Empty;
    }

    public class AiSummaryFeatureSettings
    {
        public bool Enabled { get; set; }
        public string Llm { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int MaxChars { get; set; } = 150;
        public string Tone { get; set; } = string.Empty;
        public string DocTypes { get; set; } = string.Empty;
        public string ExcludeProperties { get; set; } = string.Empty;
        public string PropertyAlias { get; set; } = string.Empty;
        public string TogglePropertyAlias { get; set; } = string.Empty;
    }
}
