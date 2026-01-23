export interface HeroTour {
  id: number;
  title: string;
  description: string;
  image: string;
  url: string;
}

export interface tour {
  id: number;
  title: string;
  description: string;
  image: {
    url: string;
  };
  url: string;
}
