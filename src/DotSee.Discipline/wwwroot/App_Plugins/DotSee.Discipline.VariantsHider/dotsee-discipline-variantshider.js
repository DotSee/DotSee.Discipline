var y = Object.defineProperty;
var S = (i, e, t) => e in i ? y(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var o = (i, e, t) => S(i, typeof e != "symbol" ? e + "" : e, t);
function g(i) {
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
const b = {
  type: "localization",
  alias: "DotSee.Discipline.VariantsHider.Localization.En",
  name: "DotSee Variants Hider Localization (English)",
  meta: {
    culture: "en"
  },
  js: () => import("./en-B5YfZqhh.js")
}, E = [b];
class T {
  constructor() {
    o(this, "isHidden", !1);
    o(this, "scanInterval", null);
    o(this, "styleElement", null);
    o(this, "enabled", !1);
    o(this, "caption", "Toggle unset variants display");
    // Selectors for finding tree items in Umbraco v14+ backoffice
    // The backoffice uses web components, so we need to check various possible selectors
    o(this, "TREE_ITEM_SELECTORS", [
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
   * This is the preferred method as it avoids a duplicate API call.
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
        headers: {
          "Content-Type": "application/json"
        }
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
  /**
   * Get the current caption for the toggle action.
   */
  getCaption() {
    return this.caption;
  }
  /**
   * Check if the service is enabled.
   */
  isEnabled() {
    return this.enabled;
  }
  /**
   * Toggle the visibility of unset variants in the tree.
   * This will always work regardless of the 'enabled' configuration -
   * 'enabled' only controls whether auto-hide happens on load.
   */
  toggleVariantsVisibility() {
    console.log("[DotSee.Discipline.VariantsHider] Toggle called, current state:", this.isHidden ? "hidden" : "visible"), this.isHidden ? (this.showUnsetVariants(), this.isHidden = !1, console.log("[DotSee.Discipline.VariantsHider] Variants are now VISIBLE")) : (this.hideUnsetVariants(), this.isHidden = !0, console.log("[DotSee.Discipline.VariantsHider] Variants are now HIDDEN"));
  }
  /**
   * Hide all tree items that represent unset variants and start a periodic
   * scan to catch items rendered later (e.g. when expanding tree nodes).
   */
  hideUnsetVariants() {
    const e = this.processTreeItems(!0);
    this.applyHideStyles(), this.startPeriodicScan(), console.log(`[DotSee.Discipline.VariantsHider] Processed ${e} items for hiding`);
  }
  /**
   * Show all previously hidden unset variant tree items and stop scanning.
   */
  showUnsetVariants() {
    this.stopPeriodicScan();
    const e = this.processTreeItems(!1);
    this.removeHideStyles(), console.log(`[DotSee.Discipline.VariantsHider] Processed ${e} items for showing`);
  }
  /**
   * Start a periodic scan that catches tree items rendered after the initial hide
   * (e.g. when expanding collapsed tree nodes). Scans every 500ms while hiding is active.
   */
  startPeriodicScan() {
    this.scanInterval || (this.scanInterval = setInterval(() => {
      this.processTreeItems(!0), this.applyHideStyles();
    }, 500));
  }
  /**
   * Stop the periodic scan.
   */
  stopPeriodicScan() {
    this.scanInterval && (clearInterval(this.scanInterval), this.scanInterval = null);
  }
  /**
   * Process tree items to show or hide them based on whether they are unset variants.
   * @param hide Whether to hide (true) or show (false) the items
   * @returns The number of items processed
   */
  processTreeItems(e) {
    let t = 0;
    return document.querySelectorAll(this.TREE_ITEM_SELECTORS).forEach((s) => {
      this.processTreeItem(s, e) && t++;
    }), t += this.processShadowRoots(document.body, e), t;
  }
  /**
   * Recursively search through shadow DOMs to find tree items.
   * @returns The number of items processed
   */
  processShadowRoots(e, t) {
    let n = 0;
    return e.querySelectorAll("*").forEach((a) => {
      a.shadowRoot && (a.shadowRoot.querySelectorAll(this.TREE_ITEM_SELECTORS).forEach((c) => {
        this.processTreeItem(c, t) && n++;
      }), n += this.processShadowRoots(a.shadowRoot, t));
    }), n;
  }
  /**
   * Process a single tree item to determine if it should be hidden.
   * @param item The tree item element
   * @param hide Whether to hide (true) or show (false) the item
   * @returns True if the item was processed (matched criteria), false otherwise
   */
  processTreeItem(e, t) {
    const n = this.getTreeItemName(e);
    return n && this.isUnsetVariant(n) ? (t ? (e.classList.add("dotsee-variants-hidden"), e.setAttribute("data-dotsee-hidden", "true"), e.style.display = "none") : (e.classList.remove("dotsee-variants-hidden"), e.removeAttribute("data-dotsee-hidden"), e.style.display = ""), !0) : !1;
  }
  /**
   * Extract the name/label from a tree item element.
   * Tries multiple strategies to find the text.
   */
  getTreeItemName(e) {
    var a, u, c, m, f;
    const t = e.getAttribute("label") || e.getAttribute("name");
    if (t)
      return t.trim();
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
    for (const l of n) {
      const r = e.querySelector(l);
      if ((a = r == null ? void 0 : r.textContent) != null && a.trim())
        return r.textContent.trim();
    }
    if (e.shadowRoot) {
      for (const r of n) {
        const d = e.shadowRoot.querySelector(r);
        if ((u = d == null ? void 0 : d.textContent) != null && u.trim())
          return d.textContent.trim();
      }
      const l = (c = e.shadowRoot.textContent) == null ? void 0 : c.trim();
      if (l)
        return l;
    }
    const s = (m = e.textContent) == null ? void 0 : m.trim();
    return s ? ((f = s.split(`
`)[0]) == null ? void 0 : f.trim()) || s : "";
  }
  /**
   * Check if a name represents an unset variant (wrapped in parentheses).
   * @param name The name to check
   * @returns True if the name represents an unset variant
   */
  isUnsetVariant(e) {
    const t = e.trim();
    return t.startsWith("(") && t.endsWith(")") && t.length > 2;
  }
  /**
   * Apply CSS styles to hide the marked tree items.
   */
  applyHideStyles() {
    this.styleElement || (this.styleElement = document.createElement("style"), this.styleElement.id = "dotsee-variants-hider-styles", this.styleElement.textContent = `
      .dotsee-variants-hidden,
      [data-dotsee-hidden="true"] {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
      }
    `, document.head.appendChild(this.styleElement));
  }
  /**
   * Remove the CSS styles that hide tree items.
   */
  removeHideStyles() {
    this.styleElement && (this.styleElement.remove(), this.styleElement = null), document.querySelectorAll("[data-dotsee-hidden]").forEach((e) => {
      e.style.display = "";
    });
  }
  /**
   * Clean up all resources.
   */
  dispose() {
    this.stopPeriodicScan(), this.removeHideStyles();
  }
}
let h = null;
function D() {
  return h || (h = new T()), h;
}
function I() {
  return h;
}
const p = {
  enabled: !1,
  caption: "Toggle unset variants display"
};
async function v() {
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
const V = async (i, e) => {
  console.log("[DotSee.Discipline.VariantsHider] Initializing...");
  const t = await v();
  if (t.enabled) {
    const n = g(t.caption);
    e.registerMany([
      n,
      ...E
    ]), D().initializeWithSettings(t), console.log("[DotSee.Discipline.VariantsHider] Initialized successfully with caption:", t.caption);
  } else
    console.log("[DotSee.Discipline.VariantsHider] Feature is disabled in configuration");
};
export {
  T as VariantsHiderService,
  I as getVariantsHiderService,
  V as onInit
};
//# sourceMappingURL=dotsee-discipline-variantshider.js.map
