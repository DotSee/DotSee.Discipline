export default {
  // ────────────────────────────────────────────────────────────────────
  // Common / shared
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_common_save: 'Save',
  dotseeDiscipline_common_remove: 'Remove',
  dotseeDiscipline_common_enable: 'Enable',
  dotseeDiscipline_common_disable: 'Disable',
  dotseeDiscipline_common_help: 'Help',
  dotseeDiscipline_common_addRule: 'Add rule',
  dotseeDiscipline_common_addRuleButton: '+ Add rule',
  dotseeDiscipline_common_rules: 'Rules',
  dotseeDiscipline_common_ruleNumber: 'Rule %0%',
  dotseeDiscipline_common_noRulesDefined: 'No rules defined.',
  dotseeDiscipline_common_noEntries: 'No entries.',
  dotseeDiscipline_common_expandRule: 'Expand rule',
  dotseeDiscipline_common_collapseRule: 'Collapse rule',
  dotseeDiscipline_common_dragToReorder: 'Drag to reorder',
  dotseeDiscipline_common_showList: 'Show list',
  dotseeDiscipline_common_hideList: 'Hide list',
  dotseeDiscipline_common_selectedCount: '(%0% selected)',
  dotseeDiscipline_common_filterAll: 'All',
  dotseeDiscipline_common_filterSelectedOnly: 'Selected only',
  dotseeDiscipline_common_notFoundSuffix: 'not found',
  dotseeDiscipline_common_selectPlaceholder: '-- Select --',
  dotseeDiscipline_common_selectDoctypeFirstPlaceholder: '-- Select a doctype first --',
  dotseeDiscipline_common_noBlueprintsPlaceholder: '-- No blueprints available --',
  dotseeDiscipline_common_anyDoctype: 'Any doctype',
  dotseeDiscipline_common_anyDoctypeLowercase: 'any',

  // ────────────────────────────────────────────────────────────────────
  // Backoffice settings workspace
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_settings_headline: 'DotSee Discipline Settings',
  dotseeDiscipline_settings_sourceHeadline: 'Settings source',
  dotseeDiscipline_settings_noAppsettingsFound:
    'No DotSee.Discipline section was found in appsettings.json. All configuration is managed from this screen.',
  dotseeDiscipline_settings_manageFromBackoffice: 'Manage settings from the backoffice',
  dotseeDiscipline_settings_loadFromAppsettings: 'Load from appsettings.json',
  dotseeDiscipline_settings_importConfirmContent:
    'This will replace every field in this page with the values from appsettings.json. Your current backoffice settings will be lost. Continue?',
  dotseeDiscipline_settings_importConfirmLabel: 'Load from appsettings',
  dotseeDiscipline_settings_loadedToast: 'Loaded from appsettings.json.',
  dotseeDiscipline_settings_savedToast: 'Settings saved.',
  dotseeDiscipline_settings_loadFailedToast: 'Could not load settings: %0%',
  dotseeDiscipline_settings_importFailedToast: 'Import failed: %0%',
  dotseeDiscipline_settings_saveFailedToast: 'Save failed: %0%',

  // ────────────────────────────────────────────────────────────────────
  // Menu / sidebar
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_menu_label: 'DotSee Discipline',
  dotseeDiscipline_menu_itemLabel: 'Discipline',

  // ────────────────────────────────────────────────────────────────────
  // AutoNode
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_autoNode_label: 'AutoNode',
  dotseeDiscipline_autoNode_description:
    'Automatically creates child nodes when a parent is published, based on rules that match document types. Useful for scaffolding required child structure (folders, landing pages) the moment a content item is created.',
  dotseeDiscipline_autoNode_logLevel: 'Log level',
  dotseeDiscipline_autoNode_logLevelHelp:
    'Controls how chatty AutoNode is in the Umbraco log. Use Verbose when diagnosing rule behaviour; switch back to Normal for production to keep the log clean.',
  dotseeDiscipline_autoNode_logLevelNormal: 'Normal',
  dotseeDiscipline_autoNode_logLevelVerbose: 'Verbose',
  dotseeDiscipline_autoNode_republish: 'Republish existing nodes',
  dotseeDiscipline_autoNode_republishHelp:
    'When on, AutoNode will also process already-published parent nodes — any missing child nodes defined by its rules will be created retroactively the next time the parent is republished. Leave off to only apply rules to newly published nodes.',
  dotseeDiscipline_autoNode_triggeringDoctype: 'Triggering doctype *',
  dotseeDiscipline_autoNode_triggeringDoctypeHelp:
    'The parent doctype whose publish event triggers this rule. When a node of this type is published, AutoNode will evaluate the rule against it.',
  dotseeDiscipline_autoNode_doctypeToCreate: 'DocType to create *',
  dotseeDiscipline_autoNode_doctypeToCreateHelp:
    'The doctype of the child node that will be created under the triggering node. Must be allowed as a child of the triggering doctype in Umbraco.',
  dotseeDiscipline_autoNode_nodeName: 'Node name *',
  dotseeDiscipline_autoNode_nodeNameHelp:
    'Literal name for the created child node. Ignored when a dictionary item is set below.',
  dotseeDiscipline_autoNode_dictionaryItem: 'Dictionary item for name',
  dotseeDiscipline_autoNode_dictionaryItemHelp:
    'Umbraco dictionary key used to translate the child node name per culture. Takes precedence over the literal Node name when set and the key exists.',
  dotseeDiscipline_autoNode_blueprint: 'Blueprint',
  dotseeDiscipline_autoNode_blueprintHelp:
    'Optional content template (blueprint) to prefill the new node. Only blueprints of the doctype selected in "DocType to create" are listed.',
  dotseeDiscipline_autoNode_bringFirst: 'Bring new node first',
  dotseeDiscipline_autoNode_bringFirstHelp:
    'When on, the new child is inserted as the first sibling in the tree. When off, it is appended at the end.',
  dotseeDiscipline_autoNode_onlyIfNoChildren: 'Only create if no children',
  dotseeDiscipline_autoNode_onlyIfNoChildrenHelp:
    'When on, the rule only fires if the triggering node has no existing children. Use for one-off scaffolding where the rule should not keep creating siblings later.',
  dotseeDiscipline_autoNode_existsDifferentName: 'Create if exists with different name',
  dotseeDiscipline_autoNode_existsDifferentNameHelp:
    'When on, AutoNode will create a new child even if a sibling of the same doctype already exists under a different name. When off, an existing child of that doctype is treated as already satisfying the rule.',
  dotseeDiscipline_autoNode_keepUnpublished: 'Keep new node unpublished',
  dotseeDiscipline_autoNode_keepUnpublishedHelp:
    'When on, the created child is saved as a draft only. When off, it is published immediately after creation.',
  dotseeDiscipline_autoNode_validationCreatedDoctype: 'AutoNode rule %0%: Created DocType is required',
  dotseeDiscipline_autoNode_validationDoctypeToCreate: 'AutoNode rule %0%: DocType to create is required',
  dotseeDiscipline_autoNode_validationNodeName: 'AutoNode rule %0%: Node name is required',

  // ────────────────────────────────────────────────────────────────────
  // NodeRestrict
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_nodeRestrict_label: 'NodeRestrict',
  dotseeDiscipline_nodeRestrict_description:
    'Limits the number of child nodes of a given type that can be created under a parent node. Editors see a configurable warning or error message when they try to exceed the limit.',
  dotseeDiscipline_nodeRestrict_propertyAlias: 'Property alias *',
  dotseeDiscipline_nodeRestrict_propertyAliasHelp:
    'Optional property alias that, when present on a node and set to true, excludes that node from NodeRestrict limits. Leave empty to apply limits to every node that matches a rule.',
  dotseeDiscipline_nodeRestrict_showWarnings: 'Show warnings',
  dotseeDiscipline_nodeRestrict_showWarningsHelp:
    'Global default. When on, NodeRestrict surfaces warning messages to editors as they approach a limit. Individual rules can override this.',
  dotseeDiscipline_nodeRestrict_parentDoctype: 'Parent doctype *',
  dotseeDiscipline_nodeRestrict_parentDoctypeHelp:
    'The doctype of the parent node under which the limit is enforced. The rule counts children of this parent.',
  dotseeDiscipline_nodeRestrict_childDoctype: 'Child doctype',
  dotseeDiscipline_nodeRestrict_childDoctypeHelp:
    'The doctype of children that count towards the limit. Choose "Any doctype" to cap the total number of children regardless of type.',
  dotseeDiscipline_nodeRestrict_maxNodes: 'Max nodes *',
  dotseeDiscipline_nodeRestrict_maxNodesHelp:
    'Maximum number of matching children allowed under a single parent. Editors are blocked from creating more than this many.',
  dotseeDiscipline_nodeRestrict_ruleShowWarningsHelp:
    'When on, editors see the warning message as they approach the limit. Overrides the feature-level default for this rule only.',
  dotseeDiscipline_nodeRestrict_customMessage: 'Custom limit message',
  dotseeDiscipline_nodeRestrict_customMessageHelp:
    'Plain text (or dictionary key — see category below) shown to editors when they hit the hard limit. Leave empty to use the default.',
  dotseeDiscipline_nodeRestrict_customMessageCategory: 'Custom limit category',
  dotseeDiscipline_nodeRestrict_customMessageCategoryHelp:
    'Optional Umbraco dictionary category used to localise the Custom limit message. When set, the message value is treated as a dictionary key within this category.',
  dotseeDiscipline_nodeRestrict_customWarning: 'Custom warning message',
  dotseeDiscipline_nodeRestrict_customWarningHelp:
    'Text shown to editors as they approach — but have not yet reached — the limit. Leave empty to use the default warning.',
  dotseeDiscipline_nodeRestrict_customWarningCategory: 'Custom warning category',
  dotseeDiscipline_nodeRestrict_customWarningCategoryHelp:
    'Optional Umbraco dictionary category used to localise the Custom warning message. When set, the message value is treated as a dictionary key within this category.',
  dotseeDiscipline_nodeRestrict_ruleDetailMax: 'Max %0%',
  dotseeDiscipline_nodeRestrict_validationPropertyAlias: 'NodeRestrict: Property alias is required',
  dotseeDiscipline_nodeRestrict_validationParentDoctype: 'NodeRestrict rule %0%: Parent doctype is required',
  dotseeDiscipline_nodeRestrict_validationMaxNodes: 'NodeRestrict rule %0%: Max nodes must be a non-negative number',

  // ────────────────────────────────────────────────────────────────────
  // VirtualNodes
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_virtualNodes_label: 'VirtualNodes',
  dotseeDiscipline_virtualNodes_description:
    "Hides the URL segment of the selected document types so their children appear one level higher in the site's public URLs. Useful for grouping content in the tree without that grouping leaking into the URL.",
  dotseeDiscipline_virtualNodes_doctypes: 'Virtual node doctypes',
  dotseeDiscipline_virtualNodes_doctypesHelp:
    'Doctypes whose URL segment should be skipped in the frontend. Nodes of these doctypes still appear in the tree as containers, but their children are served one level up in the public URL.',
  dotseeDiscipline_virtualNodes_validationDoctype: 'VirtualNodes rule %0%: DocType alias is required',

  // ────────────────────────────────────────────────────────────────────
  // VariantsHider
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_variantsHider_label: 'VariantsHider',
  dotseeDiscipline_variantsHider_description:
    "Adds an entity action on the content tree that hides language variants that haven't been created yet (those shown in parentheses), so editors only see variants that actually exist.",
  dotseeDiscipline_variantsHider_caption: 'Caption',
  dotseeDiscipline_variantsHider_captionHelp:
    'Label shown on the Hide/Show variants entity action in the content tree context menu. Leave empty to use the default caption.',
  dotseeDiscipline_variantsHider_toggle: 'Toggle unset variants display',

  // ────────────────────────────────────────────────────────────────────
  // NodeProtect
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_nodeProtect_label: 'NodeProtect',
  dotseeDiscipline_nodeProtect_description:
    "Prevents deletion of important nodes, either by document type or by specific GUID. Editors see a configurable message explaining why the node can't be deleted.",
  dotseeDiscipline_nodeProtect_propertyAlias: 'Property alias *',
  dotseeDiscipline_nodeProtect_propertyAliasHelp:
    'The alias of a true/false property on your document types. When a node has this property set to true, NodeProtect will treat it as protected and block deletion.',
  dotseeDiscipline_nodeProtect_doctypeAlias: 'DocType alias',
  dotseeDiscipline_nodeProtect_doctypeAliasHelp:
    'Protect every node of this doctype from deletion. Leave empty if you want to protect specific nodes by GUID instead.',
  dotseeDiscipline_nodeProtect_guids: 'Document GUIDs (comma separated)',
  dotseeDiscipline_nodeProtect_guidsHelp:
    'Comma-separated list of specific content GUIDs to protect. Use alongside or instead of the doctype alias to protect individual important nodes.',
  dotseeDiscipline_nodeProtect_customMessage: 'Custom message',
  dotseeDiscipline_nodeProtect_customMessageHelp:
    'Text (or dictionary key — see category below) shown to editors who try to delete a protected node. Leave empty to use the default message.',
  dotseeDiscipline_nodeProtect_customMessageCategory: 'Custom message category',
  dotseeDiscipline_nodeProtect_customMessageCategoryHelp:
    'Optional Umbraco dictionary category used to localise the Custom message. When set, the message value is treated as a dictionary key within this category.',
  dotseeDiscipline_nodeProtect_byGuids: 'By GUIDs',
  dotseeDiscipline_nodeProtect_byDoctype: 'By doctype',
  dotseeDiscipline_nodeProtect_validationPropertyAlias: 'NodeProtect: Property alias is required',
  dotseeDiscipline_nodeProtect_validationDoctypeOrGuids:
    'NodeProtect rule %0%: DocType alias or Document GUIDs is required',

  // ────────────────────────────────────────────────────────────────────
  // AiSummary
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_aiSummary_label: 'AiSummary',
  dotseeDiscipline_aiSummary_description:
    'Generates AI-powered content summaries using OpenAI or Gemini and writes the result into a configured property. A toggle property on the node controls whether a summary should be produced for that item.',
  dotseeDiscipline_aiSummary_llm: 'LLM *',
  dotseeDiscipline_aiSummary_llmHelp:
    'Which large-language-model provider to use for summaries. Determines which Model names and API key format are valid.',
  dotseeDiscipline_aiSummary_apiKey: 'API key *',
  dotseeDiscipline_aiSummary_apiKeyHelp:
    'Secret key issued by the selected LLM provider. Stored as plain text in settings — protect access to this screen accordingly.',
  dotseeDiscipline_aiSummary_model: 'Model *',
  dotseeDiscipline_aiSummary_modelHelp:
    'The exact model identifier to call, e.g. gpt-4o-mini or gemini-1.5-flash. Must match a model your API key is entitled to use.',
  dotseeDiscipline_aiSummary_maxChars: 'Max chars',
  dotseeDiscipline_aiSummary_maxCharsHelp:
    'Upper bound for the generated summary length in characters. The prompt asks the model to stay under this limit; set it to match the space available in your front-end.',
  dotseeDiscipline_aiSummary_propertyAlias: 'Property alias *',
  dotseeDiscipline_aiSummary_propertyAliasHelp:
    'Alias of the text property on your doctypes where the generated summary will be written. Must exist on every doctype selected below.',
  dotseeDiscipline_aiSummary_toggleProperty: 'Toggle property alias',
  dotseeDiscipline_aiSummary_togglePropertyHelp:
    'Optional true/false property alias that editors use to opt a specific node in or out of summary generation. Leave empty to summarise every matching node on save.',
  dotseeDiscipline_aiSummary_doctypes: 'DocTypes',
  dotseeDiscipline_aiSummary_doctypesHelp:
    'Doctypes whose content should be eligible for AI summaries. Nodes of other doctypes are ignored entirely.',
  dotseeDiscipline_aiSummary_excludeProperties: 'Exclude properties',
  dotseeDiscipline_aiSummary_excludePropertiesHelp:
    'Text properties on the node that should not be sent to the LLM when building the summary prompt. Use this to exclude internal notes, sidebars, or already-summarised fields.',
  dotseeDiscipline_aiSummary_tone: 'Tone',
  dotseeDiscipline_aiSummary_toneHelp:
    'Free-text instructions appended to the prompt that steer the voice of the generated summary, e.g. "formal, no marketing fluff" or "friendly, second person, max two sentences".',
  dotseeDiscipline_aiSummary_validationLlm: 'AiSummary: LLM is required',
  dotseeDiscipline_aiSummary_validationApiKey: 'AiSummary: API key is required',
  dotseeDiscipline_aiSummary_validationModel: 'AiSummary: Model is required',
  dotseeDiscipline_aiSummary_validationPropertyAlias: 'AiSummary: Property alias is required',

  // ────────────────────────────────────────────────────────────────────
  // PropertyVersions
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_propertyVersions_label: 'PropertyVersions',
  dotseeDiscipline_propertyVersions_description:
    'Adds navigation actions to properties so editors can step through previous saved versions and roll individual properties back without restoring the whole document.',
  dotseeDiscipline_propertyVersions_nextDictionaryEntry: 'Next version dictionary entry',
  dotseeDiscipline_propertyVersions_nextDictionaryEntryHelp:
    'Umbraco dictionary key used as the caption for the "Next version" property action. Leave empty to use the built-in English label.',
  dotseeDiscipline_propertyVersions_previousDictionaryEntry: 'Previous version dictionary entry',
  dotseeDiscipline_propertyVersions_previousDictionaryEntryHelp:
    'Umbraco dictionary key used as the caption for the "Previous version" property action. Leave empty to use the built-in English label.',
  dotseeDiscipline_propertyVersions_noVersionsDictionaryEntry: 'No versions dictionary entry',
  dotseeDiscipline_propertyVersions_noVersionsDictionaryEntryHelp:
    'Umbraco dictionary key used for the disabled state when no earlier versions are available. Leave empty to use the built-in English label.',
  dotseeDiscipline_propertyVersions_previousVersion: 'Previous version',
  dotseeDiscipline_propertyVersions_nextVersion: 'Next version',
  dotseeDiscipline_propertyVersions_noPreviousVersions: 'No previous versions',
};
