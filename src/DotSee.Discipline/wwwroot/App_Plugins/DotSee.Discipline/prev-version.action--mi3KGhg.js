var v = (s) => {
  throw TypeError(s);
};
var V = (s, a, t) => a.has(s) || v("Cannot " + t);
var e = (s, a, t) => (V(s, a, "read from private field"), t ? t.call(s) : a.get(s)), p = (s, a, t) => a.has(s) ? v("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(s) : a.set(s, t), T = (s, a, t, i) => (V(s, a, "write to private field"), i ? i.call(s, t) : a.set(s, t), t), u = (s, a, t) => (V(s, a, "access private method"), t);
import { UmbPropertyActionBase as U } from "@umbraco-cms/backoffice/property-action";
import { UMB_PROPERTY_CONTEXT as K, UMB_PROPERTY_DATASET_CONTEXT as B } from "@umbraco-cms/backoffice/property";
import { UMB_AUTH_CONTEXT as N } from "@umbraco-cms/backoffice/auth";
import { UMB_BLOCK_MANAGER_CONTEXT as O } from "@umbraco-cms/backoffice/block";
import { g as x, p as S, h as M, c as R, n as I, b as L } from "./property-value-helpers-DT36Om7H.js";
function X() {
  const s = window.location.pathname.match(/\/workspace\/document\/edit\/([a-f0-9-]+)/i);
  return s == null ? void 0 : s[1];
}
var n, g, f, P, y, A, o, _, w, d, b;
class j extends U {
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
      this.observe(r.propertyAlias, (c) => {
        T(this, P, c);
      });
    }).asPromise({ preventTimeout: !0 }).catch(() => {
    })), e(this, y).then(async () => {
      await Promise.race([e(this, A), new Promise((r) => setTimeout(r, 200))]), await u(this, o, _).call(this);
    });
  }
  /** Returns true if the element should not render at all. */
  isHidden() {
    return !1;
  }
  /** Returns an override label, or undefined to use the manifest default. */
  getLabel() {
    if (!u(this, o, b).call(this))
      return "No previous versions";
  }
  /** Called by the element to check if this action should be disabled. */
  getDisabledState() {
    var l, h, m;
    if (!u(this, o, b).call(this)) return !0;
    const t = u(this, o, w).call(this), i = u(this, o, d).call(this, t), r = (l = e(this, n)) == null ? void 0 : l.getAlias();
    if (!i || !r) return !1;
    const c = ((m = (h = e(this, n)) == null ? void 0 : h.getVariantId()) == null ? void 0 : m.culture) ?? null;
    return !R(i, r, c, t);
  }
  async execute() {
    if (await e(this, y), await Promise.race([e(this, A), new Promise((E) => setTimeout(E, 200))]), !e(this, n) || !e(this, g) || !e(this, f))
      return;
    const t = u(this, o, w).call(this), i = u(this, o, d).call(this, t), r = e(this, n).getAlias();
    if (!i || !r) return;
    const c = e(this, n).getVariantId(), l = (c == null ? void 0 : c.culture) ?? null, h = e(this, n).getValue(), m = x(h), C = await e(this, f).getLatestToken(), k = await I(i, r, l, m, C, t);
    k !== null && e(this, n).setValue(L(h, k));
  }
}
n = new WeakMap(), g = new WeakMap(), f = new WeakMap(), P = new WeakMap(), y = new WeakMap(), A = new WeakMap(), o = new WeakSet(), _ = async function() {
  var C;
  if (!e(this, n) || !e(this, g) || !e(this, f)) return;
  const t = u(this, o, w).call(this), i = u(this, o, d).call(this, t), r = e(this, n).getAlias();
  if (!i || !r) return;
  const c = ((C = e(this, n).getVariantId()) == null ? void 0 : C.culture) ?? null, l = e(this, n).getValue(), h = x(l), m = await e(this, f).getLatestToken();
  await S(i, r, c, h, m, t);
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
}, d = function(t) {
  var i;
  return t ? X() : (i = e(this, g)) == null ? void 0 : i.getUnique();
}, b = function() {
  var l, h, m;
  const t = u(this, o, w).call(this), i = u(this, o, d).call(this, t), r = (l = e(this, n)) == null ? void 0 : l.getAlias();
  if (!i || !r) return !0;
  const c = ((m = (h = e(this, n)) == null ? void 0 : h.getVariantId()) == null ? void 0 : m.culture) ?? null;
  return M(i, r, c, t);
};
export {
  j as PrevVersionAction,
  j as api
};
//# sourceMappingURL=prev-version.action--mi3KGhg.js.map
