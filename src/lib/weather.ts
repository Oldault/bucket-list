import type { WeatherTag } from "./types";

export type DayPart = {
  weatherCode: number;
  temp: number;           // average temp for the period
};

export type Forecast = {
  date: string;
  tempMin: number;
  tempMax: number;
  precipMm: number;
  weatherCode: number;
  tags: WeatherTag[];
  morning: DayPart | null;    // 06:00–12:00
  afternoon: DayPart | null;  // 12:00–18:00
};

export async function fetchForecast(lat: number, lng: number, days = 7): Promise<Forecast[]> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lng.toString());
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
  );
  url.searchParams.set("hourly", "weather_code,temperature_2m");
  url.searchParams.set("forecast_days", days.toString());
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString(), {
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`open-meteo failed: ${res.status}`);
  const json = (await res.json()) as {
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_sum: number[];
    };
    hourly: {
      time: string[];
      weather_code: number[];
      temperature_2m: number[];
    };
  };
  const d = json.daily;
  const h = json.hourly;

  const hourlyEntries = new Map<string, { hour: number; code: number; temp: number }[]>();
  for (let hi = 0; hi < h.time.length; hi++) {
    const dt = h.time[hi];
    const date = dt.slice(0, 10);
    const hour = parseInt(dt.slice(11, 13), 10);
    if (!hourlyEntries.has(date)) hourlyEntries.set(date, []);
    hourlyEntries.get(date)!.push({ hour, code: h.weather_code[hi], temp: h.temperature_2m[hi] });
  }

  return d.time.map((date, i) => {
    const tempMax = d.temperature_2m_max[i];
    const tempMin = d.temperature_2m_min[i];
    const precipMm = d.precipitation_sum[i];
    const weatherCode = d.weather_code[i];
    const hours = hourlyEntries.get(date) ?? [];

    return {
      date,
      tempMin,
      tempMax,
      precipMm,
      weatherCode,
      tags: codeToTags(weatherCode, tempMax, precipMm),
      morning: aggregatePeriod(hours, 6, 12),
      afternoon: aggregatePeriod(hours, 12, 18),
    };
  });
}

function aggregatePeriod(
  hours: { hour: number; code: number; temp: number }[],
  fromHour: number,
  toHour: number,
): DayPart | null {
  const slice = hours.filter((h) => h.hour >= fromHour && h.hour < toHour);
  if (slice.length === 0) return null;
  const avgTemp = slice.reduce((s, h) => s + h.temp, 0) / slice.length;
  // pick the most "significant" weather code (highest = most severe in WMO)
  const worstCode = Math.max(...slice.map((h) => h.code));
  return { weatherCode: worstCode, temp: Math.round(avgTemp) };
}

// https://open-meteo.com/en/docs — WMO Weather interpretation codes
function codeToTags(code: number, tempMax: number, precipMm: number): WeatherTag[] {
  const tags = new Set<WeatherTag>();
  if (code === 0) tags.add("sunny");
  else if (code <= 3) tags.add("cloudy");
  else if (code >= 45 && code <= 48) tags.add("cloudy");
  else if (code >= 51 && code <= 67) tags.add("rainy");
  else if (code >= 71 && code <= 77) tags.add("snow");
  else if (code >= 80 && code <= 82) tags.add("rainy");
  else if (code >= 85 && code <= 86) tags.add("snow");
  else if (code >= 95) tags.add("rainy");

  if (precipMm >= 2) tags.add("rainy");
  if (tempMax >= 25) tags.add("hot");
  if (tempMax <= 5) tags.add("cold");

  return Array.from(tags);
}

export function weatherLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}

export function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}
