var S = Object.defineProperty;
var k = (f, e, t) => e in f ? S(f, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : f[e] = t;
var _ = (f, e, t) => k(f, typeof e != "symbol" ? e + "" : e, t);
import { html as l, nothing as g, css as H, state as y, customElement as P } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as A } from "@umbraco-cms/backoffice/lit-element";
import { UMB_AUTH_CONTEXT as C } from "@umbraco-cms/backoffice/auth";
import { UMB_MODAL_MANAGER_CONTEXT as F, UMB_CONFIRM_MODAL as M } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as E } from "@umbraco-cms/backoffice/notification";
import { D as B, c as I, b as L, d as O } from "./index-CKJyY1Rr.js";
const w = "/umbraco/api/discipline";
class V {
  constructor(e) {
    this.getToken = e;
  }
  async headers(e = {}) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await this.getToken()}`,
      ...e
    };
  }
  async getSettings() {
    const e = await fetch(`${w}/settings`, {
      method: "GET",
      headers: await this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load Discipline settings (${e.status})`);
    return await e.json();
  }
  async saveSettings(e) {
    const t = await fetch(`${w}/settings`, {
      method: "PUT",
      headers: await this.headers(),
      body: JSON.stringify(e)
    });
    if (!t.ok)
      throw new Error(`Failed to save Discipline settings (${t.status})`);
    return await t.json();
  }
  async getDocTypes() {
    const e = await fetch(`${w}/doctypes`, {
      method: "GET",
      headers: await this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load doctypes (${e.status})`);
    return await e.json();
  }
  async getTrueFalseProperties() {
    const e = await fetch(`${w}/properties/truefalse`, {
      method: "GET",
      headers: await this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load true/false properties (${e.status})`);
    return await e.json();
  }
  async getTextContentProperties() {
    const e = await fetch(`${w}/properties/text-content`, {
      method: "GET",
      headers: await this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load text content properties (${e.status})`);
    return await e.json();
  }
  async getTextInputProperties() {
    const e = await fetch(`${w}/properties/text-input`, {
      method: "GET",
      headers: await this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load text input properties (${e.status})`);
    return await e.json();
  }
  async getBlueprints() {
    const e = await fetch(`${w}/blueprints`, {
      method: "GET",
      headers: await this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to load blueprints (${e.status})`);
    return await e.json();
  }
  async getAiSummaryModels(e, t) {
    const a = await fetch(`${w}/aisummary/models`, {
      method: "POST",
      headers: await this.headers(),
      body: JSON.stringify({ llm: e, apiKey: t })
    });
    if (!a.ok) {
      let s = `Failed to load models (${a.status})`;
      try {
        const o = await a.json();
        o && typeof o.message == "string" && (s = o.message);
      } catch {
      }
      throw new Error(s);
    }
    return await a.json();
  }
  async importFromAppSettings() {
    const e = await fetch(`${w}/import-from-appsettings`, {
      method: "POST",
      headers: await this.headers()
    });
    if (!e.ok)
      throw new Error(`Failed to import from appsettings (${e.status})`);
    return await e.json();
  }
}
var N = Object.defineProperty, U = Object.getOwnPropertyDescriptor, K = (f, e, t) => e in f ? N(f, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : f[e] = t, b = (f, e, t, a) => {
  for (var s = a > 1 ? void 0 : a ? U(e, t) : e, o = f.length - 1, i; o >= 0; o--)
    (i = f[o]) && (s = (a ? i(e, t, s) : i(s)) || s);
  return a && s && N(e, t, s), s;
}, W = (f, e, t) => K(f, e + "", t);
const j = [
  { alias: "autoNode", labelKey: "dotseeDiscipline_autoNode_label" },
  { alias: "nodeRestrict", labelKey: "dotseeDiscipline_nodeRestrict_label" },
  { alias: "virtualNodes", labelKey: "dotseeDiscipline_virtualNodes_label" },
  { alias: "variantsHider", labelKey: "dotseeDiscipline_variantsHider_label" },
  { alias: "nodeProtect", labelKey: "dotseeDiscipline_nodeProtect_label" },
  { alias: "aiSummary", labelKey: "dotseeDiscipline_aiSummary_label" },
  { alias: "propertyVersions", labelKey: "dotseeDiscipline_propertyVersions_label" }
];
function R() {
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
let m = class extends A {
  constructor() {
    super(...arguments);
    _(this, "_loading", !0);
    _(this, "_saving", !1);
    _(this, "_hasAppSettings", !1);
    _(this, "_settings", R());
    _(this, "_activeTab", "autoNode");
    _(this, "_docTypes", []);
    _(this, "_trueFalseProperties", []);
    _(this, "_textContentProperties", []);
    _(this, "_textInputProperties", []);
    _(this, "_blueprints", []);
    _(this, "_aiModels", []);
    _(this, "_aiModelsLoading", !1);
    _(this, "_aiModelsError", "");
    // llm|apiKey signature the model list was last loaded for (avoids redundant fetches).
    _(this, "_aiModelsKey", "");
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
    _(this, "_onDocumentMouseDown", (e) => {
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
    const e = await this.getContext(C);
    this._repository = new V(() => e.getLatestToken());
    try {
      const [t, a, s, o, i, r] = await Promise.all([
        this._repository.getSettings(),
        this._repository.getDocTypes().catch(() => []),
        this._repository.getTrueFalseProperties().catch(() => []),
        this._repository.getTextContentProperties().catch(() => []),
        this._repository.getTextInputProperties().catch(() => []),
        this._repository.getBlueprints().catch(() => [])
      ]);
      this._docTypes = a, this._trueFalseProperties = s, this._textContentProperties = o, this._textInputProperties = i, this._blueprints = r, this._applyResponse(t), this._collapseAllRules();
    } catch (t) {
      await this._notify(
        "danger",
        this.localize.term("dotseeDiscipline_settings_loadFailedToast", this._errorMessage(t))
      );
    } finally {
      this._loading = !1, this.requestUpdate();
    }
  }
  _applyResponse(e) {
    this._hasAppSettings = e.hasAppSettings, this._settings = e.settings ?? R(), this._refreshSensitiveSnapshot = this._snapshotRefreshSensitive(this._settings), this.requestUpdate();
  }
  _snapshotRefreshSensitive(e) {
    return JSON.stringify({ variantsHider: e.variantsHider, propertyVersions: e.propertyVersions });
  }
  _errorMessage(e) {
    return e instanceof Error ? e.message : String(e);
  }
  async _notify(e, t) {
    try {
      const a = await this.getContext(E);
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
  _selectTab(e) {
    this._activeTab = e, e === "aiSummary" && this._loadAiModels(), this.requestUpdate();
  }
  // Loads the available model names for the selected LLM + API key into the model dropdown,
  // and defaults the selection to the lower (cheapest) model when nothing valid is selected.
  async _loadAiModels(e = !1) {
    if (!this._repository) return;
    const t = this._settings.aiSummary, a = t.llm || "openai", s = t.apiKey;
    if (!s) {
      this._aiModels = [], this._aiModelsError = "", this._aiModelsKey = "", this.requestUpdate();
      return;
    }
    const o = `${a}|${s}`;
    if (!(!e && o === this._aiModelsKey && this._aiModels.length > 0)) {
      this._aiModelsLoading = !0, this._aiModelsError = "", this.requestUpdate();
      try {
        const i = await this._repository.getAiSummaryModels(a, s);
        this._aiModels = i.models ?? [], this._aiModelsKey = o;
        const r = this._settings.aiSummary.model;
        this._aiModels.length > 0 && !this._aiModels.includes(r) && this._patchSettings("aiSummary", {
          ...this._settings.aiSummary,
          model: i.defaultModel || this._aiModels[0]
        });
      } catch (i) {
        this._aiModels = [], this._aiModelsKey = "", this._aiModelsError = this._errorMessage(i);
      } finally {
        this._aiModelsLoading = !1, this.requestUpdate();
      }
    }
  }
  async _onImportClick() {
    if (!this._hasAppSettings || !this._repository) return;
    const e = await this.getContext(F);
    if (!e) return;
    const t = e.open(this, M, {
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
    if (!this._repository || !this._canSave()) return;
    const e = this._snapshotRefreshSensitive(this._settings) !== this._refreshSensitiveSnapshot;
    try {
      this._saving = !0, this.requestUpdate();
      const t = await this._repository.saveSettings(this._settings);
      this._applyResponse(t), await this._notify("positive", this.localize.term("dotseeDiscipline_settings_savedToast")), e && await this._notify("warning", this.localize.term("dotseeDiscipline_settings_reloadHintToast"));
    } catch (t) {
      await this._notify(
        "danger",
        this.localize.term("dotseeDiscipline_settings_saveFailedToast", this._errorMessage(t))
      );
    } finally {
      this._saving = !1, this.requestUpdate();
    }
  }
  _canSave() {
    return this._settings.useBackoffice ? this._validationErrors().length === 0 : !0;
  }
  _validationErrors() {
    const e = [], t = this._settings, a = (s, ...o) => this.localize.term(s, ...o);
    return t.autoNode.enabled && t.autoNode.rules.forEach((s, o) => {
      s.createdDocTypeAlias || e.push(a("dotseeDiscipline_autoNode_validationCreatedDoctype", o + 1)), s.docTypeAliasToCreate || e.push(a("dotseeDiscipline_autoNode_validationDoctypeToCreate", o + 1)), s.nodeName || e.push(a("dotseeDiscipline_autoNode_validationNodeName", o + 1));
    }), t.nodeRestrict.enabled && t.nodeRestrict.rules.forEach((s, o) => {
      s.parentDocType || e.push(a("dotseeDiscipline_nodeRestrict_validationParentDoctype", o + 1)), (!Number.isFinite(s.maxNodes) || s.maxNodes < 0) && e.push(a("dotseeDiscipline_nodeRestrict_validationMaxNodes", o + 1));
    }), t.nodeProtect.enabled && t.nodeProtect.rules.forEach((s, o) => {
      !s.docTypeAlias && !s.documentGuids && e.push(a("dotseeDiscipline_nodeProtect_validationDoctypeOrGuids", o + 1));
    }), t.virtualNodes.enabled && t.virtualNodes.rules.forEach((s, o) => {
      s || e.push(a("dotseeDiscipline_virtualNodes_validationDoctype", o + 1));
    }), t.aiSummary.enabled && (t.aiSummary.llm || e.push(a("dotseeDiscipline_aiSummary_validationLlm")), t.aiSummary.apiKey || e.push(a("dotseeDiscipline_aiSummary_validationApiKey")), t.aiSummary.model || e.push(a("dotseeDiscipline_aiSummary_validationModel")), t.aiSummary.propertyAlias || e.push(a("dotseeDiscipline_aiSummary_validationPropertyAlias"))), e;
  }
  get _fieldsDisabled() {
    return !this._settings.useBackoffice || this._saving;
  }
  render() {
    const e = this.localize.term("dotseeDiscipline_settings_headline");
    if (this._loading)
      return l`<umb-body-layout headline=${e}>
        <div class="center"><uui-loader></uui-loader></div>
      </umb-body-layout>`;
    const t = this._fieldsDisabled, a = this._settings.useBackoffice;
    return l`
      <umb-body-layout headline=${e}>
        ${this._renderSourceBanner()}
        ${a ? l`
              <div class="tab-bar">
                ${j.map((s) => {
      var r;
      const o = !!((r = this._settings[s.alias]) != null && r.enabled), i = [
        "tab-button",
        this._activeTab === s.alias ? "active" : "",
        o ? "enabled" : ""
      ].filter(Boolean).join(" ");
      return l`
                    <button
                      type="button"
                      class=${i}
                      @click=${() => this._selectTab(s.alias)}
                    >
                      ${o ? l`<umb-icon name="icon-check" class="tab-icon"></umb-icon>` : g}
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
            ` : g}
        ${this._renderFooter()}
      </umb-body-layout>
    `;
  }
  _renderSourceBanner() {
    const e = this.localize.term("dotseeDiscipline_settings_sourceHeadline");
    return this._hasAppSettings ? l`
      <uui-box headline=${e}>
        <div class="banner-row">
          <uui-toggle
            .checked=${this._settings.useBackoffice}
            label=${this.localize.term("dotseeDiscipline_settings_manageFromBackoffice")}
            label-position="right"
            @change=${this._onMasterToggleChange}
          ></uui-toggle>
          <div class="banner-actions">
            ${this._settings.useBackoffice ? l`
                  <uui-button
                    look="primary"
                    color="positive"
                    label=${this.localize.term("dotseeDiscipline_settings_loadFromAppsettings")}
                    ?disabled=${this._saving}
                    @click=${this._onImportClick}
                  ></uui-button>
                ` : g}
            ${this._renderAboutButton()}
          </div>
        </div>
      </uui-box>
    ` : l`
        <uui-box headline=${e}>
          <div class="banner-row">
            <p>${this.localize.term("dotseeDiscipline_settings_noAppsettingsFound")}</p>
            <div class="banner-actions">${this._renderAboutButton()}</div>
          </div>
        </uui-box>
      `;
  }
  _renderAboutButton() {
    return l`
      <uui-button
        look="secondary"
        label=${this.localize.term("dotseeDiscipline_settings_about")}
        @click=${() => this._onAboutClick()}
      >
        ${this.localize.term("dotseeDiscipline_settings_about")}
      </uui-button>
    `;
  }
  async _onAboutClick() {
    const e = await this.getContext(F);
    e == null || e.open(this, B);
  }
  _renderEnableButton(e, t, a) {
    return l`
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
      const i = Number(o.slice(a.length)), r = t.get(i);
      r !== void 0 && s.add(`${a}${r}`);
    }
    this._collapsedRules = s;
  }
  _reorderRules(e, t, a) {
    const s = this._settings[e];
    if (t === a || t < 0 || t >= s.rules.length) return;
    const o = Math.max(0, Math.min(a, s.rules.length - 1));
    if (t === o) return;
    const i = s.rules.slice(), [r] = i.splice(t, 1);
    i.splice(o, 0, r);
    const u = /* @__PURE__ */ new Map(), c = s.rules.map((d, $) => $), [v] = c.splice(t, 1);
    c.splice(o, 0, v), c.forEach((d, $) => u.set(d, $)), this._remapCollapsedRules(e, u), this._patchSettings(e, { ...s, rules: i });
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
    const o = e.currentTarget.getBoundingClientRect(), i = o.top + o.height / 2, r = e.clientY < i ? "before" : "after";
    (this._dragOverIndex !== a || this._dragPosition !== r) && (this._dragOverIndex = a, this._dragPosition = r, this.requestUpdate());
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
    return l`
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
    const i = this._isRuleCollapsed(e, t), r = this.localize.term("dotseeDiscipline_common_remove");
    return l`
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
          ${o ? l`<span class="rule-suffix">${o}</span>` : g}
        </button>
        <uui-button
          look="secondary"
          color="danger"
          label=${r}
          ?disabled=${a}
          @click=${s}
        >${r}</uui-button>
      </div>
    `;
  }
  _renderFooter() {
    const e = this._validationErrors();
    return l`
      <div slot="footer" class="footer">
        ${e.length > 0 && this._settings.useBackoffice ? l`<ul class="errors">
              ${e.map((t) => l`<li>${t}</li>`)}
            </ul>` : g}
        <uui-button
          look="primary"
          color="positive"
          label=${this.localize.term("dotseeDiscipline_common_save")}
          ?disabled=${!this._canSave()}
          @click=${this._onSaveClick}
        >
          ${this._saving ? l`<uui-loader></uui-loader>` : this.localize.term("dotseeDiscipline_common_save")}
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
      const r = t.rules.map((u, c) => c === o ? { ...u, ...i } : u);
      a({ rules: r });
    };
    return l`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_autoNode_label")}</h4>
        ${this._renderEnableButton(t.enabled, e, (o) => a({ enabled: o }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_autoNode_description")}
        </p>
        ${t.enabled ? l`
        <div class="grid">
          ${this._withFieldHelp(
      l`
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
      l`
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
        ${t.rules.length === 0 ? l`<p class="empty">${this.localize.term("dotseeDiscipline_common_noRulesDefined")}</p>` : g}
        ${t.rules.map((o, i) => {
      const r = o.createdDocTypeAlias && o.docTypeAliasToCreate ? `(${o.createdDocTypeAlias} → ${o.docTypeAliasToCreate})` : "", u = this.localize.term("dotseeDiscipline_common_ruleNumber", i + 1), c = r ? `${u} ${r}` : u, v = o.nodeName ?? "", d = () => {
        this._removeRuleAndReindex("autoNode", i), a({ rules: t.rules.filter((n, h) => h !== i) });
      }, $ = this._isRuleCollapsed("autoNode", i) ? this._renderCollapsedRule("autoNode", i, c, v, e || !t.enabled, d) : l`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader("autoNode", i, e || !t.enabled, d, r || void 0)}
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
      ].filter(Boolean).join(" "), p = e || !t.enabled;
      return l`
            <div
              class=${D}
              @dragover=${(n) => this._onRuleDragOver(n, "autoNode", i)}
              @dragleave=${() => this._onRuleDragLeave("autoNode", i)}
              @drop=${(n) => this._onRuleDrop(n, "autoNode", i)}
            >
              <span
                class="drag-handle"
                draggable=${p ? "false" : "true"}
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
          @click=${() => a({ rules: [...t.rules, I()] })}
        >${this.localize.term("dotseeDiscipline_common_addRuleButton")}</uui-button>
        ` : g}
      </uui-box>
    `;
  }
  _renderNodeRestrictTab(e) {
    const t = this._settings.nodeRestrict, a = (o) => {
      this._patchSettings("nodeRestrict", { ...t, ...o });
    }, s = (o, i) => {
      const r = t.rules.map((u, c) => c === o ? { ...u, ...i } : u);
      a({ rules: r });
    };
    return l`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_nodeRestrict_label")}</h4>
        ${this._renderEnableButton(t.enabled, e, (o) => a({ enabled: o }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_nodeRestrict_description")}
        </p>
        ${t.enabled ? l`
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
        ${t.rules.length === 0 ? l`<p class="empty">${this.localize.term("dotseeDiscipline_common_noRulesDefined")}</p>` : g}
        ${t.rules.map((o, i) => {
      const r = !o.childDocType || o.childDocType === "*" ? this.localize.term("dotseeDiscipline_common_anyDoctypeLowercase") : o.childDocType, u = o.parentDocType ? `(${o.parentDocType} → ${r})` : "", c = this.localize.term("dotseeDiscipline_common_ruleNumber", i + 1), v = u ? `${c} ${u}` : c, d = this.localize.term("dotseeDiscipline_nodeRestrict_ruleDetailMax", o.maxNodes ?? 0), $ = () => {
        this._removeRuleAndReindex("nodeRestrict", i), a({ rules: t.rules.filter((h, T) => T !== i) });
      }, z = this._isRuleCollapsed("nodeRestrict", i) ? this._renderCollapsedRule("nodeRestrict", i, v, d, e || !t.enabled, $) : l`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader("nodeRestrict", i, e || !t.enabled, $, u || void 0)}
              <div class="grid">
                ${this._withFieldHelp(
        this._docTypeField(
          this.localize.term("dotseeDiscipline_nodeRestrict_parentDoctype"),
          o.parentDocType,
          e || !t.enabled,
          (h) => s(i, { parentDocType: h })
        ),
        `noderestrict-rule-${i}-parent-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_parentDoctypeHelp")
      )}
                ${this._withFieldHelp(
        this._docTypeField(
          this.localize.term("dotseeDiscipline_nodeRestrict_childDoctype"),
          o.childDocType || "*",
          e || !t.enabled,
          (h) => s(i, { childDocType: h }),
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
          (h) => s(i, { maxNodes: h })
        ),
        `noderestrict-rule-${i}-max-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_maxNodesHelp")
      )}
                ${this._withFieldHelp(
        this._toggleField(
          this.localize.term("dotseeDiscipline_nodeRestrict_showWarnings"),
          o.showWarnings,
          e || !t.enabled,
          (h) => s(i, { showWarnings: h })
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
          (h) => s(i, { customMessage: h })
        ),
        `noderestrict-rule-${i}-limitmsg-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_customMessageHelp")
      )}
                ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeRestrict_customMessageCategory"),
          o.customMessageCategory,
          e || !t.enabled,
          (h) => s(i, { customMessageCategory: h })
        ),
        `noderestrict-rule-${i}-limitcat-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_customMessageCategoryHelp")
      )}
                ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeRestrict_customWarning"),
          o.customWarningMessage,
          e || !t.enabled,
          (h) => s(i, { customWarningMessage: h })
        ),
        `noderestrict-rule-${i}-warnmsg-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_customWarningHelp")
      )}
                    ${this._withFieldHelp(
        this._textField(
          this.localize.term("dotseeDiscipline_nodeRestrict_customWarningCategory"),
          o.customWarningMessageCategory,
          e || !t.enabled,
          (h) => s(i, { customWarningMessageCategory: h })
        ),
        `noderestrict-rule-${i}-warncat-help`,
        this.localize.term("dotseeDiscipline_nodeRestrict_customWarningCategoryHelp")
      )}
                  </div>
                </uui-box>
              `, x = this._dragFeature === "nodeRestrict" && this._dragIndex === i, D = this._dragFeature === "nodeRestrict" && this._dragOverIndex === i, p = [
        "rule-wrapper",
        x ? "dragging" : "",
        D && this._dragPosition === "before" ? "drop-before" : "",
        D && this._dragPosition === "after" ? "drop-after" : ""
      ].filter(Boolean).join(" "), n = e || !t.enabled;
      return l`
            <div
              class=${p}
              @dragover=${(h) => this._onRuleDragOver(h, "nodeRestrict", i)}
              @dragleave=${() => this._onRuleDragLeave("nodeRestrict", i)}
              @drop=${(h) => this._onRuleDrop(h, "nodeRestrict", i)}
            >
              <span
                class="drag-handle"
                draggable=${n ? "false" : "true"}
                aria-label=${this.localize.term("dotseeDiscipline_common_dragToReorder")}
                title=${this.localize.term("dotseeDiscipline_common_dragToReorder")}
                @dragstart=${(h) => this._onRuleDragStart(h, "nodeRestrict", i)}
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
          @click=${() => a({ rules: [...t.rules, L()] })}
        >${this.localize.term("dotseeDiscipline_common_addRuleButton")}</uui-button>
        ` : g}
      </uui-box>
    `;
  }
  _renderVirtualNodesTab(e) {
    const t = this._settings.virtualNodes, a = (s) => {
      this._patchSettings("virtualNodes", { ...t, ...s });
    };
    return l`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_virtualNodes_label")}</h4>
        ${this._renderEnableButton(t.enabled, e, (s) => a({ enabled: s }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_virtualNodes_description")}
        </p>
        ${t.enabled ? l`
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
    return l`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_variantsHider_label")}</h4>
        ${this._renderEnableButton(t.enabled, e, (s) => a({ enabled: s }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_variantsHider_description")}
        </p>
        ${t.enabled ? l`
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
      const r = t.rules.map((u, c) => c === o ? { ...u, ...i } : u);
      a({ rules: r });
    };
    return l`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_nodeProtect_label")}</h4>
        ${this._renderEnableButton(t.enabled, e, (o) => a({ enabled: o }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_nodeProtect_description")}
        </p>
        ${t.enabled ? l`
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
        ${t.rules.length === 0 ? l`<p class="empty">${this.localize.term("dotseeDiscipline_common_noRulesDefined")}</p>` : g}
        ${t.rules.map((o, i) => {
      const r = o.docTypeAlias ? `(${o.docTypeAlias})` : "", u = this.localize.term("dotseeDiscipline_common_ruleNumber", i + 1), c = r ? `${u} ${r}` : u, v = o.documentGuids ? this.localize.term("dotseeDiscipline_nodeProtect_byGuids") : o.docTypeAlias ? this.localize.term("dotseeDiscipline_nodeProtect_byDoctype") : "", d = () => {
        this._removeRuleAndReindex("nodeProtect", i), a({ rules: t.rules.filter((n, h) => h !== i) });
      }, $ = this._isRuleCollapsed("nodeProtect", i) ? this._renderCollapsedRule("nodeProtect", i, c, v, e || !t.enabled, d) : l`
                <uui-box class="rule-card">
                  ${this._renderRuleHeader("nodeProtect", i, e || !t.enabled, d, r || void 0)}
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
      ].filter(Boolean).join(" "), p = e || !t.enabled;
      return l`
            <div
              class=${D}
              @dragover=${(n) => this._onRuleDragOver(n, "nodeProtect", i)}
              @dragleave=${() => this._onRuleDragLeave("nodeProtect", i)}
              @drop=${(n) => this._onRuleDrop(n, "nodeProtect", i)}
            >
              <span
                class="drag-handle"
                draggable=${p ? "false" : "true"}
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
          @click=${() => a({ rules: [...t.rules, O()] })}
        >${this.localize.term("dotseeDiscipline_common_addRuleButton")}</uui-button>
        ` : g}
      </uui-box>
    `;
  }
  _aiModelField(e, t, a) {
    const s = [...this._aiModels];
    e.model && !s.includes(e.model) && s.unshift(e.model);
    const o = s.map((c) => ({ name: c, value: c, selected: c === e.model }));
    let i = "", r = !1;
    this._aiModelsLoading ? i = "" : this._aiModelsError ? (i = this._aiModelsError, r = !0) : e.apiKey ? this._aiModels.length === 0 && (i = this.localize.term("dotseeDiscipline_aiSummary_modelEmpty")) : i = this.localize.term("dotseeDiscipline_aiSummary_modelNoKey");
    const u = i ? "flex:0 1 280px; min-width:0;" : "flex:0 0 auto; width:auto; min-width:fit-content;";
    return l`
      <label>
        <span>${this.localize.term("dotseeDiscipline_aiSummary_model")}</span>
        <div style="display:flex; gap:0.5rem; align-items:center; width:100%;">
          <uui-select
            style=${u}
            ?disabled=${a || this._aiModelsLoading || o.length === 0}
            .options=${o}
            @change=${(c) => t(c.target.value)}
          ></uui-select>
          <uui-button
            look="secondary"
            label=${this.localize.term("dotseeDiscipline_aiSummary_modelRefresh")}
            ?disabled=${a || this._aiModelsLoading || !e.apiKey}
            @click=${() => this._loadAiModels(!0)}
          >
            ${this._aiModelsLoading ? l`<uui-loader></uui-loader>` : this.localize.term("dotseeDiscipline_aiSummary_modelRefresh")}
          </uui-button>
          ${i ? l`<small
                title=${i}
                style="flex:1 1 0; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:${r ? "var(--uui-color-danger, #d42054)" : "var(--uui-color-text-alt, #666)"};"
                >${i}</small
              >` : g}
        </div>
      </label>
    `;
  }
  _renderAiSummaryTab(e) {
    const t = this._settings.aiSummary, a = (s) => {
      this._patchSettings("aiSummary", { ...t, ...s });
    };
    return l`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_aiSummary_label")}</h4>
        ${this._renderEnableButton(t.enabled, e, (s) => a({ enabled: s }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_aiSummary_description")}
        </p>
        ${t.enabled ? l`
        <div class="grid">
          ${this._withFieldHelp(
      l`
              <label>
                <span>${this.localize.term("dotseeDiscipline_aiSummary_llm")}</span>
                <uui-select
                  ?disabled=${e || !t.enabled}
                  .options=${[
        { name: "OpenAI", value: "openai", selected: t.llm === "openai" },
        { name: "Gemini", value: "gemini", selected: t.llm === "gemini" }
      ]}
                  @change=${(s) => {
        a({ llm: s.target.value }), this._loadAiModels(!0);
      }}
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
      this._aiModelField(t, (s) => a({ model: s }), e || !t.enabled),
      "aisummary-model-help",
      this.localize.term("dotseeDiscipline_aiSummary_modelHelp"),
      "stretch",
      "span-all"
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
      l`
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
    return l`
      <uui-box>
        <h4 slot="headline" class="uui-h4">${this.localize.term("dotseeDiscipline_propertyVersions_label")}</h4>
        ${this._renderEnableButton(t.enabled, e, (s) => a({ enabled: s }))}
        <p class="feature-description no-divider">
          ${this.localize.term("dotseeDiscipline_propertyVersions_description")}
        </p>
        ${t.enabled ? l`
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
    return l`
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
    return l`
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
      (a ?? "").split(",").map((p) => p.trim()).filter((p) => p.length > 0)
    ), r = (p, n) => {
      n ? i.add(p) : i.delete(p), o(Array.from(i).join(","));
    }, u = new Set(t.map((p) => p.alias)), c = Array.from(i).filter((p) => !u.has(p)), v = this._expandedFields.has(e), d = this._filterModes.get(e) ?? "all", $ = (p) => {
      p ? this._expandedFields.add(e) : this._expandedFields.delete(e), this.requestUpdate();
    }, z = (p) => {
      this._filterModes.set(e, p), this.requestUpdate();
    }, x = d === "selected" ? t.filter((p) => i.has(p.alias)) : t, D = d === "selected" || d === "all" ? c : [];
    return l`
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
            ${v ? l`
                  <div class="multi-filter">
                    <label class="checkbox-row">
                      <input
                        type="radio"
                        name="filter-${e}"
                        ?disabled=${s}
                        .checked=${d === "all"}
                        @change=${() => z("all")}
                      />
                      <span>${this.localize.term("dotseeDiscipline_common_filterAll")}</span>
                    </label>
                    <label class="checkbox-row">
                      <input
                        type="radio"
                        name="filter-${e}"
                        ?disabled=${s}
                        .checked=${d === "selected"}
                        @change=${() => z("selected")}
                      />
                      <span>${this.localize.term("dotseeDiscipline_common_filterSelectedOnly")}</span>
                    </label>
                  </div>
                ` : g}
          </div>
          ${v ? l`
                <div class="checkbox-list">
                  ${x.length === 0 && D.length === 0 ? l`<p class="empty">${this.localize.term("dotseeDiscipline_common_noEntries")}</p>` : g}
                  ${x.map(
      (p) => l`
                      <label class="checkbox-row">
                        <input
                          type="checkbox"
                          ?disabled=${s}
                          .checked=${i.has(p.alias)}
                          @change=${(n) => r(p.alias, n.target.checked)}
                        />
                        <span>${p.name} (${p.alias})</span>
                      </label>
                    `
    )}
                  ${D.map(
      (p) => l`
                      <label class="checkbox-row">
                        <input
                          type="checkbox"
                          ?disabled=${s}
                          checked
                          @change=${(n) => r(p, n.target.checked)}
                        />
                        <span>${p} (${this.localize.term("dotseeDiscipline_common_notFoundSuffix")})</span>
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
    const r = a ?? "", u = new Set(t.map((d) => d.alias)), c = (i == null ? void 0 : i.value) ?? "", v = (i == null ? void 0 : i.label) ?? this.localize.term("dotseeDiscipline_common_selectPlaceholder");
    return l`
      <label>
        <span>${e}</span>
        <select
          class="doctype-select"
          ?disabled=${s}
          @change=${(d) => o(d.target.value)}
        >
          <option value=${c} ?selected=${r === c || r === ""}>
            ${v}
          </option>
          ${t.map(
      (d) => l`
              <option value=${d.alias} ?selected=${d.alias === r}>
                ${d.name} (${d.alias})
              </option>
            `
    )}
          ${r && r !== c && !u.has(r) ? l`<option value=${r} selected>${r} (${this.localize.term("dotseeDiscipline_common_notFoundSuffix")})</option>` : g}
        </select>
      </label>
    `;
  }
  _blueprintField(e, t, a, s, o) {
    const i = a ?? "", r = t ? this._blueprints.filter(
      (d) => d.docTypeAlias.localeCompare(t, void 0, { sensitivity: "accent" }) === 0
    ) : [], u = new Set(r.map((d) => d.name)), c = s || !t, v = t ? r.length === 0 ? this.localize.term("dotseeDiscipline_common_noBlueprintsPlaceholder") : this.localize.term("dotseeDiscipline_common_selectPlaceholder") : this.localize.term("dotseeDiscipline_common_selectDoctypeFirstPlaceholder");
    return l`
      <label>
        <span>${e}</span>
        <select
          class="doctype-select"
          ?disabled=${c}
          @change=${(d) => o(d.target.value)}
        >
          <option value="" ?selected=${i === ""}>${v}</option>
          ${r.map(
      (d) => l`
              <option value=${d.name} ?selected=${d.name === i}>${d.name}</option>
            `
    )}
          ${i && !u.has(i) ? l`<option value=${i} selected>${i} (${this.localize.term("dotseeDiscipline_common_notFoundSuffix")})</option>` : g}
        </select>
      </label>
    `;
  }
  _numberField(e, t, a, s) {
    return l`
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
      const i = o.target.value, r = i === "" ? 0 : Number(i);
      s(Number.isNaN(r) ? 0 : r);
    }}
        ></uui-input>
      </label>
    `;
  }
  _toggleField(e, t, a, s, o) {
    return l`
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
W(m, "styles", H`
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
    .banner-actions {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3, 12px);
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
    .span-all {
      grid-column: 1 / -1;
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
], m.prototype, "_aiModels", 2);
b([
  y()
], m.prototype, "_aiModelsLoading", 2);
b([
  y()
], m.prototype, "_aiModelsError", 2);
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
  P("dotsee-discipline-settings-workspace")
], m);
const ee = m;
export {
  m as DisciplineSettingsWorkspaceElement,
  ee as default
};
//# sourceMappingURL=discipline-settings.workspace.element-CDEF3i5l.js.map
