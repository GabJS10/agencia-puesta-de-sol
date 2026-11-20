# Informe de pruebas — Catálogo web Agencia Puesta del Sol

Fecha de ejecución: 2026-11-20 (zona horaria -05:00). Producción: `https://frontend-production-0f36.up.railway.app`.
Entorno local de pruebas: `next start` (build de producción del commit `ec02a29`) en `http://localhost:3000` contra la base de datos **`puestadelsol_test`** (PostgreSQL 16.15 en Docker, contenedor `pds-postgres`, puerto 5433), creada desde cero con `prisma migrate deploy` y el seed (`ADMIN_EMAIL=admin@test.local`).

> Producción ejecutaba en el momento de las pruebas el código anterior a estos commits (no se ha hecho push). Las pruebas contra producción (RNF01, RNF03, RNF04, RNF06) miden esa versión.

## 1. Cambios de software

| Commit | Fecha | Descripción | Archivos |
|---|---|---|---|
| `5af7832` | 2026-11-20 15:03:47 -0500 | Registro: confirmar contraseña + mostrar/ocultar | `frontend/components/auth/PasswordInput.tsx` (nuevo), `frontend/components/auth/RegisterForm.tsx`, `frontend/app/api/auth/register/route.ts` |
| `addc3b8` | 2026-11-20 15:03:47 -0500 | Recuperación de contraseña por correo | `frontend/prisma/schema.prisma`, `frontend/prisma/migrations/20261120200140_password_reset_token/migration.sql` (nuevo), `frontend/lib/password-reset.ts` (nuevo), `frontend/lib/email/templates.ts`, `frontend/app/api/auth/forgot-password/route.ts` (nuevo), `frontend/app/api/auth/reset-password/route.ts` (nuevo), `frontend/app/(site)/(auth)/recuperar/page.tsx` (nuevo), `frontend/app/(site)/(auth)/restablecer/page.tsx` (nuevo), `frontend/components/auth/ForgotPasswordForm.tsx` (nuevo), `frontend/components/auth/ResetPasswordForm.tsx` (nuevo), `frontend/components/auth/LoginForm.tsx` |
| `37a6fbb` | 2026-11-20 15:03:47 -0500 | Retira credenciales versionadas; seed exige `ADMIN_PASSWORD` | `frontend/prisma/seed.ts`, `specs/backend-propio-fase-6.md`, `specs/backend-propio-fase-2-3.md` |
| `ec02a29` | 2026-11-20 15:17:23 -0500 | Pruebas E2E Playwright y scripts de evidencia | `frontend/package.json`, `frontend/pnpm-lock.yaml`, `frontend/playwright.config.ts`, `frontend/e2e/**`, `frontend/.gitignore` |

Detalles de la recuperación de contraseña: token de 32 bytes aleatorios (`crypto.randomBytes`, base64url) enviado solo en el enlace; en la tabla `PasswordResetToken` se guarda su SHA-256 con `expiresAt = creación + 1 h` y `usedAt`. Un enlace nuevo borra los anteriores sin usar. El uso se marca con un `updateMany` condicional (`usedAt IS NULL AND expiresAt > now()`) dentro de la misma transacción que cambia la contraseña, así dos usos simultáneos del mismo token no pueden ganar ambos. `/api/auth/forgot-password` responde siempre `200` con el mismo mensaje, y el correo se envía con `after()` después de responder.

Verificación: `pnpm lint` → 0 errores, 2 avisos preexistentes (`evidencias/build/lint.txt`). `pnpm build` → exit 0 (`evidencias/build/build.txt`). Seed sin `ADMIN_PASSWORD` → falla con `Error: Falta ADMIN_PASSWORD: defínela en el entorno (o en frontend/.env) antes de correr el seed.`

## 2. Resultados por prueba

### CP20 — Registro con contraseñas distintas

| Código | Procedimiento | Resultado esperado | Resultado obtenido | Evidencia (ruta) | Estado |
|---|---|---|---|---|---|
| CP20 | 2026-11-20 15:08:34. Playwright (chromium, 1366 px) en local: `/registro`, contraseña `Clave123!`, confirmación `Clave999!`, clic en «Crear cuenta» (`node frontend/e2e/evidence/cp20-cp21.mjs`). Además, `POST /api/auth/register` con curl y contraseñas distintas (validación del servidor). Después, SQL `count(*) from "User" where email like 'cp20%'`. | No se crea la cuenta; se muestra un mensaje. | UI: mensaje «Las contraseñas no coinciden», sigue en `/registro`. API: `HTTP 400 {"error":"Las contraseñas no coinciden"}`. SQL: **0** usuarios `cp20%`. | `evidencias/cp20/cp20-mensaje.png`, `evidencias/cp20/salida.txt` | Cumplido |

