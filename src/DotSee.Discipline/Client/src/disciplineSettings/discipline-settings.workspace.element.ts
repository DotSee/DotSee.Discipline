import { css, html, customElement, state, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_MODAL_MANAGER_CONTEXT, UMB_CONFIRM_MODAL } from '@umbraco-cms/backoffice/modal';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';
import {
  BlueprintOption,
  DisciplineSettings,
  DisciplineSettingsResponse,
  DocTypeOption,
  PropertyOption,
  createEmptyAutoNodeRule,
  createEmptyNodeProtectRule,
  createEmptyNodeRestrictRule,
} from './types.js';
import { DisciplineSettingsRepository } from './settings.repository.js';

type TabAlias =
  | 'autoNode'
  | 'nodeRestrict'
  | 'virtualNodes'
  | 'variantsHider'
  | 'nodeProtect'
  | 'aiSummary'
  | 'propertyVersions';

interface TabDefinition {
  alias: TabAlias;
  label: string;
}

const TABS: TabDefinition[] = [
  { alias: 'autoNode', label: 'AutoNode' },
  { alias: 'nodeRestrict', label: 'NodeRestrict' },
  { alias: 'virtualNodes', label: 'VirtualNodes' },
  { alias: 'variantsHider', label: 'VariantsHider' },
  { alias: 'nodeProtect', label: 'NodeProtect' },
  { alias: 'aiSummary', label: 'AiSummary' },
  { alias: 'propertyVersions', label: 'PropertyVersions' },
];

function emptySettings(): DisciplineSettings {
  return {
    useBackoffice: false,
    autoNode: { enabled: false, logLevel: 'Normal', republishExistingNodes: false, rules: [] },
    nodeRestrict: { enabled: false, propertyAlias: '', showWarnings: true, rules: [] },
    nodeProtect: { enabled: false, propertyAlias: '', rules: [] },
    virtualNodes: { enabled: false, rules: [] },
    variantsHider: { enabled: false, caption: '' },
    propertyVersions: {
      enabled: false,
      nextVersionButtonCaptionDictionaryEntry: '',
      previousVersionButtonCaptionDictionaryEntry: '',
      noVersionsButtonCaptionDictionaryEntry: '',
    },
    aiSummary: {
      enabled: false,
      llm: 'openai',
      apiKey: '',
      model: '',
      maxChars: 150,
      tone: '',
      docTypes: '',
      excludeProperties: '',
      propertyAlias: '',
      togglePropertyAlias: '',
    },
  };
}

@customElement('dotsee-discipline-settings-workspace')
export class DisciplineSettingsWorkspaceElement extends UmbLitElement {
  @state()
  private _loading = true;

  @state()
  private _saving = false;

  @state()
  private _hasAppSettings = false;

  @state()
  private _settings: DisciplineSettings = emptySettings();

  @state()
  private _activeTab: TabAlias = 'autoNode';

  @state()
  private _docTypes: DocTypeOption[] = [];

  @state()
  private _trueFalseProperties: PropertyOption[] = [];

  @state()
  private _textContentProperties: PropertyOption[] = [];

  @state()
  private _textInputProperties: PropertyOption[] = [];

  @state()
  private _blueprints: BlueprintOption[] = [];

  @state()
  private _expandedFields = new Set<string>();

  @state()
  private _filterModes = new Map<string, 'all' | 'selected'>();

  @state()
  private _collapsedRules = new Set<string>();

  @state()
  private _dragIndex: number | null = null;

  @state()
  private _dragOverIndex: number | null = null;

  @state()
  private _dragPosition: 'before' | 'after' | null = null;

  private _repository?: DisciplineSettingsRepository;

  override connectedCallback() {
    super.connectedCallback();
    this._init();
    document.addEventListener('mousedown', this._onDocumentMouseDown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('mousedown', this._onDocumentMouseDown);
  }

  private _onDocumentMouseDown = (event: MouseEvent) => {
    if (this._expandedFields.size === 0) return;
    const insideMultiBox = event
      .composedPath()
      .some((node) => node instanceof HTMLElement && node.classList?.contains('multi-box'));
    if (!insideMultiBox) {
      this._expandedFields.clear();
      this.requestUpdate();
    }
  };

  private async _init() {
    const authContext = await this.getContext(UMB_AUTH_CONTEXT);
    const token = await authContext!.getLatestToken();
    this._repository = new DisciplineSettingsRepository(token);

    try {
      const [response, docTypes, trueFalseProps, textContentProps, textInputProps, blueprints] = await Promise.all([
        this._repository.getSettings(),
        this._repository.getDocTypes().catch(() => [] as DocTypeOption[]),
        this._repository.getTrueFalseProperties().catch(() => [] as PropertyOption[]),
        this._repository.getTextContentProperties().catch(() => [] as PropertyOption[]),
        this._repository.getTextInputProperties().catch(() => [] as PropertyOption[]),
        this._repository.getBlueprints().catch(() => [] as BlueprintOption[]),
      ]);
      this._docTypes = docTypes;
      this._trueFalseProperties = trueFalseProps;
      this._textContentProperties = textContentProps;
      this._textInputProperties = textInputProps;
      this._blueprints = blueprints;
      this._applyResponse(response);
      this._collapseAllRules();
    } catch (error) {
      await this._notify('danger', `Could not load settings: ${this._errorMessage(error)}`);
    } finally {
      this._loading = false;
      this.requestUpdate();
    }
  }

  private _applyResponse(response: DisciplineSettingsResponse) {
    this._hasAppSettings = response.hasAppSettings;
    this._settings = response.settings ?? emptySettings();
    this.requestUpdate();
  }

  private _errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private async _notify(color: 'positive' | 'warning' | 'danger', message: string) {
    try {
      const context = await this.getContext(UMB_NOTIFICATION_CONTEXT);
      context?.peek(color, { data: { message } });
    } catch {
      /* notifications are best-effort */
    }
  }

  private _onMasterToggleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this._settings = { ...this._settings, useBackoffice: target.checked };
    this.requestUpdate();
  }

  private _patchSettings<K extends keyof DisciplineSettings>(key: K, value: DisciplineSettings[K]) {
    this._settings = { ...this._settings, [key]: value };
    this.requestUpdate();
  }

  private async _onImportClick() {
    if (!this._hasAppSettings || !this._repository) return;

    const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
    if (!modalManager) return;
    const modal = modalManager.open(this, UMB_CONFIRM_MODAL, {
      data: {
        headline: 'Load from appsettings.json',
        content:
          'This will replace every field in this page with the values from appsettings.json. ' +
          'Your current backoffice settings will be lost. Continue?',
        confirmLabel: 'Load from appsettings',
        color: 'danger',
      },
    });
    try {
      await modal.onSubmit();
    } catch {
      return;
    }

    try {
      this._saving = true;
      this.requestUpdate();
      const response = await this._repository.importFromAppSettings();
      this._applyResponse(response);
      await this._notify('positive', 'Loaded from appsettings.json.');
    } catch (error) {
      await this._notify('danger', `Import failed: ${this._errorMessage(error)}`);
    } finally {
      this._saving = false;
      this.requestUpdate();
    }
  }

