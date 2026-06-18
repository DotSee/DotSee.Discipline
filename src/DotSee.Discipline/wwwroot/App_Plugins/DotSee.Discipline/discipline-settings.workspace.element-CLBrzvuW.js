var T = Object.defineProperty;
var k = (f, t, e) => t in f ? T(f, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : f[t] = e;
var _ = (f, t, e) => k(f, typeof t != "symbol" ? t + "" : t, e);
import { html as r, nothing as g, css as S, state as y, customElement as H } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as P } from "@umbraco-cms/backoffice/lit-element";
import { UMB_AUTH_CONTEXT as C } from "@umbraco-cms/backoffice/auth";
import { UMB_MODAL_MANAGER_CONTEXT as A, UMB_CONFIRM_MODAL as E } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as M } from "@umbraco-cms/backoffice/notification";
import { c as B, b as I, d as V } from "./index-DRS_tEys.js";
const z = "/umbraco/api/discipline";
class O {
  constructor(t) {
    this.getToken = t;
  }
  async headers(t = {}) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await this.getToken()}`,
      ...t
    };
  }
  async getSettings() {
    const t = await fetch(`${z}/settings`, {
      method: "GET",
      headers: await this.headers()
    });
    if (!t.ok)
      throw new Error(`Failed to load Discipline settings (${t.status})`);
    return await t.json();
  }
  async saveSettings(t) {
    const e = await fetch(`${z}/settings`, {
      method: "PUT",
      headers: await this.headers(),
      body: JSON.stringify(t)
    });
    if (!e.ok)
      throw new Error(`Failed to save Discipline settings (${e.status})`);
    return await e.json();
  }
  async getDocTypes() {
    const t = await fetch(`${z}/doctypes`, {
      method: "GET",
      headers: await this.headers()
    });
    if (!t.ok)
      throw new Error(`Failed to load doctypes (${t.status})`);
    return await t.json();
  }
  async getTrueFalseProperties() {
    const t = await fetch(`${z}/properties/truefalse`, {
      method: "GET",
      headers: await this.headers()
    });
    if (!t.ok)
      throw new Error(`Failed to load true/false properties (${t.status})`);
    return await t.json();
  }
  async getTextContentProperties() {
    const t = await fetch(`${z}/properties/text-content`, {
      method: "GET",
      headers: await this.headers()
    });
    if (!t.ok)
      throw new Error(`Failed to load text content properties (${t.status})`);
    return await t.json();
  }
  async getTextInputProperties() {
    const t = await fetch(`${z}/properties/text-input`, {
      method: "GET",
      headers: await this.headers()
    });
    if (!t.ok)
      throw new Error(`Failed to load text input properties (${t.status})`);
    return await t.json();
  }
  async getBlueprints() {
    const t = await fetch(`${z}/blueprints`, {
      method: "GET",
      headers: await this.headers()
    });
    if (!t.ok)
      throw new Error(`Failed to load blueprints (${t.status})`);
    return await t.json();
  }
  async importFromAppSettings() {
    const t = await fetch(`${z}/import-from-appsettings`, {
      method: "POST",
      headers: await this.headers()
    });
    if (!t.ok)
      throw new Error(`Failed to import from appsettings (${t.status})`);
    return await t.json();
  }
}
var R = Object.defineProperty, U = Object.getOwnPropertyDescriptor, L = (f, t, e) => t in f ? R(f, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : f[t] = e, b = (f, t, e, a) => {
  for (var s = a > 1 ? void 0 : a ? U(t, e) : t, o = f.length - 1, i; o >= 0; o--)
    (i = f[o]) && (s = (a ? i(t, e, s) : i(s)) || s);
  return a && s && R(t, e, s), s;
}, W = (f, t, e) => L(f, t + "", e);
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
let m = class extends P {
  constructor() {
    super(...arguments);
    _(this, "_loading", !0);
    _(this, "_saving", !1);
    _(this, "_hasAppSettings", !1);
    _(this, "_settings", F());
    _(this, "_activeTab", "autoNode");
    _(this, "_docTypes", []);
    _(this, "_trueFalseProperties", []);
    _(this, "_textContentProperties", []);
    _(this, "_textInputProperties", []);
    _(this, "_blueprints", []);
    _(this, "_expandedFields", /* @__PURE__ */ new Set());
    _(this, "_filterModes", /* @__PURE__ */ new Map());
    _(this, "_collapsedRules", /* @__PURE__ */ new Set());
    _(this, "_dragIndex", null);
    _(this, "_dragOverIndex", null);
    _(this, "_dragPosition", null);
    _(this, "_dragFeature", null);
    _(this, "_repository");
    // Snapshot of last server-known state for sections whose changes only take effect
    // after a backoffice reload (VariantsHider + PropertyVersions are registered once
    // at extension entry-point init). Compared against pre-save state to decide whether
    // to show the reload hint toast.
    _(this, "_refreshSensitiveSnapshot", "");
    _(this, "_onDocumentMouseDown", (t) => {
      if (this._expandedFields.size === 0) return;
      t.composedPath().some((a) => {
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
    const t = await this.getContext(C);
    this._repository = new O(() => t.getLatestToken());
    try {
      const [e, a, s, o, i, l] = await Promise.all([
        this._repository.getSettings(),
        this._repository.getDocTypes().catch(() => []),
        this._repository.getTrueFalseProperties().catch(() => []),
        this._repository.getTextContentProperties().catch(() => []),
        this._repository.getTextInputProperties().catch(() => []),
        this._repository.getBlueprints().catch(() => [])
      ]);
      this._docTypes = a, this._trueFalseProperties = s, this._textContentProperties = o, this._textInputProperties = i, this._blueprints = l, this._applyResponse(e), this._collapseAllRules();
    } catch (e) {
      await this._notify(
        "danger",
        this.localize.term("dotseeDiscipline_settings_loadFailedToast", this._errorMessage(e))
      );
    } finally {
      this._loading = !1, this.requestUpdate();
    }
  }
  _applyResponse(t) {
    this._hasAppSettings = t.hasAppSettings, this._settings = t.settings ?? F(), this._refreshSensitiveSnapshot = this._snapshotRefreshSensitive(this._settings), this.requestUpdate();
  }
  _snapshotRefreshSensitive(t) {
    return JSON.stringify({ variantsHider: t.variantsHider, propertyVersions: t.propertyVersions });
  }
  _errorMessage(t) {
    return t instanceof Error ? t.message : String(t);
  }
  async _notify(t, e) {
    try {
      const a = await this.getContext(M);
      a == null || a.peek(t, { data: { message: e } });
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
    const e = t.open(this, E, {
      data: {
        headline: this.localize.term("dotseeDiscipline_settings_loadFromAppsettings"),
        content: this.localize.term("dotseeDiscipline_settings_importConfirmContent"),
        confirmLabel: this.localize.term("dotseeDiscipline_settings_importConfirmLabel"),
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
    if (!this._repository || !this._canSave()) return;
    const t = this._snapshotRefreshSensitive(this._settings) !== this._refreshSensitiveSnapshot;
    try {
      this._saving = !0, this.requestUpdate();
      const e = await this._repository.saveSettings(this._settings);
      this._applyResponse(e), await this._notify("positive", this.localize.term("dotseeDiscipline_settings_savedToast")), t && await this._notify("warning", this.localize.term("dotseeDiscipline_settings_reloadHintToast"));
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
    const t = [], e = this._settings, a = (s, ...o) => this.localize.term(s, ...o);
    return e.autoNode.enabled && e.autoNode.rules.forEach((s, o) => {
      s.createdDocTypeAlias || t.push(a("dotseeDiscipline_autoNode_validationCreatedDoctype", o + 1)), s.docTypeAliasToCreate || t.push(a("dotseeDiscipline_autoNode_validationDoctypeToCreate", o + 1)), s.nodeName || t.push(a("dotseeDiscipline_autoNode_validationNodeName", o + 1));
    }), e.nodeRestrict.enabled && e.nodeRestrict.rules.forEach((s, o) => {
      s.parentDocType || t.push(a("dotseeDiscipline_nodeRestrict_validationParentDoctype", o + 1)), (!Number.isFinite(s.maxNodes) || s.maxNodes < 0) && t.push(a("dotseeDiscipline_nodeRestrict_validationMaxNodes", o + 1));
    }), e.nodeProtect.enabled && (e.nodeProtect.propertyAlias || t.push(a("dotseeDiscipline_nodeProtect_validationPropertyAlias")), e.nodeProtect.rules.forEach((s, o) => {
      !s.docTypeAlias && !s.documentGuids && t.push(a("dotseeDiscipline_nodeProtect_validationDoctypeOrGuids", o + 1));
    })), e.virtualNodes.enabled && e.virtualNodes.rules.forEach((s, o) => {
      s || t.push(a("dotseeDiscipline_virtualNodes_validationDoctype", o + 1));
    }), e.aiSummary.enabled && (e.aiSummary.llm || t.push(a("dotseeDiscipline_aiSummary_validationLlm")), e.aiSummary.apiKey || t.push(a("dotseeDiscipline_aiSummary_validationApiKey")), e.aiSummary.model || t.push(a("dotseeDiscipline_aiSummary_validationModel")), e.aiSummary.propertyAlias || t.push(a("dotseeDiscipline_aiSummary_validationPropertyAlias"))), t;
  }
  get _fieldsDisabled() {
    return !this._settings.useBackoffice || this._saving;
  }
  render() {
    const t = this.localize.term("dotseeDiscipline_settings_headline");
    if (this._loading)
      return r`<umb-body-layout headline=${t}>
        <div class="center"><uui-loader></uui-loader></div>
      </umb-body-layout>`;
    const e = this._fieldsDisabled, a = this._settings.useBackoffice;
    return r`
      <umb-body-layout headline=${t}>
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
                <div ?hidden=${this._activeTab !== "autoNode"}>${this._renderAutoNodeTab(e)}</div>
                <div ?hidden=${this._activeTab !== "nodeRestrict"}>${this._renderNodeRestrictTab(e)}</div>
                <div ?hidden=${this._activeTab !== "virtualNodes"}>${this._renderVirtualNodesTab(e)}</div>
                <div ?hidden=${this._activeTab !== "variantsHider"}>${this._renderVariantsHiderTab(e)}</div>
                <div ?hidden=${this._activeTab !== "nodeProtect"}>${this._renderNodeProtectTab(e)}</div>
                <div ?hidden=${this._activeTab !== "aiSummary"}>${this._renderAiSummaryTab(e)}</div>
                <div ?hidden=${this._activeTab !== "propertyVersions"}>${this._renderPropertyVersionsTab(e)}</div>
              </div>
              ${this._renderFooter()}
            ` : g}
      </umb-body-layout>
    `;
  }
  _renderSourceBanner() {
    const t = this.localize.term("dotseeDiscipline_settings_sourceHeadline");
    return this._hasAppSettings ? r`
      <uui-box headline=${t}>
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
        <uui-box headline=${t}>
          <p>${this.localize.term("dotseeDiscipline_settings_noAppsettingsFound")}</p>
        </uui-box>
      `;
  }
  _renderEnableButton(t, e, a) {
    return r`
      <uui-button
        slot="header-actions"
        look=${t ? "secondary" : "primary"}
        color=${t ? "default" : "positive"}
        label=${this.localize.term(
      t ? "dotseeDiscipline_common_disable" : "dotseeDiscipline_common_enable"
    )}
        ?disabled=${e}
        @click=${() => a(!t)}
      ></uui-button>
    `;
  }
  _isRuleCollapsed(t, e) {
    return this._collapsedRules.has(`${t}:${e}`);
  }
  _toggleRuleCollapsed(t, e) {
    const a = `${t}:${e}`;
    this._collapsedRules.has(a) ? this._collapsedRules.delete(a) : this._collapsedRules.add(a), this.requestUpdate();
  }
  _remapCollapsedRules(t, e) {
    const a = `${t}:`, s = /* @__PURE__ */ new Set();
    for (const o of this._collapsedRules) {
      if (!o.startsWith(a)) {
        s.add(o);
        continue;
      }
      const i = Number(o.slice(a.length)), l = e.get(i);
      l !== void 0 && s.add(`${a}${l}`);
    }
    this._collapsedRules = s;
  }
  _reorderRules(t, e, a) {
    const s = this._settings[t];
    if (e === a || e < 0 || e >= s.rules.length) return;
    const o = Math.max(0, Math.min(a, s.rules.length - 1));
    if (e === o) return;
    const i = s.rules.slice(), [l] = i.splice(e, 1);
    i.splice(o, 0, l);
    const p = /* @__PURE__ */ new Map(), h = s.rules.map((c, $) => $), [v] = h.splice(e, 1);
    h.splice(o, 0, v), h.forEach((c, $) => p.set(c, $)), this._remapCollapsedRules(t, p), this._patchSettings(t, { ...s, rules: i });
  }
  _onRuleDragStart(t, e, a) {
    if (this._dragFeature = e, this._dragIndex = a, t.dataTransfer) {
      t.dataTransfer.effectAllowed = "move", t.dataTransfer.setData("text/plain", String(a));
      const s = t.currentTarget, o = s == null ? void 0 : s.closest(".rule-wrapper");
      if (o) {
        const i = o.getBoundingClientRect();
        t.dataTransfer.setDragImage(
          o,
          t.clientX - i.left,
          t.clientY - i.top
        );
      }
    }
    this.requestUpdate();
  }
  _onRuleDragOver(t, e, a) {
    if (this._dragIndex === null || this._dragFeature !== e) return;
    t.preventDefault(), t.dataTransfer && (t.dataTransfer.dropEffect = "move");
    const o = t.currentTarget.getBoundingClientRect(), i = o.top + o.height / 2, l = t.clientY < i ? "before" : "after";
    (this._dragOverIndex !== a || this._dragPosition !== l) && (this._dragOverIndex = a, this._dragPosition = l, this.requestUpdate());
  }
  _onRuleDragLeave(t, e) {
    this._dragFeature === t && this._dragOverIndex === e && (this._dragOverIndex = null, this._dragPosition = null, this.requestUpdate());
  }
  _onRuleDrop(t, e, a) {
    if (t.preventDefault(), this._dragIndex === null || this._dragFeature !== e) return;
    const s = this._dragIndex, o = this._dragPosition ?? "after";
    let i = a + (o === "after" ? 1 : 0);
    s < i && i--, this._reorderRules(e, s, i), this._dragFeature = null, this._dragIndex = null, this._dragOverIndex = null, this._dragPosition = null, this.requestUpdate();
  }
  _onRuleDragEnd() {
    this._dragFeature = null, this._dragIndex = null, this._dragOverIndex = null, this._dragPosition = null, this.requestUpdate();
  }
  _removeRuleAndReindex(t, e) {
    const a = `${t}:`, s = /* @__PURE__ */ new Set();
    for (const o of this._collapsedRules) {
      if (!o.startsWith(a)) {
        s.add(o);
        continue;
      }
      const i = Number(o.slice(a.length));
      i < e ? s.add(o) : i > e && s.add(`${a}${i - 1}`);
    }
    this._collapsedRules = s;
  }
  _collapseAllRules() {
    const t = /* @__PURE__ */ new Set();
    this._settings.autoNode.rules.forEach((e, a) => t.add(`autoNode:${a}`)), this._settings.nodeRestrict.rules.forEach((e, a) => t.add(`nodeRestrict:${a}`)), this._settings.nodeProtect.rules.forEach((e, a) => t.add(`nodeProtect:${a}`)), this._collapsedRules = t, this.requestUpdate();
  }
  _renderCollapsedRule(t, e, a, s, o, i) {
    return r`
      <uui-ref-node
        class="rule-ref"
        name=${a}
        detail=${s}
        ?disabled=${o}
        @open=${() => this._toggleRuleCollapsed(t, e)}
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
  _renderRuleHeader(t, e, a, s, o) {
    const i = this._isRuleCollapsed(t, e), l = this.localize.term("dotseeDiscipline_common_remove");
    return r`
      <div slot="header" class="rule-header">
        <button
          type="button"
          class="rule-toggle"
          aria-label=${this.localize.term(
      i ? "dotseeDiscipline_common_expandRule" : "dotseeDiscipline_common_collapseRule"
    )}
          aria-expanded=${!i}
          @click=${() => this._toggleRuleCollapsed(t, e)}
        >
          <umb-icon
            name=${i ? "icon-navigation-right" : "icon-navigation-down"}
          ></umb-icon>
          <strong>${this.localize.term("dotseeDiscipline_common_ruleNumber", e + 1)}</strong>
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
    const t = this._validationErrors();
    return r`
      <div slot="footer" class="footer">
        ${t.length > 0 && this._settings.useBackoffice ? r`<ul class="errors">
              ${t.map((e) => r`<li>${e}</li>`)}
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
  _renderAutoNodeTab(t) {
    const e = this._settings.autoNode, a = (o) => {
      this._patchSettings("autoNode", { ...e, ...o });
    }, s = (o, i) => {
      const l = e.rules.map((p, h) => h === o ? { ...p, ...i } : p);
      a({ rules: l });
    };
    return r`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_autoNode_label")}</h4>
        ${this._renderEnableButton(e.enabled, t, (o) => a({ enabled: o }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_autoNode_description")}
        </p>
        ${e.enabled ? r`
        <div class="grid">
          ${this._withFieldHelp(
      r`
              <label class="fit">
                <span>${this.localize.term("dotseeDiscipline_autoNode_logLevel")}</span>
                <uui-select
                  ?disabled=${t || !e.enabled}
                  .options=${[
        {
          name: this.localize.term("dotseeDiscipline_autoNode_logLevelNormal"),
          value: "Normal",
          selected: e.logLevel === "Normal"
        },
        {
          name: this.localize.term("dotseeDiscipline_autoNode_logLevelVerbose"),
          value: "Verbose",
          selected: e.logLevel === "Verbose"
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
                .checked=${e.republishExistingNodes}
                ?disabled=${t || !e.enabled}
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
        ${e.rules.length === 0 ? r`<p class="empty">${this.localize.term("dotseeDiscipline_common_noRulesDefined")}</p>` : g}
        ${e.rules.map((o, i) => {
      const l = o.createdDocTypeAlias && o.docTypeAliasToCreate ? `(${o.createdDocTypeAlias} → ${o.docTypeAliasToCreate})` : "", p = this.localize.term("dotseeDiscipline_common_ruleNumber", i + 1), h = l ? `${p} ${l}` : p, v = o.nodeName ?? "", c = () => {
        this._removeRuleAndReindex("autoNode", i), a({ rules: e.rules.filter((n, u) => u !== i) });
      }, $ = this._isRuleCollapsed("autoNode", i) ? this._renderCollapsedRule("autoNode", i, h, v, t || !e.enabled, c) : r`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader("autoNode", i, t || !e.enabled, c, l || void 0)}
                  <div class="grid">
                    ${this._withFieldHelp(
        this._docTypeField(
          this.localize.term("dotseeDiscipline_autoNode_triggeringDoctype"),
          o.createdDocTypeAlias,
          t || !e.enabled,
          (n) => s(i, { createdDocTypeAlias: n })
        ),
        `autonode-rule-${i}-trigger-help`,
        this.localize.term("dotseeDiscipline_autoNode_triggeringDoctypeHelp")
      )}
                    ${this._withFieldHelp(
        this._docTypeField(
          this.localize.term("dotseeDiscipline_autoNode_doctypeToCreate"),
          o.docTypeAliasToCreate,
          t || !e.enabled,
          (n) => s(i, { docTypeAliasToCreate: n })
        ),
        `autonode-rule-${i}-create-help`,
        this.localize.term("dotseeDiscipline_autoNode_doctypeToCreateHelp")
      )}
                    ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_autoNode_nodeName"),
          o.nodeName,
          t || !e.enabled,
          (n) => s(i, { nodeName: n })
        ),
        `autonode-rule-${i}-nodename-help`,
        this.localize.term("dotseeDiscipline_autoNode_nodeNameHelp")
      )}
                    ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_autoNode_dictionaryItem"),
          o.dictionaryItemForName,
          t || !e.enabled,
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
          t || !e.enabled,
          (n) => s(i, { blueprint: n })
        ),
        `autonode-rule-${i}-blueprint-help`,
        this.localize.term("dotseeDiscipline_autoNode_blueprintHelp")
      )}
                    ${this._withFieldHelp(
        this._toggleField(
          this.localize.term("dotseeDiscipline_autoNode_bringFirst"),
          o.bringNewNodeFirst,
          t || !e.enabled,
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
          t || !e.enabled,
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
          t || !e.enabled,
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
          t || !e.enabled,
          (n) => s(i, { keepNewNodeUnpublished: n })
        ),
        `autonode-rule-${i}-unpublished-help`,
        this.localize.term("dotseeDiscipline_autoNode_keepUnpublishedHelp"),
        "inline"
      )}
                  </div>
                </uui-box>
              `, w = this._dragFeature === "autoNode" && this._dragIndex === i, x = this._dragFeature === "autoNode" && this._dragOverIndex === i, D = [
        "rule-wrapper",
        w ? "dragging" : "",
        x && this._dragPosition === "before" ? "drop-before" : "",
        x && this._dragPosition === "after" ? "drop-after" : ""
      ].filter(Boolean).join(" "), d = t || !e.enabled;
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
          ?disabled=${t || !e.enabled}
          @click=${() => a({ rules: [...e.rules, B()] })}
        >${this.localize.term("dotseeDiscipline_common_addRuleButton")}</uui-button>
        ` : g}
      </uui-box>
    `;
  }
  _renderNodeRestrictTab(t) {
    const e = this._settings.nodeRestrict, a = (o) => {
      this._patchSettings("nodeRestrict", { ...e, ...o });
    }, s = (o, i) => {
      const l = e.rules.map((p, h) => h === o ? { ...p, ...i } : p);
      a({ rules: l });
    };
    return r`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_nodeRestrict_label")}</h4>
        ${this._renderEnableButton(e.enabled, t, (o) => a({ enabled: o }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_nodeRestrict_description")}
        </p>
        ${e.enabled ? r`
        <div class="grid">
          ${this._withFieldHelp(
      this._textField(
        this.localize.term("dotseeDiscipline_nodeRestrict_propertyAlias"),
        e.propertyAlias,
        t || !e.enabled,
        (o) => a({ propertyAlias: o })
      ),
      "noderestrict-propertyalias-help",
      this.localize.term("dotseeDiscipline_nodeRestrict_propertyAliasHelp")
    )}
          ${this._withFieldHelp(
      this._toggleField(
        this.localize.term("dotseeDiscipline_nodeRestrict_showWarnings"),
        e.showWarnings,
        t || !e.enabled,
        (o) => a({ showWarnings: o })
      ),
      "noderestrict-showwarnings-help",
      this.localize.term("dotseeDiscipline_nodeRestrict_showWarningsHelp"),
      "inline",
      "align-bottom"
    )}
        </div>
        <h4>${this.localize.term("dotseeDiscipline_common_rules")}</h4>
        ${e.rules.length === 0 ? r`<p class="empty">${this.localize.term("dotseeDiscipline_common_noRulesDefined")}</p>` : g}
        ${e.rules.map((o, i) => {
      const l = !o.childDocType || o.childDocType === "*" ? this.localize.term("dotseeDiscipline_common_anyDoctypeLowercase") : o.childDocType, p = o.parentDocType ? `(${o.parentDocType} → ${l})` : "", h = this.localize.term("dotseeDiscipline_common_ruleNumber", i + 1), v = p ? `${h} ${p}` : h, c = this.localize.term("dotseeDiscipline_nodeRestrict_ruleDetailMax", o.maxNodes ?? 0), $ = () => {
        this._removeRuleAndReindex("nodeRestrict", i), a({ rules: e.rules.filter((u, N) => N !== i) });
      }, w = this._isRuleCollapsed("nodeRestrict", i) ? this._renderCollapsedRule("nodeRestrict", i, v, c, t || !e.enabled, $) : r`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader("nodeRestrict", i, t || !e.enabled, $, p || void 0)}
              <div class="grid">
                ${this._withFieldHelp(
        this._docTypeField(
          this.localize.term("dotseeDiscipline_nodeRestrict_parentDoctype"),
          o.parentDocType,
          t || !e.enabled,
          (u) => s(i, { parentDocType: u })
        ),
        `noderestrict-rule-${i}-parent-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_parentDoctypeHelp")
      )}
                ${this._withFieldHelp(
        this._docTypeField(
          this.localize.term("dotseeDiscipline_nodeRestrict_childDoctype"),
          o.childDocType || "*",
          t || !e.enabled,
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
          t || !e.enabled,
          (u) => s(i, { maxNodes: u })
        ),
        `noderestrict-rule-${i}-max-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_maxNodesHelp")
      )}
                ${this._withFieldHelp(
        this._toggleField(
          this.localize.term("dotseeDiscipline_nodeRestrict_showWarnings"),
          o.showWarnings,
          t || !e.enabled,
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
          t || !e.enabled,
          (u) => s(i, { customMessage: u })
        ),
        `noderestrict-rule-${i}-limitmsg-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_customMessageHelp")
      )}
                ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeRestrict_customMessageCategory"),
          o.customMessageCategory,
          t || !e.enabled,
          (u) => s(i, { customMessageCategory: u })
        ),
        `noderestrict-rule-${i}-limitcat-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_customMessageCategoryHelp")
      )}
                ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeRestrict_customWarning"),
          o.customWarningMessage,
          t || !e.enabled,
          (u) => s(i, { customWarningMessage: u })
        ),
        `noderestrict-rule-${i}-warnmsg-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_customWarningHelp")
      )}
                    ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeRestrict_customWarningCategory"),
          o.customWarningMessageCategory,
          t || !e.enabled,
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
      ].filter(Boolean).join(" "), n = t || !e.enabled;
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
              <div class="rule-content">${w}</div>
            </div>
          `;
    })}
        <uui-button
          look="secondary"
          label=${this.localize.term("dotseeDiscipline_common_addRule")}
          ?disabled=${t || !e.enabled}
          @click=${() => a({ rules: [...e.rules, I()] })}
        >${this.localize.term("dotseeDiscipline_common_addRuleButton")}</uui-button>
        ` : g}
      </uui-box>
    `;
  }
  _renderVirtualNodesTab(t) {
    const e = this._settings.virtualNodes, a = (s) => {
      this._patchSettings("virtualNodes", { ...e, ...s });
    };
    return r`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_virtualNodes_label")}</h4>
        ${this._renderEnableButton(e.enabled, t, (s) => a({ enabled: s }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_virtualNodes_description")}
        </p>
        ${e.enabled ? r`
        <div class="grid">
          ${this._withFieldHelp(
      this._multiAliasField(
        this.localize.term("dotseeDiscipline_virtualNodes_doctypes"),
        this._docTypes,
        (e.rules ?? []).join(","),
        t || !e.enabled,
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
  _renderVariantsHiderTab(t) {
    const e = this._settings.variantsHider, a = (s) => {
      this._patchSettings("variantsHider", { ...e, ...s });
    };
    return r`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_variantsHider_label")}</h4>
        ${this._renderEnableButton(e.enabled, t, (s) => a({ enabled: s }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_variantsHider_description")}
        </p>
        ${e.enabled ? r`
        <div class="grid">
          ${this._withFieldHelp(
      this._textField(
        this.localize.term("dotseeDiscipline_variantsHider_caption"),
        e.caption,
        t || !e.enabled,
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
  _renderNodeProtectTab(t) {
    const e = this._settings.nodeProtect, a = (o) => {
      this._patchSettings("nodeProtect", { ...e, ...o });
    }, s = (o, i) => {
      const l = e.rules.map((p, h) => h === o ? { ...p, ...i } : p);
      a({ rules: l });
    };
    return r`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_nodeProtect_label")}</h4>
        ${this._renderEnableButton(e.enabled, t, (o) => a({ enabled: o }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_nodeProtect_description")}
        </p>
        ${e.enabled ? r`
        <div class="grid">
          ${this._withFieldHelp(
      this._propertyField(
        this.localize.term("dotseeDiscipline_nodeProtect_propertyAlias"),
        this._trueFalseProperties,
        e.propertyAlias,
        t || !e.enabled,
        (o) => a({ propertyAlias: o })
      ),
      "nodeprotect-propertyalias-help",
      this.localize.term("dotseeDiscipline_nodeProtect_propertyAliasHelp")
    )}
        </div>
        <h4>${this.localize.term("dotseeDiscipline_common_rules")}</h4>
        ${e.rules.length === 0 ? r`<p class="empty">${this.localize.term("dotseeDiscipline_common_noRulesDefined")}</p>` : g}
        ${e.rules.map((o, i) => {
      const l = o.docTypeAlias ? `(${o.docTypeAlias})` : "", p = this.localize.term("dotseeDiscipline_common_ruleNumber", i + 1), h = l ? `${p} ${l}` : p, v = o.documentGuids ? this.localize.term("dotseeDiscipline_nodeProtect_byGuids") : o.docTypeAlias ? this.localize.term("dotseeDiscipline_nodeProtect_byDoctype") : "", c = () => {
        this._removeRuleAndReindex("nodeProtect", i), a({ rules: e.rules.filter((n, u) => u !== i) });
      }, $ = this._isRuleCollapsed("nodeProtect", i) ? this._renderCollapsedRule("nodeProtect", i, h, v, t || !e.enabled, c) : r`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader("nodeProtect", i, t || !e.enabled, c, l || void 0)}
                  <div class="grid">
                    ${this._withFieldHelp(
        this._docTypeField(
          this.localize.term("dotseeDiscipline_nodeProtect_doctypeAlias"),
          o.docTypeAlias,
          t || !e.enabled,
          (n) => s(i, { docTypeAlias: n })
        ),
        `nodeprotect-rule-${i}-doctype-help`,
        this.localize.term("dotseeDiscipline_nodeProtect_doctypeAliasHelp")
      )}
                    ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeProtect_guids"),
          o.documentGuids,
          t || !e.enabled,
          (n) => s(i, { documentGuids: n })
        ),
        `nodeprotect-rule-${i}-guids-help`,
        this.localize.term("dotseeDiscipline_nodeProtect_guidsHelp")
      )}
                    ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeProtect_customMessage"),
          o.customMessage,
          t || !e.enabled,
          (n) => s(i, { customMessage: n })
        ),
        `nodeprotect-rule-${i}-msg-help`,
        this.localize.term("dotseeDiscipline_nodeProtect_customMessageHelp")
      )}
                    ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeProtect_customMessageCategory"),
          o.customMessageCategory,
          t || !e.enabled,
          (n) => s(i, { customMessageCategory: n })
        ),
        `nodeprotect-rule-${i}-msgcat-help`,
        this.localize.term("dotseeDiscipline_nodeProtect_customMessageCategoryHelp")
      )}
                  </div>
                </uui-box>
              `, w = this._dragFeature === "nodeProtect" && this._dragIndex === i, x = this._dragFeature === "nodeProtect" && this._dragOverIndex === i, D = [
        "rule-wrapper",
        w ? "dragging" : "",
        x && this._dragPosition === "before" ? "drop-before" : "",
        x && this._dragPosition === "after" ? "drop-after" : ""
      ].filter(Boolean).join(" "), d = t || !e.enabled;
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
          ?disabled=${t || !e.enabled}
          @click=${() => a({ rules: [...e.rules, V()] })}
        >${this.localize.term("dotseeDiscipline_common_addRuleButton")}</uui-button>
        ` : g}
      </uui-box>
    `;
  }
  _renderAiSummaryTab(t) {
    const e = this._settings.aiSummary, a = (s) => {
      this._patchSettings("aiSummary", { ...e, ...s });
    };
    return r`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_aiSummary_label")}</h4>
        ${this._renderEnableButton(e.enabled, t, (s) => a({ enabled: s }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_aiSummary_description")}
        </p>
        ${e.enabled ? r`
        <div class="grid">
          ${this._withFieldHelp(
      r`
              <label>
                <span>${this.localize.term("dotseeDiscipline_aiSummary_llm")}</span>
                <uui-select
                  ?disabled=${t || !e.enabled}
                  .options=${[
        { name: "OpenAI", value: "openai", selected: e.llm === "openai" },
        { name: "Gemini", value: "gemini", selected: e.llm === "gemini" }
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
        e.apiKey,
        t || !e.enabled,
        (s) => a({ apiKey: s })
      ),
      "aisummary-apikey-help",
      this.localize.term("dotseeDiscipline_aiSummary_apiKeyHelp")
    )}
          ${this._withFieldHelp(
      this._textField(
        this.localize.term("dotseeDiscipline_aiSummary_model"),
        e.model,
        t || !e.enabled,
        (s) => a({ model: s })
      ),
      "aisummary-model-help",
      this.localize.term("dotseeDiscipline_aiSummary_modelHelp")
    )}
          ${this._withFieldHelp(
      this._numberField(
        this.localize.term("dotseeDiscipline_aiSummary_maxChars"),
        e.maxChars,
        t || !e.enabled,
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
        e.propertyAlias,
        t || !e.enabled,
        (s) => a({ propertyAlias: s })
      ),
      "aisummary-propertyalias-help",
      this.localize.term("dotseeDiscipline_aiSummary_propertyAliasHelp")
    )}
          ${this._withFieldHelp(
      this._propertyField(
        this.localize.term("dotseeDiscipline_aiSummary_toggleProperty"),
        this._trueFalseProperties,
        e.togglePropertyAlias,
        t || !e.enabled,
        (s) => a({ togglePropertyAlias: s })
      ),
      "aisummary-toggleproperty-help",
      this.localize.term("dotseeDiscipline_aiSummary_togglePropertyHelp")
    )}
          ${this._withFieldHelp(
      this._multiAliasField(
        this.localize.term("dotseeDiscipline_aiSummary_doctypes"),
        this._docTypes,
        e.docTypes,
        t || !e.enabled,
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
        e.excludeProperties,
        t || !e.enabled,
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
                .value=${e.tone}
                ?disabled=${t || !e.enabled}
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
  _renderPropertyVersionsTab(t) {
    const e = this._settings.propertyVersions, a = (s) => {
      this._patchSettings("propertyVersions", { ...e, ...s });
    };
    return r`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_propertyVersions_label")}</h4>
        ${this._renderEnableButton(e.enabled, t, (s) => a({ enabled: s }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_propertyVersions_description")}
        </p>
        ${e.enabled ? r`
        <div class="grid">
          ${this._withFieldHelp(
      this._textField(
        this.localize.term("dotseeDiscipline_propertyVersions_nextDictionaryEntry"),
        e.nextVersionButtonCaptionDictionaryEntry,
        t || !e.enabled,
        (s) => a({ nextVersionButtonCaptionDictionaryEntry: s })
      ),
      "propertyversions-next-help",
      this.localize.term("dotseeDiscipline_propertyVersions_nextDictionaryEntryHelp")
    )}
          ${this._withFieldHelp(
      this._textField(
        this.localize.term("dotseeDiscipline_propertyVersions_previousDictionaryEntry"),
        e.previousVersionButtonCaptionDictionaryEntry,
        t || !e.enabled,
        (s) => a({ previousVersionButtonCaptionDictionaryEntry: s })
      ),
      "propertyversions-previous-help",
      this.localize.term("dotseeDiscipline_propertyVersions_previousDictionaryEntryHelp")
    )}
          ${this._withFieldHelp(
      this._textField(
        this.localize.term("dotseeDiscipline_propertyVersions_noVersionsDictionaryEntry"),
        e.noVersionsButtonCaptionDictionaryEntry,
        t || !e.enabled,
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
  _textField(t, e, a, s) {
    return r`
      <label>
        <span>${t}</span>
        <uui-input
          .value=${e ?? ""}
          ?disabled=${a}
          @input=${(o) => s(o.target.value)}
        ></uui-input>
      </label>
    `;
  }
  _docTypeField(t, e, a, s, o) {
    return this._aliasField(t, this._docTypes, e, a, s, o);
  }
  _propertyField(t, e, a, s, o) {
    return this._aliasField(t, e, a, s, o);
  }
  _withFieldHelp(t, e, a, s = "stretch", o) {
    const i = `field-with-help ${s}${o ? ` ${o}` : ""}`;
    return r`
      <div class=${i}>
        ${t}
        <uui-button
          class="help-button"
          look="secondary"
          compact
          label=${this.localize.term("dotseeDiscipline_common_help")}
          popovertarget=${e}
        >
          <umb-icon name="icon-help-alt"></umb-icon>
        </uui-button>
        <uui-popover-container id=${e} placement="top-end">
          <div class="help-bubble">${a}</div>
        </uui-popover-container>
      </div>
    `;
  }
  _multiAliasField(t, e, a, s, o) {
    const i = new Set(
      (a ?? "").split(",").map((d) => d.trim()).filter((d) => d.length > 0)
    ), l = (d, n) => {
      n ? i.add(d) : i.delete(d), o(Array.from(i).join(","));
    }, p = new Set(e.map((d) => d.alias)), h = Array.from(i).filter((d) => !p.has(d)), v = this._expandedFields.has(t), c = this._filterModes.get(t) ?? "all", $ = (d) => {
      d ? this._expandedFields.add(t) : this._expandedFields.delete(t), this.requestUpdate();
    }, w = (d) => {
      this._filterModes.set(t, d), this.requestUpdate();
    }, x = c === "selected" ? e.filter((d) => i.has(d.alias)) : e, D = c === "selected" || c === "all" ? h : [];
    return r`
      <label>
        <span>${t}</span>
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
                        name="filter-${t}"
                        ?disabled=${s}
                        .checked=${c === "all"}
                        @change=${() => w("all")}
                      />
                      <span>${this.localize.term("dotseeDiscipline_common_filterAll")}</span>
                    </label>
                    <label class="checkbox-row">
                      <input
                        type="radio"
                        name="filter-${t}"
                        ?disabled=${s}
                        .checked=${c === "selected"}
                        @change=${() => w("selected")}
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
  _aliasField(t, e, a, s, o, i) {
    const l = a ?? "", p = new Set(e.map((c) => c.alias)), h = (i == null ? void 0 : i.value) ?? "", v = (i == null ? void 0 : i.label) ?? this.localize.term("dotseeDiscipline_common_selectPlaceholder");
    return r`
      <label>
        <span>${t}</span>
        <select
          class="doctype-select"
          ?disabled=${s}
          @change=${(c) => o(c.target.value)}
        >
          <option value=${h} ?selected=${l === h || l === ""}>
            ${v}
          </option>
          ${e.map(
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
  _blueprintField(t, e, a, s, o) {
    const i = a ?? "", l = e ? this._blueprints.filter(
      (c) => c.docTypeAlias.localeCompare(e, void 0, { sensitivity: "accent" }) === 0
    ) : [], p = new Set(l.map((c) => c.name)), h = s || !e, v = e ? l.length === 0 ? this.localize.term("dotseeDiscipline_common_noBlueprintsPlaceholder") : this.localize.term("dotseeDiscipline_common_selectPlaceholder") : this.localize.term("dotseeDiscipline_common_selectDoctypeFirstPlaceholder");
    return r`
      <label>
        <span>${t}</span>
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
  _numberField(t, e, a, s) {
    return r`
      <label>
        <span>${t}</span>
        <uui-input
          .type=${"number"}
          min="0"
          step="1"
          inputmode="numeric"
          .value=${(e == null ? void 0 : e.toString()) ?? "0"}
          ?disabled=${a}
          @input=${(o) => {
      const i = o.target.value, l = i === "" ? 0 : Number(i);
      s(Number.isNaN(l) ? 0 : l);
    }}
        ></uui-input>
      </label>
    `;
  }
  _toggleField(t, e, a, s, o) {
    return r`
      <label class=${`inline${o ? ` ${o}` : ""}`}>
        <uui-toggle
          .checked=${e}
          ?disabled=${a}
          @change=${(i) => s(i.target.checked)}
        ></uui-toggle>
        <span>${t}</span>
      </label>
    `;
  }
};
W(m, "styles", S`
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
], m.prototype, "_loading", 2);
b([
  y()
], m.prototype, "_saving", 2);
b([
  y()
], m.prototype, "_hasAppSettings", 2);
b([
  y()
], m.prototype, "_settings", 2);
b([
  y()
], m.prototype, "_activeTab", 2);
b([
  y()
], m.prototype, "_docTypes", 2);
b([
  y()
], m.prototype, "_trueFalseProperties", 2);
b([
  y()
], m.prototype, "_textContentProperties", 2);
b([
  y()
], m.prototype, "_textInputProperties", 2);
b([
  y()
], m.prototype, "_blueprints", 2);
b([
  y()
], m.prototype, "_expandedFields", 2);
b([
  y()
], m.prototype, "_filterModes", 2);
b([
  y()
], m.prototype, "_collapsedRules", 2);
b([
  y()
], m.prototype, "_dragIndex", 2);
b([
  y()
], m.prototype, "_dragOverIndex", 2);
b([
  y()
], m.prototype, "_dragPosition", 2);
b([
  y()
], m.prototype, "_dragFeature", 2);
m = b([
  H("dotsee-discipline-settings-workspace")
], m);
const Z = m;
export {
  m as DisciplineSettingsWorkspaceElement,
  Z as default
};
//# sourceMappingURL=discipline-settings.workspace.element-CLBrzvuW.js.map
