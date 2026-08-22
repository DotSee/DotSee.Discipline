export interface AutoNodeRuleDto {
  createdDocTypeAlias: string;
  docTypeAliasToCreate: string;
  nodeName: string;
  bringNewNodeFirst: boolean;
  onlyCreateIfNoChildren: boolean;
  createIfExistsWithDifferentName: boolean;
  dictionaryItemForName: string;
  keepNewNodeUnpublished: boolean;
  blueprint: string;
}

export interface AutoNodeFeatureSettings {
  enabled: boolean;
  logLevel: string;
  republishExistingNodes: boolean;
  rules: AutoNodeRuleDto[];
}

export interface NodeRestrictRuleDto {
  parentDocType: string;
  /** When true the rule applies at the content tree root and parentDocType is ignored. */
  atRoot: boolean;
  childDocType: string;
  maxNodes: number;
  showWarnings: boolean;
  customMessage: string;
  customMessageCategory: string;
  customWarningMessage: string;
  customWarningMessageCategory: string;
}

export interface NodeRestrictFeatureSettings {
  enabled: boolean;
  propertyAlias: string;
  showWarnings: boolean;
  rules: NodeRestrictRuleDto[];
}

export interface NodeProtectRuleDto {
  docTypeAlias: string;
  documentGuids: string;
  customMessage: string;
  customMessageCategory: string;
}

export interface NodeProtectFeatureSettings {
  enabled: boolean;
  propertyAlias: string;
  rules: NodeProtectRuleDto[];
}

export interface VirtualNodesFeatureSettings {
  enabled: boolean;
  rules: string[];
}

export interface VariantsHiderFeatureSettings {
  enabled: boolean;
  caption: string;
}

export interface PropertyVersionsFeatureSettings {
  enabled: boolean;
  nextVersionButtonCaptionDictionaryEntry: string;
  previousVersionButtonCaptionDictionaryEntry: string;
  noVersionsButtonCaptionDictionaryEntry: string;
}

export interface AiSummaryFeatureSettings {
  enabled: boolean;
  llm: string;
  apiKey: string;
  model: string;
  maxChars: number;
  tone: string;
  docTypes: string;
  excludeProperties: string;
  propertyAlias: string;
  togglePropertyAlias: string;
}

export interface DisciplineSettings {
  useBackoffice: boolean;
  autoNode: AutoNodeFeatureSettings;
  nodeRestrict: NodeRestrictFeatureSettings;
  nodeProtect: NodeProtectFeatureSettings;
  virtualNodes: VirtualNodesFeatureSettings;
  variantsHider: VariantsHiderFeatureSettings;
  propertyVersions: PropertyVersionsFeatureSettings;
  aiSummary: AiSummaryFeatureSettings;
}

export interface DisciplineSettingsResponse {
  uiEnabled: boolean;
  hasAppSettings: boolean;
  settings: DisciplineSettings;
}

export interface DocTypeOption {
  name: string;
  alias: string;
}

export interface PropertyOption {
  name: string;
  alias: string;
}

export interface BlueprintOption {
  name: string;
  docTypeAlias: string;
}

export interface AiModelListResult {
  models: string[];
  defaultModel: string;
}

export const DISCIPLINE_SETTINGS_ENTITY_TYPE = 'dotsee-discipline-settings';
export const DISCIPLINE_SETTINGS_ROOT_UNIQUE = 'root';

export function createEmptyAutoNodeRule(): AutoNodeRuleDto {
  return {
    createdDocTypeAlias: '',
    docTypeAliasToCreate: '',
    nodeName: '',
    bringNewNodeFirst: false,
    onlyCreateIfNoChildren: false,
    createIfExistsWithDifferentName: true,
    dictionaryItemForName: '',
    keepNewNodeUnpublished: false,
    blueprint: '',
  };
}

export function createEmptyNodeRestrictRule(): NodeRestrictRuleDto {
  return {
    parentDocType: '',
    atRoot: false,
    childDocType: '*',
    maxNodes: 1,
    showWarnings: true,
    customMessage: '',
    customMessageCategory: '',
    customWarningMessage: '',
    customWarningMessageCategory: '',
  };
}

export function createEmptyNodeProtectRule(): NodeProtectRuleDto {
  return {
    docTypeAlias: '',
    documentGuids: '',
    customMessage: '',
    customMessageCategory: '',
  };
}
