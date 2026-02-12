var S = Object.defineProperty;
var g = (i, e, t) => e in i ? S(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var r = (i, e, t) => g(i, typeof e != "symbol" ? e + "" : e, t);
function b(i) {
  return {
    type: "entityAction",
    kind: "default",
    alias: "DotSee.Discipline.VariantsHider.ToggleAction",
    name: "Toggle Unset Variants Display",
    weight: 100,
    api: () => import("./toggle-variants.action-CLunlf31.js"),
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
const T = {
  type: "localization",
  alias: "DotSee.Discipline.VariantsHider.Localization.En",
  name: "DotSee Variants Hider Localization (English)",
  meta: {
    culture: "en"
  },
  js: () => import("./en-B5YfZqhh.js")
}, y = [T];
class D {
  constructor() {
    r(this, "isHidden", !1);
    r(this, "rafId", null);
    r(this, "enabled", !1);
    r(this, "caption", "Toggle unset variants display");
    // Selectors for finding tree items in Umbraco v14+ backoffice
    r(this, "TREE_ITEM_SELECTORS", [
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
    return e.querySelectorAll("*").forEach((a) => {
      a.shadowRoot && (a.shadowRoot.querySelectorAll(this.TREE_ITEM_SELECTORS).forEach((l) => {
        this.processTreeItem(l, t) && n++;
      }), n += this.processShadowRoots(a.shadowRoot, t));
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
    var a, h, l, f, m;
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
      const o = e.querySelector(c);
      if ((a = o == null ? void 0 : o.textContent) != null && a.trim())
        return o.textContent.trim();
    }
    if (e.shadowRoot) {
      for (const o of n) {
        const d = e.shadowRoot.querySelector(o);
        if ((h = d == null ? void 0 : d.textContent) != null && h.trim())
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
let u = null;
function I() {
  return u || (u = new D()), u;
}
function w() {
  return u;
}
const p = {
  enabled: !1,
  caption: "Toggle unset variants display"
};
async function V() {
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
        caption: e.caption || p.caption
      };
    }
    return console.warn("[DotSee.Discipline.VariantsHider] Failed to fetch settings, using defaults"), p;
  } catch (i) {
    return console.error("[DotSee.Discipline.VariantsHider] Error fetching settings:", i), p;
  }
}
const H = async (i, e) => {
  console.log("[DotSee.Discipline.VariantsHider] Initializing...");
  const t = await V();
  if (t.enabled) {
    const n = b(t.caption);
    e.registerMany([
      n,
      ...y
    ]), I().initializeWithSettings(t), console.log("[DotSee.Discipline.VariantsHider] Initialized successfully with caption:", t.caption);
  } else
    console.log("[DotSee.Discipline.VariantsHider] Feature is disabled in configuration");
};
export {
  D as VariantsHiderService,
  w as getVariantsHiderService,
  H as onInit
};
//# sourceMappingURL=dotsee-discipline-variantshider.js.map
