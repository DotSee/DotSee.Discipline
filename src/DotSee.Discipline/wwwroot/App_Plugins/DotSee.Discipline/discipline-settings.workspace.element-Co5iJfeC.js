var R = Object.defineProperty;
var D = (y, e, t) => e in y ? R(y, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : y[e] = t;
var g = (y, e, t) => D(y, typeof e != "symbol" ? e + "" : e, t);
import { html as n, nothing as v, css as A, state as f, customElement as P } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as S } from "@umbraco-cms/backoffice/lit-element";
import { UMB_AUTH_CONTEXT as C } from "@umbraco-cms/backoffice/auth";
import { UMB_MODAL_MANAGER_CONTEXT as E, UMB_CONFIRM_MODAL as H } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as M } from "@umbraco-cms/backoffice/notification";
import { c as U, b as z, d as I } from "./index-CZ5cgnnZ.js";
const F = "/umbraco/api/discipline";
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
    const e = await fetch(`${F}/settings`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load Discipline settings (${e.status})`);
    return await e.json();
  }
  async saveSettings(e) {
    const t = await fetch(`${F}/settings`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify(e)
    });
    if (!t.ok)
      throw new Error(`Failed to save Discipline settings (${t.status})`);
    return await t.json();
  }
  async getDocTypes() {
    const e = await fetch(`${F}/doctypes`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load doctypes (${e.status})`);
    return await e.json();
  }
  async getTrueFalseProperties() {
    const e = await fetch(`${F}/properties/truefalse`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load true/false properties (${e.status})`);
    return await e.json();
  }
  async getTextContentProperties() {
    const e = await fetch(`${F}/properties/text-content`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load text content properties (${e.status})`);
    return await e.json();
  }
  async getTextInputProperties() {
    const e = await fetch(`${F}/properties/text-input`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load text input properties (${e.status})`);
    return await e.json();
  }
  async getBlueprints() {
    const e = await fetch(`${F}/blueprints`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load blueprints (${e.status})`);
    return await e.json();
  }
  async importFromAppSettings() {
    const e = await fetch(`${F}/import-from-appsettings`, {
      method: "POST",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to import from appsettings (${e.status})`);
    return await e.json();
  }
}
var k = Object.defineProperty, B = Object.getOwnPropertyDescriptor, O = (y, e, t) => e in y ? k(y, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : y[e] = t, b = (y, e, t, s) => {
  for (var o = s > 1 ? void 0 : s ? B(e, t) : e, r = y.length - 1, i; r >= 0; r--)
    (i = y[r]) && (o = (s ? i(e, t, o) : i(o)) || o);
  return s && o && k(e, t, o), o;
}, V = (y, e, t) => O(y, e + "", t);
const q = [
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
let h = class extends S {
  constructor() {
    super(...arguments);
    g(this, "_loading", !0);
    g(this, "_saving", !1);
    g(this, "_hasAppSettings", !1);
    g(this, "_settings", T());
    g(this, "_activeTab", "autoNode");
    g(this, "_docTypes", []);
    g(this, "_trueFalseProperties", []);
    g(this, "_textContentProperties", []);
    g(this, "_textInputProperties", []);
    g(this, "_blueprints", []);
    g(this, "_expandedFields", /* @__PURE__ */ new Set());
    g(this, "_filterModes", /* @__PURE__ */ new Map());
    g(this, "_collapsedRules", /* @__PURE__ */ new Set());
    g(this, "_dragIndex", null);
    g(this, "_dragOverIndex", null);
    g(this, "_dragPosition", null);
    g(this, "_dragFeature", null);
    g(this, "_repository");
    g(this, "_onDocumentMouseDown", (e) => {
      if (this._expandedFields.size === 0) return;
      e.composedPath().some((s) => {
        var o;
        return s instanceof HTMLElement && ((o = s.classList) == null ? void 0 : o.contains("multi-box"));
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
    const t = await (await this.getContext(C)).getLatestToken();
    this._repository = new L(t);
    try {
      const [s, o, r, i, l, c] = await Promise.all([
        this._repository.getSettings(),
        this._repository.getDocTypes().catch(() => []),
        this._repository.getTrueFalseProperties().catch(() => []),
        this._repository.getTextContentProperties().catch(() => []),
        this._repository.getTextInputProperties().catch(() => []),
        this._repository.getBlueprints().catch(() => [])
      ]);
      this._docTypes = o, this._trueFalseProperties = r, this._textContentProperties = i, this._textInputProperties = l, this._blueprints = c, this._applyResponse(s), this._collapseAllRules();
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
      const s = await this.getContext(M);
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
    const e = await this.getContext(E);
    if (!e) return;
    const t = e.open(this, H, {
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
    return t.autoNode.enabled && t.autoNode.rules.forEach((s, o) => {
      s.createdDocTypeAlias || e.push(`AutoNode rule ${o + 1}: Created DocType is required`), s.docTypeAliasToCreate || e.push(`AutoNode rule ${o + 1}: DocType to create is required`), s.nodeName || e.push(`AutoNode rule ${o + 1}: Node name is required`);
    }), t.nodeRestrict.enabled && (t.nodeRestrict.propertyAlias || e.push("NodeRestrict: Property alias is required"), t.nodeRestrict.rules.forEach((s, o) => {
      s.parentDocType || e.push(`NodeRestrict rule ${o + 1}: Parent doctype is required`), (!Number.isFinite(s.maxNodes) || s.maxNodes < 0) && e.push(`NodeRestrict rule ${o + 1}: Max nodes must be a non-negative number`);
    })), t.nodeProtect.enabled && (t.nodeProtect.propertyAlias || e.push("NodeProtect: Property alias is required"), t.nodeProtect.rules.forEach((s, o) => {
      !s.docTypeAlias && !s.documentGuids && e.push(`NodeProtect rule ${o + 1}: DocType alias or Document GUIDs is required`);
    })), t.virtualNodes.enabled && t.virtualNodes.rules.forEach((s, o) => {
      s || e.push(`VirtualNodes rule ${o + 1}: DocType alias is required`);
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
                ${q.map((s) => {
      var i;
      const o = !!((i = this._settings[s.alias]) != null && i.enabled), r = [
        "tab-button",
        this._activeTab === s.alias ? "active" : "",
        o ? "enabled" : ""
      ].filter(Boolean).join(" ");
      return n`
                    <button
                      type="button"
                      class=${r}
                      @click=${() => {
        this._activeTab = s.alias, this.requestUpdate();
      }}
                    >
                      ${o ? n`<umb-icon name="icon-check" class="tab-icon"></umb-icon>` : v}
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
            ` : v}
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
              ` : v}
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
  _renderEnableButton(e, t, s) {
    return n`
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
    const s = `${e}:`, o = /* @__PURE__ */ new Set();
    for (const r of this._collapsedRules) {
      if (!r.startsWith(s)) {
        o.add(r);
        continue;
      }
      const i = Number(r.slice(s.length)), l = t.get(i);
      l !== void 0 && o.add(`${s}${l}`);
    }
    this._collapsedRules = o;
  }
  _reorderRules(e, t, s) {
    const o = this._settings[e];
    if (t === s || t < 0 || t >= o.rules.length) return;
    const r = Math.max(0, Math.min(s, o.rules.length - 1));
    if (t === r) return;
    const i = o.rules.slice(), [l] = i.splice(t, 1);
    i.splice(r, 0, l);
    const c = /* @__PURE__ */ new Map(), p = o.rules.map((d, _) => _), [m] = p.splice(t, 1);
    p.splice(r, 0, m), p.forEach((d, _) => c.set(d, _)), this._remapCollapsedRules(e, c), this._patchSettings(e, { ...o, rules: i });
  }
  _onRuleDragStart(e, t, s) {
    if (this._dragFeature = t, this._dragIndex = s, e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", String(s));
      const o = e.currentTarget, r = o == null ? void 0 : o.closest(".rule-wrapper");
      if (r) {
        const i = r.getBoundingClientRect();
        e.dataTransfer.setDragImage(
          r,
          e.clientX - i.left,
          e.clientY - i.top
        );
      }
    }
    this.requestUpdate();
  }
  _onRuleDragOver(e, t, s) {
    if (this._dragIndex === null || this._dragFeature !== t) return;
    e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
    const r = e.currentTarget.getBoundingClientRect(), i = r.top + r.height / 2, l = e.clientY < i ? "before" : "after";
    (this._dragOverIndex !== s || this._dragPosition !== l) && (this._dragOverIndex = s, this._dragPosition = l, this.requestUpdate());
  }
  _onRuleDragLeave(e, t) {
    this._dragFeature === e && this._dragOverIndex === t && (this._dragOverIndex = null, this._dragPosition = null, this.requestUpdate());
  }
  _onRuleDrop(e, t, s) {
    if (e.preventDefault(), this._dragIndex === null || this._dragFeature !== t) return;
    const o = this._dragIndex, r = this._dragPosition ?? "after";
    let i = s + (r === "after" ? 1 : 0);
    o < i && i--, this._reorderRules(t, o, i), this._dragFeature = null, this._dragIndex = null, this._dragOverIndex = null, this._dragPosition = null, this.requestUpdate();
  }
  _onRuleDragEnd() {
    this._dragFeature = null, this._dragIndex = null, this._dragOverIndex = null, this._dragPosition = null, this.requestUpdate();
  }
  _removeRuleAndReindex(e, t) {
    const s = `${e}:`, o = /* @__PURE__ */ new Set();
    for (const r of this._collapsedRules) {
      if (!r.startsWith(s)) {
        o.add(r);
        continue;
      }
      const i = Number(r.slice(s.length));
      i < t ? o.add(r) : i > t && o.add(`${s}${i - 1}`);
    }
    this._collapsedRules = o;
  }
  _collapseAllRules() {
    const e = /* @__PURE__ */ new Set();
    this._settings.autoNode.rules.forEach((t, s) => e.add(`autoNode:${s}`)), this._settings.nodeRestrict.rules.forEach((t, s) => e.add(`nodeRestrict:${s}`)), this._settings.nodeProtect.rules.forEach((t, s) => e.add(`nodeProtect:${s}`)), this._collapsedRules = e, this.requestUpdate();
  }
  _renderCollapsedRule(e, t, s, o, r, i) {
    return n`
      <uui-ref-node
        class="rule-ref"
        name=${s}
        detail=${o}
        ?disabled=${r}
        @open=${() => this._toggleRuleCollapsed(e, t)}
      >
        <umb-icon slot="icon" name="icon-navigation-right"></umb-icon>
        <uui-action-bar slot="actions">
          <uui-button
            look="secondary"
            color="danger"
            label="Remove"
            ?disabled=${r}
            @click=${i}
          ></uui-button>
        </uui-action-bar>
      </uui-ref-node>
    `;
  }
  _renderRuleHeader(e, t, s, o, r) {
    const i = this._isRuleCollapsed(e, t);
    return n`
      <div slot="header" class="rule-header">
        <button
          type="button"
          class="rule-toggle"
          aria-label=${i ? "Expand rule" : "Collapse rule"}
          aria-expanded=${!i}
          @click=${() => this._toggleRuleCollapsed(e, t)}
        >
          <umb-icon
            name=${i ? "icon-navigation-right" : "icon-navigation-down"}
          ></umb-icon>
          <strong>Rule ${t + 1}</strong>
          ${r ? n`<span class="rule-suffix">${r}</span>` : v}
        </button>
        <uui-button
          look="secondary"
          color="danger"
          label="Remove"
          ?disabled=${s}
          @click=${o}
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
            </ul>` : v}
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
    const t = this._settings.autoNode, s = (r) => {
      this._patchSettings("autoNode", { ...t, ...r });
    }, o = (r, i) => {
      const l = t.rules.map((c, p) => p === r ? { ...c, ...i } : c);
      s({ rules: l });
    };
    return n`
      <uui-box>
        <h3 slot="headline" class="uui-h3">AutoNode</h3>
        ${this._renderEnableButton(t.enabled, e, (r) => s({ enabled: r }))}
        <p class="feature-description no-divider">
          Automatically creates child nodes when a parent is published, based on rules that match
          document types. Useful for scaffolding required child structure (folders, landing pages)
          the moment a content item is created.
        </p>
        <div class="stack">
          ${this._withFieldHelp(
      n`
              <label class="fit">
                <span>Log level</span>
                <uui-select
                  ?disabled=${e || !t.enabled}
                  .options=${[
        { name: "Normal", value: "Normal", selected: t.logLevel === "Normal" },
        { name: "Verbose", value: "Verbose", selected: t.logLevel === "Verbose" }
      ]}
                  @change=${(r) => s({ logLevel: r.target.value })}
                ></uui-select>
              </label>
            `,
      "autonode-loglevel-help",
      "Controls how chatty AutoNode is in the Umbraco log. Use Verbose when diagnosing rule behaviour; switch back to Normal for production to keep the log clean.",
      "inline"
    )}
          <div>
            ${this._withFieldHelp(
      n`
                <uui-toggle
                  .checked=${t.republishExistingNodes}
                  ?disabled=${e || !t.enabled}
                  label="Republish existing nodes"
                  label-position="right"
                  @change=${(r) => s({ republishExistingNodes: r.target.checked })}
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
        ${t.rules.length === 0 ? n`<p class="empty">No rules defined.</p>` : v}
        ${t.rules.map((r, i) => {
      const l = r.createdDocTypeAlias && r.docTypeAliasToCreate ? `(${r.createdDocTypeAlias} → ${r.docTypeAliasToCreate})` : "", c = l ? `Rule ${i + 1} ${l}` : `Rule ${i + 1}`, p = r.nodeName ?? "", m = () => {
        this._removeRuleAndReindex("autoNode", i), s({ rules: t.rules.filter((a, u) => u !== i) });
      }, d = this._isRuleCollapsed("autoNode", i) ? this._renderCollapsedRule("autoNode", i, c, p, e || !t.enabled, m) : n`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader("autoNode", i, e || !t.enabled, m, l || void 0)}
                  <div class="grid">
                    ${this._withFieldHelp(
        this._docTypeField(
          "Triggering doctype *",
          r.createdDocTypeAlias,
          e || !t.enabled,
          (a) => o(i, { createdDocTypeAlias: a })
        ),
        `autonode-rule-${i}-trigger-help`,
        "The parent doctype whose publish event triggers this rule. When a node of this type is published, AutoNode will evaluate the rule against it."
      )}
                    ${this._withFieldHelp(
        this._docTypeField(
          "DocType to create *",
          r.docTypeAliasToCreate,
          e || !t.enabled,
          (a) => o(i, { docTypeAliasToCreate: a })
        ),
        `autonode-rule-${i}-create-help`,
        "The doctype of the child node that will be created under the triggering node. Must be allowed as a child of the triggering doctype in Umbraco."
      )}
                    ${this._withFieldHelp(
        this._textField(
          "Node name *",
          r.nodeName,
          e || !t.enabled,
          (a) => o(i, { nodeName: a })
        ),
        `autonode-rule-${i}-nodename-help`,
        "Literal name for the created child node. Ignored when a dictionary item is set below."
      )}
                    ${this._withFieldHelp(
        this._textField(
          "Dictionary item for name",
          r.dictionaryItemForName,
          e || !t.enabled,
          (a) => o(i, { dictionaryItemForName: a })
        ),
        `autonode-rule-${i}-dictionary-help`,
        "Umbraco dictionary key used to translate the child node name per culture. Takes precedence over the literal Node name when set and the key exists.",
        "stretch",
        "row-break"
      )}
                    ${this._withFieldHelp(
        this._blueprintField(
          "Blueprint",
          r.docTypeAliasToCreate,
          r.blueprint,
          e || !t.enabled,
          (a) => o(i, { blueprint: a })
        ),
        `autonode-rule-${i}-blueprint-help`,
        'Optional content template (blueprint) to prefill the new node. Only blueprints of the doctype selected in "DocType to create" are listed.'
      )}
                    ${this._withFieldHelp(
        this._toggleField(
          "Bring new node first",
          r.bringNewNodeFirst,
          e || !t.enabled,
          (a) => o(i, { bringNewNodeFirst: a })
        ),
        `autonode-rule-${i}-bringfirst-help`,
        "When on, the new child is inserted as the first sibling in the tree. When off, it is appended at the end.",
        "inline",
        "row-break"
      )}
                    ${this._withFieldHelp(
        this._toggleField(
          "Only create if no children",
          r.onlyCreateIfNoChildren,
          e || !t.enabled,
          (a) => o(i, { onlyCreateIfNoChildren: a })
        ),
        `autonode-rule-${i}-nochildren-help`,
        "When on, the rule only fires if the triggering node has no existing children. Use for one-off scaffolding where the rule should not keep creating siblings later.",
        "inline"
      )}
                    ${this._withFieldHelp(
        this._toggleField(
          "Create if exists with different name",
          r.createIfExistsWithDifferentName,
          e || !t.enabled,
          (a) => o(i, { createIfExistsWithDifferentName: a })
        ),
        `autonode-rule-${i}-existsdiffname-help`,
        "When on, AutoNode will create a new child even if a sibling of the same doctype already exists under a different name. When off, an existing child of that doctype is treated as already satisfying the rule.",
        "inline"
      )}
                    ${this._withFieldHelp(
        this._toggleField(
          "Keep new node unpublished",
          r.keepNewNodeUnpublished,
          e || !t.enabled,
          (a) => o(i, { keepNewNodeUnpublished: a })
        ),
        `autonode-rule-${i}-unpublished-help`,
        "When on, the created child is saved as a draft only. When off, it is published immediately after creation.",
        "inline"
      )}
                  </div>
                </uui-box>
              `, _ = this._dragFeature === "autoNode" && this._dragIndex === i, x = this._dragFeature === "autoNode" && this._dragOverIndex === i, $ = [
        "rule-wrapper",
        _ ? "dragging" : "",
        x && this._dragPosition === "before" ? "drop-before" : "",
        x && this._dragPosition === "after" ? "drop-after" : ""
      ].filter(Boolean).join(" "), w = e || !t.enabled;
      return n`
            <div
              class=${$}
              @dragover=${(a) => this._onRuleDragOver(a, "autoNode", i)}
              @dragleave=${() => this._onRuleDragLeave("autoNode", i)}
              @drop=${(a) => this._onRuleDrop(a, "autoNode", i)}
            >
              <span
                class="drag-handle"
                draggable=${w ? "false" : "true"}
                aria-label="Drag to reorder"
                title="Drag to reorder"
                @dragstart=${(a) => this._onRuleDragStart(a, "autoNode", i)}
                @dragend=${() => this._onRuleDragEnd()}
              >
                <umb-icon name="icon-navigation"></umb-icon>
              </span>
              <div class="rule-content">${d}</div>
            </div>
          `;
    })}
        <uui-button
          look="secondary"
          label="Add rule"
          ?disabled=${e || !t.enabled}
          @click=${() => s({ rules: [...t.rules, U()] })}
        >+ Add rule</uui-button>
      </uui-box>
    `;
  }
  _renderNodeRestrictTab(e) {
    const t = this._settings.nodeRestrict, s = (r) => {
      this._patchSettings("nodeRestrict", { ...t, ...r });
    }, o = (r, i) => {
      const l = t.rules.map((c, p) => p === r ? { ...c, ...i } : c);
      s({ rules: l });
    };
    return n`
      <uui-box>
        <h3 slot="headline" class="uui-h3">NodeRestrict</h3>
        ${this._renderEnableButton(t.enabled, e, (r) => s({ enabled: r }))}
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
        (r) => s({ propertyAlias: r })
      ),
      "noderestrict-propertyalias-help",
      "Optional property alias that, when present on a node and set to true, excludes that node from NodeRestrict limits. Leave empty to apply limits to every node that matches a rule."
    )}
          ${this._withFieldHelp(
      this._toggleField(
        "Show warnings",
        t.showWarnings,
        e || !t.enabled,
        (r) => s({ showWarnings: r })
      ),
      "noderestrict-showwarnings-help",
      "Global default. When on, NodeRestrict surfaces warning messages to editors as they approach a limit. Individual rules can override this.",
      "inline"
    )}
        </div>
        <h4>Rules</h4>
        ${t.rules.length === 0 ? n`<p class="empty">No rules defined.</p>` : v}
        ${t.rules.map((r, i) => {
      const l = !r.childDocType || r.childDocType === "*" ? "any" : r.childDocType, c = r.parentDocType ? `(${r.parentDocType} → ${l})` : "", p = c ? `Rule ${i + 1} ${c}` : `Rule ${i + 1}`, m = `Max ${r.maxNodes ?? 0}`, d = () => {
        this._removeRuleAndReindex("nodeRestrict", i), s({ rules: t.rules.filter((u, N) => N !== i) });
      }, _ = this._isRuleCollapsed("nodeRestrict", i) ? this._renderCollapsedRule("nodeRestrict", i, p, m, e || !t.enabled, d) : n`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader("nodeRestrict", i, e || !t.enabled, d, c || void 0)}
              <div class="grid">
                ${this._withFieldHelp(
        this._docTypeField(
          "Parent doctype *",
          r.parentDocType,
          e || !t.enabled,
          (u) => o(i, { parentDocType: u })
        ),
        `noderestrict-rule-${i}-parent-help`,
        "The doctype of the parent node under which the limit is enforced. The rule counts children of this parent."
      )}
                ${this._withFieldHelp(
        this._docTypeField(
          "Child doctype",
          r.childDocType || "*",
          e || !t.enabled,
          (u) => o(i, { childDocType: u }),
          { label: "Any doctype", value: "*" }
        ),
        `noderestrict-rule-${i}-child-help`,
        'The doctype of children that count towards the limit. Choose "Any doctype" to cap the total number of children regardless of type.'
      )}
                ${this._withFieldHelp(
        this._numberField(
          "Max nodes *",
          r.maxNodes,
          e || !t.enabled,
          (u) => o(i, { maxNodes: u })
        ),
        `noderestrict-rule-${i}-max-help`,
        "Maximum number of matching children allowed under a single parent. Editors are blocked from creating more than this many."
      )}
                ${this._withFieldHelp(
        this._toggleField(
          "Show warnings",
          r.showWarnings,
          e || !t.enabled,
          (u) => o(i, { showWarnings: u })
        ),
        `noderestrict-rule-${i}-warnings-help`,
        "When on, editors see the warning message as they approach the limit. Overrides the feature-level default for this rule only.",
        "inline"
      )}
                ${this._withFieldHelp(
        this._textField(
          "Custom limit message",
          r.customMessage,
          e || !t.enabled,
          (u) => o(i, { customMessage: u })
        ),
        `noderestrict-rule-${i}-limitmsg-help`,
        "Plain text (or dictionary key — see category below) shown to editors when they hit the hard limit. Leave empty to use the default."
      )}
                ${this._withFieldHelp(
        this._textField(
          "Custom limit category",
          r.customMessageCategory,
          e || !t.enabled,
          (u) => o(i, { customMessageCategory: u })
        ),
        `noderestrict-rule-${i}-limitcat-help`,
        "Optional Umbraco dictionary category used to localise the Custom limit message. When set, the message value is treated as a dictionary key within this category."
      )}
                ${this._withFieldHelp(
        this._textField(
          "Custom warning message",
          r.customWarningMessage,
          e || !t.enabled,
          (u) => o(i, { customWarningMessage: u })
        ),
        `noderestrict-rule-${i}-warnmsg-help`,
        "Text shown to editors as they approach — but have not yet reached — the limit. Leave empty to use the default warning."
      )}
                    ${this._withFieldHelp(
        this._textField(
          "Custom warning category",
          r.customWarningMessageCategory,
          e || !t.enabled,
          (u) => o(i, { customWarningMessageCategory: u })
        ),
        `noderestrict-rule-${i}-warncat-help`,
        "Optional Umbraco dictionary category used to localise the Custom warning message. When set, the message value is treated as a dictionary key within this category."
      )}
                  </div>
                </uui-box>
              `, x = this._dragFeature === "nodeRestrict" && this._dragIndex === i, $ = this._dragFeature === "nodeRestrict" && this._dragOverIndex === i, w = [
        "rule-wrapper",
        x ? "dragging" : "",
        $ && this._dragPosition === "before" ? "drop-before" : "",
        $ && this._dragPosition === "after" ? "drop-after" : ""
      ].filter(Boolean).join(" "), a = e || !t.enabled;
      return n`
            <div
              class=${w}
              @dragover=${(u) => this._onRuleDragOver(u, "nodeRestrict", i)}
              @dragleave=${() => this._onRuleDragLeave("nodeRestrict", i)}
              @drop=${(u) => this._onRuleDrop(u, "nodeRestrict", i)}
            >
              <span
                class="drag-handle"
                draggable=${a ? "false" : "true"}
                aria-label="Drag to reorder"
                title="Drag to reorder"
                @dragstart=${(u) => this._onRuleDragStart(u, "nodeRestrict", i)}
                @dragend=${() => this._onRuleDragEnd()}
              >
                <umb-icon name="icon-navigation"></umb-icon>
              </span>
              <div class="rule-content">${_}</div>
            </div>
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
    const t = this._settings.virtualNodes, s = (o) => {
      this._patchSettings("virtualNodes", { ...t, ...o });
    };
    return n`
      <uui-box>
        <h3 slot="headline" class="uui-h3">VirtualNodes</h3>
        ${this._renderEnableButton(t.enabled, e, (o) => s({ enabled: o }))}
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
        (o) => {
          const r = o ? o.split(",").map((i) => i.trim()).filter((i) => i.length > 0) : [];
          s({ rules: r });
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
    const t = this._settings.variantsHider, s = (o) => {
      this._patchSettings("variantsHider", { ...t, ...o });
    };
    return n`
      <uui-box>
        <h3 slot="headline" class="uui-h3">VariantsHider</h3>
        ${this._renderEnableButton(t.enabled, e, (o) => s({ enabled: o }))}
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
        (o) => s({ caption: o })
      ),
      "variantshider-caption-help",
      "Label shown on the Hide/Show variants entity action in the content tree context menu. Leave empty to use the default caption."
    )}
        </div>
      </uui-box>
    `;
  }
  _renderNodeProtectTab(e) {
    const t = this._settings.nodeProtect, s = (r) => {
      this._patchSettings("nodeProtect", { ...t, ...r });
    }, o = (r, i) => {
      const l = t.rules.map((c, p) => p === r ? { ...c, ...i } : c);
      s({ rules: l });
    };
    return n`
      <uui-box>
        <h3 slot="headline" class="uui-h3">NodeProtect</h3>
        ${this._renderEnableButton(t.enabled, e, (r) => s({ enabled: r }))}
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
        (r) => s({ propertyAlias: r })
      ),
      "nodeprotect-propertyalias-help",
      "The alias of a true/false property on your document types. When a node has this property set to true, NodeProtect will treat it as protected and block deletion."
    )}
        </div>
        <h4>Rules</h4>
        ${t.rules.length === 0 ? n`<p class="empty">No rules defined.</p>` : v}
        ${t.rules.map((r, i) => {
      const l = r.docTypeAlias ? `(${r.docTypeAlias})` : "", c = l ? `Rule ${i + 1} ${l}` : `Rule ${i + 1}`, p = r.documentGuids ? "By GUIDs" : r.docTypeAlias ? "By doctype" : "", m = () => {
        this._removeRuleAndReindex("nodeProtect", i), s({ rules: t.rules.filter((a, u) => u !== i) });
      }, d = this._isRuleCollapsed("nodeProtect", i) ? this._renderCollapsedRule("nodeProtect", i, c, p, e || !t.enabled, m) : n`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader("nodeProtect", i, e || !t.enabled, m, l || void 0)}
                  <div class="grid">
                    ${this._withFieldHelp(
        this._docTypeField(
          "DocType alias",
          r.docTypeAlias,
          e || !t.enabled,
          (a) => o(i, { docTypeAlias: a })
        ),
        `nodeprotect-rule-${i}-doctype-help`,
        "Protect every node of this doctype from deletion. Leave empty if you want to protect specific nodes by GUID instead."
      )}
                    ${this._withFieldHelp(
        this._textField(
          "Document GUIDs (comma separated)",
          r.documentGuids,
          e || !t.enabled,
          (a) => o(i, { documentGuids: a })
        ),
        `nodeprotect-rule-${i}-guids-help`,
        "Comma-separated list of specific content GUIDs to protect. Use alongside or instead of the doctype alias to protect individual important nodes."
      )}
                    ${this._withFieldHelp(
        this._textField(
          "Custom message",
          r.customMessage,
          e || !t.enabled,
          (a) => o(i, { customMessage: a })
        ),
        `nodeprotect-rule-${i}-msg-help`,
        "Text (or dictionary key — see category below) shown to editors who try to delete a protected node. Leave empty to use the default message."
      )}
                    ${this._withFieldHelp(
        this._textField(
          "Custom message category",
          r.customMessageCategory,
          e || !t.enabled,
          (a) => o(i, { customMessageCategory: a })
        ),
        `nodeprotect-rule-${i}-msgcat-help`,
        "Optional Umbraco dictionary category used to localise the Custom message. When set, the message value is treated as a dictionary key within this category."
      )}
                  </div>
                </uui-box>
              `, _ = this._dragFeature === "nodeProtect" && this._dragIndex === i, x = this._dragFeature === "nodeProtect" && this._dragOverIndex === i, $ = [
        "rule-wrapper",
        _ ? "dragging" : "",
        x && this._dragPosition === "before" ? "drop-before" : "",
        x && this._dragPosition === "after" ? "drop-after" : ""
      ].filter(Boolean).join(" "), w = e || !t.enabled;
      return n`
            <div
              class=${$}
              @dragover=${(a) => this._onRuleDragOver(a, "nodeProtect", i)}
              @dragleave=${() => this._onRuleDragLeave("nodeProtect", i)}
              @drop=${(a) => this._onRuleDrop(a, "nodeProtect", i)}
            >
              <span
                class="drag-handle"
                draggable=${w ? "false" : "true"}
                aria-label="Drag to reorder"
                title="Drag to reorder"
                @dragstart=${(a) => this._onRuleDragStart(a, "nodeProtect", i)}
                @dragend=${() => this._onRuleDragEnd()}
              >
                <umb-icon name="icon-navigation"></umb-icon>
              </span>
              <div class="rule-content">${d}</div>
            </div>
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
    const t = this._settings.aiSummary, s = (o) => {
      this._patchSettings("aiSummary", { ...t, ...o });
    };
    return n`
      <uui-box>
        <h3 slot="headline" class="uui-h3">AiSummary</h3>
        ${this._renderEnableButton(t.enabled, e, (o) => s({ enabled: o }))}
        <p class="feature-description no-divider">
          Generates AI-powered content summaries using OpenAI or Gemini and writes the result into a
          configured property. A toggle property on the node controls whether a summary should be
          produced for that item.
        </p>
        <div class="grid">
          ${this._withFieldHelp(
      n`
              <label>
                <span>LLM *</span>
                <uui-select
                  ?disabled=${e || !t.enabled}
                  .options=${[
        { name: "OpenAI", value: "openai", selected: t.llm === "openai" },
        { name: "Gemini", value: "gemini", selected: t.llm === "gemini" }
      ]}
                  @change=${(o) => s({ llm: o.target.value })}
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
        (o) => s({ apiKey: o })
      ),
      "aisummary-apikey-help",
      "Secret key issued by the selected LLM provider. Stored as plain text in settings — protect access to this screen accordingly."
    )}
          ${this._withFieldHelp(
      this._textField("Model *", t.model, e || !t.enabled, (o) => s({ model: o })),
      "aisummary-model-help",
      "The exact model identifier to call, e.g. gpt-4o-mini or gemini-1.5-flash. Must match a model your API key is entitled to use."
    )}
          ${this._withFieldHelp(
      this._numberField(
        "Max chars",
        t.maxChars,
        e || !t.enabled,
        (o) => s({ maxChars: o })
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
        (o) => s({ propertyAlias: o })
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
        (o) => s({ togglePropertyAlias: o })
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
        (o) => s({ docTypes: o })
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
        (o) => s({ excludeProperties: o })
      ),
      "aisummary-excludeproperties-help",
      "Text properties on the node that should not be sent to the LLM when building the summary prompt. Use this to exclude internal notes, sidebars, or already-summarised fields."
    )}
        </div>
        ${this._withFieldHelp(
      n`
            <label class="block">
              <span>Tone</span>
              <uui-textarea
                .value=${t.tone}
                ?disabled=${e || !t.enabled}
                @input=${(o) => s({ tone: o.target.value })}
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
    const t = this._settings.propertyVersions, s = (o) => {
      this._patchSettings("propertyVersions", { ...t, ...o });
    };
    return n`
      <uui-box>
        <h3 slot="headline" class="uui-h3">PropertyVersions</h3>
        ${this._renderEnableButton(t.enabled, e, (o) => s({ enabled: o }))}
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
        (o) => s({ nextVersionButtonCaptionDictionaryEntry: o })
      ),
      "propertyversions-next-help",
      'Umbraco dictionary key used as the caption for the "Next version" property action. Leave empty to use the built-in English label.'
    )}
          ${this._withFieldHelp(
      this._textField(
        "Previous version dictionary entry",
        t.previousVersionButtonCaptionDictionaryEntry,
        e || !t.enabled,
        (o) => s({ previousVersionButtonCaptionDictionaryEntry: o })
      ),
      "propertyversions-previous-help",
      'Umbraco dictionary key used as the caption for the "Previous version" property action. Leave empty to use the built-in English label.'
    )}
          ${this._withFieldHelp(
      this._textField(
        "No versions dictionary entry",
        t.noVersionsButtonCaptionDictionaryEntry,
        e || !t.enabled,
        (o) => s({ noVersionsButtonCaptionDictionaryEntry: o })
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
  _textField(e, t, s, o) {
    return n`
      <label>
        <span>${e}</span>
        <uui-input
          .value=${t ?? ""}
          ?disabled=${s}
          @input=${(r) => o(r.target.value)}
        ></uui-input>
      </label>
    `;
  }
  _docTypeField(e, t, s, o, r) {
    return this._aliasField(e, this._docTypes, t, s, o, r);
  }
  _propertyField(e, t, s, o, r) {
    return this._aliasField(e, t, s, o, r);
  }
  _withFieldHelp(e, t, s, o = "stretch", r) {
    const i = `field-with-help ${o}${r ? ` ${r}` : ""}`;
    return n`
      <div class=${i}>
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
  _multiAliasField(e, t, s, o, r) {
    const i = new Set(
      (s ?? "").split(",").map((a) => a.trim()).filter((a) => a.length > 0)
    ), l = (a, u) => {
      u ? i.add(a) : i.delete(a), r(Array.from(i).join(","));
    }, c = new Set(t.map((a) => a.alias)), p = Array.from(i).filter((a) => !c.has(a)), m = this._expandedFields.has(e), d = this._filterModes.get(e) ?? "all", _ = (a) => {
      a ? this._expandedFields.add(e) : this._expandedFields.delete(e), this.requestUpdate();
    }, x = (a) => {
      this._filterModes.set(e, a), this.requestUpdate();
    }, $ = d === "selected" ? t.filter((a) => i.has(a.alias)) : t, w = d === "selected" || d === "all" ? p : [];
    return n`
      <label>
        <span>${e}</span>
        <div class="multi-box">
          <div class="multi-bar">
            <button
              type="button"
              class="multi-toggle"
              ?disabled=${o}
              @click=${() => _(!m)}
            >
              <span class="multi-action">${m ? "Hide list" : "Show list"}</span>
              <span class="multi-count">(${i.size} selected)</span>
            </button>
            ${m ? n`
                  <div class="multi-filter">
                    <label class="checkbox-row">
                      <input
                        type="radio"
                        name="filter-${e}"
                        ?disabled=${o}
                        .checked=${d === "all"}
                        @change=${() => x("all")}
                      />
                      <span>All</span>
                    </label>
                    <label class="checkbox-row">
                      <input
                        type="radio"
                        name="filter-${e}"
                        ?disabled=${o}
                        .checked=${d === "selected"}
                        @change=${() => x("selected")}
                      />
                      <span>Selected only</span>
                    </label>
                  </div>
                ` : v}
          </div>
          ${m ? n`
                <div class="checkbox-list">
                  ${$.length === 0 && w.length === 0 ? n`<p class="empty">No entries.</p>` : v}
                  ${$.map(
      (a) => n`
                      <label class="checkbox-row">
                        <input
                          type="checkbox"
                          ?disabled=${o}
                          .checked=${i.has(a.alias)}
                          @change=${(u) => l(a.alias, u.target.checked)}
                        />
                        <span>${a.name} (${a.alias})</span>
                      </label>
                    `
    )}
                  ${w.map(
      (a) => n`
                      <label class="checkbox-row">
                        <input
                          type="checkbox"
                          ?disabled=${o}
                          checked
                          @change=${(u) => l(a, u.target.checked)}
                        />
                        <span>${a} (not found)</span>
                      </label>
                    `
    )}
                </div>
              ` : v}
        </div>
      </label>
    `;
  }
  _aliasField(e, t, s, o, r, i) {
    const l = s ?? "", c = new Set(t.map((d) => d.alias)), p = (i == null ? void 0 : i.value) ?? "", m = (i == null ? void 0 : i.label) ?? "-- Select --";
    return n`
      <label>
        <span>${e}</span>
        <select
          class="doctype-select"
          ?disabled=${o}
          @change=${(d) => r(d.target.value)}
        >
          <option value=${p} ?selected=${l === p || l === ""}>
            ${m}
          </option>
          ${t.map(
      (d) => n`
              <option value=${d.alias} ?selected=${d.alias === l}>
                ${d.name} (${d.alias})
              </option>
            `
    )}
          ${l && l !== p && !c.has(l) ? n`<option value=${l} selected>${l} (not found)</option>` : v}
        </select>
      </label>
    `;
  }
  _blueprintField(e, t, s, o, r) {
    const i = s ?? "", l = t ? this._blueprints.filter(
      (d) => d.docTypeAlias.localeCompare(t, void 0, { sensitivity: "accent" }) === 0
    ) : [], c = new Set(l.map((d) => d.name)), p = o || !t, m = t ? l.length === 0 ? "-- No blueprints available --" : "-- Select --" : "-- Select a doctype first --";
    return n`
      <label>
        <span>${e}</span>
        <select
          class="doctype-select"
          ?disabled=${p}
          @change=${(d) => r(d.target.value)}
        >
          <option value="" ?selected=${i === ""}>${m}</option>
          ${l.map(
      (d) => n`
              <option value=${d.name} ?selected=${d.name === i}>${d.name}</option>
            `
    )}
          ${i && !c.has(i) ? n`<option value=${i} selected>${i} (not found)</option>` : v}
        </select>
      </label>
    `;
  }
  _numberField(e, t, s, o) {
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
          @input=${(r) => {
      const i = r.target.value, l = i === "" ? 0 : Number(i);
      o(Number.isNaN(l) ? 0 : l);
    }}
        ></uui-input>
      </label>
    `;
  }
  _toggleField(e, t, s, o, r) {
    return n`
      <label class=${`inline${r ? ` ${r}` : ""}`}>
        <uui-toggle
          .checked=${t}
          ?disabled=${s}
          @change=${(i) => o(i.target.checked)}
        ></uui-toggle>
        <span>${e}</span>
      </label>
    `;
  }
};
V(h, "styles", A`
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
b([
  f()
], h.prototype, "_loading", 2);
b([
  f()
], h.prototype, "_saving", 2);
b([
  f()
], h.prototype, "_hasAppSettings", 2);
b([
  f()
], h.prototype, "_settings", 2);
b([
  f()
], h.prototype, "_activeTab", 2);
b([
  f()
], h.prototype, "_docTypes", 2);
b([
  f()
], h.prototype, "_trueFalseProperties", 2);
b([
  f()
], h.prototype, "_textContentProperties", 2);
b([
  f()
], h.prototype, "_textInputProperties", 2);
b([
  f()
], h.prototype, "_blueprints", 2);
b([
  f()
], h.prototype, "_expandedFields", 2);
b([
  f()
], h.prototype, "_filterModes", 2);
b([
  f()
], h.prototype, "_collapsedRules", 2);
b([
  f()
], h.prototype, "_dragIndex", 2);
b([
  f()
], h.prototype, "_dragOverIndex", 2);
b([
  f()
], h.prototype, "_dragPosition", 2);
b([
  f()
], h.prototype, "_dragFeature", 2);
h = b([
  P("dotsee-discipline-settings-workspace")
], h);
const Q = h;
export {
  h as DisciplineSettingsWorkspaceElement,
  Q as default
};
//# sourceMappingURL=discipline-settings.workspace.element-Co5iJfeC.js.map
