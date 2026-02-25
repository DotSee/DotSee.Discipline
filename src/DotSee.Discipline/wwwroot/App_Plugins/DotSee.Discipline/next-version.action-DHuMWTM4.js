var E = (e) => {
  throw TypeError(e);
};
var C = (e, n, t) => n.has(e) || E("Cannot " + t);
var s = (e, n, t) => (C(e, n, "read from private field"), t ? t.call(e) : n.get(e)), a = (e, n, t) => n.has(e) ? E("Cannot add the same private member more than once") : n instanceof WeakSet ? n.add(e) : n.set(e, t), h = (e, n, t, i) => (C(e, n, "write to private field"), i ? i.call(e, t) : n.set(e, t), t), P = (e, n, t) => (C(e, n, "access private method"), t);
import { UmbPropertyActionBase as _ } from "@umbraco-cms/backoffice/property-action";
import { UMB_PROPERTY_CONTEXT as k, UMB_PROPERTY_DATASET_CONTEXT as N } from "@umbraco-cms/backoffice/property";
import { UMB_AUTH_CONTEXT as U } from "@umbraco-cms/backoffice/auth";
import { UMB_BLOCK_MANAGER_CONTEXT as V } from "@umbraco-cms/backoffice/block";
import { a as B, g as O, d as K, b as M } from "./property-value-helpers-CwJYlU_C.js";
function R() {
  const e = window.location.pathname.match(/\/workspace\/document\/edit\/([a-f0-9-]+)/i);
  return e == null ? void 0 : e[1];
}
var r, l, m, p, g, d, u, x, w;
class L extends _ {
  constructor(t, i) {
    super(t, i);
    a(this, u);
    a(this, r);
    a(this, l);
    a(this, m);
    a(this, p);
    a(this, g);
    a(this, d);
    h(this, g, Promise.all([
      this.consumeContext(k, (o) => {
        h(this, r, o);
      }).asPromise({ preventTimeout: !0 }),
      this.consumeContext(N, (o) => {
        h(this, l, o);
      }).asPromise({ preventTimeout: !0 }),
      this.consumeContext(U, (o) => {
        h(this, m, o);
      }).asPromise({ preventTimeout: !0 })
    ])), h(this, d, this.consumeContext(V, (o) => {
      this.observe(o.propertyAlias, (c) => {
        h(this, p, c);
      });
    }).asPromise({ preventTimeout: !0 }).catch(() => {
    })), s(this, g).then(() => {
      document.dispatchEvent(new Event("dotsee-version-nav-changed"));
    });
  }
  /** Called by the element to check if this action should be disabled. */
  getDisabledState() {
    var f, T, A;
    const t = P(this, u, x).call(this), i = P(this, u, w).call(this, t), o = (f = s(this, r)) == null ? void 0 : f.getAlias();
    if (!i || !o) return !0;
    const c = ((A = (T = s(this, r)) == null ? void 0 : T.getVariantId()) == null ? void 0 : A.culture) ?? null;
    return !B(i, o, c, t);
  }
  async execute() {
    if (await s(this, g), await Promise.race([s(this, d), new Promise((v) => setTimeout(v, 200))]), !s(this, r) || !s(this, l) || !s(this, m))
      return;
    const t = P(this, u, x).call(this), i = P(this, u, w).call(this, t), o = s(this, r).getAlias();
    if (!i || !o) return;
    const c = s(this, r).getVariantId(), f = (c == null ? void 0 : c.culture) ?? null, T = s(this, r).getValue(), A = O(T), b = await s(this, m).getLatestToken(), y = await K(i, o, f, A, b, t);
    y !== null && s(this, r).setValue(M(T, y));
  }
}
r = new WeakMap(), l = new WeakMap(), m = new WeakMap(), p = new WeakMap(), g = new WeakMap(), d = new WeakMap(), u = new WeakSet(), x = function() {
  var t;
  if (s(this, p)) {
    const i = (t = s(this, l)) == null ? void 0 : t.getUnique();
    if (i)
      return {
        parentPropertyAlias: s(this, p),
        blockElementKey: i
      };
  }
}, w = function(t) {
  var i;
  return t ? R() : (i = s(this, l)) == null ? void 0 : i.getUnique();
};
export {
  L as NextVersionAction,
  L as api
};
//# sourceMappingURL=next-version.action-DHuMWTM4.js.map