### CP21 — Recuperar contraseña

| Código | Procedimiento | Resultado esperado | Resultado obtenido | Evidencia (ruta) | Estado |
|---|---|---|---|---|---|
| CP21 (local) | 2026-11-20 15:08:36. Local: cuenta `jgabis65@gmail.com` en la BD de prueba; `/ingresar` → «¿Olvidaste tu contraseña?» → `/recuperar` → envío. | Llega el correo. | Pasos 1–3 correctos y token creado (SHA-256, vence en 1 h). El correo no salió: Brevo respondió `401` (IP local no autorizada). | `evidencias/cp21/cp21-{1,2,3}-*.png`, `evidencias/cp21/brevo-error-local.txt` | No ejecutado (sustituido por la prueba en producción) |
| CP21 (producción) | `node frontend/e2e/evidence/cp21-prod.mjs` (Playwright, chromium, 1366 px) contra producción, ya con el código desplegado (`9f1b806`). Cuenta de prueba creada para esto: `jgabis65+cp21@gmail.com`. **Intento 1** (15:50:02): la API respondió 200, pero Brevo rechazó el envío con `401` por IP no autorizada (`152.55.181.184`, IP de salida de Railway). El usuario desactivó el bloqueo por IP en Brevo. **Intento 2** (15:57:44): se solicitó un enlace nuevo; el correo llegó a la bandeja del usuario y él copió el enlace sin abrirlo. **Fase 2** (15:59:53): se abrió el enlace, se definió la nueva contraseña y se inició sesión con ella. Controles: login con la contraseña anterior y reutilización del enlace. | Llega el correo; el enlace abre `/restablecer`; la contraseña cambia; se inicia sesión con la nueva; la anterior deja de servir; el enlace es de un solo uso. | Correo recibido (intento 2; confirmado por el usuario). El enlace redirige a `/restablecer`. `POST /api/auth/reset-password` → **200** («Tu contraseña fue actualizada»). Login con la nueva → `/cuenta` («Hola, QA CP21»). Login con la anterior → **401**. Reutilizar el enlace → **400** («El enlace no es válido o ya venció»). | `evidencias/cp21/produccion/1-login-enlace.png` … `10-enlace-reutilizado.png` (sin la 4: la captura del correo no se tomó, no hay acceso al buzón), `evidencias/cp21/produccion/salida.txt`, `evidencias/cp21/produccion/brevo-error-produccion.txt` | Cumplido |

### RNF01 — Seguridad

| Código | Procedimiento | Resultado esperado | Resultado obtenido | Evidencia (ruta) | Estado |
|---|---|---|---|---|---|
| RNF01-a | 2026-11-20 15:09:05. `evidencias/scripts/rnf01.sh` contra producción: `GET /api/admin/notificaciones`, `GET /api/admin/planes/1/blackouts`, `GET /api/admin/reportes/export?type=requests` en 3 condiciones: sin cookie; token alterado (JWT real del cliente con el payload cambiado a `role: ADMIN` y la firma original); sesión de cliente válida (cuenta `qa-rnf01@example.com`, registrada en producción para esta prueba). Control: las mismas rutas con sesión ADMIN válida en local. | 401/403 en las 9 llamadas. | **9/9 → HTTP 403** (`{"error":"No autorizado"}`). Control local con admin: 3/3 → 200 (los 403 no son un fallo genérico). | `evidencias/rnf01/curl-produccion.txt`, `evidencias/rnf01/control-admin-local.txt` | Cumplido |
| RNF01-b | 2026-11-20 ~15:09. `gitleaks git` v8.24.3 (Docker `zricethezav/gitleaks:v8.24.3`, `--redact`) sobre todo el historial (52 commits). Verificación manual con `git log -S`. | Sin secretos en el historial. | gitleaks: «no leaks found», reporte `[]`. **Falso negativo**: `git log -S` muestra que la contraseña de producción del admin está en el commit `86a05ab` (2026-09-09) y la contraseña de desarrollo local en `f818900` y `86a05ab`. Las reglas de gitleaks no detectan contraseñas sueltas en Markdown. El repositorio `GabJS10/agencia-puesta-de-sol` es **público** en GitHub. | `evidencias/rnf01/gitleaks/gitleaks-report.json`, `evidencias/rnf01/gitleaks/gitleaks-salida.txt`, `evidencias/rnf01/gitleaks/historial-manual.txt` | No cumplido |

### RNF03 — Responsivo

