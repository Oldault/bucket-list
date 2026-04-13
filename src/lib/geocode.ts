export type GeocodeHit = {
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
};

export async function geocodeSearch(q: string, limit = 6): Promise<GeocodeHit[]> {
  if (!q.trim()) return [];
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", limit.toString());
  url.searchParams.set("addressdetails", "0");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "bucket-list-app/0.1 (self-hosted)",
      "Accept-Language": "en",
    },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
    type?: string;
  }>;
  return json.map((r) => ({
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    type: r.type,
  }));
}
