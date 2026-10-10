import { PageHero } from "@/components/ui/PageHero";
import { getGallery } from "@/lib/get-gallery";
import { GalleryLightbox } from "@/components/gallery/GalleryLightbox";
import { Camera } from "lucide-react";

export const metadata = {
  title: "Galería | Puesta del Sol",
  description:
    "Postales de La Guajira: desierto, mar Caribe y atardeceres de nuestros viajeros.",
};

export default async function GaleriaPage() {
  const images = await getGallery();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow="Galería"
        title={<>Postales de <span className="text-sol">La Guajira</span></>}
        description={
          <>
            Desierto que toca el Caribe, rancherías Wayúu y atardeceres que no
            caben en una foto. Estas son algunas de nuestras aventuras.
          </>
        }
      />

      {/* Contenido */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        {images.length > 0 ? (
          <GalleryLightbox images={images} />
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-dashed border-border bg-surface px-8 py-16 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sol/10 text-sol">
              <Camera className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-semibold">
              La galería está por llenarse
            </h2>
            <p className="mt-2 text-muted-foreground">
              Pronto compartiremos aquí las mejores postales de nuestros
              viajes. Vuelve muy pronto.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