Procedimiento: 2026-11-20 15:10:41. `node frontend/e2e/evidence/rnf03.mjs` (chromium) contra producción, con sesión de `qa-rnf01@example.com`, plan `cabo-de-la-vela-magico`, alto 900 px, captura de página completa. Se midió `document.documentElement.scrollWidth > window.innerWidth`. Como `body` tiene `overflow-x: hidden` (`frontend/app/globals.css:187`), eso se propaga al viewport y esa medida **no puede** detectar desbordes; por eso se midió además la cantidad de elementos cuyo borde derecho supera el viewport sin que los recorte un contenedor propio.

| Página | 375 px (scrollWidth / desborde / elementos fuera) | 768 px | 1366 px |
|---|---|---|---|
| Inicio `/` | 375 / NO / 0 | 768 / NO / **2** | 1366 / NO / 0 |
| Planes `/planes` | 375 / NO / 0 | 768 / NO / **2** | 1366 / NO / 0 |
| Detalle `/planes/cabo-de-la-vela-magico` | 375 / NO / 0 | 768 / NO / **2** | 1366 / NO / 0 |
| Ingresar `/ingresar` | 375 / NO / 0 | 768 / NO / **2** | 1366 / NO / 0 |
| Cuenta `/cuenta` | 375 / NO / 0 | 768 / NO / **2** | 1366 / NO / 0 |

| Código | Procedimiento | Resultado esperado | Resultado obtenido | Evidencia (ruta) | Estado |
|---|---|---|---|---|---|
| RNF03 | Ver arriba. | Sin desplazamiento horizontal en ninguna página o ancho. | 15/15 sin desplazamiento horizontal (`scrollWidth == innerWidth`). Pero a **768 px** el grupo derecho del encabezado (`div.flex.items-center` y su enlace) termina en x = 776 px: 8 px por fuera, y el botón «Ingresar»/usuario aparece **cortado** en las 5 páginas (lo oculta el `overflow-x: hidden` del body). | `evidencias/rnf03/*-{375,768,1366}.png`, `evidencias/rnf03/resultados.csv`, `evidencias/rnf03/salida.txt`, `evidencias/rnf03/detalle-desborde-header-768.png` | No cumplido (768 px) |

### RNF04 — Rendimiento (Lighthouse móvil)

Procedimiento: 2026-11-20 15:11:42–15:13:32. `npx lighthouse@12.8.2 <url> --only-categories=performance --output=html --output=json` con la configuración móvil por defecto (formFactor `mobile`, throttling simulado), Chromium 159 headless, 3 ejecuciones seguidas por URL contra producción. Umbrales usados: los de Core Web Vitals, «bueno» (LCP ≤ 2,5 s, CLS ≤ 0,1). El encargo no fija un umbral para la puntuación; si la tesis define otro, hay que ajustarlo.

| Página | Ejecución | Puntuación | LCP (s) | CLS |
|---|---|---|---|---|
| /planes | 1 | 89 | 1,74 | 0,000 |
| /planes | 2 | 89 | 2,02 | 0,000 |
| /planes | 3 | 92 | 1,70 | 0,000 |
| **/planes** | **Mediana** | **89** | **1,74** | **0,000** |
| /planes/cabo-de-la-vela-magico | 1 | 74 | 3,77 | 0,000 |
| /planes/cabo-de-la-vela-magico | 2 | 76 | 3,40 | 0,001 |
| /planes/cabo-de-la-vela-magico | 3 | 75 | 3,80 | 0,000 |
| **Detalle** | **Mediana** | **75** | **3,77** | **0,000** |

| Código | Procedimiento | Resultado esperado | Resultado obtenido | Evidencia (ruta) | Estado |
|---|---|---|---|---|---|
| RNF04-planes | Ver arriba. | LCP ≤ 2,5 s, CLS ≤ 0,1 | Mediana: LCP 1,74 s, CLS 0,000, puntuación 89 | `evidencias/rnf04/planes-run{1,2,3}.report.html`, `evidencias/rnf04/resultados.csv` | Cumplido |
| RNF04-detalle | Ver arriba. | LCP ≤ 2,5 s, CLS ≤ 0,1 | Mediana: **LCP 3,77 s** (las 3 ejecuciones > 2,5 s), CLS 0,000, puntuación 75 | `evidencias/rnf04/detalle-run{1,2,3}.report.html`, `evidencias/rnf04/resultados.csv` | No cumplido (LCP) |

### RNF05 — Compatibilidad (E2E)

