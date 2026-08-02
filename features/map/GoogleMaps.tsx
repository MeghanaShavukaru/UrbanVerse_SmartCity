"use client";

import { useEffect, useRef, useState } from "react";
import { Zone, ZONES } from "@/config/zones";

interface GoogleMapsProps {
  onZoneSelect: (zone: Zone) => void;
  selectedZoneId?: string | null;
}

type GooglePolygon = {
  setOptions: (options: Record<string, unknown>) => void;
  addListener: (event: string, callback: () => void) => void;
};

type GoogleMapsApi = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => object;
  Polygon: new (options: Record<string, unknown>) => GooglePolygon;
};

type GoogleMapsWindow = Window & { google?: { maps: GoogleMapsApi } };

const SCRIPT_ID = "urbanverse-google-maps";

function loadGoogleMaps(apiKey: string): Promise<GoogleMapsApi> {
  const browserWindow = window as GoogleMapsWindow;
  if (browserWindow.google?.maps) return Promise.resolve(browserWindow.google.maps);

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => {
        const api = (window as GoogleMapsWindow).google?.maps;
        if (api) resolve(api);
        else reject(new Error("Google Maps did not load"));
      }, { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.async = true;
    script.onload = () => {
      const api = (window as GoogleMapsWindow).google?.maps;
      if (api) resolve(api);
      else reject(new Error("Google Maps did not load"));
    };
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
}

export function GoogleMaps({ onZoneSelect, selectedZoneId }: GoogleMapsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const polygonsRef = useRef<Record<string, GooglePolygon>>({});
  const onZoneSelectRef = useRef(onZoneSelect);
  const selectedZoneIdRef = useRef(selectedZoneId);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    onZoneSelectRef.current = onZoneSelect;
    selectedZoneIdRef.current = selectedZoneId;
  }, [onZoneSelect, selectedZoneId]);

  useEffect(() => {
    if (!containerRef.current || !apiKey) {
      setStatus("error");
      return;
    }
    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        const map = new maps.Map(containerRef.current, {
          center: { lat: 1.3, lng: 103.85 },
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
        });

        ZONES.forEach((zone) => {
          const polygon = new maps.Polygon({
            paths: zone.polygon.map(([lat, lng]) => ({ lat, lng })),
            strokeColor: zone.color,
            strokeOpacity: 0.9,
            strokeWeight: 2,
            fillColor: zone.color,
            fillOpacity: 0.28,
            map,
          });
          polygon.addListener("mouseover", () => polygon.setOptions({ fillOpacity: 0.5, strokeWeight: 3 }));
          polygon.addListener("mouseout", () => {
            if (selectedZoneIdRef.current !== zone.id) polygon.setOptions({ fillOpacity: 0.28, strokeWeight: 2 });
          });
          polygon.addListener("click", () => onZoneSelectRef.current(zone));
          polygonsRef.current[zone.id] = polygon;
        });
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));

    return () => { cancelled = true; polygonsRef.current = {}; };
  }, [apiKey]);

  useEffect(() => {
    Object.entries(polygonsRef.current).forEach(([id, polygon]) => {
      const zone = ZONES.find((item) => item.id === id);
      if (!zone) return;
      const active = id === selectedZoneId;
      polygon.setOptions({
        fillOpacity: active ? 0.52 : 0.28,
        strokeWeight: active ? 3 : 2,
        strokeColor: active ? "#ffffff" : zone.color,
      });
    });
  }, [selectedZoneId, status]);

  if (status === "error") {
    return <div className="h-full flex items-center justify-center p-6 text-center text-sm" style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>Google Maps could not load. Check that the Maps JavaScript API is enabled and the key allows this localhost URL.</div>;
  }

  return <div className="relative w-full h-full min-h-[400px]"><div ref={containerRef} className="w-full h-full rounded-xl" />{status === "loading" && <div className="absolute inset-0 flex items-center justify-center rounded-xl text-sm" style={{ background: "hsl(220 20% 10%)", color: "hsl(215 20% 65%)" }}>Loading Google Maps…</div>}</div>;
}
