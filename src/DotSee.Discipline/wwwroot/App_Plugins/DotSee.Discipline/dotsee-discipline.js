var S = Object.defineProperty;
var b = (i, e, t) => e in i ? S(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var a = (i, e, t) => b(i, typeof e != "symbol" ? e + "" : e, t);
function y(i) {
  return {
    type: "entityAction",
    kind: "default",
    alias: "DotSee.Discipline.VariantsHider.ToggleAction",
    name: "Toggle Unset Variants Display",
    weight: 100,
    api: () => import("./toggle-variants.action-BL_Jgn3Z.js"),
    forEntityTypes: ["document-root"],
    meta: {
      icon: "icon-axis-rotation",
      label: i
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content"
      }
    ]
  };
}
const g = [
  "Umb.PropertyEditorUi.TextBox",
  "Umb.PropertyEditorUi.TextArea",
  "Umb.PropertyEditorUi.Tiptap"
], D = [
  {
    type: "propertyAction",
    alias: "DotSee.Discipline.PropertyVersions.PrevVersion",
    name: "Previous Version",
    api: () => import("./prev-version.action--mi3KGhg.js"),
    element: () => import("./version-action.element-BopZLSeP.js"),
    forPropertyEditorUis: g,
    meta: {
      icon: "icon-arrow-left",
      label: "Previous version"
    }
  },
  {
    type: "propertyAction",
    alias: "DotSee.Discipline.PropertyVersions.NextVersion",
    name: "Next Version",
    api: () => import("./next-version.action-ChSpJHum.js"),
    element: () => import("./version-action.element-BopZLSeP.js"),
    forPropertyEditorUis: g,
    meta: {
      icon: "icon-arrow-right",
      label: "Next version"
    }
  }
], T = {
  type: "localization",
  alias: "DotSee.Discipline.VariantsHider.Localization.En",
  name: "DotSee Variants Hider Localization (English)",
  meta: {
    culture: "en"
  },
  js: () => import("./en-B5YfZqhh.js")
}, V = [T];
class E {
  constructor() {
    a(this, "isHidden", !1);
    a(this, "rafId", null);
    a(this, "enabled", !1);
    a(this, "caption", "Toggle unset variants display");
    // Selectors for finding tree items in Umbraco v14+ backoffice
    a(this, "TREE_ITEM_SELECTORS", [
      "umb-tree-item",
      "uui-menu-item",
      '[data-element="tree-item"]',
      '[role="treeitem"]',
      ".umb-tree-item",
      "umb-document-tree-item"
    ].join(", "));
  }
  /**
   * Initialize the service with pre-fetched settings.
   */
  initializeWithSettings(e) {
    this.enabled = e.enabled, this.caption = e.caption, console.log(`[DotSee.Discipline.VariantsHider] Initialized with Enabled: ${this.enabled}, Caption: ${this.caption}`);
  }
  /**
   * @deprecated Use initializeWithSettings instead to avoid duplicate API calls
   */
  async initialize() {
    try {
      const e = await fetch("/umbraco/api/variantshider/settings", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (e.ok) {
        const t = await e.json();
        this.initializeWithSettings({
          enabled: t.enabled === !0 || t.enabled === "true",
          caption: t.caption || this.caption
        });
      }
    } catch (e) {
      console.error("[DotSee.Discipline.VariantsHider] Failed to fetch settings:", e);
    }
  }
  getCaption() {
    return this.caption;
  }
  isEnabled() {
    return this.enabled;
  }
  /**
   * Toggle the visibility of unset variants in the tree.
   */
  toggleVariantsVisibility() {
    console.log("[DotSee.Discipline.VariantsHider] Toggle called, current state:", this.isHidden ? "hidden" : "visible"), this.isHidden ? (this.showUnsetVariants(), this.isHidden = !1, console.log("[DotSee.Discipline.VariantsHider] Variants are now VISIBLE")) : (this.hideUnsetVariants(), this.isHidden = !0, console.log("[DotSee.Discipline.VariantsHider] Variants are now HIDDEN"));
  }
  /**
   * Hide all unset variants and start a requestAnimationFrame loop that
   * continuously scans for newly rendered items. RAF callbacks run before
   * the browser paints, so new items are hidden before they appear on screen.
   */
  hideUnsetVariants() {
    const e = this.processTreeItems(!0);
    this.startRafScan(), console.log(`[DotSee.Discipline.VariantsHider] Processed ${e} items for hiding`);
  }
  /**
   * Stop scanning, show all hidden variants, and reset state.
   */
  showUnsetVariants() {
    this.stopRafScan();
    const e = this.processTreeItems(!1);
    console.log(`[DotSee.Discipline.VariantsHider] Processed ${e} items for showing`);
  }
  // ---------------------------------------------------------------------------
  // requestAnimationFrame scan loop
  // ---------------------------------------------------------------------------
  startRafScan() {
    if (this.rafId !== null) return;
    const e = () => {
      this.processTreeItems(!0), this.rafId = requestAnimationFrame(e);
    };
    this.rafId = requestAnimationFrame(e);
  }
  stopRafScan() {
    this.rafId !== null && (cancelAnimationFrame(this.rafId), this.rafId = null);
  }
  // ---------------------------------------------------------------------------
  // Tree item processing
  // ---------------------------------------------------------------------------
  processTreeItems(e) {
    let t = 0;
    return document.querySelectorAll(this.TREE_ITEM_SELECTORS).forEach((s) => {
      this.processTreeItem(s, e) && t++;
    }), t += this.processShadowRoots(document.body, e), t;
  }
  processShadowRoots(e, t) {
    let n = 0;
    return e.querySelectorAll("*").forEach((o) => {
      o.shadowRoot && (o.shadowRoot.querySelectorAll(this.TREE_ITEM_SELECTORS).forEach((l) => {
        this.processTreeItem(l, t) && n++;
      }), n += this.processShadowRoots(o.shadowRoot, t));
    }), n;
  }
  processTreeItem(e, t) {
    const n = e.hasAttribute("data-dotsee-hidden");
    if (!t)
      return n ? (e.style.display = "", e.removeAttribute("data-dotsee-hidden"), !0) : !1;
    const s = this.getTreeItemName(e);
    if (!s) return !1;
    if (this.isUnsetVariant(s)) {
      if (!n)
        return e.style.display = "none", e.setAttribute("data-dotsee-hidden", ""), !0;
    } else n && (e.style.display = "", e.removeAttribute("data-dotsee-hidden"));
    return !1;
  }
  getTreeItemName(e) {
    var o, u, l, f, m;
    const t = e.getAttribute("label") || e.getAttribute("name");
    if (t) return t.trim();
    const n = [
      '[slot="label"]',
      ".umb-tree-item__label",
      ".uui-menu-item-label",
      "uui-menu-item-label",
      '[part="label"]',
      "span[slot]",
      "a",
      "button span",
      'span:not([slot="icon"])'
    ];
    for (const c of n) {
      const r = e.querySelector(c);
      if ((o = r == null ? void 0 : r.textContent) != null && o.trim())
        return r.textContent.trim();
    }
    if (e.shadowRoot) {
      for (const r of n) {
        const d = e.shadowRoot.querySelector(r);
        if ((u = d == null ? void 0 : d.textContent) != null && u.trim())
          return d.textContent.trim();
      }
      const c = (l = e.shadowRoot.textContent) == null ? void 0 : l.trim();
      if (c) return c;
    }
    const s = (f = e.textContent) == null ? void 0 : f.trim();
    return s ? ((m = s.split(`
`)[0]) == null ? void 0 : m.trim()) || s : "";
  }
  isUnsetVariant(e) {
    const t = e.trim();
    return t.startsWith("(") && t.endsWith(")") && t.length > 2;
  }
  dispose() {
    this.stopRafScan();
  }
}
let p = null;
function I() {
  return p || (p = new E()), p;
}
function A() {
  return p;
}
const h = {
  enabled: !1,
  caption: "Toggle unset variants display"
};
async function w() {
  try {
    const i = await fetch("/umbraco/api/variantshider/settings", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (i.ok) {
      const e = await i.json();
      return {
        enabled: e.enabled === !0 || e.enabled === "true",
        caption: e.caption || h.caption
      };
    }
    return console.warn("[DotSee.Discipline.VariantsHider] Failed to fetch settings, using defaults"), h;
  } catch (i) {
    return console.error("[DotSee.Discipline.VariantsHider] Error fetching settings:", i), h;
  }
}
const v = async (i, e) => {
  console.log("[DotSee.Discipline] Initializing..."), e.registerMany([
    ...D
  ]), console.log("[DotSee.Discipline] Property version actions registered");
  const t = await w();
  if (t.enabled) {
    const n = y(t.caption);
    e.registerMany([
      n,
      ...V
    ]), I().initializeWithSettings(t), console.log("[DotSee.Discipline.VariantsHider] Initialized successfully with caption:", t.caption);
  } else
    console.log("[DotSee.Discipline.VariantsHider] Feature is disabled in configuration");
};
export {
  E as VariantsHiderService,
  A as getVariantsHiderService,
  v as onInit
};
//# sourceMappingURL=dotsee-discipline.js.map