| Código | Procedimiento | Resultado esperado | Resultado obtenido | Evidencia (ruta) | Estado |
|---|---|---|---|---|---|
| RNF05 | 2026-11-20 ~15:14. `E2E_CLIENT_PASSWORD=<contraseña de la cuenta de prueba> E2E_REPORT_DIR=../evidencias/rnf05/reporte-html npx playwright test` (Playwright 1.65.1, `frontend/e2e/flujos-principales.spec.ts`), 4 pruebas × 3 navegadores, 1 worker, contra el **entorno local** con la BD `puestadelsol_test` (no se crearon solicitudes en producción). Cuenta `qa-e2e@test.local` y plan `cabo-de-la-vela-magico` de la BD de prueba. | 12/12 pruebas pasan. | **11 pasan, 1 falla**. chromium 4/4, firefox 4/4, webkit 3/4: falla «iniciar sesión como cliente y enviar una solicitud» (tras el login vuelve a `/ingresar?redirect=%2Fcuenta`). Diagnóstico: el login responde 200 con `Set-Cookie: pds_session=…; Secure; HttpOnly; SameSite=lax`. `next start` corre con `NODE_ENV=production`, así que la cookie va marcada `Secure`, y WebKit la descarta sobre `http://localhost` (cookies en el navegador: `[]`). Chromium y Firefox sí la guardan. Es un efecto del entorno local sin HTTPS (producción usa HTTPS), pero **no se demostró** que el flujo funcione en WebKit. | `evidencias/rnf05/reporte-html/index.html` (en la traza y el `.md` de error del reporte, la contraseña de la cuenta de prueba se reemplazó por asteriscos antes de versionarlos), `evidencias/rnf05/salida.txt`, `evidencias/rnf05/diagnostico-webkit.txt`, `evidencias/rnf05/webkit-login-fallo.png` | No cumplido (webkit) |

### RNF06 — Disponibilidad

| Código | Procedimiento | Resultado esperado | Resultado obtenido | Evidencia (ruta) | Estado |
|---|---|---|---|---|---|
| RNF06 | `evidencias/scripts/monitor.sh` en segundo plano desde 2026-11-20 15:03:58: `curl` GET a `/` de producción cada 300 s, timeout 30 s, éxito = HTTP 2xx/3xx; 37 verificaciones programadas (≈ 3 h, termina ≈ 18:04). | Disponibilidad registrada (total, exitosas, %). | **En curso al redactar este informe.** Parcial a las 15:44: 9/9 exitosas (100 %). El push del 2026-11-20 dispara un redespliegue en Railway durante el monitoreo. Se completará con el CSV final. | `evidencias/rnf06/monitoreo.csv` | En curso |

### RNF07 — Integridad (concurrencia)

Procedimiento: 2026-11-20 15:16:55 y 15:16:59. `evidencias/scripts/rnf07.sh` contra local + `puestadelsol_test`. Se crea por SQL el plan «QA RNF07» (id 5, `availabilityMode=CAPACITY`, `capacity=1`) y, en cada ensayo, se borran sus solicitudes y se insertan 2 `PENDING` (1 persona, 2027-01-15) con su evento de creación. Luego se envían en paralelo (`curl … &; wait`) dos `PATCH /api/admin/solicitudes/:id {"status":"CONFIRMED"}` con sesión ADMIN y se verifica por SQL. 10 ensayos por variante:
- **A**: apartados vigentes (+72 h), como los deja la app.
- **B**: apartados vencidos, que no bloquean: el único freno a la doble confirmación es el `pg_advisory_xact_lock` del plan.

| Código | Procedimiento | Resultado esperado | Resultado obtenido | Evidencia (ruta) | Estado |
|---|---|---|---|---|---|
| RNF07-A | Variante A, 10 ensayos | Personas confirmadas ≤ 1; un evento por cada cambio | 10/10: ambas `409` (cada solicitud ve el apartado de la otra), 0 confirmadas, 0 eventos CONFIRMED, 2 eventos de creación. Nunca más confirmadas que el cupo. Nota: la app no permite crear este estado (la segunda solicitud se rechaza al crearla), así que se forzó por SQL. | `evidencias/rnf07/variante-A.csv` | Cumplido |
| RNF07-B | Variante B, 10 ensayos | Exactamente 1 confirmada; 1 evento CONFIRMED | 10/10: una `200` y una `409`, 1 confirmada (1 persona), 1 evento CONFIRMED por ensayo, 2 eventos de creación. | `evidencias/rnf07/variante-B.csv` | Cumplido |

El primer intento del script falló por un error del propio script: la salida `INSERT 0 1` de psql se mezclaba con los ids. Se corrigió con `psql -q` y se repitieron ambas variantes completas; los CSV contienen solo la ejecución válida.

