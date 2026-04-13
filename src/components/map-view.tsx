"use client";

import { useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Item } from "@/lib/types";

function pin(color: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 26px; height: 26px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #faf2dc;
        box-shadow: 0 10px 22px -8px rgba(60,15,15,0.55);
      "></div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });
}

export function MapView({
  items,
  homeLat,
  homeLng,
}: {
  items: Item[];
  homeLat: number | null;
  homeLng: number | null;
}) {
  const center = useMemo<[number, number]>(() => {
    if (items.length > 0 && items[0].lat != null && items[0].lng != null) {
      const avgLat = items.reduce((s, i) => s + (i.lat ?? 0), 0) / items.length;
      const avgLng = items.reduce((s, i) => s + (i.lng ?? 0), 0) / items.length;
      return [avgLat, avgLng];
    }
    if (homeLat != null && homeLng != null) return [homeLat, homeLng];
    return [20, 0];
  }, [items, homeLat, homeLng]);

  const zoom = items.length > 0 ? 5 : 2;

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-[var(--rule)] bg-[var(--paper-warm)] px-10 py-20 text-center">
        <p className="font-display text-2xl italic text-[var(--muted-foreground)]">
          no places pinned yet — add an idea with a location, and it will
          land here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative border border-[var(--rule)] bg-[var(--paper-warm)] p-2">
      {/* chart header */}
      <div className="flex items-center justify-between border-b border-[var(--rule)] px-3 py-2">
        <span className="eyebrow">the chart</span>
        <span className="num-mono text-[11px] text-[var(--muted-foreground)]">
          {items.length} pin{items.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="relative" style={{ borderRadius: 2 }}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom
          className="h-[68vh] w-full"
          style={{ borderRadius: 2 }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {items.map((i) =>
            i.lat != null && i.lng != null ? (
              <Marker
                key={i.id}
                position={[i.lat, i.lng]}
                icon={pin(i.addedByColor ?? "#7a1a1a")}
              >
                <Popup>
                  <div
                    className="font-display"
                    style={{ fontSize: "1.15rem", lineHeight: 1.1 }}
                  >
                    {i.title}
                  </div>
                  {i.address && (
                    <div
                      style={{
                        marginTop: 4,
                        fontStyle: "italic",
                        fontSize: 12,
                        opacity: 0.75,
                      }}
                    >
                      {i.address}
                    </div>
                  )}
                  {i.addedByName && (
                    <div style={{ marginTop: 8, fontSize: 12 }}>
                      <em>pinned by </em>
                      <span
                        style={{
                          color: i.addedByColor,
                          fontWeight: 500,
                        }}
                      >
                        {i.addedByName}
                      </span>
                    </div>
                  )}
                </Popup>
              </Marker>
            ) : null,
          )}
        </MapContainer>
      </div>
    </div>
  );
}
