export interface Image {
  url: string;
  name: string;
}

export interface Tag {
  id: number;
  element: string;
}

export interface PlanLocation {
  location: string;
}

export interface PlanType {
  type: string;
}

export interface Plane {
  id: number;
  documentId: string;
  title: string;
  location: string;
  price: number;
  description: string;
  recommendations: string;
  includes: string;
  itinerary: string | null;
  url: string;
  photo: Image;
  gallery: Image[];
  tags: Tag[];
  plan_location: PlanLocation;
  plan_type: PlanType;
}
