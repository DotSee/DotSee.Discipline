import { css, html, customElement, state, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_MODAL_MANAGER_CONTEXT, UMB_CONFIRM_MODAL } from '@umbraco-cms/backoffice/modal';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';
import {
  DisciplineSettings,
  DisciplineSettingsResponse,
  DocTypeOption,
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

  private _repository?: DisciplineSettingsRepository;

  override connectedCallback() {
    super.connectedCallback();
    this._init();
  }

  private async _init() {
    const authContext = await this.getContext(UMB_AUTH_CONTEXT);
    const token = await authContext!.getLatestToken();
    this._repository = new DisciplineSettingsRepository(token);

    try {
      const [response, docTypes] = await Promise.all([
        this._repository.getSettings(),
        this._repository.getDocTypes().catch(() => [] as DocTypeOption[]),
      ]);
      this._docTypes = docTypes;
      this._applyResponse(response);
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
        if (!rule.childDocType) errors.push(`NodeRestrict rule ${i + 1}: Child doctype is required`);
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
                ${TABS.map(
                  (tab) => html`
                    <button
                      type="button"
                      class="tab-button ${this._activeTab === tab.alias ? 'active' : ''}"
                      @click=${() => {
                        this._activeTab = tab.alias;
                        this.requestUpdate();
                      }}
                    >
                      ${tab.label}
                    </button>
                  `,
                )}
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
          <label class="toggle-label">
            <uui-toggle
              .checked=${this._settings.useBackoffice}
              @change=${this._onMasterToggleChange}
            ></uui-toggle>
            <span>Manage settings from the backoffice</span>
          </label>
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

  private _renderFeatureToggle(
    checked: boolean,
    disabled: boolean,
    onChange: (value: boolean) => void,
  ) {
    return html`
      <label class="feature-toggle">
        <uui-toggle
          .checked=${checked}
          ?disabled=${disabled}
          @change=${(e: Event) => onChange((e.target as HTMLInputElement).checked)}
        ></uui-toggle>
        <span>Enable this feature</span>
      </label>
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
      <uui-box headline="AutoNode">
        ${this._renderFeatureToggle(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <div class="grid">
          <label>
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
          <label class="inline">
            <uui-toggle
              .checked=${feat.republishExistingNodes}
              ?disabled=${disabled || !feat.enabled}
              @change=${(e: Event) =>
                update({ republishExistingNodes: (e.target as HTMLInputElement).checked })}
            ></uui-toggle>
            <span>Republish existing nodes</span>
          </label>
        </div>
        <h4>Rules</h4>
        ${feat.rules.length === 0 ? html`<p class="empty">No rules defined.</p>` : nothing}
        ${feat.rules.map(
          (rule, i) => html`
            <uui-box class="rule-card">
              <div slot="header" class="rule-header">
                <strong>Rule ${i + 1}</strong>
                <uui-button
                  look="secondary"
                  color="danger"
                  label="Remove"
                  ?disabled=${disabled || !feat.enabled}
                  @click=${() =>
                    update({ rules: feat.rules.filter((_, idx) => idx !== i) })}
                >Remove</uui-button>
              </div>
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
                ${this._textField('Blueprint', rule.blueprint, disabled || !feat.enabled, (v) =>
                  updateRuleAt(i, { blueprint: v }),
                )}
                ${this._toggleField('Bring new node first', rule.bringNewNodeFirst, disabled || !feat.enabled, (v) =>
                  updateRuleAt(i, { bringNewNodeFirst: v }),
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
          `,
        )}
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
      <uui-box headline="NodeRestrict">
        ${this._renderFeatureToggle(feat.enabled, disabled, (v) => update({ enabled: v }))}
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
        ${feat.rules.map(
          (rule, i) => html`
            <uui-box class="rule-card">
              <div slot="header" class="rule-header">
                <strong>Rule ${i + 1}</strong>
                <uui-button
                  look="secondary"
                  color="danger"
                  label="Remove"
                  ?disabled=${disabled || !feat.enabled}
                  @click=${() =>
                    update({ rules: feat.rules.filter((_, idx) => idx !== i) })}
                >Remove</uui-button>
              </div>
              <div class="grid">
                ${this._docTypeField('Parent doctype *', rule.parentDocType, disabled || !feat.enabled, (v) =>
                  updateRuleAt(i, { parentDocType: v }),
                )}
                ${this._docTypeField('Child doctype *', rule.childDocType, disabled || !feat.enabled, (v) =>
                  updateRuleAt(i, { childDocType: v }),
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
          `,
        )}
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
      <uui-box headline="VirtualNodes">
        ${this._renderFeatureToggle(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p>List of document type aliases to be treated as virtual nodes.</p>
        ${feat.rules.length === 0 ? html`<p class="empty">No aliases defined.</p>` : nothing}
        ${feat.rules.map(
          (alias, i) => html`
            <div class="inline">
              ${this._docTypeField('DocType alias *', alias, disabled || !feat.enabled, (v) => {
                const rules = feat.rules.map((r, idx) => (idx === i ? v : r));
                update({ rules });
              })}
              <uui-button
                look="secondary"
                color="danger"
                label="Remove"
                ?disabled=${disabled || !feat.enabled}
                @click=${() => update({ rules: feat.rules.filter((_, idx) => idx !== i) })}
              >Remove</uui-button>
            </div>
          `,
        )}
        <uui-button
          look="secondary"
          label="Add alias"
          ?disabled=${disabled || !feat.enabled}
          @click=${() => update({ rules: [...feat.rules, ''] })}
        >+ Add alias</uui-button>
      </uui-box>
    `;
  }

  private _renderVariantsHiderTab(disabled: boolean) {
    const feat = this._settings.variantsHider;
    const update = (patch: Partial<typeof feat>) => {
      this._patchSettings('variantsHider', { ...feat, ...patch });
    };

    return html`
      <uui-box headline="VariantsHider">
        ${this._renderFeatureToggle(feat.enabled, disabled, (v) => update({ enabled: v }))}
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
      <uui-box headline="NodeProtect">
        ${this._renderFeatureToggle(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <div class="grid">
          ${this._textField('Property alias *', feat.propertyAlias, disabled || !feat.enabled, (v) =>
            update({ propertyAlias: v }),
          )}
        </div>
        <h4>Rules</h4>
        ${feat.rules.length === 0 ? html`<p class="empty">No rules defined.</p>` : nothing}
        ${feat.rules.map(
          (rule, i) => html`
            <uui-box class="rule-card">
              <div slot="header" class="rule-header">
                <strong>Rule ${i + 1}</strong>
                <uui-button
                  look="secondary"
                  color="danger"
                  label="Remove"
                  ?disabled=${disabled || !feat.enabled}
                  @click=${() =>
                    update({ rules: feat.rules.filter((_, idx) => idx !== i) })}
                >Remove</uui-button>
              </div>
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
          `,
        )}
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
      <uui-box headline="AiSummary">
        ${this._renderFeatureToggle(feat.enabled, disabled, (v) => update({ enabled: v }))}
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
          ${this._textField('Property alias *', feat.propertyAlias, disabled || !feat.enabled, (v) =>
            update({ propertyAlias: v }),
          )}
          ${this._textField('Toggle property alias', feat.togglePropertyAlias, disabled || !feat.enabled, (v) =>
            update({ togglePropertyAlias: v }),
          )}
          ${this._textField(
            'DocTypes (comma separated)',
            feat.docTypes,
            disabled || !feat.enabled,
            (v) => update({ docTypes: v }),
          )}
          ${this._textField(
            'Exclude properties (comma separated)',
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
      <uui-box headline="PropertyVersions">
        ${this._renderFeatureToggle(feat.enabled, disabled, (v) => update({ enabled: v }))}
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
  ) {
    const current = value ?? '';
    const knownAliases = new Set(this._docTypes.map((d) => d.alias));
    return html`
      <label>
        <span>${label}</span>
        <select
          class="doctype-select"
          ?disabled=${disabled}
          @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}
        >
          <option value="" ?selected=${current === ''}>-- Select --</option>
          ${this._docTypes.map(
            (d) => html`
              <option value=${d.alias} ?selected=${d.alias === current}>
                ${d.name} (${d.alias})
              </option>
            `,
          )}
          ${current && !knownAliases.has(current)
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
          type="number"
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
  ) {
    return html`
      <label class="inline">
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
    .feature-toggle {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2, 8px);
      margin-bottom: var(--uui-size-space-3, 12px);
    }
    h4 {
      margin-top: var(--uui-size-space-4, 16px);
      margin-bottom: var(--uui-size-space-2, 8px);
    }
    .rule-card {
      margin-top: var(--uui-size-space-3, 12px);
    }
    .rule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
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
    }
    .tab-button:hover {
      background: var(--uui-color-surface-alt, #f5f5f5);
    }
    .tab-button.active {
      border-bottom-color: var(--uui-color-selected, #3544b1);
      color: var(--uui-color-selected, #3544b1);
      font-weight: 600;
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
  `;
}

export default DisciplineSettingsWorkspaceElement;

declare global {
  interface HTMLElementTagNameMap {
    'dotsee-discipline-settings-workspace': DisciplineSettingsWorkspaceElement;
  }
}
