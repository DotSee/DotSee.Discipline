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
  labelKey: string;
}

const TABS: TabDefinition[] = [
  { alias: 'autoNode', labelKey: 'dotseeDiscipline_autoNode_label' },
  { alias: 'nodeRestrict', labelKey: 'dotseeDiscipline_nodeRestrict_label' },
  { alias: 'virtualNodes', labelKey: 'dotseeDiscipline_virtualNodes_label' },
  { alias: 'variantsHider', labelKey: 'dotseeDiscipline_variantsHider_label' },
  { alias: 'nodeProtect', labelKey: 'dotseeDiscipline_nodeProtect_label' },
  { alias: 'aiSummary', labelKey: 'dotseeDiscipline_aiSummary_label' },
  { alias: 'propertyVersions', labelKey: 'dotseeDiscipline_propertyVersions_label' },
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

  @state()
  private _dragFeature: 'autoNode' | 'nodeRestrict' | 'nodeProtect' | null = null;

  private _repository?: DisciplineSettingsRepository;

  // Snapshot of last server-known state for sections whose changes only take effect
  // after a backoffice reload (VariantsHider + PropertyVersions are registered once
  // at extension entry-point init). Compared against pre-save state to decide whether
  // to show the reload hint toast.
  private _refreshSensitiveSnapshot = '';

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
    // Resolve a fresh token per request — Umbraco access tokens are short-lived and
    // the auth context refreshes them transparently.
    this._repository = new DisciplineSettingsRepository(() => authContext!.getLatestToken());

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
      await this._notify(
        'danger',
        this.localize.term('dotseeDiscipline_settings_loadFailedToast', this._errorMessage(error)),
      );
    } finally {
      this._loading = false;
      this.requestUpdate();
    }
  }

  private _applyResponse(response: DisciplineSettingsResponse) {
    this._hasAppSettings = response.hasAppSettings;
    this._settings = response.settings ?? emptySettings();
    this._refreshSensitiveSnapshot = this._snapshotRefreshSensitive(this._settings);
    this.requestUpdate();
  }

  private _snapshotRefreshSensitive(s: DisciplineSettings): string {
    return JSON.stringify({ variantsHider: s.variantsHider, propertyVersions: s.propertyVersions });
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
        headline: this.localize.term('dotseeDiscipline_settings_loadFromAppsettings'),
        content: this.localize.term('dotseeDiscipline_settings_importConfirmContent'),
        confirmLabel: this.localize.term('dotseeDiscipline_settings_importConfirmLabel'),
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
      await this._notify('positive', this.localize.term('dotseeDiscipline_settings_loadedToast'));
    } catch (error) {
      await this._notify(
        'danger',
        this.localize.term('dotseeDiscipline_settings_importFailedToast', this._errorMessage(error)),
      );
    } finally {
      this._saving = false;
      this.requestUpdate();
    }
  }

  private async _onSaveClick() {
    if (!this._repository || !this._canSave()) return;
    const refreshSensitiveChanged =
      this._snapshotRefreshSensitive(this._settings) !== this._refreshSensitiveSnapshot;
    try {
      this._saving = true;
      this.requestUpdate();
      const response = await this._repository.saveSettings(this._settings);
      this._applyResponse(response);
      await this._notify('positive', this.localize.term('dotseeDiscipline_settings_savedToast'));
      if (refreshSensitiveChanged) {
        await this._notify('warning', this.localize.term('dotseeDiscipline_settings_reloadHintToast'));
      }
    } catch (error) {
      await this._notify(
        'danger',
        this.localize.term('dotseeDiscipline_settings_saveFailedToast', this._errorMessage(error)),
      );
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

    const t = (key: string, ...tokens: unknown[]) => this.localize.term(key, ...tokens);

    if (s.autoNode.enabled) {
      s.autoNode.rules.forEach((rule, i) => {
        if (!rule.createdDocTypeAlias)
          errors.push(t('dotseeDiscipline_autoNode_validationCreatedDoctype', i + 1));
        if (!rule.docTypeAliasToCreate)
          errors.push(t('dotseeDiscipline_autoNode_validationDoctypeToCreate', i + 1));
        if (!rule.nodeName)
          errors.push(t('dotseeDiscipline_autoNode_validationNodeName', i + 1));
      });
    }

    if (s.nodeRestrict.enabled) {
      // propertyAlias is optional — it only enables the per-parent "special property" override.
      s.nodeRestrict.rules.forEach((rule, i) => {
        if (!rule.parentDocType)
          errors.push(t('dotseeDiscipline_nodeRestrict_validationParentDoctype', i + 1));
        if (!Number.isFinite(rule.maxNodes) || rule.maxNodes < 0)
          errors.push(t('dotseeDiscipline_nodeRestrict_validationMaxNodes', i + 1));
      });
    }

    if (s.nodeProtect.enabled) {
      // propertyAlias is optional — it only enables the per-node "protected" property override.
      s.nodeProtect.rules.forEach((rule, i) => {
        if (!rule.docTypeAlias && !rule.documentGuids)
          errors.push(t('dotseeDiscipline_nodeProtect_validationDoctypeOrGuids', i + 1));
      });
    }

    if (s.virtualNodes.enabled) {
      s.virtualNodes.rules.forEach((rule, i) => {
        if (!rule) errors.push(t('dotseeDiscipline_virtualNodes_validationDoctype', i + 1));
      });
    }

    if (s.aiSummary.enabled) {
      if (!s.aiSummary.llm) errors.push(t('dotseeDiscipline_aiSummary_validationLlm'));
      if (!s.aiSummary.apiKey) errors.push(t('dotseeDiscipline_aiSummary_validationApiKey'));
      if (!s.aiSummary.model) errors.push(t('dotseeDiscipline_aiSummary_validationModel'));
      if (!s.aiSummary.propertyAlias)
        errors.push(t('dotseeDiscipline_aiSummary_validationPropertyAlias'));
    }

    return errors;
  }

  private get _fieldsDisabled() {
    return !this._settings.useBackoffice || this._saving;
  }

  override render() {
    const headline = this.localize.term('dotseeDiscipline_settings_headline');
    if (this._loading) {
      return html`<umb-body-layout headline=${headline}>
        <div class="center"><uui-loader></uui-loader></div>
      </umb-body-layout>`;
    }

    const disabled = this._fieldsDisabled;
    const active = this._settings.useBackoffice;
    return html`
      <umb-body-layout headline=${headline}>
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
                      <span>${this.localize.term(tab.labelKey)}</span>
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
    const sourceHeadline = this.localize.term('dotseeDiscipline_settings_sourceHeadline');
    if (!this._hasAppSettings) {
      return html`
        <uui-box headline=${sourceHeadline}>
          <p>${this.localize.term('dotseeDiscipline_settings_noAppsettingsFound')}</p>
        </uui-box>
      `;
    }

    return html`
      <uui-box headline=${sourceHeadline}>
        <div class="banner-row">
          <uui-toggle
            .checked=${this._settings.useBackoffice}
            label=${this.localize.term('dotseeDiscipline_settings_manageFromBackoffice')}
            label-position="right"
            @change=${this._onMasterToggleChange}
          ></uui-toggle>
          ${this._settings.useBackoffice
            ? html`
                <uui-button
                  look="primary"
                  color="positive"
                  label=${this.localize.term('dotseeDiscipline_settings_loadFromAppsettings')}
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
        label=${this.localize.term(
          enabled ? 'dotseeDiscipline_common_disable' : 'dotseeDiscipline_common_enable',
        )}
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

  private _reorderRules(
    feature: 'autoNode' | 'nodeRestrict' | 'nodeProtect',
    srcIdx: number,
    dstIdx: number,
  ) {
    const feat = this._settings[feature];
    if (srcIdx === dstIdx || srcIdx < 0 || srcIdx >= feat.rules.length) return;
    const clamped = Math.max(0, Math.min(dstIdx, feat.rules.length - 1));
    if (srcIdx === clamped) return;
    const newRules = feat.rules.slice();
    const [moved] = newRules.splice(srcIdx, 1);
    newRules.splice(clamped, 0, moved as typeof moved);

    const oldToNew = new Map<number, number>();
    const perm = feat.rules.map((_, i) => i);
    const [movedIdx] = perm.splice(srcIdx, 1);
    perm.splice(clamped, 0, movedIdx);
    perm.forEach((oldIdx, newIdx) => oldToNew.set(oldIdx, newIdx));
    this._remapCollapsedRules(feature, oldToNew);

    this._patchSettings(feature, { ...feat, rules: newRules as typeof feat.rules });
  }

  private _onRuleDragStart(
    event: DragEvent,
    feature: 'autoNode' | 'nodeRestrict' | 'nodeProtect',
    index: number,
  ) {
    this._dragFeature = feature;
    this._dragIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
      const handle = event.currentTarget as HTMLElement | null;
      const wrapper = handle?.closest('.rule-wrapper') as HTMLElement | null;
      if (wrapper) {
        const rect = wrapper.getBoundingClientRect();
        event.dataTransfer.setDragImage(
          wrapper,
          event.clientX - rect.left,
          event.clientY - rect.top,
        );
      }
    }
    this.requestUpdate();
  }

  private _onRuleDragOver(
    event: DragEvent,
    feature: 'autoNode' | 'nodeRestrict' | 'nodeProtect',
    index: number,
  ) {
    if (this._dragIndex === null || this._dragFeature !== feature) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position: 'before' | 'after' = event.clientY < midpoint ? 'before' : 'after';
    if (this._dragOverIndex !== index || this._dragPosition !== position) {
      this._dragOverIndex = index;
      this._dragPosition = position;
      this.requestUpdate();
    }
  }

  private _onRuleDragLeave(
    feature: 'autoNode' | 'nodeRestrict' | 'nodeProtect',
    index: number,
  ) {
    if (this._dragFeature === feature && this._dragOverIndex === index) {
      this._dragOverIndex = null;
      this._dragPosition = null;
      this.requestUpdate();
    }
  }

  private _onRuleDrop(
    event: DragEvent,
    feature: 'autoNode' | 'nodeRestrict' | 'nodeProtect',
    targetIndex: number,
  ) {
    event.preventDefault();
    if (this._dragIndex === null || this._dragFeature !== feature) return;
    const src = this._dragIndex;
    const position = this._dragPosition ?? 'after';
    let dst = targetIndex + (position === 'after' ? 1 : 0);
    if (src < dst) dst--;
    this._reorderRules(feature, src, dst);
    this._dragFeature = null;
    this._dragIndex = null;
    this._dragOverIndex = null;
    this._dragPosition = null;
    this.requestUpdate();
  }

  private _onRuleDragEnd() {
    this._dragFeature = null;
    this._dragIndex = null;
    this._dragOverIndex = null;
    this._dragPosition = null;
    this.requestUpdate();
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
            label=${this.localize.term('dotseeDiscipline_common_remove')}
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
    const removeLabel = this.localize.term('dotseeDiscipline_common_remove');
    return html`
      <div slot="header" class="rule-header">
        <button
          type="button"
          class="rule-toggle"
          aria-label=${this.localize.term(
            collapsed
              ? 'dotseeDiscipline_common_expandRule'
              : 'dotseeDiscipline_common_collapseRule',
          )}
          aria-expanded=${!collapsed}
          @click=${() => this._toggleRuleCollapsed(feature, index)}
        >
          <umb-icon
            name=${collapsed ? 'icon-navigation-right' : 'icon-navigation-down'}
          ></umb-icon>
          <strong>${this.localize.term('dotseeDiscipline_common_ruleNumber', index + 1)}</strong>
          ${suffix ? html`<span class="rule-suffix">${suffix}</span>` : nothing}
        </button>
        <uui-button
          look="secondary"
          color="danger"
          label=${removeLabel}
          ?disabled=${disabled}
          @click=${onRemove}
        >${removeLabel}</uui-button>
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
          label=${this.localize.term('dotseeDiscipline_common_save')}
          ?disabled=${!this._canSave()}
          @click=${this._onSaveClick}
        >
          ${this._saving
            ? html`<uui-loader></uui-loader>`
            : this.localize.term('dotseeDiscipline_common_save')}
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
        <h4 slot="headline" class="uui-h4">${this.localize.term('dotseeDiscipline_autoNode_label')}</h4>
        ${this._renderEnableButton(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p class="feature-description no-divider">
          ${this.localize.term('dotseeDiscipline_autoNode_description')}
        </p>
        ${feat.enabled ? html`
        <div class="grid">
          ${this._withFieldHelp(
            html`
              <label class="fit">
                <span>${this.localize.term('dotseeDiscipline_autoNode_logLevel')}</span>
                <uui-select
                  ?disabled=${disabled || !feat.enabled}
                  .options=${[
                    {
                      name: this.localize.term('dotseeDiscipline_autoNode_logLevelNormal'),
                      value: 'Normal',
                      selected: feat.logLevel === 'Normal',
                    },
                    {
                      name: this.localize.term('dotseeDiscipline_autoNode_logLevelVerbose'),
                      value: 'Verbose',
                      selected: feat.logLevel === 'Verbose',
                    },
                  ]}
                  @change=${(e: Event) => update({ logLevel: (e.target as HTMLSelectElement).value })}
                ></uui-select>
              </label>
            `,
            'autonode-loglevel-help',
            this.localize.term('dotseeDiscipline_autoNode_logLevelHelp'),
            'inline',
          )}
          ${this._withFieldHelp(
            html`
              <uui-toggle
                .checked=${feat.republishExistingNodes}
                ?disabled=${disabled || !feat.enabled}
                label=${this.localize.term('dotseeDiscipline_autoNode_republish')}
                label-position="right"
                @change=${(e: Event) =>
                  update({ republishExistingNodes: (e.target as HTMLInputElement).checked })}
              ></uui-toggle>
            `,
            'autonode-republish-help',
            this.localize.term('dotseeDiscipline_autoNode_republishHelp'),
            'inline',
          )}
        </div>
        <h4>${this.localize.term('dotseeDiscipline_common_rules')}</h4>
        ${feat.rules.length === 0
          ? html`<p class="empty">${this.localize.term('dotseeDiscipline_common_noRulesDefined')}</p>`
          : nothing}
        ${feat.rules.map((rule, i) => {
          const suffix =
            rule.createdDocTypeAlias && rule.docTypeAliasToCreate
              ? `(${rule.createdDocTypeAlias} \u2192 ${rule.docTypeAliasToCreate})`
              : '';
          const ruleNumber = this.localize.term('dotseeDiscipline_common_ruleNumber', i + 1);
          const ruleName = suffix ? `${ruleNumber} ${suffix}` : ruleNumber;
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
                    ${this._withFieldHelp(
                      this._docTypeField(
                        this.localize.term('dotseeDiscipline_autoNode_triggeringDoctype'),
                        rule.createdDocTypeAlias,
                        disabled || !feat.enabled,
                        (v) => updateRuleAt(i, { createdDocTypeAlias: v }),
                      ),
                      `autonode-rule-${i}-trigger-help`,
                      this.localize.term('dotseeDiscipline_autoNode_triggeringDoctypeHelp'),
                    )}
                    ${this._withFieldHelp(
                      this._docTypeField(
                        this.localize.term('dotseeDiscipline_autoNode_doctypeToCreate'),
                        rule.docTypeAliasToCreate,
                        disabled || !feat.enabled,
                        (v) => updateRuleAt(i, { docTypeAliasToCreate: v }),
                      ),
                      `autonode-rule-${i}-create-help`,
                      this.localize.term('dotseeDiscipline_autoNode_doctypeToCreateHelp'),
                    )}
                    ${this._withFieldHelp(
                      this._textField(
                        this.localize.term('dotseeDiscipline_autoNode_nodeName'),
                        rule.nodeName,
                        disabled || !feat.enabled,
                        (v) => updateRuleAt(i, { nodeName: v }),
                      ),
                      `autonode-rule-${i}-nodename-help`,
                      this.localize.term('dotseeDiscipline_autoNode_nodeNameHelp'),
                    )}
                    ${this._withFieldHelp(
                      this._textField(
                        this.localize.term('dotseeDiscipline_autoNode_dictionaryItem'),
                        rule.dictionaryItemForName,
                        disabled || !feat.enabled,
                        (v) => updateRuleAt(i, { dictionaryItemForName: v }),
                      ),
                      `autonode-rule-${i}-dictionary-help`,
                      this.localize.term('dotseeDiscipline_autoNode_dictionaryItemHelp'),
                      'stretch',
                      'row-break',
                    )}
                    ${this._withFieldHelp(
                      this._blueprintField(
                        this.localize.term('dotseeDiscipline_autoNode_blueprint'),
                        rule.docTypeAliasToCreate,
                        rule.blueprint,
                        disabled || !feat.enabled,
                        (v) => updateRuleAt(i, { blueprint: v }),
                      ),
                      `autonode-rule-${i}-blueprint-help`,
                      this.localize.term('dotseeDiscipline_autoNode_blueprintHelp'),
                    )}
                    ${this._withFieldHelp(
                      this._toggleField(
                        this.localize.term('dotseeDiscipline_autoNode_bringFirst'),
                        rule.bringNewNodeFirst,
                        disabled || !feat.enabled,
                        (v) => updateRuleAt(i, { bringNewNodeFirst: v }),
                      ),
                      `autonode-rule-${i}-bringfirst-help`,
                      this.localize.term('dotseeDiscipline_autoNode_bringFirstHelp'),
                      'inline',
                      'row-break',
                    )}
                    ${this._withFieldHelp(
                      this._toggleField(
                        this.localize.term('dotseeDiscipline_autoNode_onlyIfNoChildren'),
                        rule.onlyCreateIfNoChildren,
                        disabled || !feat.enabled,
                        (v) => updateRuleAt(i, { onlyCreateIfNoChildren: v }),
                      ),
                      `autonode-rule-${i}-nochildren-help`,
                      this.localize.term('dotseeDiscipline_autoNode_onlyIfNoChildrenHelp'),
                      'inline',
                    )}
                    ${this._withFieldHelp(
                      this._toggleField(
                        this.localize.term('dotseeDiscipline_autoNode_existsDifferentName'),
                        rule.createIfExistsWithDifferentName,
                        disabled || !feat.enabled,
                        (v) => updateRuleAt(i, { createIfExistsWithDifferentName: v }),
                      ),
                      `autonode-rule-${i}-existsdiffname-help`,
                      this.localize.term('dotseeDiscipline_autoNode_existsDifferentNameHelp'),
                      'inline',
                    )}
                    ${this._withFieldHelp(
                      this._toggleField(
                        this.localize.term('dotseeDiscipline_autoNode_keepUnpublished'),
                        rule.keepNewNodeUnpublished,
                        disabled || !feat.enabled,
                        (v) => updateRuleAt(i, { keepNewNodeUnpublished: v }),
                      ),
                      `autonode-rule-${i}-unpublished-help`,
                      this.localize.term('dotseeDiscipline_autoNode_keepUnpublishedHelp'),
                      'inline',
                    )}
                  </div>
                </uui-box>
              `;
          const isDragging = this._dragFeature === 'autoNode' && this._dragIndex === i;
          const isDropTarget = this._dragFeature === 'autoNode' && this._dragOverIndex === i;
          const wrapperClasses = [
            'rule-wrapper',
            isDragging ? 'dragging' : '',
            isDropTarget && this._dragPosition === 'before' ? 'drop-before' : '',
            isDropTarget && this._dragPosition === 'after' ? 'drop-after' : '',
          ]
            .filter(Boolean)
            .join(' ');
          const handleDisabled = disabled || !feat.enabled;
          return html`
            <div
              class=${wrapperClasses}
              @dragover=${(e: DragEvent) => this._onRuleDragOver(e, 'autoNode', i)}
              @dragleave=${() => this._onRuleDragLeave('autoNode', i)}
              @drop=${(e: DragEvent) => this._onRuleDrop(e, 'autoNode', i)}
            >
              <span
                class="drag-handle"
                draggable=${handleDisabled ? 'false' : 'true'}
                aria-label=${this.localize.term('dotseeDiscipline_common_dragToReorder')}
                title=${this.localize.term('dotseeDiscipline_common_dragToReorder')}
                @dragstart=${(e: DragEvent) => this._onRuleDragStart(e, 'autoNode', i)}
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
          label=${this.localize.term('dotseeDiscipline_common_addRule')}
          ?disabled=${disabled || !feat.enabled}
          @click=${() => update({ rules: [...feat.rules, createEmptyAutoNodeRule()] })}
        >${this.localize.term('dotseeDiscipline_common_addRuleButton')}</uui-button>
        ` : nothing}
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
        <h4 slot="headline" class="uui-h4">${this.localize.term('dotseeDiscipline_nodeRestrict_label')}</h4>
        ${this._renderEnableButton(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p class="feature-description no-divider">
          ${this.localize.term('dotseeDiscipline_nodeRestrict_description')}
        </p>
        ${feat.enabled ? html`
        <div class="grid">
          ${this._withFieldHelp(
            this._textField(
              this.localize.term('dotseeDiscipline_nodeRestrict_propertyAlias'),
              feat.propertyAlias,
              disabled || !feat.enabled,
              (v) => update({ propertyAlias: v }),
            ),
            'noderestrict-propertyalias-help',
            this.localize.term('dotseeDiscipline_nodeRestrict_propertyAliasHelp'),
          )}
          ${this._withFieldHelp(
            this._toggleField(
              this.localize.term('dotseeDiscipline_nodeRestrict_showWarnings'),
              feat.showWarnings,
              disabled || !feat.enabled,
              (v) => update({ showWarnings: v }),
            ),
            'noderestrict-showwarnings-help',
            this.localize.term('dotseeDiscipline_nodeRestrict_showWarningsHelp'),
            'inline',
            'align-bottom',
          )}
        </div>
        <h4>${this.localize.term('dotseeDiscipline_common_rules')}</h4>
        ${feat.rules.length === 0
          ? html`<p class="empty">${this.localize.term('dotseeDiscipline_common_noRulesDefined')}</p>`
          : nothing}
        ${feat.rules.map((rule, i) => {
          const childLabel =
            !rule.childDocType || rule.childDocType === '*'
              ? this.localize.term('dotseeDiscipline_common_anyDoctypeLowercase')
              : rule.childDocType;
          const suffix = rule.parentDocType
            ? `(${rule.parentDocType} \u2192 ${childLabel})`
            : '';
          const ruleNumber = this.localize.term('dotseeDiscipline_common_ruleNumber', i + 1);
          const ruleName = suffix ? `${ruleNumber} ${suffix}` : ruleNumber;
          const ruleDetail = this.localize.term('dotseeDiscipline_nodeRestrict_ruleDetailMax', rule.maxNodes ?? 0);
          const onRemove = () => {
            this._removeRuleAndReindex('nodeRestrict', i);
            update({ rules: feat.rules.filter((_, idx) => idx !== i) });
          };
          const body = this._isRuleCollapsed('nodeRestrict', i)
            ? this._renderCollapsedRule('nodeRestrict', i, ruleName, ruleDetail, disabled || !feat.enabled, onRemove)
            : html`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader('nodeRestrict', i, disabled || !feat.enabled, onRemove, suffix || undefined)}
              <div class="grid">
                ${this._withFieldHelp(
                  this._docTypeField(
                    this.localize.term('dotseeDiscipline_nodeRestrict_parentDoctype'),
                    rule.parentDocType,
                    disabled || !feat.enabled,
                    (v) => updateRuleAt(i, { parentDocType: v }),
                  ),
                  `noderestrict-rule-${i}-parent-help`,
                  this.localize.term('dotseeDiscipline_nodeRestrict_parentDoctypeHelp'),
                )}
                ${this._withFieldHelp(
                  this._docTypeField(
                    this.localize.term('dotseeDiscipline_nodeRestrict_childDoctype'),
                    rule.childDocType || '*',
                    disabled || !feat.enabled,
                    (v) => updateRuleAt(i, { childDocType: v }),
                    {
                      label: this.localize.term('dotseeDiscipline_common_anyDoctype'),
                      value: '*',
                    },
                  ),
                  `noderestrict-rule-${i}-child-help`,
                  this.localize.term('dotseeDiscipline_nodeRestrict_childDoctypeHelp'),
                )}
                ${this._withFieldHelp(
                  this._numberField(
                    this.localize.term('dotseeDiscipline_nodeRestrict_maxNodes'),
                    rule.maxNodes,
                    disabled || !feat.enabled,
                    (v) => updateRuleAt(i, { maxNodes: v }),
                  ),
                  `noderestrict-rule-${i}-max-help`,
                  this.localize.term('dotseeDiscipline_nodeRestrict_maxNodesHelp'),
                )}
                ${this._withFieldHelp(
                  this._toggleField(
                    this.localize.term('dotseeDiscipline_nodeRestrict_showWarnings'),
                    rule.showWarnings,
                    disabled || !feat.enabled,
                    (v) => updateRuleAt(i, { showWarnings: v }),
                  ),
                  `noderestrict-rule-${i}-warnings-help`,
                  this.localize.term('dotseeDiscipline_nodeRestrict_ruleShowWarningsHelp'),
                  'inline',
                )}
                ${this._withFieldHelp(
                  this._textField(
                    this.localize.term('dotseeDiscipline_nodeRestrict_customMessage'),
                    rule.customMessage,
                    disabled || !feat.enabled,
                    (v) => updateRuleAt(i, { customMessage: v }),
                  ),
                  `noderestrict-rule-${i}-limitmsg-help`,
                  this.localize.term('dotseeDiscipline_nodeRestrict_customMessageHelp'),
                )}
                ${this._withFieldHelp(
                  this._textField(
                    this.localize.term('dotseeDiscipline_nodeRestrict_customMessageCategory'),
                    rule.customMessageCategory,
                    disabled || !feat.enabled,
                    (v) => updateRuleAt(i, { customMessageCategory: v }),
                  ),
                  `noderestrict-rule-${i}-limitcat-help`,
                  this.localize.term('dotseeDiscipline_nodeRestrict_customMessageCategoryHelp'),
                )}
                ${this._withFieldHelp(
                  this._textField(
                    this.localize.term('dotseeDiscipline_nodeRestrict_customWarning'),
                    rule.customWarningMessage,
                    disabled || !feat.enabled,
                    (v) => updateRuleAt(i, { customWarningMessage: v }),
                  ),
                  `noderestrict-rule-${i}-warnmsg-help`,
                  this.localize.term('dotseeDiscipline_nodeRestrict_customWarningHelp'),
                )}
                    ${this._withFieldHelp(
                      this._textField(
                        this.localize.term('dotseeDiscipline_nodeRestrict_customWarningCategory'),
                        rule.customWarningMessageCategory,
                        disabled || !feat.enabled,
                        (v) => updateRuleAt(i, { customWarningMessageCategory: v }),
                      ),
                      `noderestrict-rule-${i}-warncat-help`,
                      this.localize.term('dotseeDiscipline_nodeRestrict_customWarningCategoryHelp'),
                    )}
                  </div>
                </uui-box>
              `;
          const isDragging = this._dragFeature === 'nodeRestrict' && this._dragIndex === i;
          const isDropTarget = this._dragFeature === 'nodeRestrict' && this._dragOverIndex === i;
          const wrapperClasses = [
            'rule-wrapper',
            isDragging ? 'dragging' : '',
            isDropTarget && this._dragPosition === 'before' ? 'drop-before' : '',
            isDropTarget && this._dragPosition === 'after' ? 'drop-after' : '',
          ]
            .filter(Boolean)
            .join(' ');
          const handleDisabled = disabled || !feat.enabled;
          return html`
            <div
              class=${wrapperClasses}
              @dragover=${(e: DragEvent) => this._onRuleDragOver(e, 'nodeRestrict', i)}
              @dragleave=${() => this._onRuleDragLeave('nodeRestrict', i)}
              @drop=${(e: DragEvent) => this._onRuleDrop(e, 'nodeRestrict', i)}
            >
              <span
                class="drag-handle"
                draggable=${handleDisabled ? 'false' : 'true'}
                aria-label=${this.localize.term('dotseeDiscipline_common_dragToReorder')}
                title=${this.localize.term('dotseeDiscipline_common_dragToReorder')}
                @dragstart=${(e: DragEvent) => this._onRuleDragStart(e, 'nodeRestrict', i)}
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
          label=${this.localize.term('dotseeDiscipline_common_addRule')}
          ?disabled=${disabled || !feat.enabled}
          @click=${() => update({ rules: [...feat.rules, createEmptyNodeRestrictRule()] })}
        >${this.localize.term('dotseeDiscipline_common_addRuleButton')}</uui-button>
        ` : nothing}
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
        <h4 slot="headline" class="uui-h4">${this.localize.term('dotseeDiscipline_virtualNodes_label')}</h4>
        ${this._renderEnableButton(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p class="feature-description no-divider">
          ${this.localize.term('dotseeDiscipline_virtualNodes_description')}
        </p>
        ${feat.enabled ? html`
        <div class="grid">
          ${this._withFieldHelp(
            this._multiAliasField(
              this.localize.term('dotseeDiscipline_virtualNodes_doctypes'),
              this._docTypes,
              (feat.rules ?? []).join(','),
              disabled || !feat.enabled,
              (v) => {
                const rules = v
                  ? v.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
                  : [];
                update({ rules });
              },
            ),
            'virtualnodes-rules-help',
            this.localize.term('dotseeDiscipline_virtualNodes_doctypesHelp'),
          )}
        </div>
        ` : nothing}
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
        <h4 slot="headline" class="uui-h4">${this.localize.term('dotseeDiscipline_variantsHider_label')}</h4>
        ${this._renderEnableButton(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p class="feature-description no-divider">
          ${this.localize.term('dotseeDiscipline_variantsHider_description')}
        </p>
        ${feat.enabled ? html`
        <div class="grid">
          ${this._withFieldHelp(
            this._textField(
              this.localize.term('dotseeDiscipline_variantsHider_caption'),
              feat.caption,
              disabled || !feat.enabled,
              (v) => update({ caption: v }),
            ),
            'variantshider-caption-help',
            this.localize.term('dotseeDiscipline_variantsHider_captionHelp'),
          )}
        </div>
        ` : nothing}
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
        <h4 slot="headline" class="uui-h4">${this.localize.term('dotseeDiscipline_nodeProtect_label')}</h4>
        ${this._renderEnableButton(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p class="feature-description no-divider">
          ${this.localize.term('dotseeDiscipline_nodeProtect_description')}
        </p>
        ${feat.enabled ? html`
        <div class="grid">
          ${this._withFieldHelp(
            this._propertyField(
              this.localize.term('dotseeDiscipline_nodeProtect_propertyAlias'),
              this._trueFalseProperties,
              feat.propertyAlias,
              disabled || !feat.enabled,
              (v) => update({ propertyAlias: v }),
            ),
            'nodeprotect-propertyalias-help',
            this.localize.term('dotseeDiscipline_nodeProtect_propertyAliasHelp'),
          )}
        </div>
        <h4>${this.localize.term('dotseeDiscipline_common_rules')}</h4>
        ${feat.rules.length === 0
          ? html`<p class="empty">${this.localize.term('dotseeDiscipline_common_noRulesDefined')}</p>`
          : nothing}
        ${feat.rules.map((rule, i) => {
          const suffix = rule.docTypeAlias ? `(${rule.docTypeAlias})` : '';
          const ruleNumber = this.localize.term('dotseeDiscipline_common_ruleNumber', i + 1);
          const ruleName = suffix ? `${ruleNumber} ${suffix}` : ruleNumber;
          const ruleDetail = rule.documentGuids
            ? this.localize.term('dotseeDiscipline_nodeProtect_byGuids')
            : rule.docTypeAlias
              ? this.localize.term('dotseeDiscipline_nodeProtect_byDoctype')
              : '';
          const onRemove = () => {
            this._removeRuleAndReindex('nodeProtect', i);
            update({ rules: feat.rules.filter((_, idx) => idx !== i) });
          };
          const body = this._isRuleCollapsed('nodeProtect', i)
            ? this._renderCollapsedRule('nodeProtect', i, ruleName, ruleDetail, disabled || !feat.enabled, onRemove)
            : html`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader('nodeProtect', i, disabled || !feat.enabled, onRemove, suffix || undefined)}
                  <div class="grid">
                    ${this._withFieldHelp(
                      this._docTypeField(
                        this.localize.term('dotseeDiscipline_nodeProtect_doctypeAlias'),
                        rule.docTypeAlias,
                        disabled || !feat.enabled,
                        (v) => updateRuleAt(i, { docTypeAlias: v }),
                      ),
                      `nodeprotect-rule-${i}-doctype-help`,
                      this.localize.term('dotseeDiscipline_nodeProtect_doctypeAliasHelp'),
                    )}
                    ${this._withFieldHelp(
                      this._textField(
                        this.localize.term('dotseeDiscipline_nodeProtect_guids'),
                        rule.documentGuids,
                        disabled || !feat.enabled,
                        (v) => updateRuleAt(i, { documentGuids: v }),
                      ),
                      `nodeprotect-rule-${i}-guids-help`,
                      this.localize.term('dotseeDiscipline_nodeProtect_guidsHelp'),
                    )}
                    ${this._withFieldHelp(
                      this._textField(
                        this.localize.term('dotseeDiscipline_nodeProtect_customMessage'),
                        rule.customMessage,
                        disabled || !feat.enabled,
                        (v) => updateRuleAt(i, { customMessage: v }),
                      ),
                      `nodeprotect-rule-${i}-msg-help`,
                      this.localize.term('dotseeDiscipline_nodeProtect_customMessageHelp'),
                    )}
                    ${this._withFieldHelp(
                      this._textField(
                        this.localize.term('dotseeDiscipline_nodeProtect_customMessageCategory'),
                        rule.customMessageCategory,
                        disabled || !feat.enabled,
                        (v) => updateRuleAt(i, { customMessageCategory: v }),
                      ),
                      `nodeprotect-rule-${i}-msgcat-help`,
                      this.localize.term('dotseeDiscipline_nodeProtect_customMessageCategoryHelp'),
                    )}
                  </div>
                </uui-box>
              `;
          const isDragging = this._dragFeature === 'nodeProtect' && this._dragIndex === i;
          const isDropTarget = this._dragFeature === 'nodeProtect' && this._dragOverIndex === i;
          const wrapperClasses = [
            'rule-wrapper',
            isDragging ? 'dragging' : '',
            isDropTarget && this._dragPosition === 'before' ? 'drop-before' : '',
            isDropTarget && this._dragPosition === 'after' ? 'drop-after' : '',
          ]
            .filter(Boolean)
            .join(' ');
          const handleDisabled = disabled || !feat.enabled;
          return html`
            <div
              class=${wrapperClasses}
              @dragover=${(e: DragEvent) => this._onRuleDragOver(e, 'nodeProtect', i)}
              @dragleave=${() => this._onRuleDragLeave('nodeProtect', i)}
              @drop=${(e: DragEvent) => this._onRuleDrop(e, 'nodeProtect', i)}
            >
              <span
                class="drag-handle"
                draggable=${handleDisabled ? 'false' : 'true'}
                aria-label=${this.localize.term('dotseeDiscipline_common_dragToReorder')}
                title=${this.localize.term('dotseeDiscipline_common_dragToReorder')}
                @dragstart=${(e: DragEvent) => this._onRuleDragStart(e, 'nodeProtect', i)}
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
          label=${this.localize.term('dotseeDiscipline_common_addRule')}
          ?disabled=${disabled || !feat.enabled}
          @click=${() => update({ rules: [...feat.rules, createEmptyNodeProtectRule()] })}
        >${this.localize.term('dotseeDiscipline_common_addRuleButton')}</uui-button>
        ` : nothing}
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
        <h4 slot="headline" class="uui-h4">${this.localize.term('dotseeDiscipline_aiSummary_label')}</h4>
        ${this._renderEnableButton(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p class="feature-description no-divider">
          ${this.localize.term('dotseeDiscipline_aiSummary_description')}
        </p>
        ${feat.enabled ? html`
        <div class="grid">
          ${this._withFieldHelp(
            html`
              <label>
                <span>${this.localize.term('dotseeDiscipline_aiSummary_llm')}</span>
                <uui-select
                  ?disabled=${disabled || !feat.enabled}
                  .options=${[
                    { name: 'OpenAI', value: 'openai', selected: feat.llm === 'openai' },
                    { name: 'Gemini', value: 'gemini', selected: feat.llm === 'gemini' },
                  ]}
                  @change=${(e: Event) => update({ llm: (e.target as HTMLSelectElement).value })}
                ></uui-select>
              </label>
            `,
            'aisummary-llm-help',
            this.localize.term('dotseeDiscipline_aiSummary_llmHelp'),
          )}
          ${this._withFieldHelp(
            this._textField(
              this.localize.term('dotseeDiscipline_aiSummary_apiKey'),
              feat.apiKey,
              disabled || !feat.enabled,
              (v) => update({ apiKey: v }),
            ),
            'aisummary-apikey-help',
            this.localize.term('dotseeDiscipline_aiSummary_apiKeyHelp'),
          )}
          ${this._withFieldHelp(
            this._textField(
              this.localize.term('dotseeDiscipline_aiSummary_model'),
              feat.model,
              disabled || !feat.enabled,
              (v) => update({ model: v }),
            ),
            'aisummary-model-help',
            this.localize.term('dotseeDiscipline_aiSummary_modelHelp'),
          )}
          ${this._withFieldHelp(
            this._numberField(
              this.localize.term('dotseeDiscipline_aiSummary_maxChars'),
              feat.maxChars,
              disabled || !feat.enabled,
              (v) => update({ maxChars: v }),
            ),
            'aisummary-maxchars-help',
            this.localize.term('dotseeDiscipline_aiSummary_maxCharsHelp'),
            'stretch',
            'row-break',
          )}
          ${this._withFieldHelp(
            this._propertyField(
              this.localize.term('dotseeDiscipline_aiSummary_propertyAlias'),
              this._textInputProperties,
              feat.propertyAlias,
              disabled || !feat.enabled,
              (v) => update({ propertyAlias: v }),
            ),
            'aisummary-propertyalias-help',
            this.localize.term('dotseeDiscipline_aiSummary_propertyAliasHelp'),
          )}
          ${this._withFieldHelp(
            this._propertyField(
              this.localize.term('dotseeDiscipline_aiSummary_toggleProperty'),
              this._trueFalseProperties,
              feat.togglePropertyAlias,
              disabled || !feat.enabled,
              (v) => update({ togglePropertyAlias: v }),
            ),
            'aisummary-toggleproperty-help',
            this.localize.term('dotseeDiscipline_aiSummary_togglePropertyHelp'),
          )}
          ${this._withFieldHelp(
            this._multiAliasField(
              this.localize.term('dotseeDiscipline_aiSummary_doctypes'),
              this._docTypes,
              feat.docTypes,
              disabled || !feat.enabled,
              (v) => update({ docTypes: v }),
            ),
            'aisummary-doctypes-help',
            this.localize.term('dotseeDiscipline_aiSummary_doctypesHelp'),
            'stretch',
            'row-break',
          )}
          ${this._withFieldHelp(
            this._multiAliasField(
              this.localize.term('dotseeDiscipline_aiSummary_excludeProperties'),
              this._textContentProperties,
              feat.excludeProperties,
              disabled || !feat.enabled,
              (v) => update({ excludeProperties: v }),
            ),
            'aisummary-excludeproperties-help',
            this.localize.term('dotseeDiscipline_aiSummary_excludePropertiesHelp'),
          )}
        </div>
        ${this._withFieldHelp(
          html`
            <label class="block">
              <span>${this.localize.term('dotseeDiscipline_aiSummary_tone')}</span>
              <uui-textarea
                .value=${feat.tone}
                ?disabled=${disabled || !feat.enabled}
                @input=${(e: Event) => update({ tone: (e.target as HTMLTextAreaElement).value })}
              ></uui-textarea>
            </label>
          `,
          'aisummary-tone-help',
          this.localize.term('dotseeDiscipline_aiSummary_toneHelp'),
        )}
        ` : nothing}
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
        <h4 slot="headline" class="uui-h4">${this.localize.term('dotseeDiscipline_propertyVersions_label')}</h4>
        ${this._renderEnableButton(feat.enabled, disabled, (v) => update({ enabled: v }))}
        <p class="feature-description no-divider">
          ${this.localize.term('dotseeDiscipline_propertyVersions_description')}
        </p>
        ${feat.enabled ? html`
        <div class="grid">
          ${this._withFieldHelp(
            this._textField(
              this.localize.term('dotseeDiscipline_propertyVersions_nextDictionaryEntry'),
              feat.nextVersionButtonCaptionDictionaryEntry,
              disabled || !feat.enabled,
              (v) => update({ nextVersionButtonCaptionDictionaryEntry: v }),
            ),
            'propertyversions-next-help',
            this.localize.term('dotseeDiscipline_propertyVersions_nextDictionaryEntryHelp'),
          )}
          ${this._withFieldHelp(
            this._textField(
              this.localize.term('dotseeDiscipline_propertyVersions_previousDictionaryEntry'),
              feat.previousVersionButtonCaptionDictionaryEntry,
              disabled || !feat.enabled,
              (v) => update({ previousVersionButtonCaptionDictionaryEntry: v }),
            ),
            'propertyversions-previous-help',
            this.localize.term('dotseeDiscipline_propertyVersions_previousDictionaryEntryHelp'),
          )}
          ${this._withFieldHelp(
            this._textField(
              this.localize.term('dotseeDiscipline_propertyVersions_noVersionsDictionaryEntry'),
              feat.noVersionsButtonCaptionDictionaryEntry,
              disabled || !feat.enabled,
              (v) => update({ noVersionsButtonCaptionDictionaryEntry: v }),
            ),
            'propertyversions-none-help',
            this.localize.term('dotseeDiscipline_propertyVersions_noVersionsDictionaryEntryHelp'),
          )}
        </div>
        ` : nothing}
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

  private _withFieldHelp(
    field: unknown,
    popoverId: string,
    helpText: string,
    layout: 'stretch' | 'inline' = 'stretch',
    extraClass?: string,
  ) {
    const classes = `field-with-help ${layout}${extraClass ? ` ${extraClass}` : ''}`;
    return html`
      <div class=${classes}>
        ${field}
        <uui-button
          class="help-button"
          look="secondary"
          compact
          label=${this.localize.term('dotseeDiscipline_common_help')}
          popovertarget=${popoverId}
        >
          <umb-icon name="icon-help-alt"></umb-icon>
        </uui-button>
        <uui-popover-container id=${popoverId} placement="top-end">
          <div class="help-bubble">${helpText}</div>
        </uui-popover-container>
      </div>
    `;
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
              <span class="multi-action">${this.localize.term(
                expanded
                  ? 'dotseeDiscipline_common_hideList'
                  : 'dotseeDiscipline_common_showList',
              )}</span>
              <span class="multi-count">${this.localize.term(
                'dotseeDiscipline_common_selectedCount',
                selected.size,
              )}</span>
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
                      <span>${this.localize.term('dotseeDiscipline_common_filterAll')}</span>
                    </label>
                    <label class="checkbox-row">
                      <input
                        type="radio"
                        name="filter-${label}"
                        ?disabled=${disabled}
                        .checked=${filterMode === 'selected'}
                        @change=${() => setFilter('selected')}
                      />
                      <span>${this.localize.term('dotseeDiscipline_common_filterSelectedOnly')}</span>
                    </label>
                  </div>
                `
              : nothing}
          </div>
          ${expanded
            ? html`
                <div class="checkbox-list">
                  ${visibleOptions.length === 0 && visibleUnknown.length === 0
                    ? html`<p class="empty">${this.localize.term('dotseeDiscipline_common_noEntries')}</p>`
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
                        <span>${alias} (${this.localize.term('dotseeDiscipline_common_notFoundSuffix')})</span>
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
    const placeholderLabel =
      placeholder?.label ?? this.localize.term('dotseeDiscipline_common_selectPlaceholder');
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
            ? html`<option value=${current} selected>${current} (${this.localize.term('dotseeDiscipline_common_notFoundSuffix')})</option>`
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
      ? this.localize.term('dotseeDiscipline_common_selectDoctypeFirstPlaceholder')
      : filtered.length === 0
        ? this.localize.term('dotseeDiscipline_common_noBlueprintsPlaceholder')
        : this.localize.term('dotseeDiscipline_common_selectPlaceholder');
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
            ? html`<option value=${current} selected>${current} (${this.localize.term('dotseeDiscipline_common_notFoundSuffix')})</option>`
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
      border-top-color: var(--uui-color-positive, #2bc37c);
    }
    .rule-wrapper.drop-after {
      border-bottom-color: var(--uui-color-positive, #2bc37c);
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
      border-radius: var(--uui-border-radius, 3px);
      background-color: transparent;
      transition:
        background-color 120ms ease-in-out,
        color 120ms ease-in-out;
    }
    .drag-handle[draggable='false'] {
      cursor: not-allowed;
      opacity: 0.4;
    }
    .drag-handle:active {
      cursor: grabbing;
    }
    .drag-handle:hover:not([draggable='false']) {
      color: var(--uui-color-selected, #3544b1);
      background-color: var(--uui-color-surface-alt, #e9e9eb);
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
    .uui-h4 {
      font-size: var(--uui-type-h4-size, 22px);
      line-height: var(--uui-size-large, 22px);
      font-weight: 400;
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
    .field-with-help {
      position: relative;
      display: flex;
      gap: var(--uui-size-space-2, 6px);
    }
    .field-with-help.stretch {
      align-items: flex-end;
    }
    .field-with-help.stretch > :first-child {
      flex: 1;
      min-width: 0;
    }
    .field-with-help.inline {
      align-items: center;
      align-self: flex-start;
    }
    .field-with-help.align-bottom {
      align-self: end;
    }
    .field-with-help .help-button {
      opacity: 0;
      transition: opacity 120ms ease-in-out;
      --uui-button-height: var(--uui-size-11, 30px);
    }
    .field-with-help:hover .help-button,
    .field-with-help:focus-within .help-button,
    .field-with-help .help-button:focus-visible,
    .field-with-help .help-button[active] {
      opacity: 1;
    }
    .help-bubble {
      max-width: 280px;
      padding: var(--uui-size-space-3, 12px) var(--uui-size-space-4, 16px);
      background: var(--uui-color-surface, #fff);
      color: var(--uui-color-text, #1b264f);
      border: 1px solid var(--uui-color-border, #d8d7d9);
      border-radius: var(--uui-border-radius, 3px);
      box-shadow: var(--uui-shadow-depth-2, 0 3px 10px rgba(0, 0, 0, 0.15));
      font-size: var(--uui-type-small-size, 12px);
      line-height: 1.45;
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
