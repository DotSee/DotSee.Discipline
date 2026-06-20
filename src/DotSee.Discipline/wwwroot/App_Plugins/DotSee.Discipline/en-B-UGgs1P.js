const e = {
  // ────────────────────────────────────────────────────────────────────
  // Common / shared
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_common: {
    save: "Save",
    remove: "Remove",
    enable: "Enable",
    disable: "Disable",
    help: "Help",
    close: "Close",
    addRule: "Add rule",
    addRuleButton: "+ Add rule",
    rules: "Rules",
    ruleNumber: "Rule %0%",
    noRulesDefined: "No rules defined.",
    noEntries: "No entries.",
    expandRule: "Expand rule",
    collapseRule: "Collapse rule",
    dragToReorder: "Drag to reorder",
    showList: "Show list",
    hideList: "Hide list",
    selectedCount: "(%0% selected)",
    filterAll: "All",
    filterSelectedOnly: "Selected only",
    notFoundSuffix: "not found",
    selectPlaceholder: "-- Select --",
    selectDoctypeFirstPlaceholder: "-- Select a doctype first --",
    noBlueprintsPlaceholder: "-- No blueprints available --",
    anyDoctype: "Any doctype",
    anyDoctypeLowercase: "any"
  },
  // ────────────────────────────────────────────────────────────────────
  // Backoffice settings workspace
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_settings: {
    headline: "DotSee Discipline Settings",
    sourceHeadline: "Settings source",
    noAppsettingsFound: "No DotSee.Discipline section was found in appsettings.json. All configuration is managed from this screen.",
    manageFromBackoffice: "Manage settings from the backoffice",
    loadFromAppsettings: "Load from appsettings.json",
    about: "About",
    importConfirmContent: "This will replace every field in this page with the values from appsettings.json. Your current backoffice settings will be lost. Continue?",
    importConfirmLabel: "Load from appsettings",
    loadedToast: "Loaded from appsettings.json.",
    savedToast: "Settings saved.",
    loadFailedToast: "Could not load settings: %0%",
    importFailedToast: "Import failed: %0%",
    saveFailedToast: "Save failed: %0%",
    reloadHintToast: "Changes to VariantsHider or PropertyVersions take effect after you refresh the backoffice."
  },
  // ────────────────────────────────────────────────────────────────────
  // About dialog
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_about: {
    headline: "About Discipline",
    body: "Discipline is a content governance package that helps teams keep content structured, consistent, and easier to manage. It provides tools and conventions that support better editorial discipline, reduce messy content practices, and make large or long-running Umbraco projects easier to maintain.",
    createdBy: "Discipline was created with love by",
    company: "DotSee Web Services",
    companyUrl: "https://www.dot-see.com"
  },
  // ────────────────────────────────────────────────────────────────────
  // Menu / sidebar
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_menu: {
    label: "DotSee Discipline",
    itemLabel: "Discipline"
  },
  // ────────────────────────────────────────────────────────────────────
  // AutoNode
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_autoNode: {
    label: "AutoNode",
    description: "Automatically creates child nodes when a parent is published, based on rules that match document types. Useful for scaffolding required child structure (folders, landing pages) the moment a content item is created.",
    logLevel: "Log level",
    logLevelHelp: "Controls how chatty AutoNode is in the Umbraco log. Use Verbose when diagnosing rule behaviour; switch back to Normal for production to keep the log clean.",
    logLevelNormal: "Normal",
    logLevelVerbose: "Verbose",
    republish: "Republish existing nodes",
    republishHelp: "When on, AutoNode will also process already-published parent nodes — any missing child nodes defined by its rules will be created retroactively the next time the parent is republished. Leave off to only apply rules to newly published nodes.",
    triggeringDoctype: "Triggering doctype *",
    triggeringDoctypeHelp: "The parent doctype whose publish event triggers this rule. When a node of this type is published, AutoNode will evaluate the rule against it.",
    doctypeToCreate: "DocType to create *",
    doctypeToCreateHelp: "The doctype of the child node that will be created under the triggering node. Must be allowed as a child of the triggering doctype in Umbraco.",
    nodeName: "Node name *",
    nodeNameHelp: "Literal name for the created child node. Ignored when a dictionary item is set below.",
    dictionaryItem: "Dictionary item for name",
    dictionaryItemHelp: "Umbraco dictionary key used to translate the child node name per culture. Takes precedence over the literal Node name when set and the key exists.",
    blueprint: "Blueprint",
    blueprintHelp: 'Optional content template (blueprint) to prefill the new node. Only blueprints of the doctype selected in "DocType to create" are listed.',
    bringFirst: "Bring new node first",
    bringFirstHelp: "When on, the new child is inserted as the first sibling in the tree. When off, it is appended at the end.",
    onlyIfNoChildren: "Only create if no children",
    onlyIfNoChildrenHelp: "When on, the rule only fires if the triggering node has no existing children. Use for one-off scaffolding where the rule should not keep creating siblings later.",
    existsDifferentName: "Create if exists with different name",
    existsDifferentNameHelp: "When on, AutoNode will create a new child even if a sibling of the same doctype already exists under a different name. When off, an existing child of that doctype is treated as already satisfying the rule.",
    keepUnpublished: "Keep new node unpublished",
    keepUnpublishedHelp: "When on, the created child is saved as a draft only. When off, it is published immediately after creation.",
    validationCreatedDoctype: "AutoNode rule %0%: Created DocType is required",
    validationDoctypeToCreate: "AutoNode rule %0%: DocType to create is required",
    validationNodeName: "AutoNode rule %0%: Node name is required"
  },
  // ────────────────────────────────────────────────────────────────────
  // NodeRestrict
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_nodeRestrict: {
    label: "NodeRestrict",
    description: "Limits the number of child nodes of a given type that can be created under a parent node. Editors see a configurable warning or error message when they try to exceed the limit.",
    propertyAlias: "Property alias",
    propertyAliasHelp: "Optional property alias that, when present on a node and set to true, excludes that node from NodeRestrict limits. Leave empty to apply limits to every node that matches a rule.",
    showWarnings: "Show warnings",
    showWarningsHelp: "Global default. When on, NodeRestrict surfaces warning messages to editors as they approach a limit. Individual rules can override this.",
    parentDoctype: "Parent doctype *",
    parentDoctypeHelp: "The doctype of the parent node under which the limit is enforced. The rule counts children of this parent.",
    childDoctype: "Child doctype",
    childDoctypeHelp: 'The doctype of children that count towards the limit. Choose "Any doctype" to cap the total number of children regardless of type.',
    maxNodes: "Max nodes *",
    maxNodesHelp: "Maximum number of matching children allowed under a single parent. Editors are blocked from creating more than this many.",
    ruleShowWarningsHelp: "When on, editors see the warning message as they approach the limit. Overrides the feature-level default for this rule only.",
    customMessage: "Custom limit message",
    customMessageHelp: "Plain text (or dictionary key — see category below) shown to editors when they hit the hard limit. Leave empty to use the default.",
    customMessageCategory: "Custom limit category",
    customMessageCategoryHelp: "Optional Umbraco dictionary category used to localise the Custom limit message. When set, the message value is treated as a dictionary key within this category.",
    customWarning: "Custom warning message",
    customWarningHelp: "Text shown to editors as they approach — but have not yet reached — the limit. Leave empty to use the default warning.",
    customWarningCategory: "Custom warning category",
    customWarningCategoryHelp: "Optional Umbraco dictionary category used to localise the Custom warning message. When set, the message value is treated as a dictionary key within this category.",
    ruleDetailMax: "Max %0%",
    validationParentDoctype: "NodeRestrict rule %0%: Parent doctype is required",
    validationMaxNodes: "NodeRestrict rule %0%: Max nodes must be a non-negative number"
  },
  // ────────────────────────────────────────────────────────────────────
  // VirtualNodes
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_virtualNodes: {
    label: "VirtualNodes",
    description: "Hides the URL segment of the selected document types so their children appear one level higher in the site's public URLs. Useful for grouping content in the tree without that grouping leaking into the URL.",
    doctypes: "Virtual node doctypes",
    doctypesHelp: "Doctypes whose URL segment should be skipped in the frontend. Nodes of these doctypes still appear in the tree as containers, but their children are served one level up in the public URL.",
    validationDoctype: "VirtualNodes rule %0%: DocType alias is required"
  },
  // ────────────────────────────────────────────────────────────────────
  // VariantsHider
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_variantsHider: {
    label: "VariantsHider",
    description: "Adds an entity action on the content tree that hides language variants that haven't been created yet (those shown in parentheses), so editors only see variants that actually exist.",
    caption: "Caption",
    captionHelp: "Label shown on the Hide/Show variants entity action in the content tree context menu. Leave empty to use the default caption.",
    toggle: "Toggle unset variants display"
  },
  // ────────────────────────────────────────────────────────────────────
  // NodeProtect
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_nodeProtect: {
    label: "NodeProtect",
    description: "Prevents deletion of important nodes, either by document type or by specific GUID. Editors see a configurable message explaining why the node can't be deleted.",
    propertyAlias: "Property alias",
    propertyAliasHelp: "The alias of a true/false property on your document types. When a node has this property set to true, NodeProtect will treat it as protected and block deletion.",
    doctypeAlias: "DocType alias",
    doctypeAliasHelp: "Protect every node of this doctype from deletion. Leave empty if you want to protect specific nodes by GUID instead.",
    guids: "Document GUIDs (comma separated)",
    guidsHelp: "Comma-separated list of specific content GUIDs to protect. Use alongside or instead of the doctype alias to protect individual important nodes.",
    customMessage: "Custom message",
    customMessageHelp: "Text (or dictionary key — see category below) shown to editors who try to delete a protected node. Leave empty to use the default message.",
    customMessageCategory: "Custom message category",
    customMessageCategoryHelp: "Optional Umbraco dictionary category used to localise the Custom message. When set, the message value is treated as a dictionary key within this category.",
    byGuids: "By GUIDs",
    byDoctype: "By doctype",
    validationDoctypeOrGuids: "NodeProtect rule %0%: DocType alias or Document GUIDs is required"
  },
  // ────────────────────────────────────────────────────────────────────
  // AiSummary
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_aiSummary: {
    label: "AiSummary",
    aiSummaryCategory: "Ai Summarization",
    description: "Generates AI-powered content summaries using OpenAI or Gemini and writes the result into a configured property. A toggle property on the node controls whether a summary should be produced for that item.",
    llm: "LLM *",
    llmHelp: "Which large-language-model provider to use for summaries. Determines which Model names and API key format are valid.",
    apiKey: "API key *",
    apiKeyHelp: "Secret key issued by the selected LLM provider. Stored as plain text in settings — protect access to this screen accordingly.",
    model: "Model *",
    modelHelp: "Pick the model to call. The list is loaded from your provider using the API key above (refresh after changing the key or provider). It defaults to the lowest-tier model.",
    modelRefresh: "Refresh",
    modelNoKey: "Enter an API key above, then refresh to load the available models.",
    modelEmpty: "No models were returned for this provider/key.",
    maxChars: "Max chars",
    maxCharsHelp: "Upper bound for the generated summary length in characters. The prompt asks the model to stay under this limit; set it to match the space available in your front-end.",
    propertyAlias: "Property alias *",
    propertyAliasHelp: "Alias of the text property on your doctypes where the generated summary will be written. Must exist on every doctype selected below.",
    toggleProperty: "Toggle property alias",
    togglePropertyHelp: "Optional true/false property alias that editors use to opt a specific node in or out of summary generation. Leave empty to summarise every matching node on save.",
    doctypes: "DocTypes",
    doctypesHelp: "Doctypes whose content should be eligible for AI summaries. Nodes of other doctypes are ignored entirely.",
    excludeProperties: "Exclude properties",
    excludePropertiesHelp: "Text properties on the node that should not be sent to the LLM when building the summary prompt. Use this to exclude internal notes, sidebars, or already-summarised fields.",
    tone: "Tone",
    toneHelp: 'Free-text instructions appended to the prompt that steer the voice of the generated summary, e.g. "formal, no marketing fluff" or "friendly, second person, max two sentences".',
    validationLlm: "AiSummary: LLM is required",
    validationApiKey: "AiSummary: API key is required",
    validationModel: "AiSummary: Model is required",
    validationPropertyAlias: "AiSummary: Property alias is required"
  },
  // ────────────────────────────────────────────────────────────────────
  // PropertyVersions
  // ────────────────────────────────────────────────────────────────────
  dotseeDiscipline_propertyVersions: {
    label: "PropertyVersions",
    description: "Adds navigation actions to properties so editors can step through previous saved versions and roll individual properties back without restoring the whole document.",
    nextDictionaryEntry: "Next version dictionary entry",
    nextDictionaryEntryHelp: 'Umbraco dictionary key used as the caption for the "Next version" property action. Leave empty to use the built-in English label.',
    previousDictionaryEntry: "Previous version dictionary entry",
    previousDictionaryEntryHelp: 'Umbraco dictionary key used as the caption for the "Previous version" property action. Leave empty to use the built-in English label.',
    noVersionsDictionaryEntry: "No versions dictionary entry",
    noVersionsDictionaryEntryHelp: "Umbraco dictionary key used for the disabled state when no earlier versions are available. Leave empty to use the built-in English label.",
    previousVersion: "Previous version",
    nextVersion: "Next version",
    noPreviousVersions: "No previous versions"
  }
};
export {
  e as default
};
//# sourceMappingURL=en-B-UGgs1P.js.map
