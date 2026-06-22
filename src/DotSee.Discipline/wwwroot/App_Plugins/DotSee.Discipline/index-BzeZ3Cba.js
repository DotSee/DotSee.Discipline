var V = Object.defineProperty;
var C = (i, e, t) => e in i ? V(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var r = (i, e, t) => C(i, typeof e != "symbol" ? e + "" : e, t);
import { UMB_AUTH_CONTEXT as D } from "@umbraco-cms/backoffice/auth";
import { UmbModalToken as v } from "@umbraco-cms/backoffice/modal";
function I(i) {
  const e = i && i.length > 0 ? i : "#dotseeDiscipline_variantsHider_toggle";
  return {
    type: "entityAction",
    kind: "default",
    alias: "DotSee.Discipline.VariantsHider.ToggleAction",
    name: "Toggle Unset Variants Display",
    weight: 100,
    api: () => import("./toggle-variants.action-DZP5lmQe.js"),
    forEntityTypes: ["document-root"],
    meta: {
      icon: "icon-axis-rotation",
      label: e
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content"
      }
    ]
  };
}
const y = [
  "Umb.PropertyEditorUi.TextBox",
  "Umb.PropertyEditorUi.TextArea",
  "Umb.PropertyEditorUi.Tiptap"
], _ = "#dotseeDiscipline_propertyVersions_previousVersion", w = "#dotseeDiscipline_propertyVersions_nextVersion";
function R(i) {
  return [
    {
      type: "propertyAction",
      alias: "DotSee.Discipline.PropertyVersions.PrevVersion",
      name: "Previous Version",
      api: () => import("./prev-version.action-DI6NumYt.js"),
      element: () => import("./version-action.element-DAiNSxFv.js"),
      forPropertyEditorUis: y,
      meta: {
        icon: "icon-arrow-left",
        label: i.previousVersionCaption ?? _
      }
    },
    {
      type: "propertyAction",
      alias: "DotSee.Discipline.PropertyVersions.NextVersion",
      name: "Next Version",
      api: () => import("./next-version.action-DJq-VoNF.js"),
      element: () => import("./version-action.element-DAiNSxFv.js"),
      forPropertyEditorUis: y,
      meta: {
        icon: "icon-arrow-right",
        label: i.nextVersionCaption ?? w
      }
    }
  ];
}
const M = {
  type: "localization",
  alias: "DotSee.Discipline.Localization.En",
  name: "DotSee Discipline Localization (English)",
  meta: {
    culture: "en"
  },
  js: () => import("./en-C_Ns929E.js")
}, U = [M];
class N {
  constructor() {
    r(this, "isHidden", !1);
    r(this, "enabled", !1);
    r(this, "caption", "Toggle unset variants display");
    // Mutation-driven scanning state.
    r(this, "observing", !1);
    r(this, "observers", /* @__PURE__ */ new Set());
    r(this, "observedRoots", /* @__PURE__ */ new WeakSet());
    r(this, "scanRafId", null);
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
    this.enabled = e.enabled, this.caption = e.caption;
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
   * Hide all unset variants and start observing the tree for changes. The initial
   * pass also attaches observers to any open shadow roots it walks through.
   */
  hideUnsetVariants() {
    this.observing = !0, this.processTreeItems(!0), this.observeRoot(document.body ?? document.documentElement);
  }
  /**
   * Stop observing, show all hidden variants, and reset state.
   */
  showUnsetVariants() {
    this.stopObserving(), this.processTreeItems(!1);
  }
  // ---------------------------------------------------------------------------
  // Mutation-driven scanning
  // ---------------------------------------------------------------------------
  /**
   * Attach a MutationObserver to a light-DOM root or shadow root, once. Mutations
   * trigger a coalesced rescan rather than a continuous per-frame loop.
   */
  observeRoot(e) {
    const t = new MutationObserver(() => this.scheduleScan());
    t.observe(e, { childList: !0, subtree: !0 }), this.observers.add(t);
  }
  /**
   * Queue a single scan for the next animation frame. Repeated mutations within the
   * same frame collapse into one scan, and the frame runs before paint (no flash).
   */
  scheduleScan() {
    this.scanRafId === null && (this.scanRafId = requestAnimationFrame(() => {
      this.scanRafId = null, this.observing && this.processTreeItems(!0);
    }));
  }
  stopObserving() {
    this.observing = !1, this.scanRafId !== null && (cancelAnimationFrame(this.scanRafId), this.scanRafId = null), this.observers.forEach((e) => e.disconnect()), this.observers.clear(), this.observedRoots = /* @__PURE__ */ new WeakSet();
  }
  // ---------------------------------------------------------------------------
  // Tree item processing
  // ---------------------------------------------------------------------------
  processTreeItems(e) {
    let t = 0;
    return document.querySelectorAll(this.TREE_ITEM_SELECTORS).forEach((n) => {
      this.processTreeItem(n, e) && t++;
    }), t += this.processShadowRoots(document.body, e), t;
  }
  processShadowRoots(e, t) {
    let s = 0;
    return e.querySelectorAll("*").forEach((o) => {
      o.shadowRoot && (this.observing && !this.observedRoots.has(o.shadowRoot) && (this.observedRoots.add(o.shadowRoot), this.observeRoot(o.shadowRoot)), o.shadowRoot.querySelectorAll(this.TREE_ITEM_SELECTORS).forEach((a) => {
        this.processTreeItem(a, t) && s++;
      }), s += this.processShadowRoots(o.shadowRoot, t));
    }), s;
  }
  processTreeItem(e, t) {
    const s = e.hasAttribute("data-dotsee-hidden");
    if (!t)
      return s ? (e.style.display = "", e.removeAttribute("data-dotsee-hidden"), !0) : !1;
    const n = this.getTreeItemName(e);
    if (!n) return !1;
    if (this.isUnsetVariant(n)) {
      if (!s)
        return e.style.display = "none", e.setAttribute("data-dotsee-hidden", ""), !0;
    } else s && (e.style.display = "", e.removeAttribute("data-dotsee-hidden"));
    return !1;
  }
  getTreeItemName(e) {
    var o, l, a, m, b;
    const t = e.getAttribute("label") || e.getAttribute("name");
    if (t) return t.trim();
    const s = [
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
    for (const u of s) {
      const c = e.querySelector(u);
      if ((o = c == null ? void 0 : c.textContent) != null && o.trim())
        return c.textContent.trim();
    }
    if (e.shadowRoot) {
      for (const c of s) {
        const p = e.shadowRoot.querySelector(c);
        if ((l = p == null ? void 0 : p.textContent) != null && l.trim())
          return p.textContent.trim();
      }
      const u = (a = e.shadowRoot.textContent) == null ? void 0 : a.trim();
      if (u) return u;
    }
    const n = (m = e.textContent) == null ? void 0 : m.trim();
    return n ? ((b = n.split(`
`)[0]) == null ? void 0 : b.trim()) || n : "";
  }
  isUnsetVariant(e) {
    const t = e.trim();
    return t.startsWith("(") && t.endsWith(")") && t.length > 2;
  }
  dispose() {
    this.stopObserving();
  }
}
let d = null;
function L() {
  return d || (d = new N()), d;
}
function q() {
  return d;
}
const h = {
  enabled: !1,
  caption: "Toggle unset variants display"
}, S = {
  enabled: !1,
  nextVersionCaption: null,
  previousVersionCaption: null,
  noVersionsCaption: null
};
async function x(i) {
  try {
    const e = document.documentElement.lang || "", t = e ? `/umbraco/api/propertyversions/settings?culture=${encodeURIComponent(e)}` : "/umbraco/api/propertyversions/settings", s = await fetch(t, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${i}`
      }
    });
    if (s.ok) {
      const n = await s.json();
      return {
        enabled: n.enabled === !0 || n.enabled === "true",
        nextVersionCaption: n.nextVersionCaption ?? null,
        previousVersionCaption: n.previousVersionCaption ?? null,
        noVersionsCaption: n.noVersionsCaption ?? null
      };
    }
    return S;
  } catch {
    return S;
  }
}
async function P() {
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
    return h;
  } catch {
    return h;
  }
}
const E = "#dotseeDiscipline_propertyVersions_noPreviousVersions";
let T = E;
function O(i) {
  T = i && i.length > 0 ? i : E;
}
function Y() {
  return T;
}
const g = "dotsee-discipline-settings";
function K() {
  return {
    createdDocTypeAlias: "",
    docTypeAliasToCreate: "",
    nodeName: "",
    bringNewNodeFirst: !1,
    onlyCreateIfNoChildren: !1,
    createIfExistsWithDifferentName: !0,
    dictionaryItemForName: "",
    keepNewNodeUnpublished: !1,
    blueprint: ""
  };
}
function $() {
  return {
    parentDocType: "",
    childDocType: "*",
    maxNodes: 1,
    showWarnings: !0,
    customMessage: "",
    customMessageCategory: "",
    customWarningMessage: "",
    customWarningMessageCategory: ""
  };
}
function X() {
  return {
    docTypeAlias: "",
    documentGuids: "",
    customMessage: "",
    customMessageCategory: ""
  };
}
const k = "DotSee.Discipline.Settings.Workspace", f = "DotSee.Discipline.Settings.Menu", W = "DotSee.Discipline.Settings.SidebarApp", H = "DotSee.Discipline.Settings.MenuItem", A = "DotSee.Discipline.AboutModal", J = new v(A, {
  modal: { type: "dialog", size: "small" }
}), z = [
  {
    type: "workspace",
    alias: k,
    name: "DotSee Discipline Settings Workspace",
    element: () => import("./discipline-settings.workspace.element-B7S1xPa3.js"),
    meta: {
      entityType: g
    }
  },
  {
    type: "modal",
    alias: A,
    name: "DotSee Discipline About Modal",
    element: () => import("./discipline-about-modal.element-B3gGJCql.js")
  },
  {
    type: "menu",
    alias: f,
    name: "DotSee Discipline Menu",
    meta: {
      label: "#dotseeDiscipline_menu_label"
    }
  },
  {
    type: "menuItem",
    alias: H,
    name: "DotSee Discipline Menu Item",
    weight: 50,
    meta: {
      label: "#dotseeDiscipline_menu_itemLabel",
      icon: "icon-settings-alt",
      entityType: g,
      menus: [f]
    }
  },
  {
    // Custom element (not kind: 'menu') so no group headline is rendered — just the menu link.
    type: "sectionSidebarApp",
    alias: W,
    name: "DotSee Discipline Sidebar App",
    weight: 50,
    element: () => import("./discipline-sidebar-app.element-DpKXH40p.js"),
    meta: {
      menu: f
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Settings"
      }
    ]
  }
];
async function B(i) {
  try {
    const e = await fetch("/umbraco/api/discipline/settings", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${i}`
      }
    });
    if (!e.ok)
      return { uiEnabled: !0 };
    const t = await e.json();
    return { uiEnabled: (t == null ? void 0 : t.uiEnabled) !== !1 };
  } catch {
    return { uiEnabled: !0 };
  }
}
const Q = async (i, e) => {
  e.registerMany(U);
  const s = await (await i.getContext(D)).getLatestToken(), [n, o, l] = await Promise.all([
    x(s),
    P(),
    B(s)
  ]);
  if (l.uiEnabled && e.registerMany(z), n.enabled) {
    O(n.noVersionsCaption);
    const a = R({
      nextVersionCaption: n.nextVersionCaption,
      previousVersionCaption: n.previousVersionCaption,
      noVersionsCaption: n.noVersionsCaption
    });
    e.registerMany(a);
  }
  if (o.enabled) {
    const a = I(o.caption);
    e.registerMany([a]), L().initializeWithSettings(o);
  }
};
export {
  J as D,
  N as V,
  Y as a,
  $ as b,
  K as c,
  X as d,
  q as g,
  Q as o
};
//# sourceMappingURL=index-BzeZ3Cba.js.map
