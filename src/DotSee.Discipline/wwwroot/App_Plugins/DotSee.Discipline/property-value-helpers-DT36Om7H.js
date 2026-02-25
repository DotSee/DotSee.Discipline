const u = /* @__PURE__ */ new Map();
function f(t, r, s, e) {
  const o = `${t}-${r}-${s ?? ""}`;
  return e ? `${o}-${e.blockElementKey}` : o;
}
async function v(t, r, s, e, o) {
  const n = new URLSearchParams({
    contentKey: t,
    propertyAlias: r
  });
  s && n.set("culture", s), o && (n.set("parentPropertyAlias", o.parentPropertyAlias), n.set("blockElementKey", o.blockElementKey));
  const a = `/umbraco/api/propertyversions/history?${n.toString()}`, i = await fetch(a, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${e}`
    }
  });
  return i.ok ? await i.json() : (console.error("[PropertyVersions] Failed to fetch versions:", i.status, i.statusText), []);
}
async function p(t, r, s, e, o, n) {
  const a = f(t, r, s, n);
  let i = u.get(a);
  return i || (i = {
    versions: await v(t, r, s, o, n),
    currentIndex: 0,
    originalValue: e
  }, u.set(a, i)), i;
}
function c() {
  document.dispatchEvent(new Event("dotsee-version-nav-changed"));
}
async function h(t, r, s, e, o, n) {
  const a = await p(t, r, s, e, o, n);
  if (a.versions.length === 0)
    return c(), null;
  const i = a.currentIndex + 1;
  return i >= a.versions.length ? (c(), null) : (a.currentIndex = i, c(), a.versions[i].value);
}
async function l(t, r, s, e, o, n) {
  const a = await p(t, r, s, e, o, n);
  if (a.versions.length === 0)
    return c(), null;
  const i = a.currentIndex - 1;
  return i < 0 ? (c(), null) : (a.currentIndex = i, c(), a.versions[i].value);
}
function d(t, r, s, e) {
  const o = f(t, r, s, e), n = u.get(o);
  return !n || n.versions.length === 0 ? !0 : n.currentIndex + 1 < n.versions.length;
}
function y(t, r, s, e) {
  const o = f(t, r, s, e), n = u.get(o);
  return !n || n.versions.length === 0 ? !1 : n.currentIndex > 0;
}
async function x(t, r, s, e, o, n) {
  await p(t, r, s, e, o, n), c();
}
function m(t, r, s, e) {
  const o = f(t, r, s, e), n = u.get(o);
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
  d as c,
  l as d,
  k as g,
  m as h,
  h as n,
  x as p
};
//# sourceMappingURL=property-value-helpers-DT36Om7H.js.map
