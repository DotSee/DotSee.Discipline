var F = Object.defineProperty;
var R = (y, e, t) => e in y ? F(y, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : y[e] = t;
var b = (y, e, t) => R(y, typeof e != "symbol" ? e + "" : e, t);
import { html as r, nothing as _, css as A, state as v, customElement as D } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as S } from "@umbraco-cms/backoffice/lit-element";
import { UMB_AUTH_CONTEXT as P } from "@umbraco-cms/backoffice/auth";
import { UMB_MODAL_MANAGER_CONTEXT as C, UMB_CONFIRM_MODAL as E } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as H } from "@umbraco-cms/backoffice/notification";
import { c as M, b as z, d as I } from "./index-DXKvopVq.js";
const x = "/umbraco/api/discipline";
class L {
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
    const e = await fetch(`${x}/settings`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load Discipline settings (${e.status})`);
    return await e.json();
  }
  async saveSettings(e) {
    const t = await fetch(`${x}/settings`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify(e)
    });
    if (!t.ok)
      throw new Error(`Failed to save Discipline settings (${t.status})`);
    return await t.json();
  }
  async getDocTypes() {
    const e = await fetch(`${x}/doctypes`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load doctypes (${e.status})`);
    return await e.json();
  }
  async getTrueFalseProperties() {
    const e = await fetch(`${x}/properties/truefalse`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load true/false properties (${e.status})`);
    return await e.json();
  }
  async getTextContentProperties() {
    const e = await fetch(`${x}/properties/text-content`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load text content properties (${e.status})`);
    return await e.json();
  }
  async getTextInputProperties() {
    const e = await fetch(`${x}/properties/text-input`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load text input properties (${e.status})`);
    return await e.json();
  }
  async getBlueprints() {
    const e = await fetch(`${x}/blueprints`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load blueprints (${e.status})`);
    return await e.json();
  }
  async importFromAppSettings() {
    const e = await fetch(`${x}/import-from-appsettings`, {
      method: "POST",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to import from appsettings (${e.status})`);
    return await e.json();
  }
}
var N = Object.defineProperty, U = Object.getOwnPropertyDescriptor, B = (y, e, t) => e in y ? N(y, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : y[e] = t, f = (y, e, t, s) => {
  for (var i = s > 1 ? void 0 : s ? U(e, t) : e, a = y.length - 1, o; a >= 0; a--)
    (o = y[a]) && (i = (s ? o(e, t, i) : o(i)) || i);
  return s && i && N(e, t, i), i;
}, O = (y, e, t) => B(y, e + "", t);
const V = [
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
let g = class extends S {
  constructor() {
    super(...arguments);
    b(this, "_loading", !0);
    b(this, "_saving", !1);
    b(this, "_hasAppSettings", !1);
    b(this, "_settings", T());
    b(this, "_activeTab", "autoNode");
    b(this, "_docTypes", []);
    b(this, "_trueFalseProperties", []);
    b(this, "_textContentProperties", []);
    b(this, "_textInputProperties", []);
    b(this, "_blueprints", []);
    b(this, "_expandedFields", /* @__PURE__ */ new Set());
    b(this, "_filterModes", /* @__PURE__ */ new Map());
    b(this, "_collapsedRules", /* @__PURE__ */ new Set());
    b(this, "_dragIndex", null);
    b(this, "_dragOverIndex", null);
    b(this, "_dragPosition", null);
    b(this, "_repository");
    b(this, "_onDocumentMouseDown", (e) => {
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
    const t = await (await this.getContext(P)).getLatestToken();
    this._repository = new L(t);
    try {
      const [s, i, a, o, n, d] = await Promise.all([
        this._repository.getSettings(),
        this._repository.getDocTypes().catch(() => []),
        this._repository.getTrueFalseProperties().catch(() => []),
        this._repository.getTextContentProperties().catch(() => []),
        this._repository.getTextInputProperties().catch(() => []),
        this._repository.getBlueprints().catch(() => [])
      ]);
      this._docTypes = i, this._trueFalseProperties = a, this._textContentProperties = o, this._textInputProperties = n, this._blueprints = d, this._applyResponse(s), this._collapseAllRules();
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
      const s = await this.getContext(H);
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
    const e = await this.getContext(C);
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
      s.parentDocType || e.push(`NodeRestrict rule ${i + 1}: Parent doctype is required`), (!Number.isFinite(s.maxNodes) || s.maxNodes < 0) && e.push(`NodeRestrict rule ${i + 1}: Max nodes must be a non-negative number`);
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
      return r`<umb-body-layout headline="DotSee Discipline Settings">
        <div class="center"><uui-loader></uui-loader></div>
      </umb-body-layout>`;
    const e = this._fieldsDisabled, t = this._settings.useBackoffice;
    return r`
      <umb-body-layout headline="DotSee Discipline Settings">
        ${this._renderSourceBanner()}
        ${t ? r`
              <div class="tab-bar">
                ${V.map((s) => {
      var o;
      const i = !!((o = this._settings[s.alias]) != null && o.enabled), a = [
        "tab-button",
        this._activeTab === s.alias ? "active" : "",
        i ? "enabled" : ""
      ].filter(Boolean).join(" ");
      return r`
                    <button
                      type="button"
                      class=${a}
                      @click=${() => {
        this._activeTab = s.alias, this.requestUpdate();
      }}
                    >
                      ${i ? r`<umb-icon name="icon-check" class="tab-icon"></umb-icon>` : _}
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
            ` : _}
      </umb-body-layout>
    `;
  }
  _renderSourceBanner() {
    return this._hasAppSettings ? r`
      <uui-box headline="Settings source">
        <div class="banner-row">
          <uui-toggle
            .checked=${this._settings.useBackoffice}
            label="Manage settings from the backoffice"
            label-position="right"
            @change=${this._onMasterToggleChange}
          ></uui-toggle>
          ${this._settings.useBackoffice ? r`
                <uui-button
                  look="primary"
                  color="positive"
                  label="Load from appsettings.json"
                  ?disabled=${this._saving}
                  @click=${this._onImportClick}
                ></uui-button>
              ` : _}
        </div>
      </uui-box>
    ` : r`
        <uui-box headline="Settings source">
          <p>
            No <code>DotSee.Discipline</code> section was found in <code>appsettings.json</code>.
            All configuration is managed from this screen.
          </p>
        </uui-box>
      `;
  }
  _renderEnableButton(e, t, s) {
    return r`
      <uui-button
        slot="header-actions"
        look=${e ? "secondary" : "primary"}
        color=${e ? "default" : "positive"}
        label=${e ? "Disable" : "Enable"}
        ?disabled=${t}
        @click=${() => s(!e)}
      ></uui-button>
    `;
  }
  _isRuleCollapsed(e, t) {
    return this._collapsedRules.has(`${e}:${t}`);
  }
  _toggleRuleCollapsed(e, t) {
    const s = `${e}:${t}`;
    this._collapsedRules.has(s) ? this._collapsedRules.delete(s) : this._collapsedRules.add(s), this.requestUpdate();
  }
  _remapCollapsedRules(e, t) {
    const s = `${e}:`, i = /* @__PURE__ */ new Set();
    for (const a of this._collapsedRules) {
      if (!a.startsWith(s)) {
        i.add(a);
        continue;
      }
      const o = Number(a.slice(s.length)), n = t.get(o);
      n !== void 0 && i.add(`${s}${n}`);
    }
    this._collapsedRules = i;
  }
  _reorderAutoNodeRules(e, t) {
    const s = this._settings.autoNode;
    if (e === t || e < 0 || e >= s.rules.length) return;
    const i = Math.max(0, Math.min(t, s.rules.length - 1));
    if (e === i) return;
    const a = s.rules.slice(), [o] = a.splice(e, 1);
    a.splice(i, 0, o);
    const n = /* @__PURE__ */ new Map(), d = s.rules.map((m, l) => l), [h] = d.splice(e, 1);
    d.splice(i, 0, h), d.forEach((m, l) => n.set(m, l)), this._remapCollapsedRules("autoNode", n), this._patchSettings("autoNode", { ...s, rules: a });
  }
  _onRuleDragStart(e, t) {
    if (this._dragIndex = t, e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", String(t));
      const s = e.currentTarget, i = s == null ? void 0 : s.closest(".rule-wrapper");
      if (i) {
        const a = i.getBoundingClientRect();
        e.dataTransfer.setDragImage(
          i,
          e.clientX - a.left,
          e.clientY - a.top
        );
      }
    }
  }
  _onRuleDragOver(e, t) {
    if (this._dragIndex === null) return;
    e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
    const i = e.currentTarget.getBoundingClientRect(), a = i.top + i.height / 2, o = e.clientY < a ? "before" : "after";
    (this._dragOverIndex !== t || this._dragPosition !== o) && (this._dragOverIndex = t, this._dragPosition = o);
  }
  _onRuleDragLeave(e) {
    this._dragOverIndex === e && (this._dragOverIndex = null, this._dragPosition = null);
  }
  _onRuleDrop(e, t) {
    if (e.preventDefault(), this._dragIndex === null) return;
    const s = this._dragIndex, i = this._dragPosition ?? "after";
    let a = t + (i === "after" ? 1 : 0);
    s < a && a--, this._reorderAutoNodeRules(s, a), this._dragIndex = null, this._dragOverIndex = null, this._dragPosition = null;
  }
  _onRuleDragEnd() {
    this._dragIndex = null, this._dragOverIndex = null, this._dragPosition = null;
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
  _collapseAllRules() {
    const e = /* @__PURE__ */ new Set();
    this._settings.autoNode.rules.forEach((t, s) => e.add(`autoNode:${s}`)), this._settings.nodeRestrict.rules.forEach((t, s) => e.add(`nodeRestrict:${s}`)), this._settings.nodeProtect.rules.forEach((t, s) => e.add(`nodeProtect:${s}`)), this._collapsedRules = e, this.requestUpdate();
  }
  _renderCollapsedRule(e, t, s, i, a, o) {
    return r`
      <uui-ref-node
        class="rule-ref"
        name=${s}
        detail=${i}
        ?disabled=${a}
        @open=${() => this._toggleRuleCollapsed(e, t)}
      >
        <umb-icon slot="icon" name="icon-navigation-right"></umb-icon>
        <uui-action-bar slot="actions">
          <uui-button
            look="secondary"
            color="danger"
            label="Remove"
            ?disabled=${a}
            @click=${o}
          ></uui-button>
        </uui-action-bar>
      </uui-ref-node>
    `;
  }
  _renderRuleHeader(e, t, s, i, a) {
    const o = this._isRuleCollapsed(e, t);
    return r`
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
          ${a ? r`<span class="rule-suffix">${a}</span>` : _}
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
    return r`
      <div slot="footer" class="footer">
        ${e.length > 0 && this._settings.useBackoffice ? r`<ul class="errors">
              ${e.map((t) => r`<li>${t}</li>`)}
            </ul>` : _}
        <uui-button
          look="primary"
          color="positive"
          label="Save"
          ?disabled=${!this._canSave()}
          @click=${this._onSaveClick}
        >
          ${this._saving ? r`<uui-loader></uui-loader>` : "Save"}
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
      const n = t.rules.map((d, h) => h === a ? { ...d, ...o } : d);
      s({ rules: n });
    };
    return r`
      <uui-box>
        <h3 slot="headline" class="uui-h3">AutoNode</h3>
        ${this._renderEnableButton(t.enabled, e, (a) => s({ enabled: a }))}
        <p class="feature-description no-divider">
          Automatically creates child nodes when a parent is published, based on rules that match
          document types. Useful for scaffolding required child structure (folders, landing pages)
          the moment a content item is created.
        </p>
        <div class="stack">
          ${this._withFieldHelp(
      r`
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
            `,
      "autonode-loglevel-help",
      "Controls how chatty AutoNode is in the Umbraco log. Use Verbose when diagnosing rule behaviour; switch back to Normal for production to keep the log clean.",
      "inline"
    )}
          <div>
            ${this._withFieldHelp(
      r`
                <uui-toggle
                  .checked=${t.republishExistingNodes}
                  ?disabled=${e || !t.enabled}
                  label="Republish existing nodes"
                  label-position="right"
                  @change=${(a) => s({ republishExistingNodes: a.target.checked })}
                ></uui-toggle>
              `,
      "autonode-republish-help",
      "When on, AutoNode will also process already-published parent nodes — any missing child nodes defined by its rules will be created retroactively the next time the parent is republished. Leave off to only apply rules to newly published nodes.",
      "inline"
    )}
            <p class="field-description">
              When on, AutoNode will also process already-published parent nodes — any missing child
              nodes defined by its rules will be created retroactively the next time the parent is
              republished. Leave off to only apply rules to new nodes.
            </p>
          </div>
        </div>
        <h4>Rules</h4>
        ${t.rules.length === 0 ? r`<p class="empty">No rules defined.</p>` : _}
        ${t.rules.map((a, o) => {
      const n = a.createdDocTypeAlias && a.docTypeAliasToCreate ? `(${a.createdDocTypeAlias} → ${a.docTypeAliasToCreate})` : "", d = n ? `Rule ${o + 1} ${n}` : `Rule ${o + 1}`, h = a.nodeName ?? "", m = () => {
        this._removeRuleAndReindex("autoNode", o), s({ rules: t.rules.filter((u, k) => k !== o) });
      }, l = this._isRuleCollapsed("autoNode", o) ? this._renderCollapsedRule("autoNode", o, d, h, e || !t.enabled, m) : r`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader("autoNode", o, e || !t.enabled, m, n || void 0)}
                  <div class="grid">
                    ${this._withFieldHelp(
        this._docTypeField(
          "Triggering doctype *",
          a.createdDocTypeAlias,
          e || !t.enabled,
          (u) => i(o, { createdDocTypeAlias: u })
        ),
        `autonode-rule-${o}-trigger-help`,
        "The parent doctype whose publish event triggers this rule. When a node of this type is published, AutoNode will evaluate the rule against it."
      )}
                    ${this._withFieldHelp(
        this._docTypeField(
          "DocType to create *",
          a.docTypeAliasToCreate,
          e || !t.enabled,
          (u) => i(o, { docTypeAliasToCreate: u })
        ),
        `autonode-rule-${o}-create-help`,
        "The doctype of the child node that will be created under the triggering node. Must be allowed as a child of the triggering doctype in Umbraco."
      )}
                    ${this._withFieldHelp(
        this._textField(
          "Node name *",
          a.nodeName,
          e || !t.enabled,
          (u) => i(o, { nodeName: u })
        ),
        `autonode-rule-${o}-nodename-help`,
        "Literal name for the created child node. Ignored when a dictionary item is set below."
      )}
                    ${this._withFieldHelp(
        this._textField(
          "Dictionary item for name",
          a.dictionaryItemForName,
          e || !t.enabled,
          (u) => i(o, { dictionaryItemForName: u })
        ),
        `autonode-rule-${o}-dictionary-help`,
        "Umbraco dictionary key used to translate the child node name per culture. Takes precedence over the literal Node name when set and the key exists.",
        "stretch",
        "row-break"
      )}
                    ${this._withFieldHelp(
        this._blueprintField(
          "Blueprint",
          a.docTypeAliasToCreate,
          a.blueprint,
          e || !t.enabled,
          (u) => i(o, { blueprint: u })
        ),
        `autonode-rule-${o}-blueprint-help`,
        'Optional content template (blueprint) to prefill the new node. Only blueprints of the doctype selected in "DocType to create" are listed.'
      )}
                    ${this._withFieldHelp(
        this._toggleField(
          "Bring new node first",
          a.bringNewNodeFirst,
          e || !t.enabled,
          (u) => i(o, { bringNewNodeFirst: u })
        ),
        `autonode-rule-${o}-bringfirst-help`,
        "When on, the new child is inserted as the first sibling in the tree. When off, it is appended at the end.",
        "inline",
        "row-break"
      )}
                    ${this._withFieldHelp(
        this._toggleField(
          "Only create if no children",
          a.onlyCreateIfNoChildren,
          e || !t.enabled,
          (u) => i(o, { onlyCreateIfNoChildren: u })
        ),
        `autonode-rule-${o}-nochildren-help`,
        "When on, the rule only fires if the triggering node has no existing children. Use for one-off scaffolding where the rule should not keep creating siblings later.",
        "inline"
      )}
                    ${this._withFieldHelp(
        this._toggleField(
          "Create if exists with different name",
          a.createIfExistsWithDifferentName,
          e || !t.enabled,
          (u) => i(o, { createIfExistsWithDifferentName: u })
        ),
        `autonode-rule-${o}-existsdiffname-help`,
        "When on, AutoNode will create a new child even if a sibling of the same doctype already exists under a different name. When off, an existing child of that doctype is treated as already satisfying the rule.",
        "inline"
      )}
                    ${this._withFieldHelp(
        this._toggleField(
          "Keep new node unpublished",
          a.keepNewNodeUnpublished,
          e || !t.enabled,
          (u) => i(o, { keepNewNodeUnpublished: u })
        ),
        `autonode-rule-${o}-unpublished-help`,
        "When on, the created child is saved as a draft only. When off, it is published immediately after creation.",
        "inline"
      )}
                  </div>
                </uui-box>
              `, p = [
        "rule-wrapper",
        this._dragIndex === o ? "dragging" : "",
        this._dragOverIndex === o && this._dragPosition === "before" ? "drop-before" : "",
        this._dragOverIndex === o && this._dragPosition === "after" ? "drop-after" : ""
      ].filter(Boolean).join(" "), $ = e || !t.enabled;
      return r`
            <div
              class=${p}
              @dragover=${(u) => this._onRuleDragOver(u, o)}
              @dragleave=${() => this._onRuleDragLeave(o)}
              @drop=${(u) => this._onRuleDrop(u, o)}
            >
              <span
                class="drag-handle"
                draggable=${$ ? "false" : "true"}
                aria-label="Drag to reorder"
                title="Drag to reorder"
                @dragstart=${(u) => this._onRuleDragStart(u, o)}
                @dragend=${() => this._onRuleDragEnd()}
              >
                <umb-icon name="icon-navigation"></umb-icon>
              </span>
              <div class="rule-content">${l}</div>
            </div>
          `;
    })}
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
      const n = t.rules.map((d, h) => h === a ? { ...d, ...o } : d);
      s({ rules: n });
    };
    return r`
      <uui-box>
        <h3 slot="headline" class="uui-h3">NodeRestrict</h3>
        ${this._renderEnableButton(t.enabled, e, (a) => s({ enabled: a }))}
        <p class="feature-description no-divider">
          Limits the number of child nodes of a given type that can be created under a parent node.
          Editors see a configurable warning or error message when they try to exceed the limit.
        </p>
        <div class="grid">
          ${this._withFieldHelp(
      this._textField(
        "Property alias *",
        t.propertyAlias,
        e || !t.enabled,
        (a) => s({ propertyAlias: a })
      ),
      "noderestrict-propertyalias-help",
      "Optional property alias that, when present on a node and set to true, excludes that node from NodeRestrict limits. Leave empty to apply limits to every node that matches a rule."
    )}
          ${this._withFieldHelp(
      this._toggleField(
        "Show warnings",
        t.showWarnings,
        e || !t.enabled,
        (a) => s({ showWarnings: a })
      ),
      "noderestrict-showwarnings-help",
      "Global default. When on, NodeRestrict surfaces warning messages to editors as they approach a limit. Individual rules can override this.",
      "inline"
    )}
        </div>
        <h4>Rules</h4>
        ${t.rules.length === 0 ? r`<p class="empty">No rules defined.</p>` : _}
        ${t.rules.map((a, o) => {
      const n = !a.childDocType || a.childDocType === "*" ? "any" : a.childDocType, d = a.parentDocType ? `(${a.parentDocType} → ${n})` : "", h = d ? `Rule ${o + 1} ${d}` : `Rule ${o + 1}`, m = `Max ${a.maxNodes ?? 0}`, l = () => {
        this._removeRuleAndReindex("nodeRestrict", o), s({ rules: t.rules.filter((p, $) => $ !== o) });
      };
      return this._isRuleCollapsed("nodeRestrict", o) ? this._renderCollapsedRule("nodeRestrict", o, h, m, e || !t.enabled, l) : r`
            <uui-box class="rule-card">
              ${this._renderRuleHeader("nodeRestrict", o, e || !t.enabled, l, d || void 0)}
              <div class="grid">
                ${this._withFieldHelp(
        this._docTypeField(
          "Parent doctype *",
          a.parentDocType,
          e || !t.enabled,
          (p) => i(o, { parentDocType: p })
        ),
        `noderestrict-rule-${o}-parent-help`,
        "The doctype of the parent node under which the limit is enforced. The rule counts children of this parent."
      )}
                ${this._withFieldHelp(
        this._docTypeField(
          "Child doctype",
          a.childDocType || "*",
          e || !t.enabled,
          (p) => i(o, { childDocType: p }),
          { label: "Any doctype", value: "*" }
        ),
        `noderestrict-rule-${o}-child-help`,
        'The doctype of children that count towards the limit. Choose "Any doctype" to cap the total number of children regardless of type.'
      )}
                ${this._withFieldHelp(
        this._numberField(
          "Max nodes *",
          a.maxNodes,
          e || !t.enabled,
          (p) => i(o, { maxNodes: p })
        ),
        `noderestrict-rule-${o}-max-help`,
        "Maximum number of matching children allowed under a single parent. Editors are blocked from creating more than this many."
      )}
                ${this._withFieldHelp(
        this._toggleField(
          "Show warnings",
          a.showWarnings,
          e || !t.enabled,
          (p) => i(o, { showWarnings: p })
        ),
        `noderestrict-rule-${o}-warnings-help`,
        "When on, editors see the warning message as they approach the limit. Overrides the feature-level default for this rule only.",
        "inline"
      )}
                ${this._withFieldHelp(
        this._textField(
          "Custom limit message",
          a.customMessage,
          e || !t.enabled,
          (p) => i(o, { customMessage: p })
        ),
        `noderestrict-rule-${o}-limitmsg-help`,
        "Plain text (or dictionary key — see category below) shown to editors when they hit the hard limit. Leave empty to use the default."
      )}
                ${this._withFieldHelp(
        this._textField(
          "Custom limit category",
          a.customMessageCategory,
          e || !t.enabled,
          (p) => i(o, { customMessageCategory: p })
        ),
        `noderestrict-rule-${o}-limitcat-help`,
        "Optional Umbraco dictionary category used to localise the Custom limit message. When set, the message value is treated as a dictionary key within this category."
      )}
                ${this._withFieldHelp(
        this._textField(
          "Custom warning message",
          a.customWarningMessage,
          e || !t.enabled,
          (p) => i(o, { customWarningMessage: p })
        ),
        `noderestrict-rule-${o}-warnmsg-help`,
        "Text shown to editors as they approach — but have not yet reached — the limit. Leave empty to use the default warning."
      )}
                ${this._withFieldHelp(
        this._textField(
          "Custom warning category",
          a.customWarningMessageCategory,
          e || !t.enabled,
          (p) => i(o, { customWarningMessageCategory: p })
        ),
        `noderestrict-rule-${o}-warncat-help`,
        "Optional Umbraco dictionary category used to localise the Custom warning message. When set, the message value is treated as a dictionary key within this category."
      )}
              </div>
            </uui-box>
          `;
    })}
        <uui-button
          look="secondary"
          label="Add rule"
          ?disabled=${e || !t.enabled}
          @click=${() => s({ rules: [...t.rules, z()] })}
        >+ Add rule</uui-button>
      </uui-box>
    `;
  }
  _renderVirtualNodesTab(e) {
    const t = this._settings.virtualNodes, s = (i) => {
      this._patchSettings("virtualNodes", { ...t, ...i });
    };
    return r`
      <uui-box>
        <h3 slot="headline" class="uui-h3">VirtualNodes</h3>
        ${this._renderEnableButton(t.enabled, e, (i) => s({ enabled: i }))}
        <p class="feature-description no-divider">
          Hides the URL segment of the selected document types so their children appear one level
          higher in the site's public URLs. Useful for grouping content in the tree without that
          grouping leaking into the URL.
        </p>
        <div class="grid">
          ${this._withFieldHelp(
      this._multiAliasField(
        "Virtual node doctypes",
        this._docTypes,
        (t.rules ?? []).join(","),
        e || !t.enabled,
        (i) => {
          const a = i ? i.split(",").map((o) => o.trim()).filter((o) => o.length > 0) : [];
          s({ rules: a });
        }
      ),
      "virtualnodes-rules-help",
      "Doctypes whose URL segment should be skipped in the frontend. Nodes of these doctypes still appear in the tree as containers, but their children are served one level up in the public URL."
    )}
        </div>
      </uui-box>
    `;
  }
  _renderVariantsHiderTab(e) {
    const t = this._settings.variantsHider, s = (i) => {
      this._patchSettings("variantsHider", { ...t, ...i });
    };
    return r`
      <uui-box>
        <h3 slot="headline" class="uui-h3">VariantsHider</h3>
        ${this._renderEnableButton(t.enabled, e, (i) => s({ enabled: i }))}
        <p class="feature-description no-divider">
          Adds an entity action on the content tree that hides language variants that haven't been
          created yet (those shown in parentheses), so editors only see variants that actually exist.
        </p>
        <div class="grid">
          ${this._withFieldHelp(
      this._textField(
        "Caption",
        t.caption,
        e || !t.enabled,
        (i) => s({ caption: i })
      ),
      "variantshider-caption-help",
      "Label shown on the Hide/Show variants entity action in the content tree context menu. Leave empty to use the default caption."
    )}
        </div>
      </uui-box>
    `;
  }
  _renderNodeProtectTab(e) {
    const t = this._settings.nodeProtect, s = (a) => {
      this._patchSettings("nodeProtect", { ...t, ...a });
    }, i = (a, o) => {
      const n = t.rules.map((d, h) => h === a ? { ...d, ...o } : d);
      s({ rules: n });
    };
    return r`
      <uui-box>
        <h3 slot="headline" class="uui-h3">NodeProtect</h3>
        ${this._renderEnableButton(t.enabled, e, (a) => s({ enabled: a }))}
        <p class="feature-description no-divider">
          Prevents deletion of important nodes, either by document type or by specific GUID. Editors
          see a configurable message explaining why the node can't be deleted.
        </p>
        <div class="grid">
          ${this._withFieldHelp(
      this._propertyField(
        "Property alias *",
        this._trueFalseProperties,
        t.propertyAlias,
        e || !t.enabled,
        (a) => s({ propertyAlias: a })
      ),
      "nodeprotect-propertyalias-help",
      "The alias of a true/false property on your document types. When a node has this property set to true, NodeProtect will treat it as protected and block deletion."
    )}
        </div>
        <h4>Rules</h4>
        ${t.rules.length === 0 ? r`<p class="empty">No rules defined.</p>` : _}
        ${t.rules.map((a, o) => {
      const n = a.docTypeAlias ? `(${a.docTypeAlias})` : "", d = n ? `Rule ${o + 1} ${n}` : `Rule ${o + 1}`, h = a.documentGuids ? "By GUIDs" : a.docTypeAlias ? "By doctype" : "", m = () => {
        this._removeRuleAndReindex("nodeProtect", o), s({ rules: t.rules.filter((l, p) => p !== o) });
      };
      return this._isRuleCollapsed("nodeProtect", o) ? this._renderCollapsedRule("nodeProtect", o, d, h, e || !t.enabled, m) : r`
            <uui-box class="rule-card">
              ${this._renderRuleHeader("nodeProtect", o, e || !t.enabled, m, n || void 0)}
              <div class="grid">
                ${this._withFieldHelp(
        this._docTypeField(
          "DocType alias",
          a.docTypeAlias,
          e || !t.enabled,
          (l) => i(o, { docTypeAlias: l })
        ),
        `nodeprotect-rule-${o}-doctype-help`,
        "Protect every node of this doctype from deletion. Leave empty if you want to protect specific nodes by GUID instead."
      )}
                ${this._withFieldHelp(
        this._textField(
          "Document GUIDs (comma separated)",
          a.documentGuids,
          e || !t.enabled,
          (l) => i(o, { documentGuids: l })
        ),
        `nodeprotect-rule-${o}-guids-help`,
        "Comma-separated list of specific content GUIDs to protect. Use alongside or instead of the doctype alias to protect individual important nodes."
      )}
                ${this._withFieldHelp(
        this._textField(
          "Custom message",
          a.customMessage,
          e || !t.enabled,
          (l) => i(o, { customMessage: l })
        ),
        `nodeprotect-rule-${o}-msg-help`,
        "Text (or dictionary key — see category below) shown to editors who try to delete a protected node. Leave empty to use the default message."
      )}
                ${this._withFieldHelp(
        this._textField(
          "Custom message category",
          a.customMessageCategory,
          e || !t.enabled,
          (l) => i(o, { customMessageCategory: l })
        ),
        `nodeprotect-rule-${o}-msgcat-help`,
        "Optional Umbraco dictionary category used to localise the Custom message. When set, the message value is treated as a dictionary key within this category."
      )}
              </div>
            </uui-box>
          `;
    })}
        <uui-button
          look="secondary"
          label="Add rule"
          ?disabled=${e || !t.enabled}
          @click=${() => s({ rules: [...t.rules, I()] })}
        >+ Add rule</uui-button>
      </uui-box>
    `;
  }
  _renderAiSummaryTab(e) {
    const t = this._settings.aiSummary, s = (i) => {
      this._patchSettings("aiSummary", { ...t, ...i });
    };
    return r`
      <uui-box>
        <h3 slot="headline" class="uui-h3">AiSummary</h3>
        ${this._renderEnableButton(t.enabled, e, (i) => s({ enabled: i }))}
        <p class="feature-description no-divider">
          Generates AI-powered content summaries using OpenAI or Gemini and writes the result into a
          configured property. A toggle property on the node controls whether a summary should be
          produced for that item.
        </p>
        <div class="grid">
          ${this._withFieldHelp(
      r`
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
            `,
      "aisummary-llm-help",
      "Which large-language-model provider to use for summaries. Determines which Model names and API key format are valid."
    )}
          ${this._withFieldHelp(
      this._textField(
        "API key *",
        t.apiKey,
        e || !t.enabled,
        (i) => s({ apiKey: i })
      ),
      "aisummary-apikey-help",
      "Secret key issued by the selected LLM provider. Stored as plain text in settings — protect access to this screen accordingly."
    )}
          ${this._withFieldHelp(
      this._textField("Model *", t.model, e || !t.enabled, (i) => s({ model: i })),
      "aisummary-model-help",
      "The exact model identifier to call, e.g. gpt-4o-mini or gemini-1.5-flash. Must match a model your API key is entitled to use."
    )}
          ${this._withFieldHelp(
      this._numberField(
        "Max chars",
        t.maxChars,
        e || !t.enabled,
        (i) => s({ maxChars: i })
      ),
      "aisummary-maxchars-help",
      "Upper bound for the generated summary length in characters. The prompt asks the model to stay under this limit; set it to match the space available in your front-end."
    )}
          ${this._withFieldHelp(
      this._propertyField(
        "Property alias *",
        this._textInputProperties,
        t.propertyAlias,
        e || !t.enabled,
        (i) => s({ propertyAlias: i })
      ),
      "aisummary-propertyalias-help",
      "Alias of the text property on your doctypes where the generated summary will be written. Must exist on every doctype selected below."
    )}
          ${this._withFieldHelp(
      this._propertyField(
        "Toggle property alias",
        this._trueFalseProperties,
        t.togglePropertyAlias,
        e || !t.enabled,
        (i) => s({ togglePropertyAlias: i })
      ),
      "aisummary-toggleproperty-help",
      "Optional true/false property alias that editors use to opt a specific node in or out of summary generation. Leave empty to summarise every matching node on save."
    )}
          ${this._withFieldHelp(
      this._multiAliasField(
        "DocTypes",
        this._docTypes,
        t.docTypes,
        e || !t.enabled,
        (i) => s({ docTypes: i })
      ),
      "aisummary-doctypes-help",
      "Doctypes whose content should be eligible for AI summaries. Nodes of other doctypes are ignored entirely."
    )}
          ${this._withFieldHelp(
      this._multiAliasField(
        "Exclude properties",
        this._textContentProperties,
        t.excludeProperties,
        e || !t.enabled,
        (i) => s({ excludeProperties: i })
      ),
      "aisummary-excludeproperties-help",
      "Text properties on the node that should not be sent to the LLM when building the summary prompt. Use this to exclude internal notes, sidebars, or already-summarised fields."
    )}
        </div>
        ${this._withFieldHelp(
      r`
            <label class="block">
              <span>Tone</span>
              <uui-textarea
                .value=${t.tone}
                ?disabled=${e || !t.enabled}
                @input=${(i) => s({ tone: i.target.value })}
              ></uui-textarea>
            </label>
          `,
      "aisummary-tone-help",
      'Free-text instructions appended to the prompt that steer the voice of the generated summary, e.g. "formal, no marketing fluff" or "friendly, second person, max two sentences".'
    )}
      </uui-box>
    `;
  }
  _renderPropertyVersionsTab(e) {
    const t = this._settings.propertyVersions, s = (i) => {
      this._patchSettings("propertyVersions", { ...t, ...i });
    };
    return r`
      <uui-box>
        <h3 slot="headline" class="uui-h3">PropertyVersions</h3>
        ${this._renderEnableButton(t.enabled, e, (i) => s({ enabled: i }))}
        <p class="feature-description no-divider">
          Adds navigation actions to properties so editors can step through previous saved versions
          and roll individual properties back without restoring the whole document.
        </p>
        <div class="grid">
          ${this._withFieldHelp(
      this._textField(
        "Next version dictionary entry",
        t.nextVersionButtonCaptionDictionaryEntry,
        e || !t.enabled,
        (i) => s({ nextVersionButtonCaptionDictionaryEntry: i })
      ),
      "propertyversions-next-help",
      'Umbraco dictionary key used as the caption for the "Next version" property action. Leave empty to use the built-in English label.'
    )}
          ${this._withFieldHelp(
      this._textField(
        "Previous version dictionary entry",
        t.previousVersionButtonCaptionDictionaryEntry,
        e || !t.enabled,
        (i) => s({ previousVersionButtonCaptionDictionaryEntry: i })
      ),
      "propertyversions-previous-help",
      'Umbraco dictionary key used as the caption for the "Previous version" property action. Leave empty to use the built-in English label.'
    )}
          ${this._withFieldHelp(
      this._textField(
        "No versions dictionary entry",
        t.noVersionsButtonCaptionDictionaryEntry,
        e || !t.enabled,
        (i) => s({ noVersionsButtonCaptionDictionaryEntry: i })
      ),
      "propertyversions-none-help",
      "Umbraco dictionary key used for the disabled state when no earlier versions are available. Leave empty to use the built-in English label."
    )}
        </div>
      </uui-box>
    `;
  }
  /* ------------------------------------------------------------------ */
  /* Small field helpers                                                */
  /* ------------------------------------------------------------------ */
  _textField(e, t, s, i) {
    return r`
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
  _docTypeField(e, t, s, i, a) {
    return this._aliasField(e, this._docTypes, t, s, i, a);
  }
  _propertyField(e, t, s, i, a) {
    return this._aliasField(e, t, s, i, a);
  }
  _withFieldHelp(e, t, s, i = "stretch", a) {
    const o = `field-with-help ${i}${a ? ` ${a}` : ""}`;
    return r`
      <div class=${o}>
        ${e}
        <uui-button
          class="help-button"
          look="secondary"
          compact
          label="Help"
          popovertarget=${t}
        >
          <umb-icon name="icon-help-alt"></umb-icon>
        </uui-button>
        <uui-popover-container id=${t} placement="top-end">
          <div class="help-bubble">${s}</div>
        </uui-popover-container>
      </div>
    `;
  }
  _multiAliasField(e, t, s, i, a) {
    const o = new Set(
      (s ?? "").split(",").map((c) => c.trim()).filter((c) => c.length > 0)
    ), n = (c, w) => {
      w ? o.add(c) : o.delete(c), a(Array.from(o).join(","));
    }, d = new Set(t.map((c) => c.alias)), h = Array.from(o).filter((c) => !d.has(c)), m = this._expandedFields.has(e), l = this._filterModes.get(e) ?? "all", p = (c) => {
      c ? this._expandedFields.add(e) : this._expandedFields.delete(e), this.requestUpdate();
    }, $ = (c) => {
      this._filterModes.set(e, c), this.requestUpdate();
    }, u = l === "selected" ? t.filter((c) => o.has(c.alias)) : t, k = l === "selected" || l === "all" ? h : [];
    return r`
      <label>
        <span>${e}</span>
        <div class="multi-box">
          <div class="multi-bar">
            <button
              type="button"
              class="multi-toggle"
              ?disabled=${i}
              @click=${() => p(!m)}
            >
              <span class="multi-action">${m ? "Hide list" : "Show list"}</span>
              <span class="multi-count">(${o.size} selected)</span>
            </button>
            ${m ? r`
                  <div class="multi-filter">
                    <label class="checkbox-row">
                      <input
                        type="radio"
                        name="filter-${e}"
                        ?disabled=${i}
                        .checked=${l === "all"}
                        @change=${() => $("all")}
                      />
                      <span>All</span>
                    </label>
                    <label class="checkbox-row">
                      <input
                        type="radio"
                        name="filter-${e}"
                        ?disabled=${i}
                        .checked=${l === "selected"}
                        @change=${() => $("selected")}
                      />
                      <span>Selected only</span>
                    </label>
                  </div>
                ` : _}
          </div>
          ${m ? r`
                <div class="checkbox-list">
                  ${u.length === 0 && k.length === 0 ? r`<p class="empty">No entries.</p>` : _}
                  ${u.map(
      (c) => r`
                      <label class="checkbox-row">
                        <input
                          type="checkbox"
                          ?disabled=${i}
                          .checked=${o.has(c.alias)}
                          @change=${(w) => n(c.alias, w.target.checked)}
                        />
                        <span>${c.name} (${c.alias})</span>
                      </label>
                    `
    )}
                  ${k.map(
      (c) => r`
                      <label class="checkbox-row">
                        <input
                          type="checkbox"
                          ?disabled=${i}
                          checked
                          @change=${(w) => n(c, w.target.checked)}
                        />
                        <span>${c} (not found)</span>
                      </label>
                    `
    )}
                </div>
              ` : _}
        </div>
      </label>
    `;
  }
  _aliasField(e, t, s, i, a, o) {
    const n = s ?? "", d = new Set(t.map((l) => l.alias)), h = (o == null ? void 0 : o.value) ?? "", m = (o == null ? void 0 : o.label) ?? "-- Select --";
    return r`
      <label>
        <span>${e}</span>
        <select
          class="doctype-select"
          ?disabled=${i}
          @change=${(l) => a(l.target.value)}
        >
          <option value=${h} ?selected=${n === h || n === ""}>
            ${m}
          </option>
          ${t.map(
      (l) => r`
              <option value=${l.alias} ?selected=${l.alias === n}>
                ${l.name} (${l.alias})
              </option>
            `
    )}
          ${n && n !== h && !d.has(n) ? r`<option value=${n} selected>${n} (not found)</option>` : _}
        </select>
      </label>
    `;
  }
  _blueprintField(e, t, s, i, a) {
    const o = s ?? "", n = t ? this._blueprints.filter(
      (l) => l.docTypeAlias.localeCompare(t, void 0, { sensitivity: "accent" }) === 0
    ) : [], d = new Set(n.map((l) => l.name)), h = i || !t, m = t ? n.length === 0 ? "-- No blueprints available --" : "-- Select --" : "-- Select a doctype first --";
    return r`
      <label>
        <span>${e}</span>
        <select
          class="doctype-select"
          ?disabled=${h}
          @change=${(l) => a(l.target.value)}
        >
          <option value="" ?selected=${o === ""}>${m}</option>
          ${n.map(
      (l) => r`
              <option value=${l.name} ?selected=${l.name === o}>${l.name}</option>
            `
    )}
          ${o && !d.has(o) ? r`<option value=${o} selected>${o} (not found)</option>` : _}
        </select>
      </label>
    `;
  }
  _numberField(e, t, s, i) {
    return r`
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
      const o = a.target.value, n = o === "" ? 0 : Number(o);
      i(Number.isNaN(n) ? 0 : n);
    }}
        ></uui-input>
      </label>
    `;
  }
  _toggleField(e, t, s, i, a) {
    return r`
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
O(g, "styles", A`
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
  `);
f([
  v()
], g.prototype, "_loading", 2);
f([
  v()
], g.prototype, "_saving", 2);
f([
  v()
], g.prototype, "_hasAppSettings", 2);
f([
  v()
], g.prototype, "_settings", 2);
f([
  v()
], g.prototype, "_activeTab", 2);
f([
  v()
], g.prototype, "_docTypes", 2);
f([
  v()
], g.prototype, "_trueFalseProperties", 2);
f([
  v()
], g.prototype, "_textContentProperties", 2);
f([
  v()
], g.prototype, "_textInputProperties", 2);
f([
  v()
], g.prototype, "_blueprints", 2);
f([
  v()
], g.prototype, "_expandedFields", 2);
f([
  v()
], g.prototype, "_filterModes", 2);
f([
  v()
], g.prototype, "_collapsedRules", 2);
f([
  v()
], g.prototype, "_dragIndex", 2);
f([
  v()
], g.prototype, "_dragOverIndex", 2);
f([
  v()
], g.prototype, "_dragPosition", 2);
g = f([
  D("dotsee-discipline-settings-workspace")
], g);
const J = g;
export {
  g as DisciplineSettingsWorkspaceElement,
  J as default
};
//# sourceMappingURL=discipline-settings.workspace.element-BGU0AlSz.js.map
