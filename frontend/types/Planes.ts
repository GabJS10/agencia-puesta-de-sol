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

export type AvailabilityMode = "EXCLUSIVE" | "CAPACITY";
export type BookingMode = "SINGLE_DAY" | "DATE_RANGE";

export interface Plane {
  id: number;
  documentId: string;
  title: string;
  location: string;
  price: number;
  description: string; // Markdown
  recommendations: string; // Markdown
  includes: string; // Markdown
  itinerary: string; // Markdown
  url: string; // slug
  photo: Image;
  gallery: Image[];
  tags: Tag[];
  plan_location: PlanLocation;
  plan_type: PlanType;
  // Disponibilidad
  availabilityMode: AvailabilityMode;
  capacity: number | null;
  bookingMode: BookingMode;
  bookingsOpen: boolean;
}
