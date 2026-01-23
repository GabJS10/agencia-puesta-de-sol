export interface Review {
  description: string;
  rating: number;
  photo: string;
  name: string;
}

export interface UserReview {
  description: string;
  rating: number;
  photo: {
    url: string;
  };
  name: string;
}
