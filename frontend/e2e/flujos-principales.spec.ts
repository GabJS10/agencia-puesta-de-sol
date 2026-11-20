import { test, expect } from "@playwright/test";

// Cuenta cliente de prueba (solo BD local de pruebas). La contraseña no se versiona.
const password = process.env.E2E_CLIENT_PASSWORD;
if (!password) throw new Error("Define E2E_CLIENT_PASSWORD para correr las pruebas E2E");
const CLIENT = { name: "Cliente E2E", email: process.env.E2E_CLIENT_EMAIL ?? "qa-e2e@test.local", password };
const PLAN = { slug: "cabo-de-la-vela-magico", title: "Cabo de la Vela Mágico", type: "Playa" };

test.beforeAll(async ({ request }) => {
  const res = await request.post("/api/auth/register", {
    data: { ...CLIENT, confirmPassword: CLIENT.password },
  });
  expect([201, 409]).toContain(res.status()); // 409 = ya existe de otra ejecución
});

test("ver el catálogo", async ({ page }) => {
  await page.goto("/planes");
  await expect(page.locator('a[href^="/planes/"]').first()).toBeVisible();
  await expect(page.getByText(PLAN.title).first()).toBeVisible();
});

test("filtrar por tipo", async ({ page }) => {
  await page.goto("/planes");
  await page.getByRole("button", { name: PLAN.type, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`type=${PLAN.type}`));
  await expect(page.getByRole("button", { name: PLAN.type, exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(PLAN.title).first()).toBeVisible();
  // Los planes de otro tipo desaparecen
  await expect(page.getByText("Punta Gallinas Extremo")).toHaveCount(0);
});

test("abrir el detalle de un plan", async ({ page }) => {
  await page.goto("/planes");
  await page.locator(`a[href="/planes/${PLAN.slug}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`/planes/${PLAN.slug}$`));
  await expect(page.getByRole("heading", { level: 1 })).toContainText(PLAN.title);
});

test("iniciar sesión como cliente y enviar una solicitud", async ({ page }) => {
  await page.goto("/ingresar");
  await page.getByPlaceholder("tucorreo@ejemplo.com").fill(CLIENT.email);
  await page.locator("#password").fill(CLIENT.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/cuenta/);

  await page.goto(`/planes/${PLAN.slug}`);
  await page.getByPlaceholder("3001234567").fill("3001234567");
  await page.getByRole("button", { name: /Selecciona un día/ }).click();
  await page.locator("button[data-day]:not([disabled])").first().click();
  await page.getByRole("button", { name: "Listo" }).click();
  await page.getByRole("button", { name: "Solicitar plan" }).click();
  await expect(page.getByRole("heading", { name: "¡Solicitud enviada!" })).toBeVisible();
});
