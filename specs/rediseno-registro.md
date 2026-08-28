# Registro de rediseño — "Puesta del Sol · Guajira"

> Bitácora del rediseño de interfaz (dirección Guajira/Wayúu) + páginas nuevas (Galería, Contáctanos).
> Plan completo en `../../.claude/plans/twinkly-cuddling-unicorn.md`. Se actualiza al cierre de cada fase.

## Dirección de diseño

Marca de turismo de La Guajira. Mundo: desierto + Caribe, cultura Wayúu (tejido/mochilas), atardeceres
de Cabo de la Vela, flamencos, salinas. Tesis: hero a sangre + titular display grande; firma = motivo
**kanas** (rombos del tejido Wayúu).

**Paleta "Atardecer del desierto":**
| Token | Hex | Uso |
|---|---|---|
| `arena` | `#F4EAD6` | fondo claro |
| `arena-2` | `#E9D9BC` | superficie/borde cálido |
| `barro` | `#B85C38` | terracota (tierra) |
| `sol` | `#F5A538` | marca (naranja atardecer) |
| `brasa` | `#D6455F` | magenta-coral (acento vivo) |
| `mar` | `#159A8C` | turquesa Caribe |
| `noche` | `#171026` | fondo oscuro / tinta |

**Tipografía:** display `Fraunces` (soft-serif), cuerpo/UI `Outfit` (se conserva), eyebrow = Outfit
mayúsculas con tracking.
**Firma:** motivo kanas (SVG) + degradado de marca `sol→brasa→mar` + eyebrows con tick de atardecer.

## Estado por fases

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Fundamentos: tokens, fuentes, motivo kanas, eyebrow | ✅ Hecho |
| 1 | Backend: content-type Galería en Strapi | ✅ Código listo (sin desplegar) |
| 2 | Páginas Galería y Contáctanos | ✅ Hecho (build OK) |
| 3 | Restyle de home/planes/detalle/navbar/footer | ✅ Hecho (build OK) |

## Fase 3 — Restyle al nuevo sistema (✅ 2026-08-28)

Aplicado de forma coherente: titulares en `font-display` (Fraunces), eyebrows con el componente
`Eyebrow`, acentos con el degradado de marca (`brand-rule`, `text-atardecer`) y firma kanas.

- **Home** (`app/page.tsx`): 2 bandas `KanasBand` como divisores entre secciones.
- `home/Hero.tsx`: título display + `brand-rule` bajo el titular.
- `home/About.tsx`: `Eyebrow`, párrafo en display, estadísticas en `text-atardecer`.
- `home/Destinations.tsx`: `Eyebrow` + título display; se limpió una sombra con variable inexistente
  (`--color-brand-glow`).
- `home/DestinationCard.tsx`: título en display, hover a `sol`.
- `home/Reviews.tsx`: `Eyebrow` + título display; misma limpieza de sombra.
- `home/QuoteSection.tsx`: cita en display + `brand-rule` + cita en `sol`.
- `home/Location.tsx`: `Eyebrow` + título display (se reutiliza también en Contáctanos).
- `layout/Navbar.tsx` y `layout/Footer.tsx`: marca "Puesta del Sol" en display.
- `planes/PlanesHero.tsx`: título display con `text-atardecer`.
- `planes/[slug]/page.tsx` y `planes/RelatedPlanes.tsx`: títulos en display.
- Verificación: `tsc` 0 errores; `pnpm build` exit 0 (todas las rutas compilan y prerenderizan).

## Fase 4 — Página "Nosotros" (✅ 2026-08-28)

- Nuevo `frontend/app/nosotros/page.tsx` (server component), reusa `getHome()` (`sobreNosotros`,
  `estadistica`, imagen de `HeroTours`/`Footer`). Secciones: hero oscuro, historia (2 columnas + imagen
  con acento kanas en esquina), estadísticas en `text-atardecer`, misión/valores (3 tarjetas con kanas al
  hover) y "por qué elegirnos" + tarjeta CTA a `/planes` y `/contactanos`. Copy curado (Guajira/Wayúu).
- Sin backend nuevo ni cambios de navbar (el enlace `/nosotros` ya existía).
- Verificación: `tsc` 0 errores; `pnpm build` exit 0 (ruta `/nosotros` prerenderiza).

