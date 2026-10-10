export interface HomeTour {
  id: number;
  title: string;
  price: number;
  location: string;
  image: string;
  url: string;
  /** Tipo de plan (Desierto, Playa…); alimenta las pestañas del home. */
  type?: string;
}

export interface HTour {
  id: number;
  title: string;
  price: number;
  location: string;
  image: {
    url: string;
  };
  url: string;
}
