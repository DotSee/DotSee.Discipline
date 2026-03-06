var E = Object.defineProperty;
var S = (i, t, e) => t in i ? E(i, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[t] = e;
var c = (i, t, e) => S(i, typeof t != "symbol" ? t + "" : t, e);
import { UMB_AUTH_CONTEXT as C } from "@umbraco-cms/backoffice/auth";
function g(i) {
  return {
    type: "entityAction",
    kind: "default",
    alias: "DotSee.Discipline.VariantsHider.ToggleAction",
    name: "Toggle Unset Variants Display",
    weight: 100,
    api: () => import("./toggle-variants.action-DrrrAThN.js"),
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
const b = [
  "Umb.PropertyEditorUi.TextBox",
  "Umb.PropertyEditorUi.TextArea",
  "Umb.PropertyEditorUi.Tiptap"
], v = "Previous version", A = "Next version";
function I(i) {
  return [
    {
      type: "propertyAction",
      alias: "DotSee.Discipline.PropertyVersions.PrevVersion",
      name: "Previous Version",
      api: () => import("./prev-version.action-_VlyPguD.js"),
      element: () => import("./version-action.element-BopZLSeP.js"),
      forPropertyEditorUis: b,
      meta: {
        icon: "icon-arrow-left",
        label: i.previousVersionCaption ?? v
      }
    },
    {
      type: "propertyAction",
      alias: "DotSee.Discipline.PropertyVersions.NextVersion",
      name: "Next Version",
      api: () => import("./next-version.action-DJq-VoNF.js"),
      element: () => import("./version-action.element-BopZLSeP.js"),
      forPropertyEditorUis: b,
      meta: {
        icon: "icon-arrow-right",
        label: i.nextVersionCaption ?? A
      }
    }
  ];
}
const w = {
  type: "localization",
  alias: "DotSee.Discipline.VariantsHider.Localization.En",
  name: "DotSee Variants Hider Localization (English)",
  meta: {
    culture: "en"
  },
  js: () => import("./en-B5YfZqhh.js")
}, U = [w];
class x {
  constructor() {
    c(this, "isHidden", !1);
    c(this, "rafId", null);
    c(this, "enabled", !1);
    c(this, "caption", "Toggle unset variants display");
    // Selectors for finding tree items in Umbraco v14+ backoffice
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
   */
  initializeWithSettings(t) {
    this.enabled = t.enabled, this.caption = t.caption;
  }
  /**
   * @deprecated Use initializeWithSettings instead to avoid duplicate API calls
   */
  async initialize() {
    try {
      const t = await fetch("/umbraco/api/variantshider/settings", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (t.ok) {
        const e = await t.json();
        this.initializeWithSettings({
          enabled: e.enabled === !0 || e.enabled === "true",
          caption: e.caption || this.caption
        });
      }
    } catch {
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
    this.isHidden ? (this.showUnsetVariants(), this.isHidden = !1) : (this.hideUnsetVariants(), this.isHidden = !0);
  }
  /**
   * Hide all unset variants and start a requestAnimationFrame loop that
   * continuously scans for newly rendered items. RAF callbacks run before
   * the browser paints, so new items are hidden before they appear on screen.
   */
  hideUnsetVariants() {
    this.processTreeItems(!0), this.startRafScan();
  }
  /**
   * Stop scanning, show all hidden variants, and reset state.
   */
  showUnsetVariants() {
    this.stopRafScan(), this.processTreeItems(!1);
  }
  // ---------------------------------------------------------------------------
  // requestAnimationFrame scan loop
  // ---------------------------------------------------------------------------
  startRafScan() {
    if (this.rafId !== null) return;
    const t = () => {
      this.processTreeItems(!0), this.rafId = requestAnimationFrame(t);
    };
    this.rafId = requestAnimationFrame(t);
  }
  stopRafScan() {
    this.rafId !== null && (cancelAnimationFrame(this.rafId), this.rafId = null);
  }
  // ---------------------------------------------------------------------------
  // Tree item processing
  // ---------------------------------------------------------------------------
  processTreeItems(t) {
    let e = 0;
    return document.querySelectorAll(this.TREE_ITEM_SELECTORS).forEach((n) => {
      this.processTreeItem(n, t) && e++;
    }), e += this.processShadowRoots(document.body, t), e;
  }
  processShadowRoots(t, e) {
    let o = 0;
    return t.querySelectorAll("*").forEach((s) => {
      s.shadowRoot && (s.shadowRoot.querySelectorAll(this.TREE_ITEM_SELECTORS).forEach((l) => {
        this.processTreeItem(l, e) && o++;
      }), o += this.processShadowRoots(s.shadowRoot, e));
    }), o;
  }
  processTreeItem(t, e) {
    const o = t.hasAttribute("data-dotsee-hidden");
    if (!e)
      return o ? (t.style.display = "", t.removeAttribute("data-dotsee-hidden"), !0) : !1;
    const n = this.getTreeItemName(t);
    if (!n) return !1;
    if (this.isUnsetVariant(n)) {
      if (!o)
        return t.style.display = "none", t.setAttribute("data-dotsee-hidden", ""), !0;
    } else o && (t.style.display = "", t.removeAttribute("data-dotsee-hidden"));
    return !1;
  }
  getTreeItemName(t) {
    var s, r, l, h, f;
    const e = t.getAttribute("label") || t.getAttribute("name");
    if (e) return e.trim();
    const o = [
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
    for (const u of o) {
      const a = t.querySelector(u);
      if ((s = a == null ? void 0 : a.textContent) != null && s.trim())
        return a.textContent.trim();
    }
    if (t.shadowRoot) {
      for (const a of o) {
        const p = t.shadowRoot.querySelector(a);
        if ((r = p == null ? void 0 : p.textContent) != null && r.trim())
          return p.textContent.trim();
      }
      const u = (l = t.shadowRoot.textContent) == null ? void 0 : l.trim();
      if (u) return u;
    }
    const n = (h = t.textContent) == null ? void 0 : h.trim();
    return n ? ((f = n.split(`
`)[0]) == null ? void 0 : f.trim()) || n : "";
  }
  isUnsetVariant(t) {
    const e = t.trim();
    return e.startsWith("(") && e.endsWith(")") && e.length > 2;
  }
  dispose() {
    this.stopRafScan();
  }
}
let d = null;
function R() {
  return d || (d = new x()), d;
}
function N() {
  return d;
}
const m = {
  enabled: !1,
  caption: "Toggle unset variants display"
}, y = {
  enabled: !1,
  nextVersionCaption: null,
  previousVersionCaption: null,
  noVersionsCaption: null
};
async function _(i) {
  try {
    const t = document.documentElement.lang || "", e = t ? `/umbraco/api/propertyversions/settings?culture=${encodeURIComponent(t)}` : "/umbraco/api/propertyversions/settings", o = await fetch(e, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${i}`
      }
    });
    if (o.ok) {
      const n = await o.json();
      return {
        enabled: n.enabled === !0 || n.enabled === "true",
        nextVersionCaption: n.nextVersionCaption ?? null,
        previousVersionCaption: n.previousVersionCaption ?? null,
        noVersionsCaption: n.noVersionsCaption ?? null
      };
    }
    return y;
  } catch {
    return y;
  }
}
async function L() {
  try {
    const i = await fetch("/umbraco/api/variantshider/settings", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (i.ok) {
      const t = await i.json();
      return {
        enabled: t.enabled === !0 || t.enabled === "true",
        caption: t.caption || m.caption
      };
    }
    return m;
  } catch {
    return m;
  }
}
const T = "No previous versions";
let V = T;
function D(i) {
  V = i ?? T;
}
function M() {
  return V;
}
const z = async (i, t) => {
  const o = await (await i.getContext(C)).getLatestToken(), [n, s] = await Promise.all([
    _(o),
    L()
  ]);
  if (n.enabled) {
    D(n.noVersionsCaption);
    const r = I({
      nextVersionCaption: n.nextVersionCaption,
      previousVersionCaption: n.previousVersionCaption,
      noVersionsCaption: n.noVersionsCaption
    });
    t.registerMany(r);
  }
  if (s.enabled) {
    const r = g(s.caption);
    t.registerMany([
      r,
      ...U
    ]), R().initializeWithSettings(s);
  }
};
export {
  x as V,
  M as a,
  N as g,
  z as o
};
//# sourceMappingURL=index-5MWhwXwm.js.map
