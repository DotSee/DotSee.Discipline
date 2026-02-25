var E = (e) => {
  throw TypeError(e);
};
var d = (e, n, t) => n.has(e) || E("Cannot " + t);
var s = (e, n, t) => (d(e, n, "read from private field"), t ? t.call(e) : n.get(e)), a = (e, n, t) => n.has(e) ? E("Cannot add the same private member more than once") : n instanceof WeakSet ? n.add(e) : n.set(e, t), h = (e, n, t, i) => (d(e, n, "write to private field"), i ? i.call(e, t) : n.set(e, t), t), P = (e, n, t) => (d(e, n, "access private method"), t);
import { UmbPropertyActionBase as _ } from "@umbraco-cms/backoffice/property-action";
import { UMB_PROPERTY_CONTEXT as k, UMB_PROPERTY_DATASET_CONTEXT as U } from "@umbraco-cms/backoffice/property";
import { UMB_AUTH_CONTEXT as V } from "@umbraco-cms/backoffice/auth";
import { UMB_BLOCK_MANAGER_CONTEXT as B } from "@umbraco-cms/backoffice/block";
import { c as O, g as K, n as N, b as M } from "./property-value-helpers-CwJYlU_C.js";
function R() {
  const e = window.location.pathname.match(/\/workspace\/document\/edit\/([a-f0-9-]+)/i);
  return e == null ? void 0 : e[1];
}
var r, l, m, p, g, f, c, v, w;
class L extends _ {
  constructor(t, i) {
    super(t, i);
    a(this, c);
    a(this, r);
    a(this, l);
    a(this, m);
    a(this, p);
    a(this, g);
    a(this, f);
    h(this, g, Promise.all([
      this.consumeContext(k, (o) => {
        h(this, r, o);
      }).asPromise({ preventTimeout: !0 }),
      this.consumeContext(U, (o) => {
        h(this, l, o);
      }).asPromise({ preventTimeout: !0 }),
      this.consumeContext(V, (o) => {
        h(this, m, o);
      }).asPromise({ preventTimeout: !0 })
    ])), h(this, f, this.consumeContext(B, (o) => {
      this.observe(o.propertyAlias, (u) => {
        h(this, p, u);
      });
    }).asPromise({ preventTimeout: !0 }).catch(() => {
    })), s(this, g).then(() => {
      document.dispatchEvent(new Event("dotsee-version-nav-changed"));
    });
  }
  /** Called by the element to check if this action should be disabled. */
  getDisabledState() {
    var A, T, C;
    const t = P(this, c, v).call(this), i = P(this, c, w).call(this, t), o = (A = s(this, r)) == null ? void 0 : A.getAlias();
    if (!i || !o) return !1;
    const u = ((C = (T = s(this, r)) == null ? void 0 : T.getVariantId()) == null ? void 0 : C.culture) ?? null;
    return !O(i, o, u, t);
  }
  async execute() {
    if (await s(this, g), await Promise.race([s(this, f), new Promise((x) => setTimeout(x, 200))]), !s(this, r) || !s(this, l) || !s(this, m))
      return;
    const t = P(this, c, v).call(this), i = P(this, c, w).call(this, t), o = s(this, r).getAlias();
    if (!i || !o) return;
    const u = s(this, r).getVariantId(), A = (u == null ? void 0 : u.culture) ?? null, T = s(this, r).getValue(), C = K(T), b = await s(this, m).getLatestToken(), y = await N(i, o, A, C, b, t);
    y !== null && s(this, r).setValue(M(T, y));
  }
}
r = new WeakMap(), l = new WeakMap(), m = new WeakMap(), p = new WeakMap(), g = new WeakMap(), f = new WeakMap(), c = new WeakSet(), v = function() {
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
  L as PrevVersionAction,
  L as api
};
//# sourceMappingURL=prev-version.action-CqNDFOsz.js.map
