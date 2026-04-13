import type { Forecast } from "./weather";
import type { Item, Season, WeatherTag } from "./types";
import { currentSeason } from "./utils";

export type Scored = {
  item: Item;
  score: number;
  reasons: string[];
};

export function scoreItems(
  items: Item[],
  opts: { forecast?: Forecast; season?: Season } = {},
): Scored[] {
  const season = opts.season ?? currentSeason();
  const forecast = opts.forecast;
  const forecastTags = new Set<WeatherTag>(forecast?.tags ?? []);

  const results: Scored[] = items
    .filter((i) => !i.done)
    .map((item) => {
      const reasons: string[] = [];
      let score = item.priority * 2;

      if (item.seasons.length === 0 || item.seasons.includes(season)) {
        if (item.seasons.includes(season)) {
          score += 4;
          reasons.push(`fits ${season}`);
        }
      } else {
        score -= 3;
      }

      if (forecast) {
        const matches = item.weather.filter(
          (w) => w === "any" || forecastTags.has(w),
        );
        if (matches.length > 0) {
          score += 4;
          reasons.push(`matches ${matches.filter((w) => w !== "any").join(", ") || "any weather"}`);
        }
        const hasRain = forecastTags.has("rainy") || forecastTags.has("snow");
        if (hasRain && item.indoor) {
          score += 3;
          reasons.push("indoor option for bad weather");
        }
        if (hasRain && !item.indoor && item.weather.length === 0) {
          score -= 2;
        }
        if (forecastTags.has("sunny") && !item.indoor) {
          score += 1;
        }
      }

      if (item.lat != null && item.lng != null) score += 1;
      if (item.image_url) score += 0.5;

      return { item, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  return results;
}
