// ============================================================
// config/zones.ts
// Predefined fictional UrbanVerse city zones
// Each zone has polygon coordinates (approx. lat/lng around Singapore)
// ============================================================

export type ZoneId =
  | "ZONE_CBD"
  | "ZONE_RAILWAY"
  | "ZONE_RESIDENTIAL"
  | "ZONE_INDUSTRIAL"
  | "ZONE_RIVERFRONT"
  | "ZONE_GREEN"
  | "ZONE_HOSPITAL"
  | "ZONE_UNIVERSITY";

export interface ZoneMetrics {
  trafficIndex: number;       // 0–100 (higher = worse congestion)
  accessibility: number;      // 0–100 (higher = better)
  carbonScore: number;        // 0–100 (higher = more emissions)
  floodRisk: number;          // 0–100 (higher = more risk)
  emergencyResponse: number;  // 0–100 (higher = better coverage)
}

export interface Zone {
  id: ZoneId;
  name: string;
  description: string;
  population: number;
  center: [number, number]; // [lat, lng]
  polygon: [number, number][];
  color: string;
  metrics: ZoneMetrics;
}

export const ZONES: Zone[] = [
  {
    id: "ZONE_CBD",
    name: "Central Business District",
    description: "The financial and commercial heart of UrbanVerse City",
    population: 280000,
    center: [1.2830, 103.8510],
    polygon: [
      [1.2900, 103.8420],
      [1.2900, 103.8620],
      [1.2760, 103.8620],
      [1.2760, 103.8420],
    ],
    color: "#3B82F6",
    metrics: {
      trafficIndex: 78,
      accessibility: 85,
      carbonScore: 72,
      floodRisk: 30,
      emergencyResponse: 80,
    },
  },
  {
    id: "ZONE_RAILWAY",
    name: "Railway Hub",
    description: "Major transit interchange connecting all city zones",
    population: 95000,
    center: [1.3000, 103.8550],
    polygon: [
      [1.3060, 103.8470],
      [1.3060, 103.8640],
      [1.2940, 103.8640],
      [1.2940, 103.8470],
    ],
    color: "#8B5CF6",
    metrics: {
      trafficIndex: 85,
      accessibility: 90,
      carbonScore: 60,
      floodRisk: 20,
      emergencyResponse: 75,
    },
  },
  {
    id: "ZONE_RESIDENTIAL",
    name: "Residential Zone",
    description: "Dense residential area with schools and community centers",
    population: 420000,
    center: [1.3180, 103.8400],
    polygon: [
      [1.3260, 103.8300],
      [1.3260, 103.8510],
      [1.3100, 103.8510],
      [1.3100, 103.8300],
    ],
    color: "#10B981",
    metrics: {
      trafficIndex: 55,
      accessibility: 65,
      carbonScore: 40,
      floodRisk: 25,
      emergencyResponse: 60,
    },
  },
  {
    id: "ZONE_INDUSTRIAL",
    name: "Industrial Area",
    description: "Manufacturing and logistics hub on the city outskirts",
    population: 40000,
    center: [1.2700, 103.8750],
    polygon: [
      [1.2780, 103.8660],
      [1.2780, 103.8860],
      [1.2620, 103.8860],
      [1.2620, 103.8660],
    ],
    color: "#F59E0B",
    metrics: {
      trafficIndex: 65,
      accessibility: 40,
      carbonScore: 88,
      floodRisk: 35,
      emergencyResponse: 45,
    },
  },
  {
    id: "ZONE_RIVERFRONT",
    name: "Riverfront District",
    description: "Scenic riverside area with mixed-use development",
    population: 75000,
    center: [1.2880, 103.8680],
    polygon: [
      [1.2940, 103.8620],
      [1.2940, 103.8760],
      [1.2820, 103.8760],
      [1.2820, 103.8620],
    ],
    color: "#06B6D4",
    metrics: {
      trafficIndex: 50,
      accessibility: 70,
      carbonScore: 38,
      floodRisk: 65,
      emergencyResponse: 65,
    },
  },
  {
    id: "ZONE_GREEN",
    name: "Green Park",
    description: "City's primary green lung with parks and recreational areas",
    population: 12000,
    center: [1.3100, 103.8600],
    polygon: [
      [1.3170, 103.8520],
      [1.3170, 103.8680],
      [1.3030, 103.8680],
      [1.3030, 103.8520],
    ],
    color: "#22C55E",
    metrics: {
      trafficIndex: 25,
      accessibility: 55,
      carbonScore: 15,
      floodRisk: 15,
      emergencyResponse: 50,
    },
  },
  {
    id: "ZONE_HOSPITAL",
    name: "Hospital District",
    description: "Medical and healthcare cluster serving the entire city",
    population: 28000,
    center: [1.3280, 103.8580],
    polygon: [
      [1.3340, 103.8500],
      [1.3340, 103.8660],
      [1.3220, 103.8660],
      [1.3220, 103.8500],
    ],
    color: "#EF4444",
    metrics: {
      trafficIndex: 60,
      accessibility: 88,
      carbonScore: 45,
      floodRisk: 20,
      emergencyResponse: 95,
    },
  },
  {
    id: "ZONE_UNIVERSITY",
    name: "University Zone",
    description: "Academic campus and research institutions",
    population: 65000,
    center: [1.3050, 103.8320],
    polygon: [
      [1.3120, 103.8230],
      [1.3120, 103.8420],
      [1.2980, 103.8420],
      [1.2980, 103.8230],
    ],
    color: "#EC4899",
    metrics: {
      trafficIndex: 48,
      accessibility: 72,
      carbonScore: 32,
      floodRisk: 18,
      emergencyResponse: 58,
    },
  },
];

export const ZONE_MAP: Record<ZoneId, Zone> = ZONES.reduce(
  (acc, zone) => ({ ...acc, [zone.id]: zone }),
  {} as Record<ZoneId, Zone>
);
