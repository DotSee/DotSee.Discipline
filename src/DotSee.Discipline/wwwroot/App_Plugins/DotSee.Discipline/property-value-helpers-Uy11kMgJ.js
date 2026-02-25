const c = /* @__PURE__ */ new Map();
function u(t, n, s) {
  return `${t}-${n}-${s ?? ""}`;
}
async function d(t, n, s, o) {
  const e = new URLSearchParams({
    contentKey: t,
    propertyAlias: n
  });
  s && e.set("culture", s);
  const i = `/umbraco/api/propertyversions/history?${e.toString()}`, r = await fetch(i, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${o}`
    }
  });
  return r.ok ? await r.json() : (console.error("[PropertyVersions] Failed to fetch versions:", r.status, r.statusText), []);
}
async function f(t, n, s, o, e) {
  const i = u(t, n, s);
  let r = c.get(i);
  return r || (r = {
    versions: await d(t, n, s, e),
    currentIndex: 0,
    originalValue: o
  }, c.set(i, r)), r;
}
function a() {
  document.dispatchEvent(new Event("dotsee-version-nav-changed"));
}
async function g(t, n, s, o, e) {
  const i = await f(t, n, s, o, e);
  if (i.versions.length === 0)
    return a(), null;
  const r = i.currentIndex + 1;
  return r >= i.versions.length ? (a(), null) : (i.currentIndex = r, a(), i.versions[r].value);
}
async function p(t, n, s, o, e) {
  const i = await f(t, n, s, o, e);
  if (i.versions.length === 0)
    return a(), null;
  const r = i.currentIndex - 1;
  return r < 0 ? (a(), null) : (i.currentIndex = r, a(), i.versions[r].value);
}
function h(t, n, s) {
  const o = u(t, n, s), e = c.get(o);
  return !e || e.versions.length === 0 ? !0 : e.currentIndex + 1 < e.versions.length;
}
function l(t, n, s) {
  const o = u(t, n, s), e = c.get(o);
  return !e || e.versions.length === 0 ? !1 : e.currentIndex > 0;
}
function x(t) {
  return t == null ? "" : typeof t == "string" ? t : typeof t == "object" && "markup" in t ? t.markup ?? "" : String(t);
}
function y(t, n) {
  if (t != null && typeof t == "object" && "markup" in t) {
    try {
      const o = JSON.parse(n);
      if (o && typeof o == "object" && "markup" in o)
        return o;
    } catch {
    }
    return { ...t, markup: n };
  }
  return n;
}
export {
  l as a,
  y as b,
  h as c,
  p as d,
  x as g,
  g as n
};
//# sourceMappingURL=property-value-helpers-Uy11kMgJ.js.map