## 3. Versiones de herramientas

| Herramienta | Versión |
|---|---|
| Node.js | v24.13.0 |
| pnpm | 10.27.0 |
| Next.js | 16.1.2 |
| Prisma | 6.19.3 |
| Playwright (`@playwright/test`) | 1.65.1 |
| Chromium (Playwright) | 159.0.8154.6 |
| Firefox (Playwright) | 159.0 |
| WebKit (Playwright) | 27.2 |
| Lighthouse | 12.8.2 (vía `npx`) |
| gitleaks | v8.24.3 (Docker) |
| PostgreSQL local | 16.15 |
| curl | 8.5.0 |

## 4. Problemas y limitaciones

1. **La contraseña de producción del administrador es pública.** Estuvo en `specs/backend-propio-fase-6.md` desde el commit `86a05ab` (2026-09-09) y el repositorio de GitHub es público. Retirarla del archivo no la quita del historial. **Se rotó el 2026-11-20 ~15:38** (cambio vía `PATCH /api/perfil` como admin y actualización de la variable `ADMIN_PASSWORD` del servicio `frontend` sin redespliegue). Comprobación: login con la nueva → 200; con la anterior → 401. Las sesiones de admin emitidas antes del cambio siguen siendo válidas hasta su vencimiento (7 días), porque no se rotó `JWT_SECRET`. Reescribir el historial (git filter-repo + force push) es opcional y no la «des-publica»: pudo haber sido clonada o indexada.
2. **gitleaks dio un falso negativo** (ver RNF01-b). Su reporte limpio no prueba que no haya secretos.
3. **Brevo bloqueaba los correos de producción.** La restricción «Authorised IPs» de Brevo rechazaba también la IP de salida de Railway (`152.55.181.184`), así que ningún correo de producción salía mientras estuvo activa: acuses, cambios de estado, avisos al admin y recuperación. Los logs disponibles solo cubren el despliegue de las 15:45, por lo que no se sabe desde cuándo pasaba. El usuario desactivó el bloqueo el 2026-11-20 ~15:55 y a partir de ahí el correo llegó. Además, Brevo reescribe los enlaces con seguimiento de clics (`sendibt3.com/tr/cl/…`), así que el token de recuperación pasa por los servidores de Brevo; conviene desactivar el seguimiento de clics para este correo.
4. **WebKit en local** (RNF05): la cookie `Secure` se descarta sobre HTTP. No se cambió código. Para validarlo hace falta servir el entorno local por HTTPS o correr las E2E contra un entorno HTTPS de pruebas.
5. **Encabezado cortado a 768 px** (RNF03): defecto visual real en producción. No se corrigió.
6. **LCP del detalle de plan 3,4–3,8 s** en móvil (RNF04). No se corrigió.
7. **Texto de relleno en producción**: el detalle del plan muestra «RNT [NÚMERO RNT] - [AÑOS] años operando» (visible en `evidencias/rnf03/detalle-375.png`).
8. **Incidente en la BD de desarrollo local** (`puestadelsol`, no producción): por un error en mi encadenamiento de comandos, el seed corrió una vez contra la BD de desarrollo en lugar de la de prueba (2026-11-20 ~15:06). Creó el usuario `admin@test.local`, que ya se borró, y sobrescribió con los valores del seed los campos de los 4 planes de ejemplo (`cabo-de-la-vela-magico`, `punta-gallinas-extremo`, `riohacha-manaure-cultural`, `palomino-rio-y-mar`). Si esos planes tenían ediciones locales, se perdieron.
9. **Datos creados en producción**: el usuario CLIENT `qa-rnf01@example.com` (id 5), autorizado para RNF01 y usado también en RNF03. Puede borrarse desde el panel de administración.
10. **Limitaciones de la recuperación de contraseña**: (a) no hay límite de peticiones en `/api/auth/forgot-password`, así que se puede usar para enviar muchos correos a una dirección; (b) cambiar la contraseña no invalida las sesiones JWT ya emitidas (duran 7 días); (c) la diferencia de tiempo entre cuenta existente e inexistente se reduce enviando el correo después de responder, pero sigue habiendo una consulta y una escritura extra si la cuenta existe.
11. **Despliegue**: `pnpm start` en Railway ejecuta `prisma migrate deploy`, así que el push aplicará automáticamente la migración `password_reset_token` (solo crea una tabla) en la BD de producción.
12. **Cuenta de prueba en producción para CP21**: `jgabis65+cp21@gmail.com` («QA CP21»), sin solicitudes. Puede borrarse desde el panel.
