var v = (s) => {
  throw TypeError(s);
};
var d = (s, a, t) => a.has(s) || v("Cannot " + t);
var e = (s, a, t) => (d(s, a, "read from private field"), t ? t.call(s) : a.get(s)), p = (s, a, t) => a.has(s) ? v("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(s) : a.set(s, t), T = (s, a, t, i) => (d(s, a, "write to private field"), i ? i.call(s, t) : a.set(s, t), t), c = (s, a, t) => (d(s, a, "access private method"), t);
import { UmbPropertyActionBase as U } from "@umbraco-cms/backoffice/property-action";
import { UMB_PROPERTY_CONTEXT as K, UMB_PROPERTY_DATASET_CONTEXT as B } from "@umbraco-cms/backoffice/property";
import { UMB_AUTH_CONTEXT as N } from "@umbraco-cms/backoffice/auth";
import { UMB_BLOCK_MANAGER_CONTEXT as O } from "@umbraco-cms/backoffice/block";
import { g as x, p as S, h as M, c as R, n as I, b as L } from "./property-value-helpers-BF2x--js.js";
import { a as X } from "./index-DpYSXpkb.js";
function D() {
  const s = window.location.pathname.match(/\/workspace\/document\/edit\/([a-f0-9-]+)/i);
  return s == null ? void 0 : s[1];
}
var n, g, f, P, y, A, o, _, w, C, b;
class J extends U {
  constructor(t, i) {
    super(t, i);
    p(this, o);
    p(this, n);
    p(this, g);
    p(this, f);
    p(this, P);
    p(this, y);
    p(this, A);
    T(this, y, Promise.all([
      this.consumeContext(K, (r) => {
        T(this, n, r);
      }).asPromise({ preventTimeout: !0 }),
      this.consumeContext(B, (r) => {
        T(this, g, r);
      }).asPromise({ preventTimeout: !0 }),
      this.consumeContext(N, (r) => {
        T(this, f, r);
      }).asPromise({ preventTimeout: !0 })
    ])), T(this, A, this.consumeContext(O, (r) => {
      this.observe(r.propertyAlias, (u) => {
        T(this, P, u);
      });
    }).asPromise({ preventTimeout: !0 }).catch(() => {
    })), e(this, y).then(async () => {
      await Promise.race([e(this, A), new Promise((r) => setTimeout(r, 200))]), await c(this, o, _).call(this);
    });
  }
  /** Returns true if the element should not render at all. */
  isHidden() {
    return !1;
  }
  /** Returns an override label, or undefined to use the manifest default. */
  getLabel() {
    if (!c(this, o, b).call(this))
      return X();
  }
  /** Called by the element to check if this action should be disabled. */
  getDisabledState() {
    var l, h, m;
    if (!c(this, o, b).call(this)) return !0;
    const t = c(this, o, w).call(this), i = c(this, o, C).call(this, t), r = (l = e(this, n)) == null ? void 0 : l.getAlias();
    if (!i || !r) return !1;
    const u = ((m = (h = e(this, n)) == null ? void 0 : h.getVariantId()) == null ? void 0 : m.culture) ?? null;
    return !R(i, r, u, t);
  }
  async execute() {
    if (await e(this, y), await Promise.race([e(this, A), new Promise((E) => setTimeout(E, 200))]), !e(this, n) || !e(this, g) || !e(this, f))
      return;
    const t = c(this, o, w).call(this), i = c(this, o, C).call(this, t), r = e(this, n).getAlias();
    if (!i || !r) return;
    const u = e(this, n).getVariantId(), l = (u == null ? void 0 : u.culture) ?? null, h = e(this, n).getValue(), m = x(h), V = await e(this, f).getLatestToken(), k = await I(i, r, l, m, V, t);
    k !== null && e(this, n).setValue(L(h, k));
  }
}
n = new WeakMap(), g = new WeakMap(), f = new WeakMap(), P = new WeakMap(), y = new WeakMap(), A = new WeakMap(), o = new WeakSet(), _ = async function() {
  var V;
  if (!e(this, n) || !e(this, g) || !e(this, f)) return;
  const t = c(this, o, w).call(this), i = c(this, o, C).call(this, t), r = e(this, n).getAlias();
  if (!i || !r) return;
  const u = ((V = e(this, n).getVariantId()) == null ? void 0 : V.culture) ?? null, l = e(this, n).getValue(), h = x(l), m = await e(this, f).getLatestToken();
  await S(i, r, u, h, m, t);
}, w = function() {
  var t;
  if (e(this, P)) {
    const i = (t = e(this, g)) == null ? void 0 : t.getUnique();
    if (i)
      return {
        parentPropertyAlias: e(this, P),
        blockElementKey: i
      };
  }
}, C = function(t) {
  var i;
  return t ? D() : (i = e(this, g)) == null ? void 0 : i.getUnique();
}, b = function() {
  var l, h, m;
  const t = c(this, o, w).call(this), i = c(this, o, C).call(this, t), r = (l = e(this, n)) == null ? void 0 : l.getAlias();
  if (!i || !r) return !0;
  const u = ((m = (h = e(this, n)) == null ? void 0 : h.getVariantId()) == null ? void 0 : m.culture) ?? null;
  return M(i, r, u, t);
};
export {
  J as PrevVersionAction,
  J as api
};
//# sourceMappingURL=prev-version.action-CeHOifX7.js.map
