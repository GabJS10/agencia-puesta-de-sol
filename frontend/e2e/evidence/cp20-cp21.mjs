// CP20 y CP21 (pasos 1-2). Uso: node e2e/evidence/cp20-cp21.mjs <baseURL> <dirEvidencias> <correoCP21>
import { chromium } from "@playwright/test";
const [base, out, cp21Email] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
const log = (...a) => console.log(new Date().toISOString(), ...a);

// CP20: contraseñas distintas
const cp20Email = `cp20-${Date.now()}@test.local`;
await page.goto(`${base}/registro`);
await page.getByPlaceholder("Tu nombre").fill("Prueba CP20");
await page.getByPlaceholder("tucorreo@ejemplo.com").fill(cp20Email);
await page.locator("#password").fill("Clave123!");
await page.locator("#confirmPassword").fill("Clave999!");
await page.getByRole("button", { name: "Crear cuenta" }).click();
const msg = await page.getByText("Las contraseñas no coinciden").textContent({ timeout: 5000 });
await page.screenshot({ path: `${out}/cp20/cp20-mensaje.png`, fullPage: true });
log("CP20 mensaje:", msg, "| url:", page.url(), "| correo:", cp20Email);

// CP21 paso 0: cuenta local del cliente de prueba
const reg = await page.request.post(`${base}/api/auth/register`, {
  data: { name: "Cliente CP21", email: cp21Email, password: "Original123!", confirmPassword: "Original123!" },
});
log("CP21 registro cuenta:", reg.status());
await page.context().clearCookies();
// Paso 1: enlace en el login
await page.goto(`${base}/ingresar`);
await page.screenshot({ path: `${out}/cp21/cp21-1-login-enlace.png`, fullPage: true });
await page.getByRole("link", { name: "¿Olvidaste tu contraseña?" }).click();
await page.waitForURL("**/recuperar");
await page.getByPlaceholder("tucorreo@ejemplo.com").fill(cp21Email);
await page.screenshot({ path: `${out}/cp21/cp21-2-formulario.png`, fullPage: true });
await page.getByRole("button", { name: "Enviar enlace" }).click();
const okMsg = await page.getByRole("status").textContent({ timeout: 10000 });
await page.screenshot({ path: `${out}/cp21/cp21-3-confirmacion.png`, fullPage: true });
log("CP21 respuesta:", okMsg);
await browser.close();
