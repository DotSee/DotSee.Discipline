var d = (e) => {
  throw TypeError(e);
};
var C = (e, n, t) => n.has(e) || d("Cannot " + t);
var s = (e, n, t) => (C(e, n, "read from private field"), t ? t.call(e) : n.get(e)), l = (e, n, t) => n.has(e) ? d("Cannot add the same private member more than once") : n instanceof WeakSet ? n.add(e) : n.set(e, t), m = (e, n, t, o) => (C(e, n, "write to private field"), o ? o.call(e, t) : n.set(e, t), t);
import { UmbPropertyActionBase as A } from "@umbraco-cms/backoffice/property-action";
import { UMB_PROPERTY_CONTEXT as P, UMB_PROPERTY_DATASET_CONTEXT as f } from "@umbraco-cms/backoffice/property";
import { UMB_AUTH_CONTEXT as E } from "@umbraco-cms/backoffice/auth";
import { a as V, g as v, d as w, b as y } from "./property-value-helpers-Uy11kMgJ.js";
var r, a, u, c;
class b extends A {
  constructor(t, o) {
    super(t, o);
    l(this, r);
    l(this, a);
    l(this, u);
    l(this, c);
    m(this, c, Promise.all([
      this.consumeContext(P, (i) => {
        m(this, r, i);
      }).asPromise({ preventTimeout: !0 }),
      this.consumeContext(f, (i) => {
        m(this, a, i);
      }).asPromise({ preventTimeout: !0 }),
      this.consumeContext(E, (i) => {
        m(this, u, i);
      }).asPromise({ preventTimeout: !0 })
    ])), s(this, c).then(() => {
      document.dispatchEvent(new Event("dotsee-version-nav-changed"));
    });
  }
  /** Called by the element to check if this action should be disabled. */
  getDisabledState() {
    var p, h, g, T;
    const t = (p = s(this, a)) == null ? void 0 : p.getUnique(), o = (h = s(this, r)) == null ? void 0 : h.getAlias();
    if (!t || !o) return !0;
    const i = ((T = (g = s(this, r)) == null ? void 0 : g.getVariantId()) == null ? void 0 : T.culture) ?? null;
    return !V(t, o, i);
  }
  async execute() {
    if (await s(this, c), !s(this, r) || !s(this, a) || !s(this, u))
      return;
    const t = s(this, a).getUnique(), o = s(this, r).getAlias();
    if (!t || !o) return;
    const i = s(this, r).getVariantId(), p = (i == null ? void 0 : i.culture) ?? null, h = s(this, r).getValue(), g = v(h), T = await s(this, u).getLatestToken(), x = await w(t, o, p, g, T);
    x !== null && s(this, r).setValue(y(h, x));
  }
}
r = new WeakMap(), a = new WeakMap(), u = new WeakMap(), c = new WeakMap();
export {
  b as NextVersionAction,
  b as api
};
//# sourceMappingURL=next-version.action-D_RJFyO5.js.map
