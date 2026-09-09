"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface Taxonomy {
  id: number;
  type?: string;
  location?: string;
}

export interface PlanFormData {
  id?: number;
  title: string;
  slug: string;
  price: number;
  location: string;
  description: string;
  itinerary: string;
  includes: string;
  recommendations: string;
  photoUrl: string;
  galleryUrls: string[];
  tags: string[];
  published: boolean;
  planTypeId: number | null;
  planLocationId: number | null;
}

interface PlanFormProps {
  types: { id: number; type: string }[];
  locations: { id: number; location: string }[];
  initial?: PlanFormData;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function PlanForm({ types, locations, initial }: PlanFormProps) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [form, setForm] = useState<PlanFormData>(
    initial ?? {
      title: "",
      slug: "",
      price: 0,
      location: "",
      description: "",
      itinerary: "",
      includes: "",
      recommendations: "",
      photoUrl: "",
      galleryUrls: [],
      tags: [],
      published: true,
      planTypeId: null,
      planLocationId: null,
    },
  );
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof PlanFormData>(key: K, val: PlanFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.photoUrl) {
      setError("La imagen principal es obligatoria");
      return;
    }
    setLoading(true);
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      price: Number(form.price),
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      const res = await fetch(
        isEdit ? `/api/admin/planes/${initial!.id}` : "/api/admin/planes",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar");
        return;
      }
      router.push("/admin/planes");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const field =
    "h-11 w-full rounded-lg border border-border bg-surface px-3 text-foreground outline-none focus:border-primary";
  const area =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="rounded-lg border border-brasa/30 bg-brasa/10 px-4 py-3 text-sm text-brasa">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Título</label>
          <input
            className={field}
            required
            value={form.title}
            onChange={(e) => {
              const v = e.target.value;
              set("title", v);
              if (!isEdit) set("slug", slugify(v));
            }}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Slug (URL)</label>
          <input className={field} required value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Precio (COP)</label>
          <input type="number" min={0} className={field} required value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Ubicación (texto)</label>
          <input className={field} required value={form.location} onChange={(e) => set("location", e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Tipo</label>
          <select
            className={field}
            value={form.planTypeId ?? ""}
            onChange={(e) => set("planTypeId", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">— Sin tipo —</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Ubicación (categoría)</label>
          <select
            className={field}
            value={form.planLocationId ?? ""}
            onChange={(e) => set("planLocationId", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">— Sin ubicación —</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.location}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Etiquetas (separadas por coma)</label>
        <input className={field} value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="3 días, Todo incluido, Aventura" />
      </div>

      <ImageUploader label="Imagen principal" value={form.photoUrl} onChange={(url) => set("photoUrl", url)} />

      <div>
        <label className="mb-1.5 block text-sm font-medium">Galería</label>
        <div className="space-y-3">
          {form.galleryUrls.map((url, i) => (
            <ImageUploader
              key={i}
              value={url}
              onChange={(v) =>
                set(
                  "galleryUrls",
                  v
                    ? form.galleryUrls.map((u, idx) => (idx === i ? v : u))
                    : form.galleryUrls.filter((_, idx) => idx !== i),
                )
              }
            />
          ))}
          <ImageUploader
            value=""
            onChange={(v) => v && set("galleryUrls", [...form.galleryUrls, v])}
          />
        </div>
      </div>

      {(["description", "itinerary", "includes", "recommendations"] as const).map((k) => (
        <div key={k}>
          <label className="mb-1.5 block text-sm font-medium capitalize">
            {k === "description" ? "Descripción" : k === "includes" ? "Incluye" : k === "recommendations" ? "Recomendaciones" : "Itinerario"}{" "}
            <span className="text-xs font-normal text-muted-foreground">(Markdown)</span>
          </label>
          <textarea rows={5} className={area} value={form[k]} onChange={(e) => set(k, e.target.value)} />
        </div>
      ))}

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
        Publicado (visible en el sitio)
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-lg bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear plan"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/planes")}
          className="h-11 rounded-lg border border-border px-6 font-medium text-foreground hover:bg-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
