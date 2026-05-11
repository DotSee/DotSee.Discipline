var T = Object.defineProperty;
var k = (f, e, t) => e in f ? T(f, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : f[e] = t;
var m = (f, e, t) => k(f, typeof e != "symbol" ? e + "" : e, t);
import { html as r, nothing as g, css as P, state as y, customElement as H } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as S } from "@umbraco-cms/backoffice/lit-element";
import { UMB_AUTH_CONTEXT as C } from "@umbraco-cms/backoffice/auth";
import { UMB_MODAL_MANAGER_CONTEXT as A, UMB_CONFIRM_MODAL as E } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as M } from "@umbraco-cms/backoffice/notification";
import { c as B, b as I, d as V } from "./index-BuIMco7X.js";
const w = "/umbraco/api/discipline";
class O {
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
    const e = await fetch(`${w}/settings`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load Discipline settings (${e.status})`);
    return await e.json();
  }
  async saveSettings(e) {
    const t = await fetch(`${w}/settings`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify(e)
    });
    if (!t.ok)
      throw new Error(`Failed to save Discipline settings (${t.status})`);
    return await t.json();
  }
  async getDocTypes() {
    const e = await fetch(`${w}/doctypes`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load doctypes (${e.status})`);
    return await e.json();
  }
  async getTrueFalseProperties() {
    const e = await fetch(`${w}/properties/truefalse`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load true/false properties (${e.status})`);
    return await e.json();
  }
  async getTextContentProperties() {
    const e = await fetch(`${w}/properties/text-content`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load text content properties (${e.status})`);
    return await e.json();
  }
  async getTextInputProperties() {
    const e = await fetch(`${w}/properties/text-input`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load text input properties (${e.status})`);
    return await e.json();
  }
  async getBlueprints() {
    const e = await fetch(`${w}/blueprints`, {
      method: "GET",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load blueprints (${e.status})`);
    return await e.json();
  }
  async importFromAppSettings() {
    const e = await fetch(`${w}/import-from-appsettings`, {
      method: "POST",
      headers: this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to import from appsettings (${e.status})`);
    return await e.json();
  }
}
var R = Object.defineProperty, U = Object.getOwnPropertyDescriptor, L = (f, e, t) => e in f ? R(f, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : f[e] = t, b = (f, e, t, a) => {
  for (var s = a > 1 ? void 0 : a ? U(e, t) : e, o = f.length - 1, i; o >= 0; o--)
    (i = f[o]) && (s = (a ? i(e, t, s) : i(s)) || s);
  return a && s && R(e, t, s), s;
}, W = (f, e, t) => L(f, e + "", t);
const j = [
  { alias: "autoNode", labelKey: "dotseeDiscipline_autoNode_label" },
  { alias: "nodeRestrict", labelKey: "dotseeDiscipline_nodeRestrict_label" },
  { alias: "virtualNodes", labelKey: "dotseeDiscipline_virtualNodes_label" },
  { alias: "variantsHider", labelKey: "dotseeDiscipline_variantsHider_label" },
  { alias: "nodeProtect", labelKey: "dotseeDiscipline_nodeProtect_label" },
  { alias: "aiSummary", labelKey: "dotseeDiscipline_aiSummary_label" },
  { alias: "propertyVersions", labelKey: "dotseeDiscipline_propertyVersions_label" }
];
function F() {
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
let _ = class extends S {
  constructor() {
    super(...arguments);
    m(this, "_loading", !0);
    m(this, "_saving", !1);
    m(this, "_hasAppSettings", !1);
    m(this, "_settings", F());
    m(this, "_activeTab", "autoNode");
    m(this, "_docTypes", []);
    m(this, "_trueFalseProperties", []);
    m(this, "_textContentProperties", []);
    m(this, "_textInputProperties", []);
    m(this, "_blueprints", []);
    m(this, "_expandedFields", /* @__PURE__ */ new Set());
    m(this, "_filterModes", /* @__PURE__ */ new Map());
    m(this, "_collapsedRules", /* @__PURE__ */ new Set());
    m(this, "_dragIndex", null);
    m(this, "_dragOverIndex", null);
    m(this, "_dragPosition", null);
    m(this, "_dragFeature", null);
    m(this, "_repository");
    m(this, "_onDocumentMouseDown", (e) => {
      if (this._expandedFields.size === 0) return;
      e.composedPath().some((a) => {
        var s;
        return a instanceof HTMLElement && ((s = a.classList) == null ? void 0 : s.contains("multi-box"));
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
    this._repository = new O(t);
    try {
      const [a, s, o, i, l, p] = await Promise.all([
        this._repository.getSettings(),
        this._repository.getDocTypes().catch(() => []),
        this._repository.getTrueFalseProperties().catch(() => []),
        this._repository.getTextContentProperties().catch(() => []),
        this._repository.getTextInputProperties().catch(() => []),
        this._repository.getBlueprints().catch(() => [])
      ]);
      this._docTypes = s, this._trueFalseProperties = o, this._textContentProperties = i, this._textInputProperties = l, this._blueprints = p, this._applyResponse(a), this._collapseAllRules();
    } catch (a) {
      await this._notify(
        "danger",
        this.localize.term("dotseeDiscipline_settings_loadFailedToast", this._errorMessage(a))
      );
    } finally {
      this._loading = !1, this.requestUpdate();
    }
  }
  _applyResponse(e) {
    this._hasAppSettings = e.hasAppSettings, this._settings = e.settings ?? F(), this.requestUpdate();
  }
  _errorMessage(e) {
    return e instanceof Error ? e.message : String(e);
  }
  async _notify(e, t) {
    try {
      const a = await this.getContext(M);
      a == null || a.peek(e, { data: { message: t } });
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
    const e = await this.getContext(A);
    if (!e) return;
    const t = e.open(this, E, {
      data: {
        headline: this.localize.term("dotseeDiscipline_settings_loadFromAppsettings"),
        content: this.localize.term("dotseeDiscipline_settings_importConfirmContent"),
        confirmLabel: this.localize.term("dotseeDiscipline_settings_importConfirmLabel"),
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
      const a = await this._repository.importFromAppSettings();
      this._applyResponse(a), await this._notify("positive", this.localize.term("dotseeDiscipline_settings_loadedToast"));
    } catch (a) {
      await this._notify(
        "danger",
        this.localize.term("dotseeDiscipline_settings_importFailedToast", this._errorMessage(a))
      );
    } finally {
      this._saving = !1, this.requestUpdate();
    }
  }
  async _onSaveClick() {
    if (!(!this._repository || !this._canSave()))
      try {
        this._saving = !0, this.requestUpdate();
        const e = await this._repository.saveSettings(this._settings);
        this._applyResponse(e), await this._notify("positive", this.localize.term("dotseeDiscipline_settings_savedToast"));
      } catch (e) {
        await this._notify(
          "danger",
          this.localize.term("dotseeDiscipline_settings_saveFailedToast", this._errorMessage(e))
        );
      } finally {
        this._saving = !1, this.requestUpdate();
      }
  }
  _canSave() {
    return this._settings.useBackoffice ? this._validationErrors().length === 0 : !1;
  }
  _validationErrors() {
    const e = [], t = this._settings, a = (s, ...o) => this.localize.term(s, ...o);
    return t.autoNode.enabled && t.autoNode.rules.forEach((s, o) => {
      s.createdDocTypeAlias || e.push(a("dotseeDiscipline_autoNode_validationCreatedDoctype", o + 1)), s.docTypeAliasToCreate || e.push(a("dotseeDiscipline_autoNode_validationDoctypeToCreate", o + 1)), s.nodeName || e.push(a("dotseeDiscipline_autoNode_validationNodeName", o + 1));
    }), t.nodeRestrict.enabled && (t.nodeRestrict.propertyAlias || e.push(a("dotseeDiscipline_nodeRestrict_validationPropertyAlias")), t.nodeRestrict.rules.forEach((s, o) => {
      s.parentDocType || e.push(a("dotseeDiscipline_nodeRestrict_validationParentDoctype", o + 1)), (!Number.isFinite(s.maxNodes) || s.maxNodes < 0) && e.push(a("dotseeDiscipline_nodeRestrict_validationMaxNodes", o + 1));
    })), t.nodeProtect.enabled && (t.nodeProtect.propertyAlias || e.push(a("dotseeDiscipline_nodeProtect_validationPropertyAlias")), t.nodeProtect.rules.forEach((s, o) => {
      !s.docTypeAlias && !s.documentGuids && e.push(a("dotseeDiscipline_nodeProtect_validationDoctypeOrGuids", o + 1));
    })), t.virtualNodes.enabled && t.virtualNodes.rules.forEach((s, o) => {
      s || e.push(a("dotseeDiscipline_virtualNodes_validationDoctype", o + 1));
    }), t.aiSummary.enabled && (t.aiSummary.llm || e.push(a("dotseeDiscipline_aiSummary_validationLlm")), t.aiSummary.apiKey || e.push(a("dotseeDiscipline_aiSummary_validationApiKey")), t.aiSummary.model || e.push(a("dotseeDiscipline_aiSummary_validationModel")), t.aiSummary.propertyAlias || e.push(a("dotseeDiscipline_aiSummary_validationPropertyAlias"))), e;
  }
  get _fieldsDisabled() {
    return !this._settings.useBackoffice || this._saving;
  }
  render() {
    const e = this.localize.term("dotseeDiscipline_settings_headline");
    if (this._loading)
      return r`<umb-body-layout headline=${e}>
        <div class="center"><uui-loader></uui-loader></div>
      </umb-body-layout>`;
    const t = this._fieldsDisabled, a = this._settings.useBackoffice;
    return r`
      <umb-body-layout headline=${e}>
        ${this._renderSourceBanner()}
        ${a ? r`
              <div class="tab-bar">
                ${j.map((s) => {
      var l;
      const o = !!((l = this._settings[s.alias]) != null && l.enabled), i = [
        "tab-button",
        this._activeTab === s.alias ? "active" : "",
        o ? "enabled" : ""
      ].filter(Boolean).join(" ");
      return r`
                    <button
                      type="button"
                      class=${i}
                      @click=${() => {
        this._activeTab = s.alias, this.requestUpdate();
      }}
                    >
                      ${o ? r`<umb-icon name="icon-check" class="tab-icon"></umb-icon>` : g}
                      <span>${this.localize.term(s.labelKey)}</span>
                    </button>
                  `;
    })}
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
            ` : g}
      </umb-body-layout>
    `;
  }
  _renderSourceBanner() {
    const e = this.localize.term("dotseeDiscipline_settings_sourceHeadline");
    return this._hasAppSettings ? r`
      <uui-box headline=${e}>
        <div class="banner-row">
          <uui-toggle
            .checked=${this._settings.useBackoffice}
            label=${this.localize.term("dotseeDiscipline_settings_manageFromBackoffice")}
            label-position="right"
            @change=${this._onMasterToggleChange}
          ></uui-toggle>
          ${this._settings.useBackoffice ? r`
                <uui-button
                  look="primary"
                  color="positive"
                  label=${this.localize.term("dotseeDiscipline_settings_loadFromAppsettings")}
                  ?disabled=${this._saving}
                  @click=${this._onImportClick}
                ></uui-button>
              ` : g}
        </div>
      </uui-box>
    ` : r`
        <uui-box headline=${e}>
          <p>${this.localize.term("dotseeDiscipline_settings_noAppsettingsFound")}</p>
        </uui-box>
      `;
  }
  _renderEnableButton(e, t, a) {
    return r`
      <uui-button
        slot="header-actions"
        look=${e ? "secondary" : "primary"}
        color=${e ? "default" : "positive"}
        label=${this.localize.term(
      e ? "dotseeDiscipline_common_disable" : "dotseeDiscipline_common_enable"
    )}
        ?disabled=${t}
        @click=${() => a(!e)}
      ></uui-button>
    `;
  }
  _isRuleCollapsed(e, t) {
    return this._collapsedRules.has(`${e}:${t}`);
  }
  _toggleRuleCollapsed(e, t) {
    const a = `${e}:${t}`;
    this._collapsedRules.has(a) ? this._collapsedRules.delete(a) : this._collapsedRules.add(a), this.requestUpdate();
  }
  _remapCollapsedRules(e, t) {
    const a = `${e}:`, s = /* @__PURE__ */ new Set();
    for (const o of this._collapsedRules) {
      if (!o.startsWith(a)) {
        s.add(o);
        continue;
      }
      const i = Number(o.slice(a.length)), l = t.get(i);
      l !== void 0 && s.add(`${a}${l}`);
    }
    this._collapsedRules = s;
  }
  _reorderRules(e, t, a) {
    const s = this._settings[e];
    if (t === a || t < 0 || t >= s.rules.length) return;
    const o = Math.max(0, Math.min(a, s.rules.length - 1));
    if (t === o) return;
    const i = s.rules.slice(), [l] = i.splice(t, 1);
    i.splice(o, 0, l);
    const p = /* @__PURE__ */ new Map(), h = s.rules.map((c, $) => $), [v] = h.splice(t, 1);
    h.splice(o, 0, v), h.forEach((c, $) => p.set(c, $)), this._remapCollapsedRules(e, p), this._patchSettings(e, { ...s, rules: i });
  }
  _onRuleDragStart(e, t, a) {
    if (this._dragFeature = t, this._dragIndex = a, e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", String(a));
      const s = e.currentTarget, o = s == null ? void 0 : s.closest(".rule-wrapper");
      if (o) {
        const i = o.getBoundingClientRect();
        e.dataTransfer.setDragImage(
          o,
          e.clientX - i.left,
          e.clientY - i.top
        );
      }
    }
    this.requestUpdate();
  }
  _onRuleDragOver(e, t, a) {
    if (this._dragIndex === null || this._dragFeature !== t) return;
    e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
    const o = e.currentTarget.getBoundingClientRect(), i = o.top + o.height / 2, l = e.clientY < i ? "before" : "after";
    (this._dragOverIndex !== a || this._dragPosition !== l) && (this._dragOverIndex = a, this._dragPosition = l, this.requestUpdate());
  }
  _onRuleDragLeave(e, t) {
    this._dragFeature === e && this._dragOverIndex === t && (this._dragOverIndex = null, this._dragPosition = null, this.requestUpdate());
  }
  _onRuleDrop(e, t, a) {
    if (e.preventDefault(), this._dragIndex === null || this._dragFeature !== t) return;
    const s = this._dragIndex, o = this._dragPosition ?? "after";
    let i = a + (o === "after" ? 1 : 0);
    s < i && i--, this._reorderRules(t, s, i), this._dragFeature = null, this._dragIndex = null, this._dragOverIndex = null, this._dragPosition = null, this.requestUpdate();
  }
  _onRuleDragEnd() {
    this._dragFeature = null, this._dragIndex = null, this._dragOverIndex = null, this._dragPosition = null, this.requestUpdate();
  }
  _removeRuleAndReindex(e, t) {
    const a = `${e}:`, s = /* @__PURE__ */ new Set();
    for (const o of this._collapsedRules) {
      if (!o.startsWith(a)) {
        s.add(o);
        continue;
      }
      const i = Number(o.slice(a.length));
      i < t ? s.add(o) : i > t && s.add(`${a}${i - 1}`);
    }
    this._collapsedRules = s;
  }
  _collapseAllRules() {
    const e = /* @__PURE__ */ new Set();
    this._settings.autoNode.rules.forEach((t, a) => e.add(`autoNode:${a}`)), this._settings.nodeRestrict.rules.forEach((t, a) => e.add(`nodeRestrict:${a}`)), this._settings.nodeProtect.rules.forEach((t, a) => e.add(`nodeProtect:${a}`)), this._collapsedRules = e, this.requestUpdate();
  }
  _renderCollapsedRule(e, t, a, s, o, i) {
    return r`
      <uui-ref-node
        class="rule-ref"
        name=${a}
        detail=${s}
        ?disabled=${o}
        @open=${() => this._toggleRuleCollapsed(e, t)}
      >
        <umb-icon slot="icon" name="icon-navigation-right"></umb-icon>
        <uui-action-bar slot="actions">
          <uui-button
            look="secondary"
            color="danger"
            label=${this.localize.term("dotseeDiscipline_common_remove")}
            ?disabled=${o}
            @click=${i}
          ></uui-button>
        </uui-action-bar>
      </uui-ref-node>
    `;
  }
  _renderRuleHeader(e, t, a, s, o) {
    const i = this._isRuleCollapsed(e, t), l = this.localize.term("dotseeDiscipline_common_remove");
    return r`
      <div slot="header" class="rule-header">
        <button
          type="button"
          class="rule-toggle"
          aria-label=${this.localize.term(
      i ? "dotseeDiscipline_common_expandRule" : "dotseeDiscipline_common_collapseRule"
    )}
          aria-expanded=${!i}
          @click=${() => this._toggleRuleCollapsed(e, t)}
        >
          <umb-icon
            name=${i ? "icon-navigation-right" : "icon-navigation-down"}
          ></umb-icon>
          <strong>${this.localize.term("dotseeDiscipline_common_ruleNumber", t + 1)}</strong>
          ${o ? r`<span class="rule-suffix">${o}</span>` : g}
        </button>
        <uui-button
          look="secondary"
          color="danger"
          label=${l}
          ?disabled=${a}
          @click=${s}
        >${l}</uui-button>
      </div>
    `;
  }
  _renderFooter() {
    const e = this._validationErrors();
    return r`
      <div slot="footer" class="footer">
        ${e.length > 0 && this._settings.useBackoffice ? r`<ul class="errors">
              ${e.map((t) => r`<li>${t}</li>`)}
            </ul>` : g}
        <uui-button
          look="primary"
          color="positive"
          label=${this.localize.term("dotseeDiscipline_common_save")}
          ?disabled=${!this._canSave()}
          @click=${this._onSaveClick}
        >
          ${this._saving ? r`<uui-loader></uui-loader>` : this.localize.term("dotseeDiscipline_common_save")}
        </uui-button>
      </div>
    `;
  }
  /* ------------------------------------------------------------------ */
  /* Tab renderers                                                      */
  /* ------------------------------------------------------------------ */
  _renderAutoNodeTab(e) {
    const t = this._settings.autoNode, a = (o) => {
      this._patchSettings("autoNode", { ...t, ...o });
    }, s = (o, i) => {
      const l = t.rules.map((p, h) => h === o ? { ...p, ...i } : p);
      a({ rules: l });
    };
    return r`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_autoNode_label")}</h4>
        ${this._renderEnableButton(t.enabled, e, (o) => a({ enabled: o }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_autoNode_description")}
        </p>
        ${t.enabled ? r`
        <div class="grid">
          ${this._withFieldHelp(
      r`
              <label class="fit">
                <span>${this.localize.term("dotseeDiscipline_autoNode_logLevel")}</span>
                <uui-select
                  ?disabled=${e || !t.enabled}
                  .options=${[
        {
          name: this.localize.term("dotseeDiscipline_autoNode_logLevelNormal"),
          value: "Normal",
          selected: t.logLevel === "Normal"
        },
        {
          name: this.localize.term("dotseeDiscipline_autoNode_logLevelVerbose"),
          value: "Verbose",
          selected: t.logLevel === "Verbose"
        }
      ]}
                  @change=${(o) => a({ logLevel: o.target.value })}
                ></uui-select>
              </label>
            `,
      "autonode-loglevel-help",
      this.localize.term("dotseeDiscipline_autoNode_logLevelHelp"),
      "inline"
    )}
          ${this._withFieldHelp(
      r`
              <uui-toggle
                .checked=${t.republishExistingNodes}
                ?disabled=${e || !t.enabled}
                label=${this.localize.term("dotseeDiscipline_autoNode_republish")}
                label-position="right"
                @change=${(o) => a({ republishExistingNodes: o.target.checked })}
              ></uui-toggle>
            `,
      "autonode-republish-help",
      this.localize.term("dotseeDiscipline_autoNode_republishHelp"),
      "inline"
    )}
        </div>
        <h4>${this.localize.term("dotseeDiscipline_common_rules")}</h4>
        ${t.rules.length === 0 ? r`<p class="empty">${this.localize.term("dotseeDiscipline_common_noRulesDefined")}</p>` : g}
        ${t.rules.map((o, i) => {
      const l = o.createdDocTypeAlias && o.docTypeAliasToCreate ? `(${o.createdDocTypeAlias} → ${o.docTypeAliasToCreate})` : "", p = this.localize.term("dotseeDiscipline_common_ruleNumber", i + 1), h = l ? `${p} ${l}` : p, v = o.nodeName ?? "", c = () => {
        this._removeRuleAndReindex("autoNode", i), a({ rules: t.rules.filter((n, u) => u !== i) });
      }, $ = this._isRuleCollapsed("autoNode", i) ? this._renderCollapsedRule("autoNode", i, h, v, e || !t.enabled, c) : r`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader("autoNode", i, e || !t.enabled, c, l || void 0)}
                  <div class="grid">
                    ${this._withFieldHelp(
        this._docTypeField(
          this.localize.term("dotseeDiscipline_autoNode_triggeringDoctype"),
          o.createdDocTypeAlias,
          e || !t.enabled,
          (n) => s(i, { createdDocTypeAlias: n })
        ),
        `autonode-rule-${i}-trigger-help`,
        this.localize.term("dotseeDiscipline_autoNode_triggeringDoctypeHelp")
      )}
                    ${this._withFieldHelp(
        this._docTypeField(
          this.localize.term("dotseeDiscipline_autoNode_doctypeToCreate"),
          o.docTypeAliasToCreate,
          e || !t.enabled,
          (n) => s(i, { docTypeAliasToCreate: n })
        ),
        `autonode-rule-${i}-create-help`,
        this.localize.term("dotseeDiscipline_autoNode_doctypeToCreateHelp")
      )}
                    ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_autoNode_nodeName"),
          o.nodeName,
          e || !t.enabled,
          (n) => s(i, { nodeName: n })
        ),
        `autonode-rule-${i}-nodename-help`,
        this.localize.term("dotseeDiscipline_autoNode_nodeNameHelp")
      )}
                    ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_autoNode_dictionaryItem"),
          o.dictionaryItemForName,
          e || !t.enabled,
          (n) => s(i, { dictionaryItemForName: n })
        ),
        `autonode-rule-${i}-dictionary-help`,
        this.localize.term("dotseeDiscipline_autoNode_dictionaryItemHelp"),
        "stretch",
        "row-break"
      )}
                    ${this._withFieldHelp(
        this._blueprintField(
          this.localize.term("dotseeDiscipline_autoNode_blueprint"),
          o.docTypeAliasToCreate,
          o.blueprint,
          e || !t.enabled,
          (n) => s(i, { blueprint: n })
        ),
        `autonode-rule-${i}-blueprint-help`,
        this.localize.term("dotseeDiscipline_autoNode_blueprintHelp")
      )}
                    ${this._withFieldHelp(
        this._toggleField(
          this.localize.term("dotseeDiscipline_autoNode_bringFirst"),
          o.bringNewNodeFirst,
          e || !t.enabled,
          (n) => s(i, { bringNewNodeFirst: n })
        ),
        `autonode-rule-${i}-bringfirst-help`,
        this.localize.term("dotseeDiscipline_autoNode_bringFirstHelp"),
        "inline",
        "row-break"
      )}
                    ${this._withFieldHelp(
        this._toggleField(
          this.localize.term("dotseeDiscipline_autoNode_onlyIfNoChildren"),
          o.onlyCreateIfNoChildren,
          e || !t.enabled,
          (n) => s(i, { onlyCreateIfNoChildren: n })
        ),
        `autonode-rule-${i}-nochildren-help`,
        this.localize.term("dotseeDiscipline_autoNode_onlyIfNoChildrenHelp"),
        "inline"
      )}
                    ${this._withFieldHelp(
        this._toggleField(
          this.localize.term("dotseeDiscipline_autoNode_existsDifferentName"),
          o.createIfExistsWithDifferentName,
          e || !t.enabled,
          (n) => s(i, { createIfExistsWithDifferentName: n })
        ),
        `autonode-rule-${i}-existsdiffname-help`,
        this.localize.term("dotseeDiscipline_autoNode_existsDifferentNameHelp"),
        "inline"
      )}
                    ${this._withFieldHelp(
        this._toggleField(
          this.localize.term("dotseeDiscipline_autoNode_keepUnpublished"),
          o.keepNewNodeUnpublished,
          e || !t.enabled,
          (n) => s(i, { keepNewNodeUnpublished: n })
        ),
        `autonode-rule-${i}-unpublished-help`,
        this.localize.term("dotseeDiscipline_autoNode_keepUnpublishedHelp"),
        "inline"
      )}
                  </div>
                </uui-box>
              `, z = this._dragFeature === "autoNode" && this._dragIndex === i, x = this._dragFeature === "autoNode" && this._dragOverIndex === i, D = [
        "rule-wrapper",
        z ? "dragging" : "",
        x && this._dragPosition === "before" ? "drop-before" : "",
        x && this._dragPosition === "after" ? "drop-after" : ""
      ].filter(Boolean).join(" "), d = e || !t.enabled;
      return r`
            <div
              class=${D}
              @dragover=${(n) => this._onRuleDragOver(n, "autoNode", i)}
              @dragleave=${() => this._onRuleDragLeave("autoNode", i)}
              @drop=${(n) => this._onRuleDrop(n, "autoNode", i)}
            >
              <span
                class="drag-handle"
                draggable=${d ? "false" : "true"}
                aria-label=${this.localize.term("dotseeDiscipline_common_dragToReorder")}
                title=${this.localize.term("dotseeDiscipline_common_dragToReorder")}
                @dragstart=${(n) => this._onRuleDragStart(n, "autoNode", i)}
                @dragend=${() => this._onRuleDragEnd()}
              >
                <umb-icon name="icon-navigation"></umb-icon>
              </span>
              <div class="rule-content">${$}</div>
            </div>
          `;
    })}
        <uui-button
          look="secondary"
          label=${this.localize.term("dotseeDiscipline_common_addRule")}
          ?disabled=${e || !t.enabled}
          @click=${() => a({ rules: [...t.rules, B()] })}
        >${this.localize.term("dotseeDiscipline_common_addRuleButton")}</uui-button>
        ` : g}
      </uui-box>
    `;
  }
  _renderNodeRestrictTab(e) {
    const t = this._settings.nodeRestrict, a = (o) => {
      this._patchSettings("nodeRestrict", { ...t, ...o });
    }, s = (o, i) => {
      const l = t.rules.map((p, h) => h === o ? { ...p, ...i } : p);
      a({ rules: l });
    };
    return r`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_nodeRestrict_label")}</h4>
        ${this._renderEnableButton(t.enabled, e, (o) => a({ enabled: o }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_nodeRestrict_description")}
        </p>
        ${t.enabled ? r`
        <div class="grid">
          ${this._withFieldHelp(
      this._textField(
        this.localize.term("dotseeDiscipline_nodeRestrict_propertyAlias"),
        t.propertyAlias,
        e || !t.enabled,
        (o) => a({ propertyAlias: o })
      ),
      "noderestrict-propertyalias-help",
      this.localize.term("dotseeDiscipline_nodeRestrict_propertyAliasHelp")
    )}
          ${this._withFieldHelp(
      this._toggleField(
        this.localize.term("dotseeDiscipline_nodeRestrict_showWarnings"),
        t.showWarnings,
        e || !t.enabled,
        (o) => a({ showWarnings: o })
      ),
      "noderestrict-showwarnings-help",
      this.localize.term("dotseeDiscipline_nodeRestrict_showWarningsHelp"),
      "inline",
      "align-bottom"
    )}
        </div>
        <h4>${this.localize.term("dotseeDiscipline_common_rules")}</h4>
        ${t.rules.length === 0 ? r`<p class="empty">${this.localize.term("dotseeDiscipline_common_noRulesDefined")}</p>` : g}
        ${t.rules.map((o, i) => {
      const l = !o.childDocType || o.childDocType === "*" ? this.localize.term("dotseeDiscipline_common_anyDoctypeLowercase") : o.childDocType, p = o.parentDocType ? `(${o.parentDocType} → ${l})` : "", h = this.localize.term("dotseeDiscipline_common_ruleNumber", i + 1), v = p ? `${h} ${p}` : h, c = this.localize.term("dotseeDiscipline_nodeRestrict_ruleDetailMax", o.maxNodes ?? 0), $ = () => {
        this._removeRuleAndReindex("nodeRestrict", i), a({ rules: t.rules.filter((u, N) => N !== i) });
      }, z = this._isRuleCollapsed("nodeRestrict", i) ? this._renderCollapsedRule("nodeRestrict", i, v, c, e || !t.enabled, $) : r`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader("nodeRestrict", i, e || !t.enabled, $, p || void 0)}
              <div class="grid">
                ${this._withFieldHelp(
        this._docTypeField(
          this.localize.term("dotseeDiscipline_nodeRestrict_parentDoctype"),
          o.parentDocType,
          e || !t.enabled,
          (u) => s(i, { parentDocType: u })
        ),
        `noderestrict-rule-${i}-parent-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_parentDoctypeHelp")
      )}
                ${this._withFieldHelp(
        this._docTypeField(
          this.localize.term("dotseeDiscipline_nodeRestrict_childDoctype"),
          o.childDocType || "*",
          e || !t.enabled,
          (u) => s(i, { childDocType: u }),
          {
            label: this.localize.term("dotseeDiscipline_common_anyDoctype"),
            value: "*"
          }
        ),
        `noderestrict-rule-${i}-child-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_childDoctypeHelp")
      )}
                ${this._withFieldHelp(
        this._numberField(
          this.localize.term("dotseeDiscipline_nodeRestrict_maxNodes"),
          o.maxNodes,
          e || !t.enabled,
          (u) => s(i, { maxNodes: u })
        ),
        `noderestrict-rule-${i}-max-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_maxNodesHelp")
      )}
                ${this._withFieldHelp(
        this._toggleField(
          this.localize.term("dotseeDiscipline_nodeRestrict_showWarnings"),
          o.showWarnings,
          e || !t.enabled,
          (u) => s(i, { showWarnings: u })
        ),
        `noderestrict-rule-${i}-warnings-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_ruleShowWarningsHelp"),
        "inline"
      )}
                ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeRestrict_customMessage"),
          o.customMessage,
          e || !t.enabled,
          (u) => s(i, { customMessage: u })
        ),
        `noderestrict-rule-${i}-limitmsg-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_customMessageHelp")
      )}
                ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeRestrict_customMessageCategory"),
          o.customMessageCategory,
          e || !t.enabled,
          (u) => s(i, { customMessageCategory: u })
        ),
        `noderestrict-rule-${i}-limitcat-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_customMessageCategoryHelp")
      )}
                ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeRestrict_customWarning"),
          o.customWarningMessage,
          e || !t.enabled,
          (u) => s(i, { customWarningMessage: u })
        ),
        `noderestrict-rule-${i}-warnmsg-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_customWarningHelp")
      )}
                    ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeRestrict_customWarningCategory"),
          o.customWarningMessageCategory,
          e || !t.enabled,
          (u) => s(i, { customWarningMessageCategory: u })
        ),
        `noderestrict-rule-${i}-warncat-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_customWarningCategoryHelp")
      )}
                  </div>
                </uui-box>
              `, x = this._dragFeature === "nodeRestrict" && this._dragIndex === i, D = this._dragFeature === "nodeRestrict" && this._dragOverIndex === i, d = [
        "rule-wrapper",
        x ? "dragging" : "",
        D && this._dragPosition === "before" ? "drop-before" : "",
        D && this._dragPosition === "after" ? "drop-after" : ""
      ].filter(Boolean).join(" "), n = e || !t.enabled;
      return r`
            <div
              class=${d}
              @dragover=${(u) => this._onRuleDragOver(u, "nodeRestrict", i)}
              @dragleave=${() => this._onRuleDragLeave("nodeRestrict", i)}
              @drop=${(u) => this._onRuleDrop(u, "nodeRestrict", i)}
            >
              <span
                class="drag-handle"
                draggable=${n ? "false" : "true"}
                aria-label=${this.localize.term("dotseeDiscipline_common_dragToReorder")}
                title=${this.localize.term("dotseeDiscipline_common_dragToReorder")}
                @dragstart=${(u) => this._onRuleDragStart(u, "nodeRestrict", i)}
                @dragend=${() => this._onRuleDragEnd()}
              >
                <umb-icon name="icon-navigation"></umb-icon>
              </span>
              <div class="rule-content">${z}</div>
            </div>
          `;
    })}
        <uui-button
          look="secondary"
          label=${this.localize.term("dotseeDiscipline_common_addRule")}
          ?disabled=${e || !t.enabled}
          @click=${() => a({ rules: [...t.rules, I()] })}
        >${this.localize.term("dotseeDiscipline_common_addRuleButton")}</uui-button>
        ` : g}
      </uui-box>
    `;
  }
  _renderVirtualNodesTab(e) {
    const t = this._settings.virtualNodes, a = (s) => {
      this._patchSettings("virtualNodes", { ...t, ...s });
    };
    return r`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_virtualNodes_label")}</h4>
        ${this._renderEnableButton(t.enabled, e, (s) => a({ enabled: s }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_virtualNodes_description")}
        </p>
        ${t.enabled ? r`
        <div class="grid">
          ${this._withFieldHelp(
      this._multiAliasField(
        this.localize.term("dotseeDiscipline_virtualNodes_doctypes"),
        this._docTypes,
        (t.rules ?? []).join(","),
        e || !t.enabled,
        (s) => {
          const o = s ? s.split(",").map((i) => i.trim()).filter((i) => i.length > 0) : [];
          a({ rules: o });
        }
      ),
      "virtualnodes-rules-help",
      this.localize.term("dotseeDiscipline_virtualNodes_doctypesHelp")
    )}
        </div>
        ` : g}
      </uui-box>
    `;
  }
  _renderVariantsHiderTab(e) {
    const t = this._settings.variantsHider, a = (s) => {
      this._patchSettings("variantsHider", { ...t, ...s });
    };
    return r`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_variantsHider_label")}</h4>
        ${this._renderEnableButton(t.enabled, e, (s) => a({ enabled: s }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_variantsHider_description")}
        </p>
        ${t.enabled ? r`
        <div class="grid">
          ${this._withFieldHelp(
      this._textField(
        this.localize.term("dotseeDiscipline_variantsHider_caption"),
        t.caption,
        e || !t.enabled,
        (s) => a({ caption: s })
      ),
      "variantshider-caption-help",
      this.localize.term("dotseeDiscipline_variantsHider_captionHelp")
    )}
        </div>
        ` : g}
      </uui-box>
    `;
  }
  _renderNodeProtectTab(e) {
    const t = this._settings.nodeProtect, a = (o) => {
      this._patchSettings("nodeProtect", { ...t, ...o });
    }, s = (o, i) => {
      const l = t.rules.map((p, h) => h === o ? { ...p, ...i } : p);
      a({ rules: l });
    };
    return r`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_nodeProtect_label")}</h4>
        ${this._renderEnableButton(t.enabled, e, (o) => a({ enabled: o }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_nodeProtect_description")}
        </p>
        ${t.enabled ? r`
        <div class="grid">
          ${this._withFieldHelp(
      this._propertyField(
        this.localize.term("dotseeDiscipline_nodeProtect_propertyAlias"),
        this._trueFalseProperties,
        t.propertyAlias,
        e || !t.enabled,
        (o) => a({ propertyAlias: o })
      ),
      "nodeprotect-propertyalias-help",
      this.localize.term("dotseeDiscipline_nodeProtect_propertyAliasHelp")
    )}
        </div>
        <h4>${this.localize.term("dotseeDiscipline_common_rules")}</h4>
        ${t.rules.length === 0 ? r`<p class="empty">${this.localize.term("dotseeDiscipline_common_noRulesDefined")}</p>` : g}
        ${t.rules.map((o, i) => {
      const l = o.docTypeAlias ? `(${o.docTypeAlias})` : "", p = this.localize.term("dotseeDiscipline_common_ruleNumber", i + 1), h = l ? `${p} ${l}` : p, v = o.documentGuids ? this.localize.term("dotseeDiscipline_nodeProtect_byGuids") : o.docTypeAlias ? this.localize.term("dotseeDiscipline_nodeProtect_byDoctype") : "", c = () => {
        this._removeRuleAndReindex("nodeProtect", i), a({ rules: t.rules.filter((n, u) => u !== i) });
      }, $ = this._isRuleCollapsed("nodeProtect", i) ? this._renderCollapsedRule("nodeProtect", i, h, v, e || !t.enabled, c) : r`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader("nodeProtect", i, e || !t.enabled, c, l || void 0)}
                  <div class="grid">
                    ${this._withFieldHelp(
        this._docTypeField(
          this.localize.term("dotseeDiscipline_nodeProtect_doctypeAlias"),
          o.docTypeAlias,
          e || !t.enabled,
          (n) => s(i, { docTypeAlias: n })
        ),
        `nodeprotect-rule-${i}-doctype-help`,
        this.localize.term("dotseeDiscipline_nodeProtect_doctypeAliasHelp")
      )}
                    ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeProtect_guids"),
          o.documentGuids,
          e || !t.enabled,
          (n) => s(i, { documentGuids: n })
        ),
        `nodeprotect-rule-${i}-guids-help`,
        this.localize.term("dotseeDiscipline_nodeProtect_guidsHelp")
      )}
                    ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeProtect_customMessage"),
          o.customMessage,
          e || !t.enabled,
          (n) => s(i, { customMessage: n })
        ),
        `nodeprotect-rule-${i}-msg-help`,
        this.localize.term("dotseeDiscipline_nodeProtect_customMessageHelp")
      )}
                    ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeProtect_customMessageCategory"),
          o.customMessageCategory,
          e || !t.enabled,
          (n) => s(i, { customMessageCategory: n })
        ),
        `nodeprotect-rule-${i}-msgcat-help`,
        this.localize.term("dotseeDiscipline_nodeProtect_customMessageCategoryHelp")
      )}
                  </div>
                </uui-box>
              `, z = this._dragFeature === "nodeProtect" && this._dragIndex === i, x = this._dragFeature === "nodeProtect" && this._dragOverIndex === i, D = [
        "rule-wrapper",
        z ? "dragging" : "",
        x && this._dragPosition === "before" ? "drop-before" : "",
        x && this._dragPosition === "after" ? "drop-after" : ""
      ].filter(Boolean).join(" "), d = e || !t.enabled;
      return r`
            <div
              class=${D}
              @dragover=${(n) => this._onRuleDragOver(n, "nodeProtect", i)}
              @dragleave=${() => this._onRuleDragLeave("nodeProtect", i)}
              @drop=${(n) => this._onRuleDrop(n, "nodeProtect", i)}
            >
              <span
                class="drag-handle"
                draggable=${d ? "false" : "true"}
                aria-label=${this.localize.term("dotseeDiscipline_common_dragToReorder")}
                title=${this.localize.term("dotseeDiscipline_common_dragToReorder")}
                @dragstart=${(n) => this._onRuleDragStart(n, "nodeProtect", i)}
                @dragend=${() => this._onRuleDragEnd()}
              >
                <umb-icon name="icon-navigation"></umb-icon>
              </span>
              <div class="rule-content">${$}</div>
            </div>
          `;
    })}
        <uui-button
          look="secondary"
          label=${this.localize.term("dotseeDiscipline_common_addRule")}
          ?disabled=${e || !t.enabled}
          @click=${() => a({ rules: [...t.rules, V()] })}
        >${this.localize.term("dotseeDiscipline_common_addRuleButton")}</uui-button>
        ` : g}
      </uui-box>
    `;
  }
  _renderAiSummaryTab(e) {
    const t = this._settings.aiSummary, a = (s) => {
      this._patchSettings("aiSummary", { ...t, ...s });
    };
    return r`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_aiSummary_label")}</h4>
        ${this._renderEnableButton(t.enabled, e, (s) => a({ enabled: s }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_aiSummary_description")}
        </p>
        ${t.enabled ? r`
        <div class="grid">
          ${this._withFieldHelp(
      r`
              <label>
                <span>${this.localize.term("dotseeDiscipline_aiSummary_llm")}</span>
                <uui-select
                  ?disabled=${e || !t.enabled}
                  .options=${[
        { name: "OpenAI", value: "openai", selected: t.llm === "openai" },
        { name: "Gemini", value: "gemini", selected: t.llm === "gemini" }
      ]}
                  @change=${(s) => a({ llm: s.target.value })}
                ></uui-select>
              </label>
            `,
      "aisummary-llm-help",
      this.localize.term("dotseeDiscipline_aiSummary_llmHelp")
    )}
          ${this._withFieldHelp(
      this._textField(
        this.localize.term("dotseeDiscipline_aiSummary_apiKey"),
        t.apiKey,
        e || !t.enabled,
        (s) => a({ apiKey: s })
      ),
      "aisummary-apikey-help",
      this.localize.term("dotseeDiscipline_aiSummary_apiKeyHelp")
    )}
          ${this._withFieldHelp(
      this._textField(
        this.localize.term("dotseeDiscipline_aiSummary_model"),
        t.model,
        e || !t.enabled,
        (s) => a({ model: s })
      ),
      "aisummary-model-help",
      this.localize.term("dotseeDiscipline_aiSummary_modelHelp")
    )}
          ${this._withFieldHelp(
      this._numberField(
        this.localize.term("dotseeDiscipline_aiSummary_maxChars"),
        t.maxChars,
        e || !t.enabled,
        (s) => a({ maxChars: s })
      ),
      "aisummary-maxchars-help",
      this.localize.term("dotseeDiscipline_aiSummary_maxCharsHelp"),
      "stretch",
      "row-break"
    )}
          ${this._withFieldHelp(
      this._propertyField(
        this.localize.term("dotseeDiscipline_aiSummary_propertyAlias"),
        this._textInputProperties,
        t.propertyAlias,
        e || !t.enabled,
        (s) => a({ propertyAlias: s })
      ),
      "aisummary-propertyalias-help",
      this.localize.term("dotseeDiscipline_aiSummary_propertyAliasHelp")
    )}
          ${this._withFieldHelp(
      this._propertyField(
        this.localize.term("dotseeDiscipline_aiSummary_toggleProperty"),
        this._trueFalseProperties,
        t.togglePropertyAlias,
        e || !t.enabled,
        (s) => a({ togglePropertyAlias: s })
      ),
      "aisummary-toggleproperty-help",
      this.localize.term("dotseeDiscipline_aiSummary_togglePropertyHelp")
    )}
          ${this._withFieldHelp(
      this._multiAliasField(
        this.localize.term("dotseeDiscipline_aiSummary_doctypes"),
        this._docTypes,
        t.docTypes,
        e || !t.enabled,
        (s) => a({ docTypes: s })
      ),
      "aisummary-doctypes-help",
      this.localize.term("dotseeDiscipline_aiSummary_doctypesHelp"),
      "stretch",
      "row-break"
    )}
          ${this._withFieldHelp(
      this._multiAliasField(
        this.localize.term("dotseeDiscipline_aiSummary_excludeProperties"),
        this._textContentProperties,
        t.excludeProperties,
        e || !t.enabled,
        (s) => a({ excludeProperties: s })
      ),
      "aisummary-excludeproperties-help",
      this.localize.term("dotseeDiscipline_aiSummary_excludePropertiesHelp")
    )}
        </div>
        ${this._withFieldHelp(
      r`
            <label class="block">
              <span>${this.localize.term("dotseeDiscipline_aiSummary_tone")}</span>
              <uui-textarea
                .value=${t.tone}
                ?disabled=${e || !t.enabled}
                @input=${(s) => a({ tone: s.target.value })}
              ></uui-textarea>
            </label>
          `,
      "aisummary-tone-help",
      this.localize.term("dotseeDiscipline_aiSummary_toneHelp")
    )}
        ` : g}
      </uui-box>
    `;
  }
  _renderPropertyVersionsTab(e) {
    const t = this._settings.propertyVersions, a = (s) => {
      this._patchSettings("propertyVersions", { ...t, ...s });
    };
    return r`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_propertyVersions_label")}</h4>
        ${this._renderEnableButton(t.enabled, e, (s) => a({ enabled: s }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_propertyVersions_description")}
        </p>
        ${t.enabled ? r`
        <div class="grid">
          ${this._withFieldHelp(
      this._textField(
        this.localize.term("dotseeDiscipline_propertyVersions_nextDictionaryEntry"),
        t.nextVersionButtonCaptionDictionaryEntry,
        e || !t.enabled,
        (s) => a({ nextVersionButtonCaptionDictionaryEntry: s })
      ),
      "propertyversions-next-help",
      this.localize.term("dotseeDiscipline_propertyVersions_nextDictionaryEntryHelp")
    )}
          ${this._withFieldHelp(
      this._textField(
        this.localize.term("dotseeDiscipline_propertyVersions_previousDictionaryEntry"),
        t.previousVersionButtonCaptionDictionaryEntry,
        e || !t.enabled,
        (s) => a({ previousVersionButtonCaptionDictionaryEntry: s })
      ),
      "propertyversions-previous-help",
      this.localize.term("dotseeDiscipline_propertyVersions_previousDictionaryEntryHelp")
    )}
          ${this._withFieldHelp(
      this._textField(
        this.localize.term("dotseeDiscipline_propertyVersions_noVersionsDictionaryEntry"),
        t.noVersionsButtonCaptionDictionaryEntry,
        e || !t.enabled,
        (s) => a({ noVersionsButtonCaptionDictionaryEntry: s })
      ),
      "propertyversions-none-help",
      this.localize.term("dotseeDiscipline_propertyVersions_noVersionsDictionaryEntryHelp")
    )}
        </div>
        ` : g}
      </uui-box>
    `;
  }
  /* ------------------------------------------------------------------ */
  /* Small field helpers                                                */
  /* ------------------------------------------------------------------ */
  _textField(e, t, a, s) {
    return r`
      <label>
        <span>${e}</span>
        <uui-input
          .value=${t ?? ""}
          ?disabled=${a}
          @input=${(o) => s(o.target.value)}
        ></uui-input>
      </label>
    `;
  }
  _docTypeField(e, t, a, s, o) {
    return this._aliasField(e, this._docTypes, t, a, s, o);
  }
  _propertyField(e, t, a, s, o) {
    return this._aliasField(e, t, a, s, o);
  }
  _withFieldHelp(e, t, a, s = "stretch", o) {
    const i = `field-with-help ${s}${o ? ` ${o}` : ""}`;
    return r`
      <div class=${i}>
        ${e}
        <uui-button
          class="help-button"
          look="secondary"
          compact
          label=${this.localize.term("dotseeDiscipline_common_help")}
          popovertarget=${t}
        >
          <umb-icon name="icon-help-alt"></umb-icon>
        </uui-button>
        <uui-popover-container id=${t} placement="top-end">
          <div class="help-bubble">${a}</div>
        </uui-popover-container>
      </div>
    `;
  }
  _multiAliasField(e, t, a, s, o) {
    const i = new Set(
      (a ?? "").split(",").map((d) => d.trim()).filter((d) => d.length > 0)
    ), l = (d, n) => {
      n ? i.add(d) : i.delete(d), o(Array.from(i).join(","));
    }, p = new Set(t.map((d) => d.alias)), h = Array.from(i).filter((d) => !p.has(d)), v = this._expandedFields.has(e), c = this._filterModes.get(e) ?? "all", $ = (d) => {
      d ? this._expandedFields.add(e) : this._expandedFields.delete(e), this.requestUpdate();
    }, z = (d) => {
      this._filterModes.set(e, d), this.requestUpdate();
    }, x = c === "selected" ? t.filter((d) => i.has(d.alias)) : t, D = c === "selected" || c === "all" ? h : [];
    return r`
      <label>
        <span>${e}</span>
        <div class="multi-box">
          <div class="multi-bar">
            <button
              type="button"
              class="multi-toggle"
              ?disabled=${s}
              @click=${() => $(!v)}
            >
              <span class="multi-action">${this.localize.term(
      v ? "dotseeDiscipline_common_hideList" : "dotseeDiscipline_common_showList"
    )}</span>
              <span class="multi-count">${this.localize.term(
      "dotseeDiscipline_common_selectedCount",
      i.size
    )}</span>
            </button>
            ${v ? r`
                  <div class="multi-filter">
                    <label class="checkbox-row">
                      <input
                        type="radio"
                        name="filter-${e}"
                        ?disabled=${s}
                        .checked=${c === "all"}
                        @change=${() => z("all")}
                      />
                      <span>${this.localize.term("dotseeDiscipline_common_filterAll")}</span>
                    </label>
                    <label class="checkbox-row">
                      <input
                        type="radio"
                        name="filter-${e}"
                        ?disabled=${s}
                        .checked=${c === "selected"}
                        @change=${() => z("selected")}
                      />
                      <span>${this.localize.term("dotseeDiscipline_common_filterSelectedOnly")}</span>
                    </label>
                  </div>
                ` : g}
          </div>
          ${v ? r`
                <div class="checkbox-list">
                  ${x.length === 0 && D.length === 0 ? r`<p class="empty">${this.localize.term("dotseeDiscipline_common_noEntries")}</p>` : g}
                  ${x.map(
      (d) => r`
                      <label class="checkbox-row">
                        <input
                          type="checkbox"
                          ?disabled=${s}
                          .checked=${i.has(d.alias)}
                          @change=${(n) => l(d.alias, n.target.checked)}
                        />
                        <span>${d.name} (${d.alias})</span>
                      </label>
                    `
    )}
                  ${D.map(
      (d) => r`
                      <label class="checkbox-row">
                        <input
                          type="checkbox"
                          ?disabled=${s}
                          checked
                          @change=${(n) => l(d, n.target.checked)}
                        />
                        <span>${d} (${this.localize.term("dotseeDiscipline_common_notFoundSuffix")})</span>
                      </label>
                    `
    )}
                </div>
              ` : g}
        </div>
      </label>
    `;
  }
  _aliasField(e, t, a, s, o, i) {
    const l = a ?? "", p = new Set(t.map((c) => c.alias)), h = (i == null ? void 0 : i.value) ?? "", v = (i == null ? void 0 : i.label) ?? this.localize.term("dotseeDiscipline_common_selectPlaceholder");
    return r`
      <label>
        <span>${e}</span>
        <select
          class="doctype-select"
          ?disabled=${s}
          @change=${(c) => o(c.target.value)}
        >
          <option value=${h} ?selected=${l === h || l === ""}>
            ${v}
          </option>
          ${t.map(
      (c) => r`
              <option value=${c.alias} ?selected=${c.alias === l}>
                ${c.name} (${c.alias})
              </option>
            `
    )}
          ${l && l !== h && !p.has(l) ? r`<option value=${l} selected>${l} (${this.localize.term("dotseeDiscipline_common_notFoundSuffix")})</option>` : g}
        </select>
      </label>
    `;
  }
  _blueprintField(e, t, a, s, o) {
    const i = a ?? "", l = t ? this._blueprints.filter(
      (c) => c.docTypeAlias.localeCompare(t, void 0, { sensitivity: "accent" }) === 0
    ) : [], p = new Set(l.map((c) => c.name)), h = s || !t, v = t ? l.length === 0 ? this.localize.term("dotseeDiscipline_common_noBlueprintsPlaceholder") : this.localize.term("dotseeDiscipline_common_selectPlaceholder") : this.localize.term("dotseeDiscipline_common_selectDoctypeFirstPlaceholder");
    return r`
      <label>
        <span>${e}</span>
        <select
          class="doctype-select"
          ?disabled=${h}
          @change=${(c) => o(c.target.value)}
        >
          <option value="" ?selected=${i === ""}>${v}</option>
          ${l.map(
      (c) => r`
              <option value=${c.name} ?selected=${c.name === i}>${c.name}</option>
            `
    )}
          ${i && !p.has(i) ? r`<option value=${i} selected>${i} (${this.localize.term("dotseeDiscipline_common_notFoundSuffix")})</option>` : g}
        </select>
      </label>
    `;
  }
  _numberField(e, t, a, s) {
    return r`
      <label>
        <span>${e}</span>
        <uui-input
          .type=${"number"}
          min="0"
          step="1"
          inputmode="numeric"
          .value=${(t == null ? void 0 : t.toString()) ?? "0"}
          ?disabled=${a}
          @input=${(o) => {
      const i = o.target.value, l = i === "" ? 0 : Number(i);
      s(Number.isNaN(l) ? 0 : l);
    }}
        ></uui-input>
      </label>
    `;
  }
  _toggleField(e, t, a, s, o) {
    return r`
      <label class=${`inline${o ? ` ${o}` : ""}`}>
        <uui-toggle
          .checked=${t}
          ?disabled=${a}
          @change=${(i) => s(i.target.checked)}
        ></uui-toggle>
        <span>${e}</span>
      </label>
    `;
  }
};
W(_, "styles", P`
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
  `);
b([
  y()
], _.prototype, "_loading", 2);
b([
  y()
], _.prototype, "_saving", 2);
b([
  y()
], _.prototype, "_hasAppSettings", 2);
b([
  y()
], _.prototype, "_settings", 2);
b([
  y()
], _.prototype, "_activeTab", 2);
b([
  y()
], _.prototype, "_docTypes", 2);
b([
  y()
], _.prototype, "_trueFalseProperties", 2);
b([
  y()
], _.prototype, "_textContentProperties", 2);
b([
  y()
], _.prototype, "_textInputProperties", 2);
b([
  y()
], _.prototype, "_blueprints", 2);
b([
  y()
], _.prototype, "_expandedFields", 2);
b([
  y()
], _.prototype, "_filterModes", 2);
b([
  y()
], _.prototype, "_collapsedRules", 2);
b([
  y()
], _.prototype, "_dragIndex", 2);
b([
  y()
], _.prototype, "_dragOverIndex", 2);
b([
  y()
], _.prototype, "_dragPosition", 2);
b([
  y()
], _.prototype, "_dragFeature", 2);
_ = b([
  H("dotsee-discipline-settings-workspace")
], _);
const Z = _;
export {
  _ as DisciplineSettingsWorkspaceElement,
  Z as default
};
//# sourceMappingURL=discipline-settings.workspace.element-BKcqsQoA.js.map
