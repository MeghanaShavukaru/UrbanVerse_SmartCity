"use client";

// ============================================================
// features/map/LeafletMap.tsx
// Core Leaflet map component with zone polygons and interactions
// Must be dynamically imported (SSR disabled) due to Leaflet
// ============================================================

import { useEffect, useRef, useState } from "react";
import { Zone, ZONES } from "@/config/zones";
import { motion, AnimatePresence } from "framer-motion";

interface LeafletMapProps {
  onZoneSelect: (zone: Zone) => void;
  selectedZoneId?: string | null;
  simulationOverlay?: Record<string, number> | null;
}

export function LeafletMap({ onZoneSelect, selectedZoneId }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const polygonsRef = useRef<Record<string, L.Polygon>>({});
  const onZoneSelectRef = useRef(onZoneSelect);
  const selectedZoneIdRef = useRef(selectedZoneId);
  const [hoveredZone, setHoveredZone] = useState<Zone | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, containerWidth: 600 });
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    onZoneSelectRef.current = onZoneSelect;
    selectedZoneIdRef.current = selectedZoneId;
  }, [onZoneSelect, selectedZoneId]);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const container = mapRef.current;
    let cancelled = false;

    // Dynamic import to avoid SSR issues
    import("leaflet").then((L) => {
      if (cancelled || leafletMapRef.current) return;
      // Fix default icon URLs
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      // Fast Refresh can retain Leaflet's marker on a reused DOM node.
      // Reset it before creating a fresh map instance.
      const leafletContainer = container as HTMLDivElement & { _leaflet_id?: number };
      if (leafletContainer._leaflet_id) {
        container.replaceChildren();
        delete leafletContainer._leaflet_id;
      }

      const map = L.map(container, {
        center: [1.3000, 103.8500],
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });

      // Dark tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Draw zones
      ZONES.forEach((zone) => {
        const polygon = L.polygon(zone.polygon, {
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: 0.25,
          weight: 2,
          opacity: 0.8,
        }).addTo(map);

        // Zone label marker
        const labelIcon = L.divIcon({
          html: `<div style="
            background: rgba(15,23,42,0.85);
            border: 1px solid ${zone.color}55;
            color: ${zone.color};
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            backdrop-filter: blur(4px);
          ">${zone.name}</div>`,
          className: "",
          iconAnchor: [50, 10],
          iconSize: [100, 20],
        });
        L.marker(zone.center, { icon: labelIcon }).addTo(map);

        // Hover events
        polygon.on("mouseover", (e) => {
          polygon.setStyle({ fillOpacity: 0.45, weight: 3 });
          setHoveredZone(zone);
          const { clientX, clientY } = e.originalEvent as MouseEvent;
          const rect = mapRef.current!.getBoundingClientRect();
          setTooltipPos({ x: clientX - rect.left, y: clientY - rect.top, containerWidth: rect.width });
        });

        polygon.on("mousemove", (e) => {
          const { clientX, clientY } = e.originalEvent as MouseEvent;
          const rect = mapRef.current!.getBoundingClientRect();
          setTooltipPos({ x: clientX - rect.left, y: clientY - rect.top, containerWidth: rect.width });
        });

        polygon.on("mouseout", () => {
          if (selectedZoneIdRef.current !== zone.id) {
            polygon.setStyle({ fillOpacity: 0.25, weight: 2 });
          }
          setHoveredZone(null);
        });

        polygon.on("click", () => {
          onZoneSelectRef.current(zone);
          // Highlight selected
          Object.values(polygonsRef.current).forEach((p) =>
            p.setStyle({ fillOpacity: 0.25, weight: 2 })
          );
          polygon.setStyle({ fillOpacity: 0.5, weight: 3, color: "#fff" });
        });

        polygonsRef.current[zone.id] = polygon;
      });

      leafletMapRef.current = map;
      setIsMapReady(true);
    });

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      polygonsRef.current = {};
    };
  }, []);

  // Update selected zone highlight
  useEffect(() => {
    if (!isMapReady) return;
    import("leaflet").then(() => {
      Object.entries(polygonsRef.current).forEach(([id, polygon]) => {
        const zone = ZONES.find((z) => z.id === id);
        if (!zone) return;
        if (id === selectedZoneId) {
          polygon.setStyle({
            fillOpacity: 0.5,
            weight: 3,
            color: "#ffffff",
            fillColor: zone.color,
          });
        } else {
          polygon.setStyle({
            fillOpacity: 0.25,
            weight: 2,
            color: zone.color,
            fillColor: zone.color,
          });
        }
      });
    });
  }, [selectedZoneId, isMapReady]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: "400px" }}>
      {/* Leaflet map container */}
      <div ref={mapRef} className="w-full h-full rounded-xl" style={{ zIndex: 1 }} />

      {/* Loading overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 rounded-xl flex items-center justify-center z-10"
          style={{ background: "hsl(220 20% 10%)" }}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "hsl(217 91% 60%)", borderTopColor: "transparent" }} />
            <p className="text-sm" style={{ color: "hsl(215 20% 55%)" }}>Loading city map...</p>
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredZone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 pointer-events-none rounded-xl p-3 shadow-xl"
            style={{
              left: Math.min(tooltipPos.x + 16, tooltipPos.containerWidth - 220),
              top: Math.max(tooltipPos.y - 80, 8),
              background: "rgba(15,23,42,0.92)",
              border: `1px solid ${hoveredZone.color}44`,
              backdropFilter: "blur(8px)",
              minWidth: "180px",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: hoveredZone.color }} />
              <p className="text-white text-sm font-semibold">{hoveredZone.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs" style={{ color: "hsl(215 20% 65%)" }}>
              <span>👥 {(hoveredZone.population / 1000).toFixed(0)}K people</span>
              <span>🚦 Traffic: {hoveredZone.metrics.trafficIndex}</span>
              <span>🌊 Flood: {hoveredZone.metrics.floodRisk}</span>
              <span>🌿 Carbon: {hoveredZone.metrics.carbonScore}</span>
            </div>
            <p className="text-xs mt-2" style={{ color: hoveredZone.color }}>Click to analyze →</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 z-10 rounded-xl p-3 shadow-lg"
        style={{
          background: "rgba(15,23,42,0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
        }}>
        <p className="text-xs font-semibold text-white mb-2">City Zones</p>
        <div className="space-y-1">
          {ZONES.map((zone) => (
            <div key={zone.id} className="flex items-center gap-2 cursor-pointer"
              onClick={() => onZoneSelect(zone)}>
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: zone.color }} />
              <span className="text-xs" style={{ color: "hsl(215 20% 65%)" }}>{zone.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
