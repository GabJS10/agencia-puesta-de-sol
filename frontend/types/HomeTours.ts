export interface HomeTour {
  id: number;
  title: string;
  price: number;
  location: string;
  image: string;
  url: string;
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
