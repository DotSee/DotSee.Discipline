var a = Object.defineProperty;
var f = (s, e, t) => e in s ? a(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var m = (s, e, t) => f(s, typeof e != "symbol" ? e + "" : e, t);
import { html as u, property as b, customElement as c } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as d } from "@umbraco-cms/backoffice/lit-element";
var _ = Object.defineProperty, v = Object.getOwnPropertyDescriptor, o = (s, e, t, r) => {
  for (var i = r > 1 ? void 0 : r ? v(e, t) : e, p = s.length - 1, l; p >= 0; p--)
    (l = s[p]) && (i = (r ? l(e, t, i) : l(i)) || i);
  return r && i && _(e, t, i), i;
};
let n = class extends d {
  constructor() {
    super(...arguments);
    m(this, "manifest");
  }
  render() {
    return u`
      <umb-extension-slot
        type="menu"
        .filter=${(e) => {
      var t, r;
      return e.alias === ((r = (t = this.manifest) == null ? void 0 : t.meta) == null ? void 0 : r.menu);
    }}
        .defaultElement=${"umb-menu"}
      ></umb-extension-slot>
    `;
  }
};
o([
  b({ type: Object, attribute: !1 })
], n.prototype, "manifest", 2);
n = o([
  c("dotsee-discipline-sidebar-app")
], n);
const x = n;
export {
  n as DotseeDisciplineSidebarAppElement,
  x as default
};
//# sourceMappingURL=discipline-sidebar-app.element-DpKXH40p.js.map
