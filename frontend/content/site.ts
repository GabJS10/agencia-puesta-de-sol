// Contenido fijo del sitio: teléfono, redes y galería (antes en Strapi).
import { GalleryImage } from "@/types/Gallery";

// Teléfono de WhatsApp (10 dígitos, se antepone +57).
export const PHONE = "3001234567";

export const SOCIAL = {
  instagram: "https://instagram.com/puestadelsol",
  facebook: "https://facebook.com/puestadelsol",
  whatsapp: "https://wa.me/+573001234567",
};

const gal = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

export const GALLERY: GalleryImage[] = [
  { id: 1, order: 1, caption: "Atardecer en Cabo de la Vela", image: { url: gal("1507525428034-b723cf961d3e") } },
  { id: 2, order: 2, caption: "Dunas de Taroa", image: { url: gal("1682687220742-aba13b6e50ba") } },
  { id: 3, order: 3, caption: "Salinas de Manaure", image: { url: gal("1533105079780-92b9be482077") } },
  { id: 4, order: 4, caption: "Río Palomino", image: { url: gal("1544551763-46a013bb70d5") } },
  { id: 5, order: 5, caption: "Mar Caribe guajiro", image: { url: gal("1505228395891-9a51e7e86bf6") } },
  { id: 6, order: 6, caption: "Desierto de La Guajira", image: { url: gal("1469474968028-56623f02e42e") } },
];