  private async _onSaveClick() {
    if (!this._repository || !this._canSave()) return;
    try {
      this._saving = true;
      this.requestUpdate();
      const response = await this._repository.saveSettings(this._settings);
      this._applyResponse(response);
      await this._notify('positive', 'Settings saved.');
    } catch (error) {
      await this._notify('danger', `Save failed: ${this._errorMessage(error)}`);
    } finally {
      this._saving = false;
      this.requestUpdate();
    }
  }

  private _canSave(): boolean {
    if (!this._settings.useBackoffice) return false;
    return this._validationErrors().length === 0;
  }

  private _validationErrors(): string[] {
    const errors: string[] = [];
    const s = this._settings;

    if (s.autoNode.enabled) {
      s.autoNode.rules.forEach((rule, i) => {
        if (!rule.createdDocTypeAlias) errors.push(`AutoNode rule ${i + 1}: Created DocType is required`);
        if (!rule.docTypeAliasToCreate) errors.push(`AutoNode rule ${i + 1}: DocType to create is required`);
        if (!rule.nodeName) errors.push(`AutoNode rule ${i + 1}: Node name is required`);
      });
    }

    if (s.nodeRestrict.enabled) {
      if (!s.nodeRestrict.propertyAlias) errors.push('NodeRestrict: Property alias is required');
      s.nodeRestrict.rules.forEach((rule, i) => {
        if (!rule.parentDocType) errors.push(`NodeRestrict rule ${i + 1}: Parent doctype is required`);
        if (!Number.isFinite(rule.maxNodes) || rule.maxNodes < 0)
          errors.push(`NodeRestrict rule ${i + 1}: Max nodes must be a non-negative number`);
      });
    }

    if (s.nodeProtect.enabled) {
      if (!s.nodeProtect.propertyAlias) errors.push('NodeProtect: Property alias is required');
      s.nodeProtect.rules.forEach((rule, i) => {
        if (!rule.docTypeAlias && !rule.documentGuids)
          errors.push(`NodeProtect rule ${i + 1}: DocType alias or Document GUIDs is required`);
      });
    }

    if (s.virtualNodes.enabled) {
      s.virtualNodes.rules.forEach((rule, i) => {
        if (!rule) errors.push(`VirtualNodes rule ${i + 1}: DocType alias is required`);
      });
    }

    if (s.aiSummary.enabled) {
      if (!s.aiSummary.llm) errors.push('AiSummary: LLM is required');
      if (!s.aiSummary.apiKey) errors.push('AiSummary: API key is required');
      if (!s.aiSummary.model) errors.push('AiSummary: Model is required');
      if (!s.aiSummary.propertyAlias) errors.push('AiSummary: Property alias is required');
    }

    return errors;
  }

  private get _fieldsDisabled() {
    return !this._settings.useBackoffice || this._saving;
  }

