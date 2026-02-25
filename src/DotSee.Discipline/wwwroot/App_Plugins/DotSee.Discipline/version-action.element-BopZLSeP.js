import { nothing as P, ifDefined as $, when as L, html as g, property as S, state as _, customElement as D } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as k } from "@umbraco-cms/backoffice/lit-element";
var w = Object.defineProperty, A = Object.getOwnPropertyDescriptor, y = (t) => {
  throw TypeError(t);
}, H = (t, e, i) => e in t ? w(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i, c = (t, e, i, n) => {
  for (var l = n > 1 ? void 0 : n ? A(e, i) : e, u = t.length - 1, v; u >= 0; u--)
    (v = t[u]) && (l = (n ? v(e, i, l) : v(l)) || l);
  return n && l && w(e, i, l), l;
}, d = (t, e, i) => H(t, typeof e != "symbol" ? e + "" : e, i), b = (t, e, i) => e.has(t) || y("Cannot " + i), a = (t, e, i) => (b(t, e, "read from private field"), e.get(t)), m = (t, e, i) => e.has(t) ? y("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), O = (t, e, i, n) => (b(t, e, "write to private field"), e.set(t, i), i), h = (t, e, i) => (b(t, e, "access private method"), i), s, p, r, f, C, E;
let o = class extends k {
  constructor() {
    super(...arguments), m(this, r), d(this, "manifest"), d(this, "_href"), d(this, "_disabled", !1), d(this, "_hidden", !1), d(this, "_label"), m(this, s), m(this, p, () => h(this, r, f).call(this));
  }
  set api(t) {
    var e, i;
    O(this, s, t), (i = (e = a(this, s)) == null ? void 0 : e.getHref) == null || i.call(e).then((n) => {
      this._href = n;
    }), h(this, r, f).call(this);
  }
  connectedCallback() {
    super.connectedCallback(), document.addEventListener("dotsee-version-nav-changed", a(this, p)), h(this, r, f).call(this);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("dotsee-version-nav-changed", a(this, p));
  }
  render() {
    var e, i;
    if (this._hidden) return P;
    const t = this._label ?? this.localize.string((e = this.manifest) == null ? void 0 : e.meta.label);
    return g`
      <uui-menu-item
        label=${t}
        href=${$(this._href)}
        .disabled=${this._disabled}
        @click-label=${h(this, r, C)}
        @click=${h(this, r, E)}>
        ${L((i = this.manifest) == null ? void 0 : i.meta.icon, (n) => g`<umb-icon slot="icon" name=${n}></umb-icon>`)}
      </uui-menu-item>
    `;
  }
};
s = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
f = function() {
  var t, e, i;
  typeof ((t = a(this, s)) == null ? void 0 : t.getDisabledState) == "function" && (this._disabled = a(this, s).getDisabledState()), typeof ((e = a(this, s)) == null ? void 0 : e.isHidden) == "function" && (this._hidden = a(this, s).isHidden()), typeof ((i = a(this, s)) == null ? void 0 : i.getLabel) == "function" && (this._label = a(this, s).getLabel()), this.requestUpdate();
};
C = async function(t) {
  var e;
  t.stopPropagation(), !this._disabled && (await ((e = a(this, s)) == null ? void 0 : e.execute().catch(() => {
  })), h(this, r, f).call(this));
};
E = function(t) {
  t.stopPropagation();
};
c([
  S({ attribute: !1 })
], o.prototype, "manifest", 2);
c([
  _()
], o.prototype, "_href", 2);
c([
  _()
], o.prototype, "_disabled", 2);
c([
  _()
], o.prototype, "_hidden", 2);
c([
  _()
], o.prototype, "_label", 2);
o = c([
  D("dotsee-version-action")
], o);
const M = o;
export {
  o as VersionActionElement,
  M as default
};
//# sourceMappingURL=version-action.element-BopZLSeP.js.map
