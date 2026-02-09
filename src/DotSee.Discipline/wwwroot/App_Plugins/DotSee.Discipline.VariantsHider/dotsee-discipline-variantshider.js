var f = Object.defineProperty;
var b = (r, e, t) => e in r ? f(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var c = (r, e, t) => b(r, typeof e != "symbol" ? e + "" : e, t);
function E(r) {
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
      label: r
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content"
      }
    ]
  };
}
const S = {
  type: "localization",
  alias: "DotSee.Discipline.VariantsHider.Localization.En",
  name: "DotSee Variants Hider Localization (English)",
  meta: {
    culture: "en"
  },
  js: () => import("./en-B5YfZqhh.js")
}, y = [S];
class D {
  constructor() {
    c(this, "isHidden", !1);
    c(this, "observer", null);
    c(this, "styleElement", null);
    c(this, "enabled", !1);
    c(this, "caption", "Toggle unset variants display");
    // Selectors for finding tree items in Umbraco v14+ backoffice
    // The backoffice uses web components, so we need to check various possible selectors
    c(this, "TREE_ITEM_SELECTORS", [
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
    this.enabled = e.enabled, this.caption = e.caption, this.enabled && (this.setupMutationObserver(), setTimeout(() => {
      this.hideUnsetVariants(), this.isHidden = !0;
    }, 1e3)), console.log(`[DotSee.Discipline.VariantsHider] Initialized with Enabled: ${this.enabled}, Caption: ${this.caption}`);
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
   * Hide all tree items that represent unset variants.
   * These are identified by having their name wrapped in parentheses.
   */
  hideUnsetVariants() {
    const e = this.processTreeItems(!0);
    this.applyHideStyles(), console.log(`[DotSee.Discipline.VariantsHider] Processed ${e} items for hiding`);
  }
  /**
   * Show all previously hidden unset variant tree items.
   */
  showUnsetVariants() {
    const e = this.processTreeItems(!1);
    this.removeHideStyles(), console.log(`[DotSee.Discipline.VariantsHider] Processed ${e} items for showing`);
  }
  /**
   * Process tree items to show or hide them based on whether they are unset variants.
   * @param hide Whether to hide (true) or show (false) the items
   * @returns The number of items processed
   */
  processTreeItems(e) {
    let t = 0;
    const n = document.querySelectorAll(this.TREE_ITEM_SELECTORS);
    return console.log(`[DotSee.Discipline.VariantsHider] Found ${n.length} tree items with standard selectors`), n.forEach((o) => {
      this.processTreeItem(o, e) && t++;
    }), this.processShadowRoots(document.body, e), this.debugLogTreeStructure(), t;
  }
  /**
   * Debug helper to log the tree structure and help identify correct selectors
   */
  debugLogTreeStructure() {
    console.log("[DotSee.Discipline.VariantsHider] === DEBUG: Scanning tree structure ==="), [
      "umb-backoffice-main",
      "umb-section-sidebar",
      "umb-tree",
      "umb-document-tree",
      '[data-element="tree"]',
      "nav",
      "aside"
    ].forEach((i) => {
      const s = document.querySelectorAll(i);
      s.length > 0 && console.log(`[DEBUG] Found ${s.length} elements matching "${i}"`);
    });
    const t = document.querySelectorAll("*"), n = [];
    t.forEach((i) => {
      var a, l;
      const s = ((a = i.textContent) == null ? void 0 : a.trim()) || "";
      i.children.length < 3 && s.startsWith("(") && s.endsWith(")") && s.length > 2 && s.length < 100 && n.push({
        tag: i.tagName.toLowerCase(),
        text: s.substring(0, 50),
        classes: ((l = i.className) == null ? void 0 : l.toString()) || ""
      });
    }), n.length > 0 ? console.log("[DEBUG] Elements with text in parentheses:", n) : console.log("[DEBUG] No elements found with text in parentheses");
    const o = document.querySelectorAll('umb-tree-item, uui-menu-item, [role="treeitem"]');
    if (console.log(`[DEBUG] Found ${o.length} tree-item-like elements`), o.length > 0) {
      const i = o[0];
      console.log("[DEBUG] Sample tree item:", {
        tagName: i.tagName,
        className: i.className,
        attributes: Array.from(i.attributes).map((s) => `${s.name}="${s.value}"`).join(", "),
        innerHTML: i.innerHTML.substring(0, 200)
      });
    }
  }
  /**
   * Recursively search through shadow DOMs to find tree items.
   */
  processShadowRoots(e, t) {
    e.querySelectorAll("*").forEach((o) => {
      o.shadowRoot && (o.shadowRoot.querySelectorAll(this.TREE_ITEM_SELECTORS).forEach((s) => {
        this.processTreeItem(s, t);
      }), this.processShadowRoots(o.shadowRoot, t));
    });
  }
  /**
   * Process a single tree item to determine if it should be hidden.
   * @param item The tree item element
   * @param hide Whether to hide (true) or show (false) the item
   * @returns True if the item was processed (matched criteria), false otherwise
   */
  processTreeItem(e, t) {
    const n = this.getTreeItemName(e);
    return n && this.isUnsetVariant(n) ? (console.log(`[DotSee.Discipline.VariantsHider] Found unset variant: "${n}"`), t ? (e.classList.add("dotsee-variants-hidden"), e.setAttribute("data-dotsee-hidden", "true"), e.style.display = "none") : (e.classList.remove("dotsee-variants-hidden"), e.removeAttribute("data-dotsee-hidden"), e.style.display = ""), !0) : !1;
  }
  /**
   * Extract the name/label from a tree item element.
   * Tries multiple strategies to find the text.
   */
  getTreeItemName(e) {
    var i, s, a, l, h;
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
    for (const u of n) {
      const d = e.querySelector(u);
      if ((i = d == null ? void 0 : d.textContent) != null && i.trim())
        return d.textContent.trim();
    }
    if (e.shadowRoot) {
      for (const d of n) {
        const m = e.shadowRoot.querySelector(d);
        if ((s = m == null ? void 0 : m.textContent) != null && s.trim())
          return m.textContent.trim();
      }
      const u = (a = e.shadowRoot.textContent) == null ? void 0 : a.trim();
      if (u)
        return u;
    }
    const o = (l = e.textContent) == null ? void 0 : l.trim();
    return o ? ((h = o.split(`
`)[0]) == null ? void 0 : h.trim()) || o : "";
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
   * Set up a MutationObserver to watch for new tree items being added.
   * This ensures dynamically loaded tree items are also processed.
   */
  setupMutationObserver() {
    this.observer || (this.observer = new MutationObserver((e) => {
      if (!this.isHidden) return;
      let t = !1;
      e.forEach((n) => {
        n.addedNodes.forEach((o) => {
          var i, s;
          if (o.nodeType === Node.ELEMENT_NODE) {
            const a = o;
            (i = a.matches) != null && i.call(a, this.TREE_ITEM_SELECTORS) && (this.processTreeItem(a, !0), t = !0);
            const l = (s = a.querySelectorAll) == null ? void 0 : s.call(a, this.TREE_ITEM_SELECTORS);
            l != null && l.length && (l.forEach((h) => {
              this.processTreeItem(h, !0);
            }), t = !0);
          }
        });
      }), t && console.log("[DotSee.Discipline.VariantsHider] Processed newly added tree items");
    }), this.observer.observe(document.body, {
      childList: !0,
      subtree: !0
    }), console.log("[DotSee.Discipline.VariantsHider] MutationObserver started"));
  }
  /**
   * Disconnect the MutationObserver and clean up.
   */
  dispose() {
    this.observer && (this.observer.disconnect(), this.observer = null), this.removeHideStyles();
  }
}
let p = null;
function T() {
  return p || (p = new D()), p;
}
function V() {
  return p;
}
const g = {
  enabled: !1,
  caption: "Toggle unset variants display"
};
async function H() {
  try {
    const r = await fetch("/umbraco/api/variantshider/settings", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (r.ok) {
      const e = await r.json();
      return {
        enabled: e.enabled === !0 || e.enabled === "true",
        caption: e.caption || g.caption
      };
    }
    return console.warn("[DotSee.Discipline.VariantsHider] Failed to fetch settings, using defaults"), g;
  } catch (r) {
    return console.error("[DotSee.Discipline.VariantsHider] Error fetching settings:", r), g;
  }
}
const w = async (r, e) => {
  console.log("[DotSee.Discipline.VariantsHider] Initializing...");
  const t = await H();
  if (t.enabled) {
    const n = E(t.caption);
    e.registerMany([
      n,
      ...y
    ]), T().initializeWithSettings(t), console.log("[DotSee.Discipline.VariantsHider] Initialized successfully with caption:", t.caption);
  } else
    console.log("[DotSee.Discipline.VariantsHider] Feature is disabled in configuration");
};
export {
  D as VariantsHiderService,
  V as getVariantsHiderService,
  w as onInit
};
//# sourceMappingURL=dotsee-discipline-variantshider.js.map
