var y = Object.defineProperty;
var E = (i, e, t) => e in i ? y(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var a = (i, e, t) => E(i, typeof e != "symbol" ? e + "" : e, t);
function D(i) {
  return {
    type: "entityAction",
    kind: "default",
    alias: "DotSee.Discipline.VariantsHider.ToggleAction",
    name: "Toggle Unset Variants Display",
    weight: 100,
    api: () => import("./toggle-variants.action-Bf7Fvx01.js"),
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
const V = [
  "Umb.PropertyEditorUi.TextBox",
  "Umb.PropertyEditorUi.TextArea",
  "Umb.PropertyEditorUi.Tiptap"
], T = "Previous version", C = "Next version";
function I(i) {
  return [
    {
      type: "propertyAction",
      alias: "DotSee.Discipline.PropertyVersions.PrevVersion",
      name: "Previous Version",
      api: () => import("./prev-version.action-CGZ-BXtI.js"),
      element: () => import("./version-action.element-BopZLSeP.js"),
      forPropertyEditorUis: V,
      meta: {
        icon: "icon-arrow-left",
        label: i.previousVersionCaption ?? T
      }
    },
    {
      type: "propertyAction",
      alias: "DotSee.Discipline.PropertyVersions.NextVersion",
      name: "Next Version",
      api: () => import("./next-version.action-ChSpJHum.js"),
      element: () => import("./version-action.element-BopZLSeP.js"),
      forPropertyEditorUis: V,
      meta: {
        icon: "icon-arrow-right",
        label: i.nextVersionCaption ?? C
      }
    }
  ];
}
const v = {
  type: "localization",
  alias: "DotSee.Discipline.VariantsHider.Localization.En",
  name: "DotSee Variants Hider Localization (English)",
  meta: {
    culture: "en"
  },
  js: () => import("./en-B5YfZqhh.js")
}, w = [v];
class A {
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
    return document.querySelectorAll(this.TREE_ITEM_SELECTORS).forEach((o) => {
      this.processTreeItem(o, e) && t++;
    }), t += this.processShadowRoots(document.body, e), t;
  }
  processShadowRoots(e, t) {
    let n = 0;
    return e.querySelectorAll("*").forEach((s) => {
      s.shadowRoot && (s.shadowRoot.querySelectorAll(this.TREE_ITEM_SELECTORS).forEach((c) => {
        this.processTreeItem(c, t) && n++;
      }), n += this.processShadowRoots(s.shadowRoot, t));
    }), n;
  }
  processTreeItem(e, t) {
    const n = e.hasAttribute("data-dotsee-hidden");
    if (!t)
      return n ? (e.style.display = "", e.removeAttribute("data-dotsee-hidden"), !0) : !1;
    const o = this.getTreeItemName(e);
    if (!o) return !1;
    if (this.isUnsetVariant(o)) {
      if (!n)
        return e.style.display = "none", e.setAttribute("data-dotsee-hidden", ""), !0;
    } else n && (e.style.display = "", e.removeAttribute("data-dotsee-hidden"));
    return !1;
  }
  getTreeItemName(e) {
    var s, u, c, f, m;
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
    for (const l of n) {
      const r = e.querySelector(l);
      if ((s = r == null ? void 0 : r.textContent) != null && s.trim())
        return r.textContent.trim();
    }
    if (e.shadowRoot) {
      for (const r of n) {
        const d = e.shadowRoot.querySelector(r);
        if ((u = d == null ? void 0 : d.textContent) != null && u.trim())
          return d.textContent.trim();
      }
      const l = (c = e.shadowRoot.textContent) == null ? void 0 : c.trim();
      if (l) return l;
    }
    const o = (f = e.textContent) == null ? void 0 : f.trim();
    return o ? ((m = o.split(`
`)[0]) == null ? void 0 : m.trim()) || o : "";
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
function H() {
  return p || (p = new A()), p;
}
function _() {
  return p;
}
const h = {
  enabled: !1,
  caption: "Toggle unset variants display"
}, g = {
  enabled: !1,
  nextVersionCaption: null,
  previousVersionCaption: null,
  noVersionsCaption: null
};
async function U() {
  try {
    const i = document.documentElement.lang || "", e = i ? `/umbraco/api/propertyversions/settings?culture=${encodeURIComponent(i)}` : "/umbraco/api/propertyversions/settings", t = await fetch(e, {
      method: "GET",
      credentials: "include"
    });
    if (t.ok) {
      const n = await t.json();
      return {
        enabled: n.enabled === !0 || n.enabled === "true",
        nextVersionCaption: n.nextVersionCaption ?? null,
        previousVersionCaption: n.previousVersionCaption ?? null,
        noVersionsCaption: n.noVersionsCaption ?? null
      };
    }
    return g;
  } catch {
    return g;
  }
}
async function R() {
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
const S = "No previous versions";
let b = S;
function x(i) {
  b = i ?? S;
}
function L() {
  return b;
}
const N = async (i, e) => {
  console.log("[DotSee.Discipline] Initializing...");
  const [t, n] = await Promise.all([
    U(),
    R()
  ]);
  if (t.enabled) {
    x(t.noVersionsCaption);
    const o = I({
      nextVersionCaption: t.nextVersionCaption,
      previousVersionCaption: t.previousVersionCaption,
      noVersionsCaption: t.noVersionsCaption
    });
    e.registerMany(o), console.log("[DotSee.Discipline] Property version actions registered");
  } else
    console.log("[DotSee.Discipline.PropertyVersions] Feature is disabled in configuration");
  if (n.enabled) {
    const o = D(n.caption);
    e.registerMany([
      o,
      ...w
    ]), H().initializeWithSettings(n), console.log("[DotSee.Discipline.VariantsHider] Initialized successfully with caption:", n.caption);
  } else
    console.log("[DotSee.Discipline.VariantsHider] Feature is disabled in configuration");
};
export {
  A as V,
  L as a,
  _ as g,
  N as o
};
//# sourceMappingURL=index-CbnpoTq6.js.map
