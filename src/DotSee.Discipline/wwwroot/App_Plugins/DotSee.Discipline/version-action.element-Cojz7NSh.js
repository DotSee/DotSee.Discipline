import { ifDefined as $, when as y, html as b, property as D, state as g, customElement as S } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as k } from "@umbraco-cms/backoffice/lit-element";
var w = Object.defineProperty, A = Object.getOwnPropertyDescriptor, C = (t) => {
  throw TypeError(t);
}, L = (t, e, i) => e in t ? w(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i, p = (t, e, i, s) => {
  for (var n = s > 1 ? void 0 : s ? A(e, i) : e, f = t.length - 1, _; f >= 0; f--)
    (_ = t[f]) && (n = (s ? _(e, i, n) : _(n)) || n);
  return s && n && w(e, i, n), n;
}, u = (t, e, i) => L(t, typeof e != "symbol" ? e + "" : e, i), m = (t, e, i) => e.has(t) || C("Cannot " + i), l = (t, e, i) => (m(t, e, "read from private field"), e.get(t)), v = (t, e, i) => e.has(t) ? C("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), O = (t, e, i, s) => (m(t, e, "write to private field"), e.set(t, i), i), o = (t, e, i) => (m(t, e, "access private method"), i), r, d, a, h, E, P;
let c = class extends k {
  constructor() {
    super(...arguments), v(this, a), u(this, "manifest"), u(this, "_href"), u(this, "_disabled", !1), v(this, r), v(this, d, () => o(this, a, h).call(this));
  }
  set api(t) {
    var e, i;
    O(this, r, t), (i = (e = l(this, r)) == null ? void 0 : e.getHref) == null || i.call(e).then((s) => {
      this._href = s;
    }), o(this, a, h).call(this);
  }
  connectedCallback() {
    super.connectedCallback(), document.addEventListener("dotsee-version-nav-changed", l(this, d)), o(this, a, h).call(this);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("dotsee-version-nav-changed", l(this, d));
  }
  render() {
    var t, e;
    return b`
      <uui-menu-item
        label=${this.localize.string((t = this.manifest) == null ? void 0 : t.meta.label)}
        href=${$(this._href)}
        .disabled=${this._disabled}
        @click-label=${o(this, a, E)}
        @click=${o(this, a, P)}>
        ${y((e = this.manifest) == null ? void 0 : e.meta.icon, (i) => b`<umb-icon slot="icon" name=${i}></umb-icon>`)}
      </uui-menu-item>
    `;
  }
};
r = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
h = function() {
  var t;
  typeof ((t = l(this, r)) == null ? void 0 : t.getDisabledState) == "function" && (this._disabled = l(this, r).getDisabledState(), this.requestUpdate());
};
E = async function(t) {
  var e;
  t.stopPropagation(), !this._disabled && (await ((e = l(this, r)) == null ? void 0 : e.execute().catch(() => {
  })), o(this, a, h).call(this));
};
P = function(t) {
  t.stopPropagation();
};
p([
  D({ attribute: !1 })
], c.prototype, "manifest", 2);
p([
  g()
], c.prototype, "_href", 2);
p([
  g()
], c.prototype, "_disabled", 2);
c = p([
  S("dotsee-version-action")
], c);
const M = c;
export {
  c as VersionActionElement,
  M as default
};
//# sourceMappingURL=version-action.element-Cojz7NSh.js.map
