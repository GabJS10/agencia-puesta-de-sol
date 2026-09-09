// Contenido fijo de la Home / Footer (antes gestionado en Strapi).
// Alcance "mínimo": editar aquí para cambiar textos e imágenes de la portada.
// Las formas replican lo que devolvía Strapi para no tocar la UI.

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;
const portrait = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=200&h=200&q=80`;

export const HOME = {
  sobreNosotros:
    "Somos una agencia guajira que muestra el rincón más al norte de Suramérica como lo vivimos quienes nacimos aquí.",
  estadistica: [
    { value: "+10", label: "Años de experiencia" },
    { value: "+5K", label: "Viajeros felices" },
    { value: "15", label: "Destinos" },
    { value: "4.9", label: "Calificación" },
  ],
  HeroTours: [
    {
      id: 1,
      title: "Cabo de la Vela",
      description:
        "Donde el desierto abraza el Caribe. Atardeceres, dunas y cultura Wayúu.",
      image: { url: img("1507525428034-b723cf961d3e") },
      url: "/planes/cabo-de-la-vela-magico",
    },
    {
      id: 2,
      title: "Punta Gallinas",
      description:
        "El punto más al norte del continente: las dunas de Taroa cayendo al mar.",
      image: { url: img("1682687220742-aba13b6e50ba") },
      url: "/planes/punta-gallinas-extremo",
    },
    {
      id: 3,
      title: "Palomino",
      description: "Del río a la Sierra y al mar Caribe en un mismo día.",
      image: { url: img("1544551763-46a013bb70d5") },
      url: "/planes/palomino-rio-y-mar",
    },
  ],
  HomeTours: [
    {
      id: 1,
      title: "Cabo de la Vela",
      price: 450000,
      location: "La Guajira",
      image: { url: img("1507525428034-b723cf961d3e") },
      url: "/planes/cabo-de-la-vela-magico",
    },
    {
      id: 2,
      title: "Punta Gallinas",
      price: 720000,
      location: "La Guajira",
      image: { url: img("1682687220742-aba13b6e50ba") },
      url: "/planes/punta-gallinas-extremo",
    },
    {
      id: 3,
      title: "Riohacha & Manaure",
      price: 280000,
      location: "La Guajira",
      image: { url: img("1533105079780-92b9be482077") },
      url: "/planes/riohacha-manaure-cultural",
    },
    {
      id: 4,
      title: "Palomino Río y Mar",
      price: 320000,
      location: "La Guajira",
      image: { url: img("1544551763-46a013bb70d5") },
      url: "/planes/palomino-rio-y-mar",
    },
  ],
  HomeReviews: [
    {
      description:
        "Un viaje inolvidable. Los guías Wayúu nos mostraron una Guajira que no sale en Google.",
      rating: 5,
      name: "Laura Gómez",
      photo: { url: portrait("1494790108377-be9c29b29330") },
    },
    {
      description:
        "Punta Gallinas es de otro planeta. Todo salió perfecto, la logística impecable.",
      rating: 5,
      name: "Andrés Martínez",
      photo: { url: portrait("1507003211169-0a1dd7228f2d") },
    },
    {
      description:
        "Atardeceres en Cabo de la Vela que no olvidaré. 100% recomendados.",
      rating: 4.8,
      name: "Sofía Restrepo",
      photo: { url: portrait("1438761681033-6461ffad8d80") },
    },
  ],
  Footer: {
    phrase: "El desierto y el mar no se cuentan, se viven.",
    author: "Puesta del Sol",
    image: { url: img("1505228395891-9a51e7e86bf6") },
    number: "3001234567",
    email: "hola@puestadelsol.com",
    location: "Riohacha, La Guajira",
    AboutFooter:
      "Agencia de turismo en La Guajira. Viajes auténticos por el desierto y el Caribe, de la mano de guías locales.",
  },
};
