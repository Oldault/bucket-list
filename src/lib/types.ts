export type Season = "spring" | "summer" | "fall" | "winter";
export const SEASONS: Season[] = ["spring", "summer", "fall", "winter"];

export type WeatherTag =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "snow"
  | "hot"
  | "cold"
  | "any";

export const WEATHER_TAGS: WeatherTag[] = [
  "sunny",
  "cloudy",
  "rainy",
  "snow",
  "hot",
  "cold",
  "any",
];

export type Item = {
  id: string;
  household_id: string;
  added_by: string;
  title: string;
  notes: string | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  seasons: Season[];
  tags: string[];
  weather: WeatherTag[];
  indoor: boolean;
  priority: number;
  image_url: string | null;
  done: boolean;
  done_at: number | null;
  created_at: number;
  updated_at: number;
  addedByName?: string;
  addedByColor?: string;
};
