var _ = Object.defineProperty;
var v = (l, t, e) => t in l ? _(l, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[t] = e;
var c = (l, t, e) => v(l, typeof t != "symbol" ? t + "" : t, e);
import { html as n, nothing as p, css as $, state as b, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as T } from "@umbraco-cms/backoffice/lit-element";
import { UMB_AUTH_CONTEXT as N } from "@umbraco-cms/backoffice/auth";
import { UMB_MODAL_MANAGER_CONTEXT as A, UMB_CONFIRM_MODAL as w } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as S } from "@umbraco-cms/backoffice/notification";
import { c as k, b as F, d as C } from "./index-NUOrvrcQ.js";
const m = "/umbraco/api/discipline";
class D {
  constructor(t) {
    this.authToken = t;
  }
  headers(t = {}) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.authToken}`,
      ...t
    };
  }
  async getSettings() {
    const t = await fetch(`${m}/settings`, {
      method: "GET",
      headers: this.headers()
    });
    if (!t.ok)
      throw new Error(`Failed to load Discipline settings (${t.status})`);
    return await t.json();
  }
  async saveSettings(t) {
    const e = await fetch(`${m}/settings`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify(t)
    });
    if (!e.ok)
      throw new Error(`Failed to save Discipline settings (${e.status})`);
    return await e.json();
  }
  async getDocTypes() {
    const t = await fetch(`${m}/doctypes`, {
      method: "GET",
      headers: this.headers()
    });
    if (!t.ok)
      throw new Error(`Failed to load doctypes (${t.status})`);
    return await t.json();
  }
  async importFromAppSettings() {
    const t = await fetch(`${m}/import-from-appsettings`, {
      method: "POST",
      headers: this.headers()
    });
    if (!t.ok)
      throw new Error(`Failed to import from appsettings (${t.status})`);
    return await t.json();
  }
}
var f = Object.defineProperty, R = Object.getOwnPropertyDescriptor, P = (l, t, e) => t in l ? f(l, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[t] = e, g = (l, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? R(t, e) : t, a = l.length - 1, r; a >= 0; a--)
    (r = l[a]) && (i = (s ? r(t, e, i) : r(i)) || i);
  return s && i && f(t, e, i), i;
}, E = (l, t, e) => P(l, t + "", e);
const M = [
  { alias: "autoNode", label: "AutoNode" },
  { alias: "nodeRestrict", label: "NodeRestrict" },
  { alias: "virtualNodes", label: "VirtualNodes" },
  { alias: "variantsHider", label: "VariantsHider" },
  { alias: "nodeProtect", label: "NodeProtect" },
  { alias: "aiSummary", label: "AiSummary" },
  { alias: "propertyVersions", label: "PropertyVersions" }
];
function y() {
  return {
    useBackoffice: !1,
    autoNode: { enabled: !1, logLevel: "Normal", republishExistingNodes: !1, rules: [] },
    nodeRestrict: { enabled: !1, propertyAlias: "", showWarnings: !0, rules: [] },
    nodeProtect: { enabled: !1, propertyAlias: "", rules: [] },
    virtualNodes: { enabled: !1, rules: [] },
    variantsHider: { enabled: !1, caption: "" },
    propertyVersions: {
      enabled: !1,
      nextVersionButtonCaptionDictionaryEntry: "",
      previousVersionButtonCaptionDictionaryEntry: "",
      noVersionsButtonCaptionDictionaryEntry: ""
    },
    aiSummary: {
      enabled: !1,
      llm: "openai",
      apiKey: "",
      model: "",
      maxChars: 150,
      tone: "",
      docTypes: "",
      excludeProperties: "",
      propertyAlias: "",
      togglePropertyAlias: ""
    }
  };
}
let d = class extends T {
  constructor() {
    super(...arguments);
    c(this, "_loading", !0);
    c(this, "_saving", !1);
    c(this, "_hasAppSettings", !1);
    c(this, "_settings", y());
    c(this, "_activeTab", "autoNode");
    c(this, "_docTypes", []);
    c(this, "_repository");
  }
  connectedCallback() {
    super.connectedCallback(), this._init();
  }
  async _init() {
    const e = await (await this.getContext(N)).getLatestToken();
    this._repository = new D(e);
    try {
      const [s, i] = await Promise.all([
        this._repository.getSettings(),
        this._repository.getDocTypes().catch(() => [])
      ]);
      this._docTypes = i, this._applyResponse(s);
    } catch (s) {
      await this._notify("danger", `Could not load settings: ${this._errorMessage(s)}`);
    } finally {
      this._loading = !1, this.requestUpdate();
    }
  }
  _applyResponse(t) {
    this._hasAppSettings = t.hasAppSettings, this._settings = t.settings ?? y(), this.requestUpdate();
  }
  _errorMessage(t) {
    return t instanceof Error ? t.message : String(t);
  }
  async _notify(t, e) {
    try {
      const s = await this.getContext(S);
      s == null || s.peek(t, { data: { message: e } });
    } catch {
    }
  }
  _onMasterToggleChange(t) {
    const e = t.target;
    this._settings = { ...this._settings, useBackoffice: e.checked }, this.requestUpdate();
  }
  _patchSettings(t, e) {
    this._settings = { ...this._settings, [t]: e }, this.requestUpdate();
  }
  async _onImportClick() {
    if (!this._hasAppSettings || !this._repository) return;
    const t = await this.getContext(A);
    if (!t) return;
    const e = t.open(this, w, {
      data: {
        headline: "Load from appsettings.json",
        content: "This will replace every field in this page with the values from appsettings.json. Your current backoffice settings will be lost. Continue?",
        confirmLabel: "Load from appsettings",
        color: "danger"
      }
    });
    try {
      await e.onSubmit();
    } catch {
      return;
    }
    try {
      this._saving = !0, this.requestUpdate();
      const s = await this._repository.importFromAppSettings();
      this._applyResponse(s), await this._notify("positive", "Loaded from appsettings.json.");
    } catch (s) {
      await this._notify("danger", `Import failed: ${this._errorMessage(s)}`);
    } finally {
      this._saving = !1, this.requestUpdate();
    }
  }
  async _onSaveClick() {
    if (!(!this._repository || !this._canSave()))
      try {
        this._saving = !0, this.requestUpdate();
        const t = await this._repository.saveSettings(this._settings);
        this._applyResponse(t), await this._notify("positive", "Settings saved.");
      } catch (t) {
        await this._notify("danger", `Save failed: ${this._errorMessage(t)}`);
      } finally {
        this._saving = !1, this.requestUpdate();
      }
  }
  _canSave() {
    return this._settings.useBackoffice ? this._validationErrors().length === 0 : !1;
  }
  _validationErrors() {
    const t = [], e = this._settings;
    return e.autoNode.enabled && e.autoNode.rules.forEach((s, i) => {
      s.createdDocTypeAlias || t.push(`AutoNode rule ${i + 1}: Created DocType is required`), s.docTypeAliasToCreate || t.push(`AutoNode rule ${i + 1}: DocType to create is required`), s.nodeName || t.push(`AutoNode rule ${i + 1}: Node name is required`);
    }), e.nodeRestrict.enabled && (e.nodeRestrict.propertyAlias || t.push("NodeRestrict: Property alias is required"), e.nodeRestrict.rules.forEach((s, i) => {
      s.parentDocType || t.push(`NodeRestrict rule ${i + 1}: Parent doctype is required`), s.childDocType || t.push(`NodeRestrict rule ${i + 1}: Child doctype is required`), (!Number.isFinite(s.maxNodes) || s.maxNodes < 0) && t.push(`NodeRestrict rule ${i + 1}: Max nodes must be a non-negative number`);
    })), e.nodeProtect.enabled && (e.nodeProtect.propertyAlias || t.push("NodeProtect: Property alias is required"), e.nodeProtect.rules.forEach((s, i) => {
      !s.docTypeAlias && !s.documentGuids && t.push(`NodeProtect rule ${i + 1}: DocType alias or Document GUIDs is required`);
    })), e.virtualNodes.enabled && e.virtualNodes.rules.forEach((s, i) => {
      s || t.push(`VirtualNodes rule ${i + 1}: DocType alias is required`);
    }), e.aiSummary.enabled && (e.aiSummary.llm || t.push("AiSummary: LLM is required"), e.aiSummary.apiKey || t.push("AiSummary: API key is required"), e.aiSummary.model || t.push("AiSummary: Model is required"), e.aiSummary.propertyAlias || t.push("AiSummary: Property alias is required")), t;
  }
  get _fieldsDisabled() {
    return !this._settings.useBackoffice || this._saving;
  }
  render() {
    if (this._loading)
      return n`<umb-body-layout headline="DotSee Discipline Settings">
        <div class="center"><uui-loader></uui-loader></div>
      </umb-body-layout>`;
    const t = this._fieldsDisabled, e = this._settings.useBackoffice;
    return n`
      <umb-body-layout headline="DotSee Discipline Settings">
        ${this._renderSourceBanner()}
        ${e ? n`
              <div class="tab-bar">
                ${M.map(
      (s) => n`
                    <button
                      type="button"
                      class="tab-button ${this._activeTab === s.alias ? "active" : ""}"
                      @click=${() => {
        this._activeTab = s.alias, this.requestUpdate();
      }}
                    >
                      ${s.label}
                    </button>
                  `
    )}
              </div>
              <div class="tab-content">
                <div ?hidden=${this._activeTab !== "autoNode"}>${this._renderAutoNodeTab(t)}</div>
                <div ?hidden=${this._activeTab !== "nodeRestrict"}>${this._renderNodeRestrictTab(t)}</div>
                <div ?hidden=${this._activeTab !== "virtualNodes"}>${this._renderVirtualNodesTab(t)}</div>
                <div ?hidden=${this._activeTab !== "variantsHider"}>${this._renderVariantsHiderTab(t)}</div>
                <div ?hidden=${this._activeTab !== "nodeProtect"}>${this._renderNodeProtectTab(t)}</div>
                <div ?hidden=${this._activeTab !== "aiSummary"}>${this._renderAiSummaryTab(t)}</div>
                <div ?hidden=${this._activeTab !== "propertyVersions"}>${this._renderPropertyVersionsTab(t)}</div>
              </div>
              ${this._renderFooter()}
            ` : p}
      </umb-body-layout>
    `;
  }
  _renderSourceBanner() {
    return this._hasAppSettings ? n`
      <uui-box headline="Settings source">
        <div class="banner-row">
          <label class="toggle-label">
            <uui-toggle
              .checked=${this._settings.useBackoffice}
              @change=${this._onMasterToggleChange}
            ></uui-toggle>
            <span>Manage settings from the backoffice</span>
          </label>
          ${this._settings.useBackoffice ? n`
                <uui-button
                  look="primary"
                  color="positive"
                  label="Load from appsettings.json"
                  ?disabled=${this._saving}
                  @click=${this._onImportClick}
                ></uui-button>
              ` : p}
        </div>
      </uui-box>
    ` : n`
        <uui-box headline="Settings source">
          <p>
            No <code>DotSee.Discipline</code> section was found in <code>appsettings.json</code>.
            All configuration is managed from this screen.
          </p>
        </uui-box>
      `;
  }
  _renderFeatureToggle(t, e, s) {
    return n`
      <label class="feature-toggle">
        <uui-toggle
          .checked=${t}
          ?disabled=${e}
          @change=${(i) => s(i.target.checked)}
        ></uui-toggle>
        <span>Enable this feature</span>
      </label>
    `;
  }
  _renderFooter() {
    const t = this._validationErrors();
    return n`
      <div slot="footer" class="footer">
        ${t.length > 0 && this._settings.useBackoffice ? n`<ul class="errors">
              ${t.map((e) => n`<li>${e}</li>`)}
            </ul>` : p}
        <uui-button
          look="primary"
          color="positive"
          label="Save"
          ?disabled=${!this._canSave()}
          @click=${this._onSaveClick}
        >
          ${this._saving ? n`<uui-loader></uui-loader>` : "Save"}
        </uui-button>
      </div>
    `;
  }
  /* ------------------------------------------------------------------ */
  /* Tab renderers                                                      */
  /* ------------------------------------------------------------------ */
  _renderAutoNodeTab(t) {
    const e = this._settings.autoNode, s = (a) => {
      this._patchSettings("autoNode", { ...e, ...a });
    }, i = (a, r) => {
      const o = e.rules.map((u, h) => h === a ? { ...u, ...r } : u);
      s({ rules: o });
    };
    return n`
      <uui-box headline="AutoNode">
        ${this._renderFeatureToggle(e.enabled, t, (a) => s({ enabled: a }))}
        <div class="grid">
          <label>
            <span>Log level</span>
            <uui-select
              ?disabled=${t || !e.enabled}
              .options=${[
      { name: "Normal", value: "Normal", selected: e.logLevel === "Normal" },
      { name: "Verbose", value: "Verbose", selected: e.logLevel === "Verbose" }
    ]}
              @change=${(a) => s({ logLevel: a.target.value })}
            ></uui-select>
          </label>
          <label class="inline">
            <uui-toggle
              .checked=${e.republishExistingNodes}
              ?disabled=${t || !e.enabled}
              @change=${(a) => s({ republishExistingNodes: a.target.checked })}
            ></uui-toggle>
            <span>Republish existing nodes</span>
          </label>
        </div>
        <h4>Rules</h4>
        ${e.rules.length === 0 ? n`<p class="empty">No rules defined.</p>` : p}
        ${e.rules.map(
      (a, r) => n`
            <uui-box class="rule-card">
              <div slot="header" class="rule-header">
                <strong>Rule ${r + 1}</strong>
                <uui-button
                  look="secondary"
                  color="danger"
                  label="Remove"
                  ?disabled=${t || !e.enabled}
                  @click=${() => s({ rules: e.rules.filter((o, u) => u !== r) })}
                >Remove</uui-button>
              </div>
              <div class="grid">
                ${this._docTypeField(
        "Triggering doctype *",
        a.createdDocTypeAlias,
        t || !e.enabled,
        (o) => i(r, { createdDocTypeAlias: o })
      )}
                ${this._docTypeField(
        "DocType to create *",
        a.docTypeAliasToCreate,
        t || !e.enabled,
        (o) => i(r, { docTypeAliasToCreate: o })
      )}
                ${this._textField(
        "Node name *",
        a.nodeName,
        t || !e.enabled,
        (o) => i(r, { nodeName: o })
      )}
                ${this._textField(
        "Dictionary item for name",
        a.dictionaryItemForName,
        t || !e.enabled,
        (o) => i(r, { dictionaryItemForName: o })
      )}
                ${this._textField(
        "Blueprint",
        a.blueprint,
        t || !e.enabled,
        (o) => i(r, { blueprint: o })
      )}
                ${this._toggleField(
        "Bring new node first",
        a.bringNewNodeFirst,
        t || !e.enabled,
        (o) => i(r, { bringNewNodeFirst: o })
      )}
                ${this._toggleField(
        "Only create if no children",
        a.onlyCreateIfNoChildren,
        t || !e.enabled,
        (o) => i(r, { onlyCreateIfNoChildren: o })
      )}
                ${this._toggleField(
        "Create if exists with different name",
        a.createIfExistsWithDifferentName,
        t || !e.enabled,
        (o) => i(r, { createIfExistsWithDifferentName: o })
      )}
                ${this._toggleField(
        "Keep new node unpublished",
        a.keepNewNodeUnpublished,
        t || !e.enabled,
        (o) => i(r, { keepNewNodeUnpublished: o })
      )}
              </div>
            </uui-box>
          `
    )}
        <uui-button
          look="secondary"
          label="Add rule"
          ?disabled=${t || !e.enabled}
          @click=${() => s({ rules: [...e.rules, k()] })}
        >+ Add rule</uui-button>
      </uui-box>
    `;
  }
  _renderNodeRestrictTab(t) {
    const e = this._settings.nodeRestrict, s = (a) => {
      this._patchSettings("nodeRestrict", { ...e, ...a });
    }, i = (a, r) => {
      const o = e.rules.map((u, h) => h === a ? { ...u, ...r } : u);
      s({ rules: o });
    };
    return n`
      <uui-box headline="NodeRestrict">
        ${this._renderFeatureToggle(e.enabled, t, (a) => s({ enabled: a }))}
        <div class="grid">
          ${this._textField(
      "Property alias *",
      e.propertyAlias,
      t || !e.enabled,
      (a) => s({ propertyAlias: a })
    )}
          ${this._toggleField(
      "Show warnings",
      e.showWarnings,
      t || !e.enabled,
      (a) => s({ showWarnings: a })
    )}
        </div>
        <h4>Rules</h4>
        ${e.rules.length === 0 ? n`<p class="empty">No rules defined.</p>` : p}
        ${e.rules.map(
      (a, r) => n`
            <uui-box class="rule-card">
              <div slot="header" class="rule-header">
                <strong>Rule ${r + 1}</strong>
                <uui-button
                  look="secondary"
                  color="danger"
                  label="Remove"
                  ?disabled=${t || !e.enabled}
                  @click=${() => s({ rules: e.rules.filter((o, u) => u !== r) })}
                >Remove</uui-button>
              </div>
              <div class="grid">
                ${this._docTypeField(
        "Parent doctype *",
        a.parentDocType,
        t || !e.enabled,
        (o) => i(r, { parentDocType: o })
      )}
                ${this._docTypeField(
        "Child doctype *",
        a.childDocType,
        t || !e.enabled,
        (o) => i(r, { childDocType: o })
      )}
                ${this._numberField(
        "Max nodes *",
        a.maxNodes,
        t || !e.enabled,
        (o) => i(r, { maxNodes: o })
      )}
                ${this._toggleField(
        "Show warnings",
        a.showWarnings,
        t || !e.enabled,
        (o) => i(r, { showWarnings: o })
      )}
                ${this._textField(
        "Custom limit message",
        a.customMessage,
        t || !e.enabled,
        (o) => i(r, { customMessage: o })
      )}
                ${this._textField(
        "Custom limit category",
        a.customMessageCategory,
        t || !e.enabled,
        (o) => i(r, { customMessageCategory: o })
      )}
                ${this._textField(
        "Custom warning message",
        a.customWarningMessage,
        t || !e.enabled,
        (o) => i(r, { customWarningMessage: o })
      )}
                ${this._textField(
        "Custom warning category",
        a.customWarningMessageCategory,
        t || !e.enabled,
        (o) => i(r, { customWarningMessageCategory: o })
      )}
              </div>
            </uui-box>
          `
    )}
        <uui-button
          look="secondary"
          label="Add rule"
          ?disabled=${t || !e.enabled}
          @click=${() => s({ rules: [...e.rules, F()] })}
        >+ Add rule</uui-button>
      </uui-box>
    `;
  }
  _renderVirtualNodesTab(t) {
    const e = this._settings.virtualNodes, s = (i) => {
      this._patchSettings("virtualNodes", { ...e, ...i });
    };
    return n`
      <uui-box headline="VirtualNodes">
        ${this._renderFeatureToggle(e.enabled, t, (i) => s({ enabled: i }))}
        <p>List of document type aliases to be treated as virtual nodes.</p>
        ${e.rules.length === 0 ? n`<p class="empty">No aliases defined.</p>` : p}
        ${e.rules.map(
      (i, a) => n`
            <div class="inline">
              ${this._docTypeField("DocType alias *", i, t || !e.enabled, (r) => {
        const o = e.rules.map((u, h) => h === a ? r : u);
        s({ rules: o });
      })}
              <uui-button
                look="secondary"
                color="danger"
                label="Remove"
                ?disabled=${t || !e.enabled}
                @click=${() => s({ rules: e.rules.filter((r, o) => o !== a) })}
              >Remove</uui-button>
            </div>
          `
    )}
        <uui-button
          look="secondary"
          label="Add alias"
          ?disabled=${t || !e.enabled}
          @click=${() => s({ rules: [...e.rules, ""] })}
        >+ Add alias</uui-button>
      </uui-box>
    `;
  }
  _renderVariantsHiderTab(t) {
    const e = this._settings.variantsHider, s = (i) => {
      this._patchSettings("variantsHider", { ...e, ...i });
    };
    return n`
      <uui-box headline="VariantsHider">
        ${this._renderFeatureToggle(e.enabled, t, (i) => s({ enabled: i }))}
        <div class="grid">
          ${this._textField(
      "Caption",
      e.caption,
      t || !e.enabled,
      (i) => s({ caption: i })
    )}
        </div>
      </uui-box>
    `;
  }
  _renderNodeProtectTab(t) {
    const e = this._settings.nodeProtect, s = (a) => {
      this._patchSettings("nodeProtect", { ...e, ...a });
    }, i = (a, r) => {
      const o = e.rules.map((u, h) => h === a ? { ...u, ...r } : u);
      s({ rules: o });
    };
    return n`
      <uui-box headline="NodeProtect">
        ${this._renderFeatureToggle(e.enabled, t, (a) => s({ enabled: a }))}
        <div class="grid">
          ${this._textField(
      "Property alias *",
      e.propertyAlias,
      t || !e.enabled,
      (a) => s({ propertyAlias: a })
    )}
        </div>
        <h4>Rules</h4>
        ${e.rules.length === 0 ? n`<p class="empty">No rules defined.</p>` : p}
        ${e.rules.map(
      (a, r) => n`
            <uui-box class="rule-card">
              <div slot="header" class="rule-header">
                <strong>Rule ${r + 1}</strong>
                <uui-button
                  look="secondary"
                  color="danger"
                  label="Remove"
                  ?disabled=${t || !e.enabled}
                  @click=${() => s({ rules: e.rules.filter((o, u) => u !== r) })}
                >Remove</uui-button>
              </div>
              <div class="grid">
                ${this._docTypeField(
        "DocType alias",
        a.docTypeAlias,
        t || !e.enabled,
        (o) => i(r, { docTypeAlias: o })
      )}
                ${this._textField(
        "Document GUIDs (comma separated)",
        a.documentGuids,
        t || !e.enabled,
        (o) => i(r, { documentGuids: o })
      )}
                ${this._textField(
        "Custom message",
        a.customMessage,
        t || !e.enabled,
        (o) => i(r, { customMessage: o })
      )}
                ${this._textField(
        "Custom message category",
        a.customMessageCategory,
        t || !e.enabled,
        (o) => i(r, { customMessageCategory: o })
      )}
              </div>
            </uui-box>
          `
    )}
        <uui-button
          look="secondary"
          label="Add rule"
          ?disabled=${t || !e.enabled}
          @click=${() => s({ rules: [...e.rules, C()] })}
        >+ Add rule</uui-button>
      </uui-box>
    `;
  }
  _renderAiSummaryTab(t) {
    const e = this._settings.aiSummary, s = (i) => {
      this._patchSettings("aiSummary", { ...e, ...i });
    };
    return n`
      <uui-box headline="AiSummary">
        ${this._renderFeatureToggle(e.enabled, t, (i) => s({ enabled: i }))}
        <div class="grid">
          <label>
            <span>LLM *</span>
            <uui-select
              ?disabled=${t || !e.enabled}
              .options=${[
      { name: "OpenAI", value: "openai", selected: e.llm === "openai" },
      { name: "Gemini", value: "gemini", selected: e.llm === "gemini" }
    ]}
              @change=${(i) => s({ llm: i.target.value })}
            ></uui-select>
          </label>
          ${this._textField(
      "API key *",
      e.apiKey,
      t || !e.enabled,
      (i) => s({ apiKey: i })
    )}
          ${this._textField("Model *", e.model, t || !e.enabled, (i) => s({ model: i }))}
          ${this._numberField(
      "Max chars",
      e.maxChars,
      t || !e.enabled,
      (i) => s({ maxChars: i })
    )}
          ${this._textField(
      "Property alias *",
      e.propertyAlias,
      t || !e.enabled,
      (i) => s({ propertyAlias: i })
    )}
          ${this._textField(
      "Toggle property alias",
      e.togglePropertyAlias,
      t || !e.enabled,
      (i) => s({ togglePropertyAlias: i })
    )}
          ${this._textField(
      "DocTypes (comma separated)",
      e.docTypes,
      t || !e.enabled,
      (i) => s({ docTypes: i })
    )}
          ${this._textField(
      "Exclude properties (comma separated)",
      e.excludeProperties,
      t || !e.enabled,
      (i) => s({ excludeProperties: i })
    )}
        </div>
        <label class="block">
          <span>Tone</span>
          <uui-textarea
            .value=${e.tone}
            ?disabled=${t || !e.enabled}
            @input=${(i) => s({ tone: i.target.value })}
          ></uui-textarea>
        </label>
      </uui-box>
    `;
  }
  _renderPropertyVersionsTab(t) {
    const e = this._settings.propertyVersions, s = (i) => {
      this._patchSettings("propertyVersions", { ...e, ...i });
    };
    return n`
      <uui-box headline="PropertyVersions">
        ${this._renderFeatureToggle(e.enabled, t, (i) => s({ enabled: i }))}
        <div class="grid">
          ${this._textField(
      "Next version dictionary entry",
      e.nextVersionButtonCaptionDictionaryEntry,
      t || !e.enabled,
      (i) => s({ nextVersionButtonCaptionDictionaryEntry: i })
    )}
          ${this._textField(
      "Previous version dictionary entry",
      e.previousVersionButtonCaptionDictionaryEntry,
      t || !e.enabled,
      (i) => s({ previousVersionButtonCaptionDictionaryEntry: i })
    )}
          ${this._textField(
      "No versions dictionary entry",
      e.noVersionsButtonCaptionDictionaryEntry,
      t || !e.enabled,
      (i) => s({ noVersionsButtonCaptionDictionaryEntry: i })
    )}
        </div>
      </uui-box>
    `;
  }
  /* ------------------------------------------------------------------ */
  /* Small field helpers                                                */
  /* ------------------------------------------------------------------ */
  _textField(t, e, s, i) {
    return n`
      <label>
        <span>${t}</span>
        <uui-input
          .value=${e ?? ""}
          ?disabled=${s}
          @input=${(a) => i(a.target.value)}
        ></uui-input>
      </label>
    `;
  }
  _docTypeField(t, e, s, i) {
    const a = e ?? "", r = new Set(this._docTypes.map((o) => o.alias));
    return n`
      <label>
        <span>${t}</span>
        <select
          class="doctype-select"
          ?disabled=${s}
          @change=${(o) => i(o.target.value)}
        >
          <option value="" ?selected=${a === ""}>-- Select --</option>
          ${this._docTypes.map(
      (o) => n`
              <option value=${o.alias} ?selected=${o.alias === a}>
                ${o.name} (${o.alias})
              </option>
            `
    )}
          ${a && !r.has(a) ? n`<option value=${a} selected>${a} (not found)</option>` : p}
        </select>
      </label>
    `;
  }
  _numberField(t, e, s, i) {
    return n`
      <label>
        <span>${t}</span>
        <uui-input
          type="number"
          .value=${(e == null ? void 0 : e.toString()) ?? "0"}
          ?disabled=${s}
          @input=${(a) => {
      const r = a.target.value, o = r === "" ? 0 : Number(r);
      i(Number.isNaN(o) ? 0 : o);
    }}
        ></uui-input>
      </label>
    `;
  }
  _toggleField(t, e, s, i) {
    return n`
      <label class="inline">
        <uui-toggle
          .checked=${e}
          ?disabled=${s}
          @change=${(a) => i(a.target.checked)}
        ></uui-toggle>
        <span>${t}</span>
      </label>
    `;
  }
};
E(d, "styles", $`
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
  `);
g([
  b()
], d.prototype, "_loading", 2);
g([
  b()
], d.prototype, "_saving", 2);
g([
  b()
], d.prototype, "_hasAppSettings", 2);
g([
  b()
], d.prototype, "_settings", 2);
g([
  b()
], d.prototype, "_activeTab", 2);
g([
  b()
], d.prototype, "_docTypes", 2);
d = g([
  x("dotsee-discipline-settings-workspace")
], d);
const O = d;
export {
  d as DisciplineSettingsWorkspaceElement,
  O as default
};
//# sourceMappingURL=discipline-settings.workspace.element-Cbaa23Qw.js.map
