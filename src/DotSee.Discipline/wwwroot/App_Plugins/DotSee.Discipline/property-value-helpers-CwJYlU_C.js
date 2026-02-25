const u = /* @__PURE__ */ new Map();
function f(t, r, o, e) {
  const i = `${t}-${r}-${o ?? ""}`;
  return e ? `${i}-${e.blockElementKey}` : i;
}
async function d(t, r, o, e, i) {
  const n = new URLSearchParams({
    contentKey: t,
    propertyAlias: r
  });
  o && n.set("culture", o), i && (n.set("parentPropertyAlias", i.parentPropertyAlias), n.set("blockElementKey", i.blockElementKey));
  const a = `/umbraco/api/propertyversions/history?${n.toString()}`, s = await fetch(a, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${e}`
    }
  });
  return s.ok ? await s.json() : (console.error("[PropertyVersions] Failed to fetch versions:", s.status, s.statusText), []);
}
async function p(t, r, o, e, i, n) {
  const a = f(t, r, o, n);
  let s = u.get(a);
  return s || (s = {
    versions: await d(t, r, o, i, n),
    currentIndex: 0,
    originalValue: e
  }, u.set(a, s)), s;
}
function c() {
  document.dispatchEvent(new Event("dotsee-version-nav-changed"));
}
async function g(t, r, o, e, i, n) {
  const a = await p(t, r, o, e, i, n);
  if (a.versions.length === 0)
    return c(), null;
  const s = a.currentIndex + 1;
  return s >= a.versions.length ? (c(), null) : (a.currentIndex = s, c(), a.versions[s].value);
}
async function l(t, r, o, e, i, n) {
  const a = await p(t, r, o, e, i, n);
  if (a.versions.length === 0)
    return c(), null;
  const s = a.currentIndex - 1;
  return s < 0 ? (c(), null) : (a.currentIndex = s, c(), a.versions[s].value);
}
function y(t, r, o, e) {
  const i = f(t, r, o, e), n = u.get(i);
  return !n || n.versions.length === 0 ? !0 : n.currentIndex + 1 < n.versions.length;
}
function h(t, r, o, e) {
  const i = f(t, r, o, e), n = u.get(i);
  return !n || n.versions.length === 0 ? !1 : n.currentIndex > 0;
}
function x(t) {
  return t == null ? "" : typeof t == "string" ? t : typeof t == "object" && "markup" in t ? t.markup ?? "" : String(t);
}
function m(t, r) {
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
  h as a,
  m as b,
  y as c,
  l as d,
  x as g,
  g as n
};
//# sourceMappingURL=property-value-helpers-CwJYlU_C.js.map
