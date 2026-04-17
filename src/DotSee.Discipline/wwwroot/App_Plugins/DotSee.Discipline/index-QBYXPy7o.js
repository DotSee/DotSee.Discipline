var C = Object.defineProperty;
var A = (i, e, t) => e in i ? C(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var c = (i, e, t) => A(i, typeof e != "symbol" ? e + "" : e, t);
import { UMB_AUTH_CONTEXT as V } from "@umbraco-cms/backoffice/auth";
function I(i) {
  return {
    type: "entityAction",
    kind: "default",
    alias: "DotSee.Discipline.VariantsHider.ToggleAction",
    name: "Toggle Unset Variants Display",
    weight: 100,
    api: () => import("./toggle-variants.action-Dcl-Hz7N.js"),
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
const y = [
  "Umb.PropertyEditorUi.TextBox",
  "Umb.PropertyEditorUi.TextArea",
  "Umb.PropertyEditorUi.Tiptap"
], D = "Previous version", w = "Next version";
function U(i) {
  return [
    {
      type: "propertyAction",
      alias: "DotSee.Discipline.PropertyVersions.PrevVersion",
      name: "Previous Version",
      api: () => import("./prev-version.action-jn3Ut8bl.js"),
      element: () => import("./version-action.element-BopZLSeP.js"),
      forPropertyEditorUis: y,
      meta: {
        icon: "icon-arrow-left",
        label: i.previousVersionCaption ?? D
      }
    },
    {
      type: "propertyAction",
      alias: "DotSee.Discipline.PropertyVersions.NextVersion",
      name: "Next Version",
      api: () => import("./next-version.action-DJq-VoNF.js"),
      element: () => import("./version-action.element-BopZLSeP.js"),
      forPropertyEditorUis: y,
      meta: {
        icon: "icon-arrow-right",
        label: i.nextVersionCaption ?? w
      }
    }
  ];
}
const N = {
  type: "localization",
  alias: "DotSee.Discipline.VariantsHider.Localization.En",
  name: "DotSee Variants Hider Localization (English)",
  meta: {
    culture: "en"
  },
  js: () => import("./en-B5YfZqhh.js")
}, v = [N];
class _ {
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
    return document.querySelectorAll(this.TREE_ITEM_SELECTORS).forEach((n) => {
      this.processTreeItem(n, e) && t++;
    }), t += this.processShadowRoots(document.body, e), t;
  }
  processShadowRoots(e, t) {
    let s = 0;
    return e.querySelectorAll("*").forEach((o) => {
      o.shadowRoot && (o.shadowRoot.querySelectorAll(this.TREE_ITEM_SELECTORS).forEach((a) => {
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
    var o, l, a, m, S;
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
      const r = e.querySelector(u);
      if ((o = r == null ? void 0 : r.textContent) != null && o.trim())
        return r.textContent.trim();
    }
    if (e.shadowRoot) {
      for (const r of s) {
        const p = e.shadowRoot.querySelector(r);
        if ((l = p == null ? void 0 : p.textContent) != null && l.trim())
          return p.textContent.trim();
      }
      const u = (a = e.shadowRoot.textContent) == null ? void 0 : a.trim();
      if (u) return u;
    }
    const n = (m = e.textContent) == null ? void 0 : m.trim();
    return n ? ((S = n.split(`
`)[0]) == null ? void 0 : S.trim()) || n : "";
  }
  isUnsetVariant(e) {
    const t = e.trim();
    return t.startsWith("(") && t.endsWith(")") && t.length > 2;
  }
  dispose() {
    this.stopRafScan();
  }
}
let d = null;
function R() {
  return d || (d = new _()), d;
}
function B() {
  return d;
}
const f = {
  enabled: !1,
  caption: "Toggle unset variants display"
}, b = {
  enabled: !1,
  nextVersionCaption: null,
  previousVersionCaption: null,
  noVersionsCaption: null
};
async function M(i) {
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
    return b;
  } catch {
    return b;
  }
}
async function x() {
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
        caption: e.caption || f.caption
      };
    }
    return f;
  } catch {
    return f;
  }
}
const g = "No previous versions";
let E = g;
function L(i) {
  E = i ?? g;
}
function G() {
  return E;
}
const T = "dotsee-discipline-settings";
function q() {
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
function O() {
  return {
    parentDocType: "",
    childDocType: "",
    maxNodes: 1,
    showWarnings: !0,
    customMessage: "",
    customMessageCategory: "",
    customWarningMessage: "",
    customWarningMessageCategory: ""
  };
}
function $() {
  return {
    docTypeAlias: "",
    documentGuids: "",
    customMessage: "",
    customMessageCategory: ""
  };
}
const P = "DotSee.Discipline.Settings.Workspace", h = "DotSee.Discipline.Settings.Menu", H = "DotSee.Discipline.Settings.SidebarApp", k = "DotSee.Discipline.Settings.MenuItem", W = [
  {
    type: "workspace",
    alias: P,
    name: "DotSee Discipline Settings Workspace",
    element: () => import("./discipline-settings.workspace.element-CvNEP0p8.js"),
    meta: {
      entityType: T
    }
  },
  {
    type: "menu",
    alias: h,
    name: "DotSee Discipline Menu",
    meta: {
      label: "DotSee Discipline"
    }
  },
  {
    type: "menuItem",
    alias: k,
    name: "DotSee Discipline Menu Item",
    weight: 50,
    meta: {
      label: "Discipline",
      icon: "icon-settings-alt",
      entityType: T,
      menus: [h]
    }
  },
  {
    type: "sectionSidebarApp",
    kind: "menu",
    alias: H,
    name: "DotSee Discipline Sidebar App",
    weight: 50,
    meta: {
      label: "DotSee Discipline",
      menu: h
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Settings"
      }
    ]
  }
];
async function z(i) {
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
const X = async (i, e) => {
  const s = await (await i.getContext(V)).getLatestToken(), [n, o, l] = await Promise.all([
    M(s),
    x(),
    z(s)
  ]);
  if (l.uiEnabled && e.registerMany(W), n.enabled) {
    L(n.noVersionsCaption);
    const a = U({
      nextVersionCaption: n.nextVersionCaption,
      previousVersionCaption: n.previousVersionCaption,
      noVersionsCaption: n.noVersionsCaption
    });
    e.registerMany(a);
  }
  if (o.enabled) {
    const a = I(o.caption);
    e.registerMany([
      a,
      ...v
    ]), R().initializeWithSettings(o);
  }
};
export {
  _ as V,
  G as a,
  O as b,
  q as c,
  $ as d,
  B as g,
  X as o
};
//# sourceMappingURL=index-QBYXPy7o.js.map
