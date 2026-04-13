"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

function pinIcon(color = "#7a1a1a") {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 24px; height: 24px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #faf2dc;
        box-shadow: 0 8px 18px -6px rgba(60,15,15,0.6);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
}

function ClickCapture({
  onPick,
}: {
  onPick: (c: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function Recenter({ coords }: { coords: { lat: number; lng: number } | null }) {
  const map = useMap();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!coords) return;
    const key = `${coords.lat},${coords.lng}`;
    if (key === last.current) return;
    last.current = key;
    map.flyTo([coords.lat, coords.lng], Math.max(map.getZoom(), 11), { duration: 0.6 });
  }, [coords, map]);
  return null;
}

export function LocationPicker({
  coords,
  onChange,
}: {
  coords: { lat: number; lng: number } | null;
  onChange: (c: { lat: number; lng: number }) => void;
}) {
  const center = useMemo<[number, number]>(
    () => (coords ? [coords.lat, coords.lng] : [48.8566, 2.3522]),
    [coords],
  );
  const icon = useMemo(() => pinIcon(), []);

  return (
    <div
      className="relative h-60 overflow-hidden border border-[var(--rule)]"
      style={{ borderRadius: 2 }}
    >
      <MapContainer
        center={center}
        zoom={coords ? 12 : 3}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCapture onPick={onChange} />
        <Recenter coords={coords} />
        {coords && <Marker position={[coords.lat, coords.lng]} icon={icon} />}
      </MapContainer>
      {/* photo-corner decorations */}
      <span className="pointer-events-none absolute left-1.5 top-1.5 h-4 w-4 border-l border-t border-[var(--rule)]" />
      <span className="pointer-events-none absolute right-1.5 top-1.5 h-4 w-4 border-r border-t border-[var(--rule)]" />
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-4 w-4 border-b border-l border-[var(--rule)]" />
      <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-4 w-4 border-b border-r border-[var(--rule)]" />
    </div>
  );
}