## Estado global del rediseño
**Fases 0-4 completas y verificadas (build exit 0). Nada desplegado aún** — pendiente el push de
checkpoint (desplegaría backend con la galería + frontend con paleta y páginas nuevas). Tras desplegar,
el usuario sube imágenes de galería en el admin.

## Fase 2 — Páginas nuevas (✅ 2026-08-28)

- `frontend/types/Gallery.ts` + `frontend/lib/get-gallery.ts` (`gallery-images?populate=image&sort=order:asc`).
- `frontend/components/gallery/GalleryLightbox.tsx` (client): grid masonry (columns CSS) + lightbox con
  teclado (Esc/←/→), caption al hover, `resolveMedia` para las URLs.
- `frontend/app/galeria/page.tsx`: hero oscuro (legible bajo el navbar), banda kanas, grid y **estado
  vacío** de invitación (mientras no haya imágenes subidas).
- `frontend/components/contact/ContactForm.tsx` (client): campos **nombre + asunto + personas + fecha +
  mensaje** → arma `wa.me` (patrón de ReservationForm, reusa `ui/calendar`).
- `frontend/app/contactanos/page.tsx`: hero, canales de contacto (de `getHome().Footer`), redes
  (`getSocial`), **botón directo de WhatsApp**, formulario, y **mapa** reutilizando `home/Location`.
- Verificación: `tsc` 0 errores; `pnpm build` exit 0 (rutas `/galeria` y `/contactanos` prerenderizan).
  La galería sale vacía hasta desplegar el backend (Fase 1) y subir imágenes.

## Fase 1 — Content-type Galería (✅ código, 2026-08-28)

- Nuevo API `backend/src/api/gallery-image/` (schema + controller/route/service con factories core).
- Campos: `image` (media, images, required), `caption` (string ≤120), `order` (integer, default 0).
  `draftAndPublish: true`.
- **Sin desplegar aún:** un push a `main` desplegaría también la paleta (Fase 0) a producción, que el
  usuario prefirió no desplegar todavía. Se despliega en un checkpoint posterior. Al desplegar, Railway
  sincroniza la tabla `gallery_images` en Postgres y el usuario sube imágenes en el admin (👤).
- Lectura desde el frontend: se usa el `STRAPI_TOKEN` read-only (cubre find/findOne de todos los tipos,
  incluidos los nuevos). Caveat: si tras desplegar la API devolviera 401, habría que regenerar el token
  o habilitar el permiso público de `gallery-image` en el admin.

## Fase 0 — Fundamentos (✅ 2026-08-28)

- `frontend/app/globals.css`: reemplazada la paleta por "Atardecer del desierto" (light + dark),
  mapeada a los tokens semánticos existentes (`background/foreground/primary/surface/muted/border`) y a
  los del sistema shadcn (retintados cálidos), para no romper utilidades ya usadas. Añadidas utilidades
  de acento (`bg-sol`, `text-mar`, `border-barro`, …), `--font-display`, y clases de firma
  (`.font-display`, `.gradient-atardecer`, `.brand-rule`, `.text-atardecer`).
- `frontend/app/layout.tsx`: se añade la fuente `Fraunces` (`--font-fraunces`) junto a `Outfit`.
- Nuevo `frontend/components/ui/KanasBand.tsx`: motivo kanas Wayúu en SVG (rombos, tileable, altura/opacidad por props).
- Nuevo `frontend/components/ui/Eyebrow.tsx`: etiqueta de sección con tick de degradado.
- Verificación: `tsc --noEmit` → 0 errores. `pnpm build` contra el backend de Railway → **exit 0**
  (compiló utilidades nuevas, fuentes OK, prerender de home/planes/detalle correcto).
  Aviso menor no bloqueante: hay un `pnpm-lock.yaml` en un directorio padre; Turbopack elige ese como
  root. Se puede fijar `turbopack.root` en `next.config.ts` si molesta.

### Notas de diseño (para no repetir)
- Se evita el cliché "serif contrastada + crema + terracota y nada más": lo rompen el turquesa Caribe,
  el magenta de atardecer y el motivo kanas como firma.
- El naranja de marca original (`#F5A538`) se conserva como `sol` para continuidad.