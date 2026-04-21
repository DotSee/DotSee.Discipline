var A = Object.defineProperty;
var F = (c, e, t) => e in c ? A(c, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : c[e] = t;
var p = (c, e, t) => F(c, typeof e != "symbol" ? e + "" : e, t);
import { html as n, nothing as h, css as S, state as b, customElement as C } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as P } from "@umbraco-cms/backoffice/lit-element";
import { UMB_AUTH_CONTEXT as R } from "@umbraco-cms/backoffice/auth";
import { UMB_MODAL_MANAGER_CONTEXT as D, UMB_CONFIRM_MODAL as E } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as z } from "@umbraco-cms/backoffice/notification";
import { c as M, b as B, d as U } from "./index-Cn2QRQ80.js";
const y = "/umbraco/api/discipline";
class V {
  constructor(e) {
    this.authToken = e;
  }
  headers(e = {}) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.authToken}`,
      ...e
    };
  }
  async getSettings() {
    const e = await fetch(`${y}/settings`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load Discipline settings (${e.status})`);
    return await e.json();
  }
  async saveSettings(e) {
    const t = await fetch(`${y}/settings`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify(e)
    });
    if (!t.ok)
      throw new Error(`Failed to save Discipline settings (${t.status})`);
    return await t.json();
  }
  async getDocTypes() {
    const e = await fetch(`${y}/doctypes`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load doctypes (${e.status})`);
    return await e.json();
  }
  async getTrueFalseProperties() {
    const e = await fetch(`${y}/properties/truefalse`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load true/false properties (${e.status})`);
    return await e.json();
  }
  async getTextContentProperties() {
    const e = await fetch(`${y}/properties/text-content`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load text content properties (${e.status})`);
    return await e.json();
  }
  async getTextInputProperties() {
    const e = await fetch(`${y}/properties/text-input`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load text input properties (${e.status})`);
    return await e.json();
  }
  async importFromAppSettings() {
    const e = await fetch(`${y}/import-from-appsettings`, {
      method: "POST",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to import from appsettings (${e.status})`);
    return await e.json();
  }
}
var k = Object.defineProperty, I = Object.getOwnPropertyDescriptor, q = (c, e, t) => e in c ? k(c, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : c[e] = t, g = (c, e, t, s) => {
  for (var i = s > 1 ? void 0 : s ? I(e, t) : e, a = c.length - 1, o; a >= 0; a--)
    (o = c[a]) && (i = (s ? o(e, t, i) : o(i)) || i);
  return s && i && k(e, t, i), i;
}, L = (c, e, t) => q(c, e + "", t);
const j = [
  { alias: "autoNode", label: "AutoNode" },
  { alias: "nodeRestrict", label: "NodeRestrict" },
  { alias: "virtualNodes", label: "VirtualNodes" },
  { alias: "variantsHider", label: "VariantsHider" },
  { alias: "nodeProtect", label: "NodeProtect" },
  { alias: "aiSummary", label: "AiSummary" },
  { alias: "propertyVersions", label: "PropertyVersions" }
];
function T() {
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
let u = class extends P {
  constructor() {
    super(...arguments);
    p(this, "_loading", !0);
    p(this, "_saving", !1);
    p(this, "_hasAppSettings", !1);
    p(this, "_settings", T());
    p(this, "_activeTab", "autoNode");
    p(this, "_docTypes", []);
    p(this, "_trueFalseProperties", []);
    p(this, "_textContentProperties", []);
    p(this, "_textInputProperties", []);
    p(this, "_expandedFields", /* @__PURE__ */ new Set());
    p(this, "_filterModes", /* @__PURE__ */ new Map());
    p(this, "_collapsedRules", /* @__PURE__ */ new Set());
    p(this, "_repository");
    p(this, "_onDocumentMouseDown", (e) => {
      if (this._expandedFields.size === 0) return;
      e.composedPath().some((s) => {
        var i;
        return s instanceof HTMLElement && ((i = s.classList) == null ? void 0 : i.contains("multi-box"));
      }) || (this._expandedFields.clear(), this.requestUpdate());
    });
  }
  connectedCallback() {
    super.connectedCallback(), this._init(), document.addEventListener("mousedown", this._onDocumentMouseDown);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("mousedown", this._onDocumentMouseDown);
  }
  async _init() {
    const t = await (await this.getContext(R)).getLatestToken();
    this._repository = new V(t);
    try {
      const [s, i, a, o, r] = await Promise.all([
        this._repository.getSettings(),
        this._repository.getDocTypes().catch(() => []),
        this._repository.getTrueFalseProperties().catch(() => []),
        this._repository.getTextContentProperties().catch(() => []),
        this._repository.getTextInputProperties().catch(() => [])
      ]);
      this._docTypes = i, this._trueFalseProperties = a, this._textContentProperties = o, this._textInputProperties = r, this._applyResponse(s);
    } catch (s) {
      await this._notify("danger", `Could not load settings: ${this._errorMessage(s)}`);
    } finally {
      this._loading = !1, this.requestUpdate();
    }
  }
  _applyResponse(e) {
    this._hasAppSettings = e.hasAppSettings, this._settings = e.settings ?? T(), this.requestUpdate();
  }
  _errorMessage(e) {
    return e instanceof Error ? e.message : String(e);
  }
  async _notify(e, t) {
    try {
      const s = await this.getContext(z);
      s == null || s.peek(e, { data: { message: t } });
    } catch {
    }
  }
  _onMasterToggleChange(e) {
    const t = e.target;
    this._settings = { ...this._settings, useBackoffice: t.checked }, this.requestUpdate();
  }
  _patchSettings(e, t) {
    this._settings = { ...this._settings, [e]: t }, this.requestUpdate();
  }
  async _onImportClick() {
    if (!this._hasAppSettings || !this._repository) return;
    const e = await this.getContext(D);
    if (!e) return;
    const t = e.open(this, E, {
      data: {
        headline: "Load from appsettings.json",
        content: "This will replace every field in this page with the values from appsettings.json. Your current backoffice settings will be lost. Continue?",
        confirmLabel: "Load from appsettings",
        color: "danger"
      }
    });
    try {
      await t.onSubmit();
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
        const e = await this._repository.saveSettings(this._settings);
        this._applyResponse(e), await this._notify("positive", "Settings saved.");
      } catch (e) {
        await this._notify("danger", `Save failed: ${this._errorMessage(e)}`);
      } finally {
        this._saving = !1, this.requestUpdate();
      }
  }
  _canSave() {
    return this._settings.useBackoffice ? this._validationErrors().length === 0 : !1;
  }
  _validationErrors() {
    const e = [], t = this._settings;
    return t.autoNode.enabled && t.autoNode.rules.forEach((s, i) => {
      s.createdDocTypeAlias || e.push(`AutoNode rule ${i + 1}: Created DocType is required`), s.docTypeAliasToCreate || e.push(`AutoNode rule ${i + 1}: DocType to create is required`), s.nodeName || e.push(`AutoNode rule ${i + 1}: Node name is required`);
    }), t.nodeRestrict.enabled && (t.nodeRestrict.propertyAlias || e.push("NodeRestrict: Property alias is required"), t.nodeRestrict.rules.forEach((s, i) => {
      s.parentDocType || e.push(`NodeRestrict rule ${i + 1}: Parent doctype is required`), s.childDocType || e.push(`NodeRestrict rule ${i + 1}: Child doctype is required`), (!Number.isFinite(s.maxNodes) || s.maxNodes < 0) && e.push(`NodeRestrict rule ${i + 1}: Max nodes must be a non-negative number`);
    })), t.nodeProtect.enabled && (t.nodeProtect.propertyAlias || e.push("NodeProtect: Property alias is required"), t.nodeProtect.rules.forEach((s, i) => {
      !s.docTypeAlias && !s.documentGuids && e.push(`NodeProtect rule ${i + 1}: DocType alias or Document GUIDs is required`);
    })), t.virtualNodes.enabled && t.virtualNodes.rules.forEach((s, i) => {
      s || e.push(`VirtualNodes rule ${i + 1}: DocType alias is required`);
    }), t.aiSummary.enabled && (t.aiSummary.llm || e.push("AiSummary: LLM is required"), t.aiSummary.apiKey || e.push("AiSummary: API key is required"), t.aiSummary.model || e.push("AiSummary: Model is required"), t.aiSummary.propertyAlias || e.push("AiSummary: Property alias is required")), e;
  }
  get _fieldsDisabled() {
    return !this._settings.useBackoffice || this._saving;
  }
  render() {
    if (this._loading)
      return n`<umb-body-layout headline="DotSee Discipline Settings">
        <div class="center"><uui-loader></uui-loader></div>
      </umb-body-layout>`;
    const e = this._fieldsDisabled, t = this._settings.useBackoffice;
    return n`
      <umb-body-layout headline="DotSee Discipline Settings">
        ${this._renderSourceBanner()}
        ${t ? n`
              <div class="tab-bar">
                ${j.map((s) => {
      var o;
      const i = !!((o = this._settings[s.alias]) != null && o.enabled), a = [
        "tab-button",
        this._activeTab === s.alias ? "active" : "",
        i ? "enabled" : ""
      ].filter(Boolean).join(" ");
      return n`
                    <button
                      type="button"
                      class=${a}
                      @click=${() => {
        this._activeTab = s.alias, this.requestUpdate();
      }}
                    >
                      ${i ? n`<umb-icon name="icon-check" class="tab-icon"></umb-icon>` : h}
                      <span>${s.label}</span>
                    </button>
                  `;
    })}
              </div>
              <div class="tab-content">
                <div ?hidden=${this._activeTab !== "autoNode"}>${this._renderAutoNodeTab(e)}</div>
                <div ?hidden=${this._activeTab !== "nodeRestrict"}>${this._renderNodeRestrictTab(e)}</div>
                <div ?hidden=${this._activeTab !== "virtualNodes"}>${this._renderVirtualNodesTab(e)}</div>
                <div ?hidden=${this._activeTab !== "variantsHider"}>${this._renderVariantsHiderTab(e)}</div>
                <div ?hidden=${this._activeTab !== "nodeProtect"}>${this._renderNodeProtectTab(e)}</div>
                <div ?hidden=${this._activeTab !== "aiSummary"}>${this._renderAiSummaryTab(e)}</div>
                <div ?hidden=${this._activeTab !== "propertyVersions"}>${this._renderPropertyVersionsTab(e)}</div>
              </div>
              ${this._renderFooter()}
            ` : h}
      </umb-body-layout>
    `;
  }
  _renderSourceBanner() {
    return this._hasAppSettings ? n`
      <uui-box headline="Settings source">
        <div class="banner-row">
          <uui-toggle
            .checked=${this._settings.useBackoffice}
            label="Manage settings from the backoffice"
            label-position="right"
            @change=${this._onMasterToggleChange}
          ></uui-toggle>
          ${this._settings.useBackoffice ? n`
                <uui-button
                  look="primary"
                  color="positive"
                  label="Load from appsettings.json"
                  ?disabled=${this._saving}
                  @click=${this._onImportClick}
                ></uui-button>
              ` : h}
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
  _renderFeatureToggle(e, t, s) {
    return n`
      <uui-toggle
        class="feature-toggle"
        .checked=${e}
        ?disabled=${t}
        label="Enable this feature"
        label-position="right"
        @change=${(i) => s(i.target.checked)}
      ></uui-toggle>
    `;
  }
  _isRuleCollapsed(e, t) {
    return this._collapsedRules.has(`${e}:${t}`);
  }
  _toggleRuleCollapsed(e, t) {
    const s = `${e}:${t}`;
    this._collapsedRules.has(s) ? this._collapsedRules.delete(s) : this._collapsedRules.add(s), this.requestUpdate();
  }
  _removeRuleAndReindex(e, t) {
    const s = `${e}:`, i = /* @__PURE__ */ new Set();
    for (const a of this._collapsedRules) {
      if (!a.startsWith(s)) {
        i.add(a);
        continue;
      }
      const o = Number(a.slice(s.length));
      o < t ? i.add(a) : o > t && i.add(`${s}${o - 1}`);
    }
    this._collapsedRules = i;
  }
  _renderRuleHeader(e, t, s, i, a) {
    const o = this._isRuleCollapsed(e, t);
    return n`
      <div slot="header" class="rule-header">
        <button
          type="button"
          class="rule-toggle"
          aria-label=${o ? "Expand rule" : "Collapse rule"}
          aria-expanded=${!o}
          @click=${() => this._toggleRuleCollapsed(e, t)}
        >
          <umb-icon
            name=${o ? "icon-navigation-right" : "icon-navigation-down"}
          ></umb-icon>
          <strong>Rule ${t + 1}</strong>
          ${a ? n`<span class="rule-suffix">${a}</span>` : h}
        </button>
        <uui-button
          look="secondary"
          color="danger"
          label="Remove"
          ?disabled=${s}
          @click=${i}
        >Remove</uui-button>
      </div>
    `;
  }
  _renderFooter() {
    const e = this._validationErrors();
    return n`
      <div slot="footer" class="footer">
        ${e.length > 0 && this._settings.useBackoffice ? n`<ul class="errors">
              ${e.map((t) => n`<li>${t}</li>`)}
            </ul>` : h}
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
  _renderAutoNodeTab(e) {
    const t = this._settings.autoNode, s = (a) => {
      this._patchSettings("autoNode", { ...t, ...a });
    }, i = (a, o) => {
      const r = t.rules.map((l, m) => m === a ? { ...l, ...o } : l);
      s({ rules: r });
    };
    return n`
      <uui-box>
        <h3 slot="headline" class="uui-h3">AutoNode</h3>
        <p class="feature-description">
          Automatically creates child nodes when a parent is published, based on rules that match
          document types. Useful for scaffolding required child structure (folders, landing pages)
          the moment a content item is created.
        </p>
        ${this._renderFeatureToggle(t.enabled, e, (a) => s({ enabled: a }))}
        <div class="stack">
          <label class="fit">
            <span>Log level</span>
            <uui-select
              ?disabled=${e || !t.enabled}
              .options=${[
      { name: "Normal", value: "Normal", selected: t.logLevel === "Normal" },
      { name: "Verbose", value: "Verbose", selected: t.logLevel === "Verbose" }
    ]}
              @change=${(a) => s({ logLevel: a.target.value })}
            ></uui-select>
          </label>
          <div>
            <uui-toggle
              .checked=${t.republishExistingNodes}
              ?disabled=${e || !t.enabled}
              label="Republish existing nodes"
              label-position="right"
              @change=${(a) => s({ republishExistingNodes: a.target.checked })}
            ></uui-toggle>
            <p class="field-description">
              When on, AutoNode will also process already-published parent nodes — any missing child
              nodes defined by its rules will be created retroactively the next time the parent is
              republished. Leave off to only apply rules to new nodes.
            </p>
          </div>
        </div>
        <h4>Rules</h4>
        ${t.rules.length === 0 ? n`<p class="empty">No rules defined.</p>` : h}
        ${t.rules.map(
      (a, o) => n`
            <uui-box class="rule-card">
              ${this._renderRuleHeader(
        "autoNode",
        o,
        e || !t.enabled,
        () => {
          this._removeRuleAndReindex("autoNode", o), s({ rules: t.rules.filter((r, l) => l !== o) });
        },
        a.createdDocTypeAlias && a.docTypeAliasToCreate ? `(${a.createdDocTypeAlias} → ${a.docTypeAliasToCreate})` : void 0
      )}
              ${this._isRuleCollapsed("autoNode", o) ? h : n`<div class="grid">
                    ${this._docTypeField(
        "Triggering doctype *",
        a.createdDocTypeAlias,
        e || !t.enabled,
        (r) => i(o, { createdDocTypeAlias: r })
      )}
                    ${this._docTypeField(
        "DocType to create *",
        a.docTypeAliasToCreate,
        e || !t.enabled,
        (r) => i(o, { docTypeAliasToCreate: r })
      )}
                    ${this._textField(
        "Node name *",
        a.nodeName,
        e || !t.enabled,
        (r) => i(o, { nodeName: r })
      )}
                    ${this._textField(
        "Dictionary item for name",
        a.dictionaryItemForName,
        e || !t.enabled,
        (r) => i(o, { dictionaryItemForName: r })
      )}
                    ${this._textField(
        "Blueprint",
        a.blueprint,
        e || !t.enabled,
        (r) => i(o, { blueprint: r })
      )}
                    ${this._toggleField(
        "Bring new node first",
        a.bringNewNodeFirst,
        e || !t.enabled,
        (r) => i(o, { bringNewNodeFirst: r }),
        "row-break"
      )}
                    ${this._toggleField(
        "Only create if no children",
        a.onlyCreateIfNoChildren,
        e || !t.enabled,
        (r) => i(o, { onlyCreateIfNoChildren: r })
      )}
                    ${this._toggleField(
        "Create if exists with different name",
        a.createIfExistsWithDifferentName,
        e || !t.enabled,
        (r) => i(o, { createIfExistsWithDifferentName: r })
      )}
                    ${this._toggleField(
        "Keep new node unpublished",
        a.keepNewNodeUnpublished,
        e || !t.enabled,
        (r) => i(o, { keepNewNodeUnpublished: r })
      )}
                  </div>`}
            </uui-box>
          `
    )}
        <uui-button
          look="secondary"
          label="Add rule"
          ?disabled=${e || !t.enabled}
          @click=${() => s({ rules: [...t.rules, M()] })}
        >+ Add rule</uui-button>
      </uui-box>
    `;
  }
  _renderNodeRestrictTab(e) {
    const t = this._settings.nodeRestrict, s = (a) => {
      this._patchSettings("nodeRestrict", { ...t, ...a });
    }, i = (a, o) => {
      const r = t.rules.map((l, m) => m === a ? { ...l, ...o } : l);
      s({ rules: r });
    };
    return n`
      <uui-box>
        <h3 slot="headline" class="uui-h3">NodeRestrict</h3>
        <p class="feature-description">
          Limits the number of child nodes of a given type that can be created under a parent node.
          Editors see a configurable warning or error message when they try to exceed the limit.
        </p>
        ${this._renderFeatureToggle(t.enabled, e, (a) => s({ enabled: a }))}
        <div class="grid">
          ${this._textField(
      "Property alias *",
      t.propertyAlias,
      e || !t.enabled,
      (a) => s({ propertyAlias: a })
    )}
          ${this._toggleField(
      "Show warnings",
      t.showWarnings,
      e || !t.enabled,
      (a) => s({ showWarnings: a })
    )}
        </div>
        <h4>Rules</h4>
        ${t.rules.length === 0 ? n`<p class="empty">No rules defined.</p>` : h}
        ${t.rules.map(
      (a, o) => n`
            <uui-box class="rule-card">
              ${this._renderRuleHeader(
        "nodeRestrict",
        o,
        e || !t.enabled,
        () => {
          this._removeRuleAndReindex("nodeRestrict", o), s({ rules: t.rules.filter((r, l) => l !== o) });
        },
        a.parentDocType && a.childDocType ? `(${a.parentDocType} → ${a.childDocType})` : void 0
      )}
              ${this._isRuleCollapsed("nodeRestrict", o) ? h : n`<div class="grid">
                    ${this._docTypeField(
        "Parent doctype *",
        a.parentDocType,
        e || !t.enabled,
        (r) => i(o, { parentDocType: r })
      )}
                    ${this._docTypeField(
        "Child doctype *",
        a.childDocType,
        e || !t.enabled,
        (r) => i(o, { childDocType: r })
      )}
                    ${this._numberField(
        "Max nodes *",
        a.maxNodes,
        e || !t.enabled,
        (r) => i(o, { maxNodes: r })
      )}
                    ${this._toggleField(
        "Show warnings",
        a.showWarnings,
        e || !t.enabled,
        (r) => i(o, { showWarnings: r })
      )}
                    ${this._textField(
        "Custom limit message",
        a.customMessage,
        e || !t.enabled,
        (r) => i(o, { customMessage: r })
      )}
                    ${this._textField(
        "Custom limit category",
        a.customMessageCategory,
        e || !t.enabled,
        (r) => i(o, { customMessageCategory: r })
      )}
                    ${this._textField(
        "Custom warning message",
        a.customWarningMessage,
        e || !t.enabled,
        (r) => i(o, { customWarningMessage: r })
      )}
                    ${this._textField(
        "Custom warning category",
        a.customWarningMessageCategory,
        e || !t.enabled,
        (r) => i(o, { customWarningMessageCategory: r })
      )}
                  </div>`}
            </uui-box>
          `
    )}
        <uui-button
          look="secondary"
          label="Add rule"
          ?disabled=${e || !t.enabled}
          @click=${() => s({ rules: [...t.rules, B()] })}
        >+ Add rule</uui-button>
      </uui-box>
    `;
  }
  _renderVirtualNodesTab(e) {
    const t = this._settings.virtualNodes, s = (i) => {
      this._patchSettings("virtualNodes", { ...t, ...i });
    };
    return n`
      <uui-box>
        <h3 slot="headline" class="uui-h3">VirtualNodes</h3>
        <p class="feature-description">
          Hides the URL segment of the selected document types so their children appear one level
          higher in the site's public URLs. Useful for grouping content in the tree without that
          grouping leaking into the URL.
        </p>
        ${this._renderFeatureToggle(t.enabled, e, (i) => s({ enabled: i }))}
        <div class="grid">
          ${this._multiAliasField(
      "Virtual node doctypes",
      this._docTypes,
      (t.rules ?? []).join(","),
      e || !t.enabled,
      (i) => {
        const a = i ? i.split(",").map((o) => o.trim()).filter((o) => o.length > 0) : [];
        s({ rules: a });
      }
    )}
        </div>
      </uui-box>
    `;
  }
  _renderVariantsHiderTab(e) {
    const t = this._settings.variantsHider, s = (i) => {
      this._patchSettings("variantsHider", { ...t, ...i });
    };
    return n`
      <uui-box>
        <h3 slot="headline" class="uui-h3">VariantsHider</h3>
        <p class="feature-description">
          Adds an entity action on the content tree that hides language variants that haven't been
          created yet (those shown in parentheses), so editors only see variants that actually exist.
        </p>
        ${this._renderFeatureToggle(t.enabled, e, (i) => s({ enabled: i }))}
        <div class="grid">
          ${this._textField(
      "Caption",
      t.caption,
      e || !t.enabled,
      (i) => s({ caption: i })
    )}
        </div>
      </uui-box>
    `;
  }
  _renderNodeProtectTab(e) {
    const t = this._settings.nodeProtect, s = (a) => {
      this._patchSettings("nodeProtect", { ...t, ...a });
    }, i = (a, o) => {
      const r = t.rules.map((l, m) => m === a ? { ...l, ...o } : l);
      s({ rules: r });
    };
    return n`
      <uui-box>
        <h3 slot="headline" class="uui-h3">NodeProtect</h3>
        <p class="feature-description">
          Prevents deletion of important nodes, either by document type or by specific GUID. Editors
          see a configurable message explaining why the node can't be deleted.
        </p>
        ${this._renderFeatureToggle(t.enabled, e, (a) => s({ enabled: a }))}
        <div class="grid">
          ${this._textField(
      "Property alias *",
      t.propertyAlias,
      e || !t.enabled,
      (a) => s({ propertyAlias: a })
    )}
        </div>
        <h4>Rules</h4>
        ${t.rules.length === 0 ? n`<p class="empty">No rules defined.</p>` : h}
        ${t.rules.map(
      (a, o) => n`
            <uui-box class="rule-card">
              ${this._renderRuleHeader(
        "nodeProtect",
        o,
        e || !t.enabled,
        () => {
          this._removeRuleAndReindex("nodeProtect", o), s({ rules: t.rules.filter((r, l) => l !== o) });
        },
        a.docTypeAlias ? `(${a.docTypeAlias})` : void 0
      )}
              ${this._isRuleCollapsed("nodeProtect", o) ? h : n`<div class="grid">
                    ${this._docTypeField(
        "DocType alias",
        a.docTypeAlias,
        e || !t.enabled,
        (r) => i(o, { docTypeAlias: r })
      )}
                    ${this._textField(
        "Document GUIDs (comma separated)",
        a.documentGuids,
        e || !t.enabled,
        (r) => i(o, { documentGuids: r })
      )}
                    ${this._textField(
        "Custom message",
        a.customMessage,
        e || !t.enabled,
        (r) => i(o, { customMessage: r })
      )}
                    ${this._textField(
        "Custom message category",
        a.customMessageCategory,
        e || !t.enabled,
        (r) => i(o, { customMessageCategory: r })
      )}
                  </div>`}
            </uui-box>
          `
    )}
        <uui-button
          look="secondary"
          label="Add rule"
          ?disabled=${e || !t.enabled}
          @click=${() => s({ rules: [...t.rules, U()] })}
        >+ Add rule</uui-button>
      </uui-box>
    `;
  }
  _renderAiSummaryTab(e) {
    const t = this._settings.aiSummary, s = (i) => {
      this._patchSettings("aiSummary", { ...t, ...i });
    };
    return n`
      <uui-box>
        <h3 slot="headline" class="uui-h3">AiSummary</h3>
        <p class="feature-description">
          Generates AI-powered content summaries using OpenAI or Gemini and writes the result into a
          configured property. A toggle property on the node controls whether a summary should be
          produced for that item.
        </p>
        ${this._renderFeatureToggle(t.enabled, e, (i) => s({ enabled: i }))}
        <div class="grid">
          <label>
            <span>LLM *</span>
            <uui-select
              ?disabled=${e || !t.enabled}
              .options=${[
      { name: "OpenAI", value: "openai", selected: t.llm === "openai" },
      { name: "Gemini", value: "gemini", selected: t.llm === "gemini" }
    ]}
              @change=${(i) => s({ llm: i.target.value })}
            ></uui-select>
          </label>
          ${this._textField(
      "API key *",
      t.apiKey,
      e || !t.enabled,
      (i) => s({ apiKey: i })
    )}
          ${this._textField("Model *", t.model, e || !t.enabled, (i) => s({ model: i }))}
          ${this._numberField(
      "Max chars",
      t.maxChars,
      e || !t.enabled,
      (i) => s({ maxChars: i })
    )}
          ${this._propertyField(
      "Property alias *",
      this._textInputProperties,
      t.propertyAlias,
      e || !t.enabled,
      (i) => s({ propertyAlias: i })
    )}
          ${this._propertyField(
      "Toggle property alias",
      this._trueFalseProperties,
      t.togglePropertyAlias,
      e || !t.enabled,
      (i) => s({ togglePropertyAlias: i })
    )}
          ${this._multiAliasField(
      "DocTypes",
      this._docTypes,
      t.docTypes,
      e || !t.enabled,
      (i) => s({ docTypes: i })
    )}
          ${this._multiAliasField(
      "Exclude properties",
      this._textContentProperties,
      t.excludeProperties,
      e || !t.enabled,
      (i) => s({ excludeProperties: i })
    )}
        </div>
        <label class="block">
          <span>Tone</span>
          <uui-textarea
            .value=${t.tone}
            ?disabled=${e || !t.enabled}
            @input=${(i) => s({ tone: i.target.value })}
          ></uui-textarea>
        </label>
      </uui-box>
    `;
  }
  _renderPropertyVersionsTab(e) {
    const t = this._settings.propertyVersions, s = (i) => {
      this._patchSettings("propertyVersions", { ...t, ...i });
    };
    return n`
      <uui-box>
        <h3 slot="headline" class="uui-h3">PropertyVersions</h3>
        <p class="feature-description">
          Adds navigation actions to properties so editors can step through previous saved versions
          and roll individual properties back without restoring the whole document.
        </p>
        ${this._renderFeatureToggle(t.enabled, e, (i) => s({ enabled: i }))}
        <div class="grid">
          ${this._textField(
      "Next version dictionary entry",
      t.nextVersionButtonCaptionDictionaryEntry,
      e || !t.enabled,
      (i) => s({ nextVersionButtonCaptionDictionaryEntry: i })
    )}
          ${this._textField(
      "Previous version dictionary entry",
      t.previousVersionButtonCaptionDictionaryEntry,
      e || !t.enabled,
      (i) => s({ previousVersionButtonCaptionDictionaryEntry: i })
    )}
          ${this._textField(
      "No versions dictionary entry",
      t.noVersionsButtonCaptionDictionaryEntry,
      e || !t.enabled,
      (i) => s({ noVersionsButtonCaptionDictionaryEntry: i })
    )}
        </div>
      </uui-box>
    `;
  }
  /* ------------------------------------------------------------------ */
  /* Small field helpers                                                */
  /* ------------------------------------------------------------------ */
  _textField(e, t, s, i) {
    return n`
      <label>
        <span>${e}</span>
        <uui-input
          .value=${t ?? ""}
          ?disabled=${s}
          @input=${(a) => i(a.target.value)}
        ></uui-input>
      </label>
    `;
  }
  _docTypeField(e, t, s, i) {
    return this._aliasField(e, this._docTypes, t, s, i);
  }
  _propertyField(e, t, s, i, a) {
    return this._aliasField(e, t, s, i, a);
  }
  _multiAliasField(e, t, s, i, a) {
    const o = new Set(
      (s ?? "").split(",").map((d) => d.trim()).filter((d) => d.length > 0)
    ), r = (d, v) => {
      v ? o.add(d) : o.delete(d), a(Array.from(o).join(","));
    }, l = new Set(t.map((d) => d.alias)), m = Array.from(o).filter((d) => !l.has(d)), _ = this._expandedFields.has(e), f = this._filterModes.get(e) ?? "all", N = (d) => {
      d ? this._expandedFields.add(e) : this._expandedFields.delete(e), this.requestUpdate();
    }, x = (d) => {
      this._filterModes.set(e, d), this.requestUpdate();
    }, $ = f === "selected" ? t.filter((d) => o.has(d.alias)) : t, w = f === "selected" || f === "all" ? m : [];
    return n`
      <label>
        <span>${e}</span>
        <div class="multi-box">
          <div class="multi-bar">
            <button
              type="button"
              class="multi-toggle"
              ?disabled=${i}
              @click=${() => N(!_)}
            >
              <span class="multi-action">${_ ? "Hide list" : "Show list"}</span>
              <span class="multi-count">(${o.size} selected)</span>
            </button>
            ${_ ? n`
                  <div class="multi-filter">
                    <label class="checkbox-row">
                      <input
                        type="radio"
                        name="filter-${e}"
                        ?disabled=${i}
                        .checked=${f === "all"}
                        @change=${() => x("all")}
                      />
                      <span>All</span>
                    </label>
                    <label class="checkbox-row">
                      <input
                        type="radio"
                        name="filter-${e}"
                        ?disabled=${i}
                        .checked=${f === "selected"}
                        @change=${() => x("selected")}
                      />
                      <span>Selected only</span>
                    </label>
                  </div>
                ` : h}
          </div>
          ${_ ? n`
                <div class="checkbox-list">
                  ${$.length === 0 && w.length === 0 ? n`<p class="empty">No entries.</p>` : h}
                  ${$.map(
      (d) => n`
                      <label class="checkbox-row">
                        <input
                          type="checkbox"
                          ?disabled=${i}
                          .checked=${o.has(d.alias)}
                          @change=${(v) => r(d.alias, v.target.checked)}
                        />
                        <span>${d.name} (${d.alias})</span>
                      </label>
                    `
    )}
                  ${w.map(
      (d) => n`
                      <label class="checkbox-row">
                        <input
                          type="checkbox"
                          ?disabled=${i}
                          checked
                          @change=${(v) => r(d, v.target.checked)}
                        />
                        <span>${d} (not found)</span>
                      </label>
                    `
    )}
                </div>
              ` : h}
        </div>
      </label>
    `;
  }
  _aliasField(e, t, s, i, a) {
    const o = s ?? "", r = new Set(t.map((l) => l.alias));
    return n`
      <label>
        <span>${e}</span>
        <select
          class="doctype-select"
          ?disabled=${i}
          @change=${(l) => a(l.target.value)}
        >
          <option value="" ?selected=${o === ""}>-- Select --</option>
          ${t.map(
      (l) => n`
              <option value=${l.alias} ?selected=${l.alias === o}>
                ${l.name} (${l.alias})
              </option>
            `
    )}
          ${o && !r.has(o) ? n`<option value=${o} selected>${o} (not found)</option>` : h}
        </select>
      </label>
    `;
  }
  _numberField(e, t, s, i) {
    return n`
      <label>
        <span>${e}</span>
        <uui-input
          .type=${"number"}
          min="0"
          step="1"
          inputmode="numeric"
          .value=${(t == null ? void 0 : t.toString()) ?? "0"}
          ?disabled=${s}
          @input=${(a) => {
      const o = a.target.value, r = o === "" ? 0 : Number(o);
      i(Number.isNaN(r) ? 0 : r);
    }}
        ></uui-input>
      </label>
    `;
  }
  _toggleField(e, t, s, i, a) {
    return n`
      <label class=${`inline${a ? ` ${a}` : ""}`}>
        <uui-toggle
          .checked=${t}
          ?disabled=${s}
          @change=${(o) => i(o.target.checked)}
        ></uui-toggle>
        <span>${e}</span>
      </label>
    `;
  }
};
L(u, "styles", S`
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
    .feature-toggle {
      display: block;
      margin-bottom: calc(var(--uui-size-space-3, 12px) + 5px);
      padding-bottom: calc(var(--uui-size-space-3, 12px) + 5px);
      border-bottom: 1px solid #e9e9eb;
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
  `);
g([
  b()
], u.prototype, "_loading", 2);
g([
  b()
], u.prototype, "_saving", 2);
g([
  b()
], u.prototype, "_hasAppSettings", 2);
g([
  b()
], u.prototype, "_settings", 2);
g([
  b()
], u.prototype, "_activeTab", 2);
g([
  b()
], u.prototype, "_docTypes", 2);
g([
  b()
], u.prototype, "_trueFalseProperties", 2);
g([
  b()
], u.prototype, "_textContentProperties", 2);
g([
  b()
], u.prototype, "_textInputProperties", 2);
g([
  b()
], u.prototype, "_expandedFields", 2);
g([
  b()
], u.prototype, "_filterModes", 2);
g([
  b()
], u.prototype, "_collapsedRules", 2);
u = g([
  C("dotsee-discipline-settings-workspace")
], u);
const Y = u;
export {
  u as DisciplineSettingsWorkspaceElement,
  Y as default
};
//# sourceMappingURL=discipline-settings.workspace.element-DnEgwVl9.js.map