  override render() {
    if (this._loading) {
      return html`<umb-body-layout headline="DotSee Discipline Settings">
        <div class="center"><uui-loader></uui-loader></div>
      </umb-body-layout>`;
    }

    const disabled = this._fieldsDisabled;
    const active = this._settings.useBackoffice;
    return html`
      <umb-body-layout headline="DotSee Discipline Settings">
        ${this._renderSourceBanner()}
        ${active
          ? html`
              <div class="tab-bar">
                ${TABS.map((tab) => {
                  const isEnabled = Boolean(
                    (this._settings[tab.alias] as { enabled?: boolean } | undefined)?.enabled,
                  );
                  const classes = [
                    'tab-button',
                    this._activeTab === tab.alias ? 'active' : '',
                    isEnabled ? 'enabled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return html`
                    <button
                      type="button"
                      class=${classes}
                      @click=${() => {
                        this._activeTab = tab.alias;
                        this.requestUpdate();
                      }}
                    >
                      ${isEnabled
                        ? html`<umb-icon name="icon-check" class="tab-icon"></umb-icon>`
                        : nothing}
                      <span>${tab.label}</span>
                    </button>
                  `;
                })}
              </div>
              <div class="tab-content">
                <div ?hidden=${this._activeTab !== 'autoNode'}>${this._renderAutoNodeTab(disabled)}</div>
                <div ?hidden=${this._activeTab !== 'nodeRestrict'}>${this._renderNodeRestrictTab(disabled)}</div>
                <div ?hidden=${this._activeTab !== 'virtualNodes'}>${this._renderVirtualNodesTab(disabled)}</div>
                <div ?hidden=${this._activeTab !== 'variantsHider'}>${this._renderVariantsHiderTab(disabled)}</div>
                <div ?hidden=${this._activeTab !== 'nodeProtect'}>${this._renderNodeProtectTab(disabled)}</div>
                <div ?hidden=${this._activeTab !== 'aiSummary'}>${this._renderAiSummaryTab(disabled)}</div>
                <div ?hidden=${this._activeTab !== 'propertyVersions'}>${this._renderPropertyVersionsTab(disabled)}</div>
              </div>
              ${this._renderFooter()}
            `
          : nothing}
      </umb-body-layout>
    `;
  }

  private _renderSourceBanner() {
    if (!this._hasAppSettings) {
      return html`
        <uui-box headline="Settings source">
          <p>
            No <code>DotSee.Discipline</code> section was found in <code>appsettings.json</code>.
            All configuration is managed from this screen.
          </p>
        </uui-box>
      `;
    }

    return html`
      <uui-box headline="Settings source">
        <div class="banner-row">
          <uui-toggle
            .checked=${this._settings.useBackoffice}
            label="Manage settings from the backoffice"
            label-position="right"
            @change=${this._onMasterToggleChange}
          ></uui-toggle>
          ${this._settings.useBackoffice
            ? html`
                <uui-button
                  look="primary"
                  color="positive"
                  label="Load from appsettings.json"
                  ?disabled=${this._saving}
                  @click=${this._onImportClick}
                ></uui-button>
              `
            : nothing}
        </div>
      </uui-box>
    `;
  }

  private _renderEnableButton(
    enabled: boolean,
    disabled: boolean,
    onChange: (value: boolean) => void,
  ) {
    return html`
      <uui-button
        slot="header-actions"
        look=${enabled ? 'secondary' : 'primary'}
        color=${enabled ? 'default' : 'positive'}
        label=${enabled ? 'Disable' : 'Enable'}
        ?disabled=${disabled}
        @click=${() => onChange(!enabled)}
      ></uui-button>
    `;
  }

  private _isRuleCollapsed(feature: string, index: number): boolean {
    return this._collapsedRules.has(`${feature}:${index}`);
  }

  private _toggleRuleCollapsed(feature: string, index: number) {
    const key = `${feature}:${index}`;
    if (this._collapsedRules.has(key)) {
      this._collapsedRules.delete(key);
    } else {
      this._collapsedRules.add(key);
    }
    this.requestUpdate();
  }

  private _remapCollapsedRules(feature: string, oldToNew: Map<number, number>) {
    const prefix = `${feature}:`;
    const next = new Set<string>();
    for (const key of this._collapsedRules) {
      if (!key.startsWith(prefix)) {
        next.add(key);
        continue;
      }
      const oldIdx = Number(key.slice(prefix.length));
      const newIdx = oldToNew.get(oldIdx);
      if (newIdx !== undefined) next.add(`${prefix}${newIdx}`);
    }
    this._collapsedRules = next;
  }

  private _reorderAutoNodeRules(srcIdx: number, dstIdx: number) {
    const feat = this._settings.autoNode;
    if (srcIdx === dstIdx || srcIdx < 0 || srcIdx >= feat.rules.length) return;
    const clamped = Math.max(0, Math.min(dstIdx, feat.rules.length - 1));
    if (srcIdx === clamped) return;
    const newRules = feat.rules.slice();
    const [moved] = newRules.splice(srcIdx, 1);
    newRules.splice(clamped, 0, moved);

    const oldToNew = new Map<number, number>();
    const perm = feat.rules.map((_, i) => i);
    const [movedIdx] = perm.splice(srcIdx, 1);
    perm.splice(clamped, 0, movedIdx);
    perm.forEach((oldIdx, newIdx) => oldToNew.set(oldIdx, newIdx));
    this._remapCollapsedRules('autoNode', oldToNew);

    this._patchSettings('autoNode', { ...feat, rules: newRules });
  }

  private _onRuleDragStart(event: DragEvent, index: number) {
    this._dragIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  private _onRuleDragOver(event: DragEvent, index: number) {
    if (this._dragIndex === null) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position: 'before' | 'after' = event.clientY < midpoint ? 'before' : 'after';
    if (this._dragOverIndex !== index || this._dragPosition !== position) {
      this._dragOverIndex = index;
      this._dragPosition = position;
    }
  }

  private _onRuleDragLeave(index: number) {
    if (this._dragOverIndex === index) {
      this._dragOverIndex = null;
      this._dragPosition = null;
    }
  }

  private _onRuleDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    if (this._dragIndex === null) return;
    const src = this._dragIndex;
    const position = this._dragPosition ?? 'after';
    let dst = targetIndex + (position === 'after' ? 1 : 0);
    if (src < dst) dst--;
    this._reorderAutoNodeRules(src, dst);
    this._dragIndex = null;
    this._dragOverIndex = null;
    this._dragPosition = null;
  }

  private _onRuleDragEnd() {
    this._dragIndex = null;
    this._dragOverIndex = null;
    this._dragPosition = null;
  }

  private _removeRuleAndReindex(feature: string, index: number) {
    const prefix = `${feature}:`;
    const next = new Set<string>();
    for (const key of this._collapsedRules) {
      if (!key.startsWith(prefix)) {
        next.add(key);
        continue;
      }
      const idx = Number(key.slice(prefix.length));
      if (idx < index) next.add(key);
      else if (idx > index) next.add(`${prefix}${idx - 1}`);
    }
    this._collapsedRules = next;
  }

  private _collapseAllRules() {
    const next = new Set<string>();
    this._settings.autoNode.rules.forEach((_, i) => next.add(`autoNode:${i}`));
    this._settings.nodeRestrict.rules.forEach((_, i) => next.add(`nodeRestrict:${i}`));
    this._settings.nodeProtect.rules.forEach((_, i) => next.add(`nodeProtect:${i}`));
    this._collapsedRules = next;
    this.requestUpdate();
  }

  private _renderCollapsedRule(
    feature: string,
    index: number,
    name: string,
    detail: string,
    disabled: boolean,
    onRemove: () => void,
  ) {
    return html`
      <uui-ref-node
        class="rule-ref"
        name=${name}
        detail=${detail}
        ?disabled=${disabled}
        @open=${() => this._toggleRuleCollapsed(feature, index)}
      >
        <umb-icon slot="icon" name="icon-navigation-right"></umb-icon>
        <uui-action-bar slot="actions">
          <uui-button
            look="secondary"
            color="danger"
            label="Remove"
            ?disabled=${disabled}
            @click=${onRemove}
          ></uui-button>
        </uui-action-bar>
      </uui-ref-node>
    `;
  }

  private _renderRuleHeader(
    feature: string,
    index: number,
    disabled: boolean,
    onRemove: () => void,
    suffix?: string,
  ) {
    const collapsed = this._isRuleCollapsed(feature, index);
    return html`
      <div slot="header" class="rule-header">
        <button
          type="button"
          class="rule-toggle"
          aria-label=${collapsed ? 'Expand rule' : 'Collapse rule'}
          aria-expanded=${!collapsed}
          @click=${() => this._toggleRuleCollapsed(feature, index)}
        >
          <umb-icon
            name=${collapsed ? 'icon-navigation-right' : 'icon-navigation-down'}
          ></umb-icon>
          <strong>Rule ${index + 1}</strong>
          ${suffix ? html`<span class="rule-suffix">${suffix}</span>` : nothing}
        </button>
        <uui-button
          look="secondary"
          color="danger"
          label="Remove"
          ?disabled=${disabled}
          @click=${onRemove}
        >Remove</uui-button>
      </div>
    `;
  }

  private _renderFooter() {
    const errors = this._validationErrors();
    return html`
      <div slot="footer" class="footer">
        ${errors.length > 0 && this._settings.useBackoffice
          ? html`<ul class="errors">
              ${errors.map((e) => html`<li>${e}</li>`)}
            </ul>`
          : nothing}
        <uui-button
          look="primary"
          color="positive"
          label="Save"
          ?disabled=${!this._canSave()}
          @click=${this._onSaveClick}
        >
          ${this._saving ? html`<uui-loader></uui-loader>` : 'Save'}
        </uui-button>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* Tab renderers                                                      */
  /* ------------------------------------------------------------------ */

  private _renderAutoNodeTab(disabled: boolean) {
    const feat = this._settings.autoNode;
    const update = (patch: Partial<typeof feat>) => {
      this._patchSettings('autoNode', { ...feat, ...patch });
    };
    const updateRuleAt = (index: number, patch: Partial<(typeof feat.rules)[number]>) => {
      const rules = feat.rules.map((r, i) => (i === index ? { ...r, ...patch } : r));
      update({ rules });
    };

    return html`
      <uui-box>
        <h3 slot="headline" class="uui-h3">AutoNode</h3>
        ${this._renderEnableButton(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p class="feature-description no-divider">
          Automatically creates child nodes when a parent is published, based on rules that match
          document types. Useful for scaffolding required child structure (folders, landing pages)
          the moment a content item is created.
        </p>
        <div class="stack">
          <label class="fit">
            <span>Log level</span>
            <uui-select
              ?disabled=${disabled || !feat.enabled}
              .options=${[
                { name: 'Normal', value: 'Normal', selected: feat.logLevel === 'Normal' },
                { name: 'Verbose', value: 'Verbose', selected: feat.logLevel === 'Verbose' },
              ]}
              @change=${(e: Event) => update({ logLevel: (e.target as HTMLSelectElement).value })}
            ></uui-select>
          </label>
          <div>
            <uui-toggle
              .checked=${feat.republishExistingNodes}
              ?disabled=${disabled || !feat.enabled}
              label="Republish existing nodes"
              label-position="right"
              @change=${(e: Event) =>
                update({ republishExistingNodes: (e.target as HTMLInputElement).checked })}
            ></uui-toggle>
            <p class="field-description">
              When on, AutoNode will also process already-published parent nodes — any missing child
              nodes defined by its rules will be created retroactively the next time the parent is
              republished. Leave off to only apply rules to new nodes.
            </p>
          </div>
        </div>
        <h4>Rules</h4>
        ${feat.rules.length === 0 ? html`<p class="empty">No rules defined.</p>` : nothing}
        ${feat.rules.map((rule, i) => {
          const suffix =
            rule.createdDocTypeAlias && rule.docTypeAliasToCreate
              ? `(${rule.createdDocTypeAlias} \u2192 ${rule.docTypeAliasToCreate})`
              : '';
          const ruleName = suffix ? `Rule ${i + 1} ${suffix}` : `Rule ${i + 1}`;
          const ruleDetail = rule.nodeName ?? '';
          const onRemove = () => {
            this._removeRuleAndReindex('autoNode', i);
            update({ rules: feat.rules.filter((_, idx) => idx !== i) });
          };
          const body = this._isRuleCollapsed('autoNode', i)
            ? this._renderCollapsedRule('autoNode', i, ruleName, ruleDetail, disabled || !feat.enabled, onRemove)
            : html`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader('autoNode', i, disabled || !feat.enabled, onRemove, suffix || undefined)}
                  <div class="grid">
                    ${this._docTypeField('Triggering doctype *', rule.createdDocTypeAlias, disabled || !feat.enabled, (v) =>
                      updateRuleAt(i, { createdDocTypeAlias: v }),
                    )}
                    ${this._docTypeField('DocType to create *', rule.docTypeAliasToCreate, disabled || !feat.enabled, (v) =>
                      updateRuleAt(i, { docTypeAliasToCreate: v }),
                    )}
                    ${this._textField('Node name *', rule.nodeName, disabled || !feat.enabled, (v) =>
                      updateRuleAt(i, { nodeName: v }),
                    )}
                    ${this._textField('Dictionary item for name', rule.dictionaryItemForName, disabled || !feat.enabled, (v) =>
                      updateRuleAt(i, { dictionaryItemForName: v }),
                    )}
                    ${this._blueprintField(
                      'Blueprint',
                      rule.docTypeAliasToCreate,
                      rule.blueprint,
                      disabled || !feat.enabled,
                      (v) => updateRuleAt(i, { blueprint: v }),
                    )}
                    ${this._toggleField(
                      'Bring new node first',
                      rule.bringNewNodeFirst,
                      disabled || !feat.enabled,
                      (v) => updateRuleAt(i, { bringNewNodeFirst: v }),
                      'row-break',
                    )}
                    ${this._toggleField('Only create if no children', rule.onlyCreateIfNoChildren, disabled || !feat.enabled, (v) =>
                      updateRuleAt(i, { onlyCreateIfNoChildren: v }),
                    )}
                    ${this._toggleField(
                      'Create if exists with different name',
                      rule.createIfExistsWithDifferentName,
                      disabled || !feat.enabled,
                      (v) => updateRuleAt(i, { createIfExistsWithDifferentName: v }),
                    )}
                    ${this._toggleField(
                      'Keep new node unpublished',
                      rule.keepNewNodeUnpublished,
                      disabled || !feat.enabled,
                      (v) => updateRuleAt(i, { keepNewNodeUnpublished: v }),
                    )}
                  </div>
                </uui-box>
              `;
          const wrapperClasses = [
            'rule-wrapper',
            this._dragIndex === i ? 'dragging' : '',
            this._dragOverIndex === i && this._dragPosition === 'before' ? 'drop-before' : '',
            this._dragOverIndex === i && this._dragPosition === 'after' ? 'drop-after' : '',
          ]
            .filter(Boolean)
            .join(' ');
          const handleDisabled = disabled || !feat.enabled;
          return html`
            <div
              class=${wrapperClasses}
              @dragover=${(e: DragEvent) => this._onRuleDragOver(e, i)}
              @dragleave=${() => this._onRuleDragLeave(i)}
              @drop=${(e: DragEvent) => this._onRuleDrop(e, i)}
            >
              <span
                class="drag-handle"
                draggable=${handleDisabled ? 'false' : 'true'}
                aria-label="Drag to reorder"
                title="Drag to reorder"
                @dragstart=${(e: DragEvent) => this._onRuleDragStart(e, i)}
                @dragend=${() => this._onRuleDragEnd()}
              >
                <umb-icon name="icon-navigation"></umb-icon>
              </span>
              <div class="rule-content">${body}</div>
            </div>
          `;
        })}
        <uui-button
          look="secondary"
          label="Add rule"
          ?disabled=${disabled || !feat.enabled}
          @click=${() => update({ rules: [...feat.rules, createEmptyAutoNodeRule()] })}
        >+ Add rule</uui-button>
      </uui-box>
    `;
  }

  private _renderNodeRestrictTab(disabled: boolean) {
    const feat = this._settings.nodeRestrict;
    const update = (patch: Partial<typeof feat>) => {
      this._patchSettings('nodeRestrict', { ...feat, ...patch });
    };
    const updateRuleAt = (index: number, patch: Partial<(typeof feat.rules)[number]>) => {
      const rules = feat.rules.map((r, i) => (i === index ? { ...r, ...patch } : r));
      update({ rules });
    };

    return html`
      <uui-box>
        <h3 slot="headline" class="uui-h3">NodeRestrict</h3>
        ${this._renderEnableButton(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p class="feature-description no-divider">
          Limits the number of child nodes of a given type that can be created under a parent node.
          Editors see a configurable warning or error message when they try to exceed the limit.
        </p>
        <div class="grid">
          ${this._textField('Property alias *', feat.propertyAlias, disabled || !feat.enabled, (v) =>
            update({ propertyAlias: v }),
          )}
          ${this._toggleField('Show warnings', feat.showWarnings, disabled || !feat.enabled, (v) =>
            update({ showWarnings: v }),
          )}
        </div>
        <h4>Rules</h4>
        ${feat.rules.length === 0 ? html`<p class="empty">No rules defined.</p>` : nothing}
        ${feat.rules.map((rule, i) => {
          const childLabel =
            !rule.childDocType || rule.childDocType === '*' ? 'any' : rule.childDocType;
          const suffix = rule.parentDocType
            ? `(${rule.parentDocType} \u2192 ${childLabel})`
            : '';
          const ruleName = suffix ? `Rule ${i + 1} ${suffix}` : `Rule ${i + 1}`;
          const ruleDetail = `Max ${rule.maxNodes ?? 0}`;
          const onRemove = () => {
            this._removeRuleAndReindex('nodeRestrict', i);
            update({ rules: feat.rules.filter((_, idx) => idx !== i) });
          };
          if (this._isRuleCollapsed('nodeRestrict', i)) {
            return this._renderCollapsedRule('nodeRestrict', i, ruleName, ruleDetail, disabled || !feat.enabled, onRemove);
          }
          return html`
            <uui-box class="rule-card">
              ${this._renderRuleHeader('nodeRestrict', i, disabled || !feat.enabled, onRemove, suffix || undefined)}
              <div class="grid">
                ${this._docTypeField('Parent doctype *', rule.parentDocType, disabled || !feat.enabled, (v) =>
                  updateRuleAt(i, { parentDocType: v }),
                )}
                ${this._docTypeField(
                  'Child doctype',
                  rule.childDocType || '*',
                  disabled || !feat.enabled,
                  (v) => updateRuleAt(i, { childDocType: v }),
                  { label: 'Any doctype', value: '*' },
                )}
                ${this._numberField('Max nodes *', rule.maxNodes, disabled || !feat.enabled, (v) =>
                  updateRuleAt(i, { maxNodes: v }),
                )}
                ${this._toggleField('Show warnings', rule.showWarnings, disabled || !feat.enabled, (v) =>
                  updateRuleAt(i, { showWarnings: v }),
                )}
                ${this._textField('Custom limit message', rule.customMessage, disabled || !feat.enabled, (v) =>
                  updateRuleAt(i, { customMessage: v }),
                )}
                ${this._textField('Custom limit category', rule.customMessageCategory, disabled || !feat.enabled, (v) =>
                  updateRuleAt(i, { customMessageCategory: v }),
                )}
                ${this._textField('Custom warning message', rule.customWarningMessage, disabled || !feat.enabled, (v) =>
                  updateRuleAt(i, { customWarningMessage: v }),
                )}
                ${this._textField(
                  'Custom warning category',
                  rule.customWarningMessageCategory,
                  disabled || !feat.enabled,
                  (v) => updateRuleAt(i, { customWarningMessageCategory: v }),
                )}
              </div>
            </uui-box>
          `;
        })}
        <uui-button
          look="secondary"
          label="Add rule"
          ?disabled=${disabled || !feat.enabled}
          @click=${() => update({ rules: [...feat.rules, createEmptyNodeRestrictRule()] })}
        >+ Add rule</uui-button>
      </uui-box>
    `;
  }

  private _renderVirtualNodesTab(disabled: boolean) {
    const feat = this._settings.virtualNodes;
    const update = (patch: Partial<typeof feat>) => {
      this._patchSettings('virtualNodes', { ...feat, ...patch });
    };

    return html`
      <uui-box>
        <h3 slot="headline" class="uui-h3">VirtualNodes</h3>
        ${this._renderEnableButton(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p class="feature-description no-divider">
          Hides the URL segment of the selected document types so their children appear one level
          higher in the site's public URLs. Useful for grouping content in the tree without that
          grouping leaking into the URL.
        </p>
        <div class="grid">
          ${this._multiAliasField(
            'Virtual node doctypes',
            this._docTypes,
            (feat.rules ?? []).join(','),
            disabled || !feat.enabled,
            (v) => {
              const rules = v
                ? v.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
                : [];
              update({ rules });
            },
          )}
        </div>
      </uui-box>
    `;
  }

  private _renderVariantsHiderTab(disabled: boolean) {
    const feat = this._settings.variantsHider;
    const update = (patch: Partial<typeof feat>) => {
      this._patchSettings('variantsHider', { ...feat, ...patch });
    };

    return html`
      <uui-box>
        <h3 slot="headline" class="uui-h3">VariantsHider</h3>
        ${this._renderEnableButton(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p class="feature-description no-divider">
          Adds an entity action on the content tree that hides language variants that haven't been
          created yet (those shown in parentheses), so editors only see variants that actually exist.
        </p>
        <div class="grid">
          ${this._textField('Caption', feat.caption, disabled || !feat.enabled, (v) =>
            update({ caption: v }),
          )}
        </div>
      </uui-box>
    `;
  }

  private _renderNodeProtectTab(disabled: boolean) {
    const feat = this._settings.nodeProtect;
    const update = (patch: Partial<typeof feat>) => {
      this._patchSettings('nodeProtect', { ...feat, ...patch });
    };
    const updateRuleAt = (index: number, patch: Partial<(typeof feat.rules)[number]>) => {
      const rules = feat.rules.map((r, i) => (i === index ? { ...r, ...patch } : r));
      update({ rules });
    };

    return html`
      <uui-box>
        <h3 slot="headline" class="uui-h3">NodeProtect</h3>
        ${this._renderEnableButton(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p class="feature-description no-divider">
          Prevents deletion of important nodes, either by document type or by specific GUID. Editors
          see a configurable message explaining why the node can't be deleted.
        </p>
        <div class="grid">
          ${this._propertyField(
            'Property alias *',
            this._trueFalseProperties,
            feat.propertyAlias,
            disabled || !feat.enabled,
            (v) => update({ propertyAlias: v }),
          )}
        </div>
        <h4>Rules</h4>
        ${feat.rules.length === 0 ? html`<p class="empty">No rules defined.</p>` : nothing}
        ${feat.rules.map((rule, i) => {
          const suffix = rule.docTypeAlias ? `(${rule.docTypeAlias})` : '';
          const ruleName = suffix ? `Rule ${i + 1} ${suffix}` : `Rule ${i + 1}`;
          const ruleDetail = rule.documentGuids ? 'By GUIDs' : rule.docTypeAlias ? 'By doctype' : '';
          const onRemove = () => {
            this._removeRuleAndReindex('nodeProtect', i);
            update({ rules: feat.rules.filter((_, idx) => idx !== i) });
          };
          if (this._isRuleCollapsed('nodeProtect', i)) {
            return this._renderCollapsedRule('nodeProtect', i, ruleName, ruleDetail, disabled || !feat.enabled, onRemove);
          }
          return html`
            <uui-box class="rule-card">
              ${this._renderRuleHeader('nodeProtect', i, disabled || !feat.enabled, onRemove, suffix || undefined)}
              <div class="grid">
                ${this._docTypeField('DocType alias', rule.docTypeAlias, disabled || !feat.enabled, (v) =>
                  updateRuleAt(i, { docTypeAlias: v }),
                )}
                ${this._textField(
                  'Document GUIDs (comma separated)',
                  rule.documentGuids,
                  disabled || !feat.enabled,
                  (v) => updateRuleAt(i, { documentGuids: v }),
                )}
                ${this._textField('Custom message', rule.customMessage, disabled || !feat.enabled, (v) =>
                  updateRuleAt(i, { customMessage: v }),
                )}
                ${this._textField(
                  'Custom message category',
                  rule.customMessageCategory,
                  disabled || !feat.enabled,
                  (v) => updateRuleAt(i, { customMessageCategory: v }),
                )}
              </div>
            </uui-box>
          `;
        })}
        <uui-button
          look="secondary"
          label="Add rule"
          ?disabled=${disabled || !feat.enabled}
          @click=${() => update({ rules: [...feat.rules, createEmptyNodeProtectRule()] })}
        >+ Add rule</uui-button>
      </uui-box>
    `;
  }

  private _renderAiSummaryTab(disabled: boolean) {
    const feat = this._settings.aiSummary;
    const update = (patch: Partial<typeof feat>) => {
      this._patchSettings('aiSummary', { ...feat, ...patch });
    };

    return html`
      <uui-box>
        <h3 slot="headline" class="uui-h3">AiSummary</h3>
        ${this._renderEnableButton(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p class="feature-description no-divider">
          Generates AI-powered content summaries using OpenAI or Gemini and writes the result into a
          configured property. A toggle property on the node controls whether a summary should be
          produced for that item.
        </p>
        <div class="grid">
          <label>
            <span>LLM *</span>
            <uui-select
              ?disabled=${disabled || !feat.enabled}
              .options=${[
                { name: 'OpenAI', value: 'openai', selected: feat.llm === 'openai' },
                { name: 'Gemini', value: 'gemini', selected: feat.llm === 'gemini' },
              ]}
              @change=${(e: Event) => update({ llm: (e.target as HTMLSelectElement).value })}
            ></uui-select>
          </label>
          ${this._textField('API key *', feat.apiKey, disabled || !feat.enabled, (v) =>
            update({ apiKey: v }),
          )}
          ${this._textField('Model *', feat.model, disabled || !feat.enabled, (v) => update({ model: v }))}
          ${this._numberField('Max chars', feat.maxChars, disabled || !feat.enabled, (v) =>
            update({ maxChars: v }),
          )}
          ${this._propertyField(
            'Property alias *',
            this._textInputProperties,
            feat.propertyAlias,
            disabled || !feat.enabled,
            (v) => update({ propertyAlias: v }),
          )}
          ${this._propertyField(
            'Toggle property alias',
            this._trueFalseProperties,
            feat.togglePropertyAlias,
            disabled || !feat.enabled,
            (v) => update({ togglePropertyAlias: v }),
          )}
          ${this._multiAliasField(
            'DocTypes',
            this._docTypes,
            feat.docTypes,
            disabled || !feat.enabled,
            (v) => update({ docTypes: v }),
          )}
          ${this._multiAliasField(
            'Exclude properties',
            this._textContentProperties,
            feat.excludeProperties,
            disabled || !feat.enabled,
            (v) => update({ excludeProperties: v }),
          )}
        </div>
        <label class="block">
          <span>Tone</span>
          <uui-textarea
            .value=${feat.tone}
            ?disabled=${disabled || !feat.enabled}
            @input=${(e: Event) => update({ tone: (e.target as HTMLTextAreaElement).value })}
          ></uui-textarea>
        </label>
      </uui-box>
    `;
  }

  private _renderPropertyVersionsTab(disabled: boolean) {
    const feat = this._settings.propertyVersions;
    const update = (patch: Partial<typeof feat>) => {
      this._patchSettings('propertyVersions', { ...feat, ...patch });
    };

    return html`
      <uui-box>
        <h3 slot="headline" class="uui-h3">PropertyVersions</h3>
        ${this._renderEnableButton(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p class="feature-description no-divider">
          Adds navigation actions to properties so editors can step through previous saved versions
          and roll individual properties back without restoring the whole document.
        </p>
        <div class="grid">
          ${this._textField(
            'Next version dictionary entry',
            feat.nextVersionButtonCaptionDictionaryEntry,
            disabled || !feat.enabled,
            (v) => update({ nextVersionButtonCaptionDictionaryEntry: v }),
          )}
          ${this._textField(
            'Previous version dictionary entry',
            feat.previousVersionButtonCaptionDictionaryEntry,
            disabled || !feat.enabled,
            (v) => update({ previousVersionButtonCaptionDictionaryEntry: v }),
          )}
          ${this._textField(
            'No versions dictionary entry',
            feat.noVersionsButtonCaptionDictionaryEntry,
            disabled || !feat.enabled,
            (v) => update({ noVersionsButtonCaptionDictionaryEntry: v }),
          )}
        </div>
      </uui-box>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* Small field helpers                                                */
  /* ------------------------------------------------------------------ */

  private _textField(
    label: string,
    value: string,
    disabled: boolean,
    onChange: (value: string) => void,
  ) {
    return html`
      <label>
        <span>${label}</span>
        <uui-input
          .value=${value ?? ''}
          ?disabled=${disabled}
          @input=${(e: Event) => onChange((e.target as HTMLInputElement).value)}
        ></uui-input>
      </label>
    `;
  }

  private _docTypeField(
    label: string,
    value: string,
    disabled: boolean,
    onChange: (value: string) => void,
    placeholder?: { label: string; value: string },
  ) {
    return this._aliasField(label, this._docTypes, value, disabled, onChange, placeholder);
  }

  private _propertyField(
    label: string,
    options: PropertyOption[],
    value: string,
    disabled: boolean,
    onChange: (value: string) => void,
  ) {
    return this._aliasField(label, options, value, disabled, onChange);
  }

  private _multiAliasField(
    label: string,
    options: { name: string; alias: string }[],
    value: string,
    disabled: boolean,
    onChange: (value: string) => void,
  ) {
    const selected = new Set(
      (value ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    );
    const toggle = (alias: string, checked: boolean) => {
      if (checked) selected.add(alias);
      else selected.delete(alias);
      onChange(Array.from(selected).join(','));
    };
    const knownAliases = new Set(options.map((o) => o.alias));
    const unknownSelected = Array.from(selected).filter((a) => !knownAliases.has(a));
    const expanded = this._expandedFields.has(label);
    const filterMode = this._filterModes.get(label) ?? 'all';
    const setExpanded = (v: boolean) => {
      if (v) this._expandedFields.add(label);
      else this._expandedFields.delete(label);
      this.requestUpdate();
    };
    const setFilter = (mode: 'all' | 'selected') => {
      this._filterModes.set(label, mode);
      this.requestUpdate();
    };
    const visibleOptions =
      filterMode === 'selected' ? options.filter((o) => selected.has(o.alias)) : options;
    const visibleUnknown =
      filterMode === 'selected' || filterMode === 'all' ? unknownSelected : [];
    return html`
      <label>
        <span>${label}</span>
        <div class="multi-box">
          <div class="multi-bar">
            <button
              type="button"
              class="multi-toggle"
              ?disabled=${disabled}
              @click=${() => setExpanded(!expanded)}
            >
              <span class="multi-action">${expanded ? 'Hide list' : 'Show list'}</span>
              <span class="multi-count">(${selected.size} selected)</span>
            </button>
            ${expanded
              ? html`
                  <div class="multi-filter">
                    <label class="checkbox-row">
                      <input
                        type="radio"
                        name="filter-${label}"
                        ?disabled=${disabled}
                        .checked=${filterMode === 'all'}
                        @change=${() => setFilter('all')}
                      />
                      <span>All</span>
                    </label>
                    <label class="checkbox-row">
                      <input
                        type="radio"
                        name="filter-${label}"
                        ?disabled=${disabled}
                        .checked=${filterMode === 'selected'}
                        @change=${() => setFilter('selected')}
                      />
                      <span>Selected only</span>
                    </label>
                  </div>
                `
              : nothing}
          </div>
          ${expanded
            ? html`
                <div class="checkbox-list">
                  ${visibleOptions.length === 0 && visibleUnknown.length === 0
                    ? html`<p class="empty">No entries.</p>`
                    : nothing}
                  ${visibleOptions.map(
                    (o) => html`
                      <label class="checkbox-row">
                        <input
                          type="checkbox"
                          ?disabled=${disabled}
                          .checked=${selected.has(o.alias)}
                          @change=${(e: Event) =>
                            toggle(o.alias, (e.target as HTMLInputElement).checked)}
                        />
                        <span>${o.name} (${o.alias})</span>
                      </label>
                    `,
                  )}
                  ${visibleUnknown.map(
                    (alias) => html`
                      <label class="checkbox-row">
                        <input
                          type="checkbox"
                          ?disabled=${disabled}
                          checked
                          @change=${(e: Event) =>
                            toggle(alias, (e.target as HTMLInputElement).checked)}
                        />
                        <span>${alias} (not found)</span>
                      </label>
                    `,
                  )}
                </div>
              `
            : nothing}
        </div>
      </label>
    `;
  }

  private _aliasField(
    label: string,
    options: { name: string; alias: string }[],
    value: string,
    disabled: boolean,
    onChange: (value: string) => void,
    placeholder?: { label: string; value: string },
  ) {
    const current = value ?? '';
    const knownAliases = new Set(options.map((o) => o.alias));
    const placeholderValue = placeholder?.value ?? '';
    const placeholderLabel = placeholder?.label ?? '-- Select --';
    return html`
      <label>
        <span>${label}</span>
        <select
          class="doctype-select"
          ?disabled=${disabled}
          @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}
        >
          <option value=${placeholderValue} ?selected=${current === placeholderValue || current === ''}>
            ${placeholderLabel}
          </option>
          ${options.map(
            (o) => html`
              <option value=${o.alias} ?selected=${o.alias === current}>
                ${o.name} (${o.alias})
              </option>
            `,
          )}
          ${current && current !== placeholderValue && !knownAliases.has(current)
            ? html`<option value=${current} selected>${current} (not found)</option>`
            : nothing}
        </select>
      </label>
    `;
  }

  private _blueprintField(
    label: string,
    docTypeAliasToCreate: string,
    value: string,
    disabled: boolean,
    onChange: (value: string) => void,
  ) {
    const current = value ?? '';
    const filtered = docTypeAliasToCreate
      ? this._blueprints.filter(
          (b) => b.docTypeAlias.localeCompare(docTypeAliasToCreate, undefined, { sensitivity: 'accent' }) === 0,
        )
      : [];
    const knownNames = new Set(filtered.map((b) => b.name));
    const isDisabled = disabled || !docTypeAliasToCreate;
    const placeholderLabel = !docTypeAliasToCreate
      ? '-- Select a doctype first --'
      : filtered.length === 0
        ? '-- No blueprints available --'
        : '-- Select --';
    return html`
      <label>
        <span>${label}</span>
        <select
          class="doctype-select"
          ?disabled=${isDisabled}
          @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}
        >
          <option value="" ?selected=${current === ''}>${placeholderLabel}</option>
          ${filtered.map(
            (b) => html`
              <option value=${b.name} ?selected=${b.name === current}>${b.name}</option>
            `,
          )}
          ${current && !knownNames.has(current)
            ? html`<option value=${current} selected>${current} (not found)</option>`
            : nothing}
        </select>
      </label>
    `;
  }

  private _numberField(
    label: string,
    value: number,
    disabled: boolean,
    onChange: (value: number) => void,
  ) {
    return html`
      <label>
        <span>${label}</span>
        <uui-input
          .type=${'number'}
          min="0"
          step="1"
          inputmode="numeric"
          .value=${value?.toString() ?? '0'}
          ?disabled=${disabled}
          @input=${(e: Event) => {
            const raw = (e.target as HTMLInputElement).value;
            const parsed = raw === '' ? 0 : Number(raw);
            onChange(Number.isNaN(parsed) ? 0 : parsed);
          }}
        ></uui-input>
      </label>
    `;
  }

  private _toggleField(
    label: string,
    value: boolean,
    disabled: boolean,
    onChange: (value: boolean) => void,
    extraClass?: string,
  ) {
    return html`
      <label class=${`inline${extraClass ? ` ${extraClass}` : ''}`}>
        <uui-toggle
          .checked=${value}
          ?disabled=${disabled}
          @change=${(e: Event) => onChange((e.target as HTMLInputElement).checked)}
        ></uui-toggle>
        <span>${label}</span>
      </label>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      height: 100%;
    }
    .center {
      display: flex;
      justify-content: center;
      padding: var(--uui-size-space-5, 24px);
    }
    uui-box {
      margin-bottom: var(--uui-size-space-4, 16px);
      display: block;
    }
    .banner-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-4, 16px);
      justify-content: space-between;
    }
    .toggle-label {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2, 8px);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: var(--uui-size-space-3, 12px);
      margin-top: var(--uui-size-space-3, 12px);
    }
    .stack {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-4, 16px);
      margin-top: var(--uui-size-space-3, 12px);
    }
    .field-description {
      color: var(--uui-color-text-alt, #666);
      margin: 4px 0 0;
      font-size: 0.9em;
      line-height: 1.4;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    label.inline {
      flex-direction: row;
      align-items: center;
    }
    label.block {
      display: block;
      margin-top: var(--uui-size-space-3, 12px);
    }
    label.block uui-textarea {
      width: 100%;
    }
    label.fit {
      flex-direction: row;
      align-items: center;
      align-self: flex-start;
      width: auto;
      gap: var(--uui-size-space-3, 12px);
    }
    label.fit uui-select {
      width: auto;
      min-width: fit-content;
    }
    uui-box:has(.feature-description) {
      --uui-color-divider-standalone: transparent;
    }
.feature-description {
      color: var(--uui-color-text-alt, #666);
      margin: calc(-1 * var(--uui-size-space-4, 12px)) 0 var(--uui-size-space-4, 16px);
      padding-bottom: var(--uui-size-space-4, 16px);
      line-height: 1.5;
      border-bottom: 1px solid #e9e9eb;
    }
    .feature-description.no-divider {
      padding-bottom: 0;
      border-bottom: none;
    }
    h4 {
      margin-top: var(--uui-size-space-4, 16px);
      margin-bottom: var(--uui-size-space-2, 8px);
    }
    .rule-card {
      margin-top: var(--uui-size-space-3, 12px);
      background-color: transparent;
      --uui-box-box-shadow: none;
      --uui-color-divider-standalone: transparent;
      --uui-box-header-padding: 0;
      --uui-box-default-padding: 0;
    }
    .rule-card .grid {
      margin-top: 0;
    }
    .rule-ref {
      margin-top: var(--uui-size-space-2, 6px);
    }
    .rule-wrapper {
      display: flex;
      align-items: stretch;
      gap: var(--uui-size-space-2, 6px);
      margin-top: var(--uui-size-space-2, 6px);
      border-top: 2px solid transparent;
      border-bottom: 2px solid transparent;
    }
    .rule-wrapper.drop-before {
      border-top-color: var(--uui-color-selected, #3544b1);
    }
    .rule-wrapper.drop-after {
      border-bottom-color: var(--uui-color-selected, #3544b1);
    }
    .rule-wrapper.dragging {
      opacity: 0.5;
    }
    .rule-wrapper .rule-content {
      flex: 1;
      min-width: 0;
    }
    .rule-wrapper .rule-content .rule-card,
    .rule-wrapper .rule-content .rule-ref {
      margin-top: 0;
    }
    .drag-handle {
      cursor: grab;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--uui-size-space-1, 3px);
      color: var(--uui-color-text-alt, #999);
    }
    .drag-handle[draggable='false'] {
      cursor: not-allowed;
      opacity: 0.4;
    }
    .drag-handle:active {
      cursor: grabbing;
    }
    .drag-handle:hover {
      color: var(--uui-color-selected, #3544b1);
    }
    .row-break {
      grid-column-start: 1;
    }
    .uui-h3 {
      font-size: var(--uui-type-h3-size, 30px);
      line-height: var(--uui-size-large, 30px);
      font-weight: 300;
      margin: 0;
    }
    .rule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .rule-toggle {
      appearance: none;
      background: transparent;
      border: none;
      padding: 0;
      font: inherit;
      color: inherit;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: var(--uui-size-space-2, 8px);
    }
    .rule-toggle:hover umb-icon {
      color: var(--uui-color-selected, #3544b1);
    }
    .rule-suffix {
      color: var(--uui-color-text-alt, #666);
      font-weight: normal;
    }
    .empty {
      color: var(--uui-color-text-alt);
      font-style: italic;
    }
    .tab-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
      border-bottom: 1px solid var(--uui-color-border, #ccc);
      margin-top: var(--uui-size-space-3, 12px);
    }
    .tab-button {
      appearance: none;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      padding: var(--uui-size-space-3, 12px) var(--uui-size-space-4, 16px);
      font-family: inherit;
      font-size: inherit;
      color: var(--uui-color-text, inherit);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: var(--uui-size-space-2, 6px);
    }
    .tab-icon {
      font-size: 1em;
      display: inline-flex;
    }
    .tab-button:hover {
      background: var(--uui-color-surface-alt, #f5f5f5);
    }
    .tab-button.active {
      border-bottom-color: var(--uui-color-selected, #3544b1);
      color: var(--uui-color-selected, #3544b1);
      font-weight: 600;
    }
    .tab-button.enabled {
      color: var(--uui-color-positive, #2bc37c);
    }
    .tab-button.enabled.active {
      border-bottom-color: var(--uui-color-positive, #2bc37c);
      color: var(--uui-color-positive, #2bc37c);
    }
    .tab-content {
      padding-top: var(--uui-size-space-4, 16px);
    }
    .tab-content > div[hidden] {
      display: none;
    }
    .footer {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--uui-size-space-3, 12px);
      padding: var(--uui-size-space-3, 12px);
    }
    .errors {
      color: var(--uui-color-danger);
      margin: 0;
      padding-left: 1.25em;
    }
    .inline {
      display: flex;
      gap: var(--uui-size-space-2, 8px);
      align-items: flex-end;
    }
    .doctype-select {
      padding: var(--uui-size-space-2, 6px) var(--uui-size-space-3, 10px);
      border: 1px solid var(--uui-color-border, #ccc);
      border-radius: var(--uui-border-radius, 3px);
      background: var(--uui-color-surface, #fff);
      color: var(--uui-color-text, inherit);
      font-family: inherit;
      font-size: inherit;
    }
    .doctype-select:disabled {
      background: var(--uui-color-surface-alt, #f5f5f5);
      color: var(--uui-color-text-alt, #999);
      cursor: not-allowed;
    }
    .checkbox-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 240px;
      overflow-y: auto;
      padding: var(--uui-size-space-2, 8px);
      border: 1px solid var(--uui-color-border, #ccc);
      border-radius: var(--uui-border-radius, 3px);
      background: var(--uui-color-surface, #fff);
    }
    .checkbox-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--uui-size-space-2, 8px);
      cursor: pointer;
    }
    .checkbox-row input[type='checkbox'] {
      cursor: pointer;
    }
    .checkbox-row input[type='checkbox']:disabled {
      cursor: not-allowed;
    }
    .multi-box {
      border: 1px solid var(--uui-color-border, #ccc);
      border-radius: var(--uui-border-radius, 3px);
      background: var(--uui-color-surface, #fff);
      overflow: hidden;
    }
    .multi-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--uui-size-space-3, 12px);
      padding: 0 var(--uui-size-space-3, 10px);
      min-height: calc(var(--uui-size-11, 36px) - 2px);
      box-sizing: border-box;
    }
    .multi-toggle {
      appearance: none;
      background: transparent;
      border: none;
      padding: 0;
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2, 8px);
      font: inherit;
      color: inherit;
      cursor: pointer;
    }
    .multi-toggle:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    .multi-toggle:hover:not(:disabled) .multi-action {
      text-decoration: underline;
    }
    .multi-action {
      color: var(--uui-color-selected, #3544b1);
      font-weight: 500;
    }
    .multi-count {
      color: var(--uui-color-text-alt, #666);
      font-weight: normal;
    }
    .multi-filter {
      display: flex;
      gap: var(--uui-size-space-3, 12px);
    }
    .multi-box .checkbox-list {
      border: none;
      border-top: 1px solid var(--uui-color-border, #ccc);
      border-radius: 0;
    }
  `;
}

export default DisciplineSettingsWorkspaceElement;

declare global {
  interface HTMLElementTagNameMap {
    'dotsee-discipline-settings-workspace': DisciplineSettingsWorkspaceElement;
  }
}
