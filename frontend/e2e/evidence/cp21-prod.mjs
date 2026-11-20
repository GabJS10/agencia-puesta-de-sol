// CP21 en producción, en dos fases.
//  Fase 1: node cp21-prod.mjs solicitar <baseURL> <dir> <correo>
//  Fase 2: CP21_OLD=… CP21_NEW=… node cp21-prod.mjs restablecer <baseURL> <dir> <correo> <enlace>
// Las contraseñas llegan por variables de entorno y nunca se imprimen.
import { chromium } from "@playwright/test";
const [phase, base, out, email, link] = process.argv.slice(2);
const log = (...a) => console.log(new Date().toISOString(), ...a);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
const shot = (n) => page.screenshot({ path: `${out}/${n}.png`, fullPage: true });

if (phase === "solicitar") {
  await page.goto(`${base}/ingresar`);
  await shot("1-login-enlace");
  await page.getByRole("link", { name: "¿Olvidaste tu contraseña?" }).click();
  await page.waitForURL("**/recuperar");
  await page.getByPlaceholder("tucorreo@ejemplo.com").fill(email);
  await shot("2-formulario-recuperar");
  const [res] = await Promise.all([
    page.waitForResponse(/\/api\/auth\/forgot-password/),
    page.getByRole("button", { name: "Enviar enlace" }).click(),
  ]);
  log("POST /api/auth/forgot-password ->", res.status());
  log("Mensaje:", await page.getByRole("status").textContent());
  await shot("3-confirmacion-envio");
} else {
  const { CP21_OLD: oldPw, CP21_NEW: newPw } = process.env;
  await page.goto(link);
  log("Enlace abierto:", new URL(page.url()).pathname);
  await shot("5-pagina-restablecer");
  await page.locator("#password").fill(newPw);
  await page.locator("#confirmPassword").fill(newPw);
  await shot("6-nueva-contrasena");
  const [res] = await Promise.all([
    page.waitForResponse(/\/api\/auth\/reset-password/),
    page.getByRole("button", { name: "Guardar contraseña" }).click(),
  ]);
  log("POST /api/auth/reset-password ->", res.status());
  log("Mensaje:", await page.getByRole("status").textContent());
  await shot("7-contrasena-actualizada");

  // Login con la nueva contraseña
  await page.getByRole("link", { name: "Iniciar sesión" }).click();
  await page.waitForURL("**/ingresar");
  await page.getByPlaceholder("tucorreo@ejemplo.com").fill(email);
  await page.locator("#password").fill(newPw);
  await shot("8-login-nueva");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL("**/cuenta", { timeout: 15000 });
  log("Login con la nueva -> URL", new URL(page.url()).pathname);
  await shot("9-cuenta-tras-login");

  // Controles: la contraseña anterior ya no sirve y el enlace es de un solo uso
  const ctx = await browser.newContext();
  const r1 = await ctx.request.post(`${base}/api/auth/login`, { data: { email, password: oldPw } });
  log("Login con la contraseña anterior ->", r1.status());
  const p2 = await ctx.newPage();
  await p2.goto(link);
  await p2.locator("#password").fill(newPw + "x");
  await p2.locator("#confirmPassword").fill(newPw + "x");
  const [r2] = await Promise.all([
    p2.waitForResponse(/\/api\/auth\/reset-password/),
    p2.getByRole("button", { name: "Guardar contraseña" }).click(),
  ]);
  log("Reutilizar el enlace ->", r2.status(), await r2.text());
  await p2.waitForTimeout(500);
  await p2.screenshot({ path: `${out}/10-enlace-reutilizado.png`, fullPage: true });
}
await browser.close();
