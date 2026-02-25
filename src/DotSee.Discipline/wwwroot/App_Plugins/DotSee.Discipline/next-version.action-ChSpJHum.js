var k = (s) => {
  throw TypeError(s);
};
var V = (s, a, t) => a.has(s) || k("Cannot " + t);
var e = (s, a, t) => (V(s, a, "read from private field"), t ? t.call(s) : a.get(s)), p = (s, a, t) => a.has(s) ? k("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(s) : a.set(s, t), f = (s, a, t, i) => (V(s, a, "write to private field"), i ? i.call(s, t) : a.set(s, t), t), u = (s, a, t) => (V(s, a, "access private method"), t);
import { UmbPropertyActionBase as U } from "@umbraco-cms/backoffice/property-action";
import { UMB_PROPERTY_CONTEXT as K, UMB_PROPERTY_DATASET_CONTEXT as v } from "@umbraco-cms/backoffice/property";
import { UMB_AUTH_CONTEXT as B } from "@umbraco-cms/backoffice/auth";
import { UMB_BLOCK_MANAGER_CONTEXT as O } from "@umbraco-cms/backoffice/block";
import { g as x, p as S, h as M, a as R, d as I, b as L } from "./property-value-helpers-DT36Om7H.js";
function X() {
  const s = window.location.pathname.match(/\/workspace\/document\/edit\/([a-f0-9-]+)/i);
  return s == null ? void 0 : s[1];
}
var r, g, T, y, A, w, o, _, P, d, E;
class j extends U {
  constructor(t, i) {
    super(t, i);
    p(this, o);
    p(this, r);
    p(this, g);
    p(this, T);
    p(this, y);
    p(this, A);
    p(this, w);
    f(this, A, Promise.all([
      this.consumeContext(K, (n) => {
        f(this, r, n);
      }).asPromise({ preventTimeout: !0 }),
      this.consumeContext(v, (n) => {
        f(this, g, n);
      }).asPromise({ preventTimeout: !0 }),
      this.consumeContext(B, (n) => {
        f(this, T, n);
      }).asPromise({ preventTimeout: !0 })
    ])), f(this, w, this.consumeContext(O, (n) => {
      this.observe(n.propertyAlias, (c) => {
        f(this, y, c);
      });
    }).asPromise({ preventTimeout: !0 }).catch(() => {
    })), e(this, A).then(async () => {
      await Promise.race([e(this, w), new Promise((n) => setTimeout(n, 200))]), await u(this, o, _).call(this);
    });
  }
  /** Returns true if the element should not render at all. */
  isHidden() {
    return !u(this, o, E).call(this);
  }
  /** Returns an override label, or undefined to use the manifest default. */
  getLabel() {
  }
  /** Called by the element to check if this action should be disabled. */
  getDisabledState() {
    var l, h, m;
    const t = u(this, o, P).call(this), i = u(this, o, d).call(this, t), n = (l = e(this, r)) == null ? void 0 : l.getAlias();
    if (!i || !n) return !0;
    const c = ((m = (h = e(this, r)) == null ? void 0 : h.getVariantId()) == null ? void 0 : m.culture) ?? null;
    return !R(i, n, c, t);
  }
  async execute() {
    if (await e(this, A), await Promise.race([e(this, w), new Promise((N) => setTimeout(N, 200))]), !e(this, r) || !e(this, g) || !e(this, T))
      return;
    const t = u(this, o, P).call(this), i = u(this, o, d).call(this, t), n = e(this, r).getAlias();
    if (!i || !n) return;
    const c = e(this, r).getVariantId(), l = (c == null ? void 0 : c.culture) ?? null, h = e(this, r).getValue(), m = x(h), C = await e(this, T).getLatestToken(), b = await I(i, n, l, m, C, t);
    b !== null && e(this, r).setValue(L(h, b));
  }
}
r = new WeakMap(), g = new WeakMap(), T = new WeakMap(), y = new WeakMap(), A = new WeakMap(), w = new WeakMap(), o = new WeakSet(), _ = async function() {
  var C;
  if (!e(this, r) || !e(this, g) || !e(this, T)) return;
  const t = u(this, o, P).call(this), i = u(this, o, d).call(this, t), n = e(this, r).getAlias();
  if (!i || !n) return;
  const c = ((C = e(this, r).getVariantId()) == null ? void 0 : C.culture) ?? null, l = e(this, r).getValue(), h = x(l), m = await e(this, T).getLatestToken();
  await S(i, n, c, h, m, t);
}, P = function() {
  var t;
  if (e(this, y)) {
    const i = (t = e(this, g)) == null ? void 0 : t.getUnique();
    if (i)
      return {
        parentPropertyAlias: e(this, y),
        blockElementKey: i
      };
  }
}, d = function(t) {
  var i;
  return t ? X() : (i = e(this, g)) == null ? void 0 : i.getUnique();
}, E = function() {
  var l, h, m;
  const t = u(this, o, P).call(this), i = u(this, o, d).call(this, t), n = (l = e(this, r)) == null ? void 0 : l.getAlias();
  if (!i || !n) return !0;
  const c = ((m = (h = e(this, r)) == null ? void 0 : h.getVariantId()) == null ? void 0 : m.culture) ?? null;
  return M(i, n, c, t);
};
export {
  j as NextVersionAction,
  j as api
};
//# sourceMappingURL=next-version.action-ChSpJHum.js.map
