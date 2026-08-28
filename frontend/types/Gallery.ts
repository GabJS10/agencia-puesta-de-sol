export interface GalleryImage {
  id: number;
  caption?: string;
  order?: number;
  image: {
    url: string;
    name?: string;
    width?: number;
    height?: number;
  };
}
