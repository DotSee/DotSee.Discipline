var v = (e) => {
  throw TypeError(e);
};
var C = (e, n, t) => n.has(e) || v("Cannot " + t);
var s = (e, n, t) => (C(e, n, "read from private field"), t ? t.call(e) : n.get(e)), l = (e, n, t) => n.has(e) ? v("Cannot add the same private member more than once") : n instanceof WeakSet ? n.add(e) : n.set(e, t), m = (e, n, t, o) => (C(e, n, "write to private field"), o ? o.call(e, t) : n.set(e, t), t);
import { UmbPropertyActionBase as d } from "@umbraco-cms/backoffice/property-action";
import { UMB_PROPERTY_CONTEXT as f, UMB_PROPERTY_DATASET_CONTEXT as x } from "@umbraco-cms/backoffice/property";
import { UMB_AUTH_CONTEXT as A } from "@umbraco-cms/backoffice/auth";
import { c as E, g as V, n as w, b as y } from "./property-value-helpers-Uy11kMgJ.js";
var r, a, u, c;
class B extends d {
  constructor(t, o) {
    super(t, o);
    l(this, r);
    l(this, a);
    l(this, u);
    l(this, c);
    m(this, c, Promise.all([
      this.consumeContext(f, (i) => {
        m(this, r, i);
      }).asPromise({ preventTimeout: !0 }),
      this.consumeContext(x, (i) => {
        m(this, a, i);
      }).asPromise({ preventTimeout: !0 }),
      this.consumeContext(A, (i) => {
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
    if (!t || !o) return !1;
    const i = ((T = (g = s(this, r)) == null ? void 0 : g.getVariantId()) == null ? void 0 : T.culture) ?? null;
    return !E(t, o, i);
  }
  async execute() {
    if (await s(this, c), !s(this, r) || !s(this, a) || !s(this, u))
      return;
    const t = s(this, a).getUnique(), o = s(this, r).getAlias();
    if (!t || !o) return;
    const i = s(this, r).getVariantId(), p = (i == null ? void 0 : i.culture) ?? null, h = s(this, r).getValue(), g = V(h), T = await s(this, u).getLatestToken(), P = await w(t, o, p, g, T);
    P !== null && s(this, r).setValue(y(h, P));
  }
}
r = new WeakMap(), a = new WeakMap(), u = new WeakMap(), c = new WeakMap();
export {
  B as PrevVersionAction,
  B as api
};
//# sourceMappingURL=prev-version.action-JQ03NHXU.js.map
