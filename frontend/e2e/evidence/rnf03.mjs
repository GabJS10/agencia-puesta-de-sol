// RNF03: capturas a 375/768/1366 px y detección de desplazamiento horizontal.
// Uso: node e2e/evidence/rnf03.mjs <baseURL> <dirSalida> <slugPlan> <correoCliente> <clave>
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const [base, out, slug, email, pass] = process.argv.slice(2);
const pages = [
  ["inicio", "/"], ["planes", "/planes"], ["detalle", `/planes/${slug}`],
  ["ingresar", "/ingresar"], ["cuenta", "/cuenta"],
];
const rows = [["pagina", "ancho", "scrollWidth", "innerWidth", "desborde_horizontal", "elementos_fuera_viewport", "captura"]];
const browser = await chromium.launch();
for (const width of [375, 768, 1366]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  const login = await page.request.post(`${base}/api/auth/login`, { data: { email, password: pass } });
  if (!login.ok()) throw new Error(`login ${login.status()}`);
  for (const [name, path] of pages) {
    // /ingresar con sesión redirige? se captura igual tal como lo ve el usuario
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(800); // animaciones de entrada
    const m = await page.evaluate(() => {
      // body tiene overflow-x:hidden (se propaga al viewport y oculta el desborde):
      // se buscan elementos que salen del viewport sin un contenedor propio que los recorte.
      const iw = window.innerWidth;
      const clipped = (el) => {
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          if (getComputedStyle(a).overflowX !== "visible") return true;
        }
        return false;
      };
      const off = [...document.body.querySelectorAll("*")]
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > iw + 1 && !clipped(el); })
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 2).join(".")}(${Math.round(el.getBoundingClientRect().right)}px)`);
      return { sw: document.documentElement.scrollWidth, iw, off };
    });
    const file = `${name}-${width}.png`;
    await page.screenshot({ path: `${out}/${file}`, fullPage: true });
    rows.push([name, width, m.sw, m.iw, m.sw > m.iw ? "SI" : "NO", m.off.length ? `"${m.off.slice(0, 3).join(" ")}"` : "0", file]);
    console.log(name, width, m.sw, m.iw, m.sw > m.iw ? "DESBORDA" : "ok", "fuera:", m.off.length, m.off.slice(0, 3).join(" "));
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/resultados.csv`, rows.map((r) => r.join(",")).join("\n") + "\n");
