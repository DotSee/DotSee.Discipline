import { nothing as L, ifDefined as P, when as $, html as g, property as S, state as _, customElement as D } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as k } from "@umbraco-cms/backoffice/lit-element";
var w = Object.defineProperty, A = Object.getOwnPropertyDescriptor, y = (t) => {
  throw TypeError(t);
}, H = (t, e, i) => e in t ? w(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i, c = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? A(e, i) : e, u = t.length - 1, v; u >= 0; u--)
    (v = t[u]) && (r = (s ? v(e, i, r) : v(r)) || r);
  return s && r && w(e, i, r), r;
}, d = (t, e, i) => H(t, typeof e != "symbol" ? e + "" : e, i), b = (t, e, i) => e.has(t) || y("Cannot " + i), n = (t, e, i) => (b(t, e, "read from private field"), e.get(t)), m = (t, e, i) => e.has(t) ? y("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), O = (t, e, i, s) => (b(t, e, "write to private field"), e.set(t, i), i), h = (t, e, i) => (b(t, e, "access private method"), i), a, p, o, f, C, E;
let l = class extends k {
  constructor() {
    super(...arguments), m(this, o), d(this, "manifest"), d(this, "_href"), d(this, "_disabled", !1), d(this, "_hidden", !1), d(this, "_label"), m(this, a), m(this, p, () => h(this, o, f).call(this));
  }
  set api(t) {
    var e, i;
    O(this, a, t), (i = (e = n(this, a)) == null ? void 0 : e.getHref) == null || i.call(e).then((s) => {
      this._href = s;
    }), h(this, o, f).call(this);
  }
  connectedCallback() {
    super.connectedCallback(), document.addEventListener("dotsee-version-nav-changed", n(this, p)), h(this, o, f).call(this);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("dotsee-version-nav-changed", n(this, p));
  }
  render() {
    var i, s;
    if (this._hidden) return L;
    const t = this._label ?? ((i = this.manifest) == null ? void 0 : i.meta.label), e = this.localize.string(t);
    return g`
      <uui-menu-item
        label=${e}
        href=${P(this._href)}
        .disabled=${this._disabled}
        @click-label=${h(this, o, C)}
        @click=${h(this, o, E)}>
        ${$((s = this.manifest) == null ? void 0 : s.meta.icon, (r) => g`<umb-icon slot="icon" name=${r}></umb-icon>`)}
      </uui-menu-item>
    `;
  }
};
a = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
f = function() {
  var t, e, i;
  typeof ((t = n(this, a)) == null ? void 0 : t.getDisabledState) == "function" && (this._disabled = n(this, a).getDisabledState()), typeof ((e = n(this, a)) == null ? void 0 : e.isHidden) == "function" && (this._hidden = n(this, a).isHidden()), typeof ((i = n(this, a)) == null ? void 0 : i.getLabel) == "function" && (this._label = n(this, a).getLabel()), this.requestUpdate();
};
C = async function(t) {
  var e;
  t.stopPropagation(), !this._disabled && (await ((e = n(this, a)) == null ? void 0 : e.execute().catch(() => {
  })), h(this, o, f).call(this));
};
E = function(t) {
  t.stopPropagation();
};
c([
  S({ attribute: !1 })
], l.prototype, "manifest", 2);
c([
  _()
], l.prototype, "_href", 2);
c([
  _()
], l.prototype, "_disabled", 2);
c([
  _()
], l.prototype, "_hidden", 2);
c([
  _()
], l.prototype, "_label", 2);
l = c([
  D("dotsee-version-action")
], l);
const M = l;
export {
  l as VersionActionElement,
  M as default
};
//# sourceMappingURL=version-action.element-DAiNSxFv.js.map
