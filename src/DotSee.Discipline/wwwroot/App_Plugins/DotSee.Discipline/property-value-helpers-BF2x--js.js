const u = /* @__PURE__ */ new Map();
function f(t, r, s, e) {
  const i = `${t}-${r}-${s ?? ""}`;
  return e ? `${i}-${e.blockElementKey}` : i;
}
async function v(t, r, s, e, i) {
  const n = new URLSearchParams({
    contentKey: t,
    propertyAlias: r
  });
  s && n.set("culture", s), i && (n.set("parentPropertyAlias", i.parentPropertyAlias), n.set("blockElementKey", i.blockElementKey));
  const o = `/umbraco/api/propertyversions/history?${n.toString()}`, a = await fetch(o, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${e}`
    }
  });
  return a.ok ? await a.json() : [];
}
async function p(t, r, s, e, i, n) {
  const o = f(t, r, s, n);
  let a = u.get(o);
  return a || (a = {
    versions: await v(t, r, s, i, n),
    currentIndex: 0,
    originalValue: e
  }, u.set(o, a)), a;
}
function c() {
  document.dispatchEvent(new Event("dotsee-version-nav-changed"));
}
async function h(t, r, s, e, i, n) {
  const o = await p(t, r, s, e, i, n);
  if (o.versions.length === 0)
    return c(), null;
  const a = o.currentIndex + 1;
  return a >= o.versions.length ? (c(), null) : (o.currentIndex = a, c(), o.versions[a].value);
}
async function d(t, r, s, e, i, n) {
  const o = await p(t, r, s, e, i, n);
  if (o.versions.length === 0)
    return c(), null;
  const a = o.currentIndex - 1;
  return a < 0 ? (c(), null) : (o.currentIndex = a, c(), o.versions[a].value);
}
function l(t, r, s, e) {
  const i = f(t, r, s, e), n = u.get(i);
  return !n || n.versions.length === 0 ? !0 : n.currentIndex + 1 < n.versions.length;
}
function y(t, r, s, e) {
  const i = f(t, r, s, e), n = u.get(i);
  return !n || n.versions.length === 0 ? !1 : n.currentIndex > 0;
}
async function m(t, r, s, e, i, n) {
  await p(t, r, s, e, i, n), c();
}
function x(t, r, s, e) {
  const i = f(t, r, s, e), n = u.get(i);
  return n ? n.versions.length > 1 : !0;
}
function k(t) {
  return t == null ? "" : typeof t == "string" ? t : typeof t == "object" && "markup" in t ? t.markup ?? "" : String(t);
}
function I(t, r) {
  if (t != null && typeof t == "object" && "markup" in t) {
    try {
      const e = JSON.parse(r);
      if (e && typeof e == "object" && "markup" in e)
        return e;
    } catch {
    }
    return { ...t, markup: r };
  }
  return r;
}
export {
  y as a,
  I as b,
  l as c,
  d,
  k as g,
  x as h,
  h as n,
  m as p
};
//# sourceMappingURL=property-value-helpers-BF2x--js.js.map
