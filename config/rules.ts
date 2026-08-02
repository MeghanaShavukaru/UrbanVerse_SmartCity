// ============================================================
// config/rules.ts
// Deterministic rule engine configuration
// All scenario calculations are driven by this config — never AI
// ============================================================

export type SupportedAction =
  | "add_hospital"
  | "add_park"
  | "add_ev_station"
  | "road_closure"
  | "flood_event";

export interface MetricDelta {
  trafficIndex?: number;
  accessibility?: number;
  carbonScore?: number;
  floodRisk?: number;
  emergencyResponse?: number;
}

export const SUPPORTED_ACTIONS: SupportedAction[] = [
  "add_hospital",
  "add_park",
  "add_ev_station",
  "road_closure",
  "flood_event",
];

export const ACTION_LABELS: Record<SupportedAction, string> = {
  add_hospital: "Add Hospital",
  add_park: "Add Green Park",
  add_ev_station: "Add EV Charging Station",
  road_closure: "Road Closure",
  flood_event: "Flood Event Simulation",
};

export const ACTION_DESCRIPTIONS: Record<SupportedAction, string> = {
  add_hospital:
    "Constructs a new hospital or medical facility in the selected zone, improving emergency response and healthcare accessibility.",
  add_park:
    "Creates a new green park or recreational area, reducing carbon emissions and flood risk through natural drainage.",
  add_ev_station:
    "Installs EV charging infrastructure, improving accessibility and reducing carbon emissions in the zone.",
  road_closure:
    "Simulates temporary or permanent road closure, redirecting traffic and impacting zone accessibility.",
  flood_event:
    "Simulates a major flood event, assessing the zone's vulnerability and emergency response capacity.",
};

export const ACTION_ICONS: Record<SupportedAction, string> = {
  add_hospital: "🏥",
  add_park: "🌳",
  add_ev_station: "⚡",
  road_closure: "🚧",
  flood_event: "🌊",
};

// Core rule engine: delta values applied to zone base metrics
// Positive = metric increases (may be good or bad depending on context)
// For trafficIndex: positive = MORE congestion (bad)
// For accessibility: positive = MORE accessible (good)
// For carbonScore: positive = MORE emissions (bad)
// For floodRisk: positive = MORE risk (bad)
// For emergencyResponse: positive = BETTER response (good)
export const RULES: Record<SupportedAction, MetricDelta> = {
  add_hospital: {
    trafficIndex: 8,      // More traffic from patients/staff
    accessibility: 20,    // Significantly better healthcare access
    carbonScore: 3,       // Slight increase from facility operations
    floodRisk: 0,
    emergencyResponse: 15, // Major boost to emergency services
  },
  add_park: {
    trafficIndex: -5,     // Reduces through-traffic in area
    accessibility: 8,     // Provides recreational access
    carbonScore: -12,     // Significant carbon reduction
    floodRisk: -5,        // Natural drainage improvement
    emergencyResponse: 0,
  },
  add_ev_station: {
    trafficIndex: -3,     // Slight reduction in internal combustion traffic
    accessibility: 10,    // Better transport options
    carbonScore: -8,      // Reduction in vehicle emissions
    floodRisk: 0,
    emergencyResponse: 0,
  },
  road_closure: {
    trafficIndex: 20,     // Significant congestion increase
    accessibility: -10,   // Harder to reach the zone
    carbonScore: 5,       // More idling = more emissions
    floodRisk: 0,
    emergencyResponse: -5, // Slower emergency vehicle access
  },
  flood_event: {
    trafficIndex: 15,     // Flooded roads = congestion
    accessibility: -25,   // Zone becomes hard to access
    carbonScore: 0,
    floodRisk: 30,        // Acute flood risk spike
    emergencyResponse: 20, // Emergency services mobilized
  },
};

// Clamp utility
export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

// Apply rules to base metrics and return new metrics
export function applyRules(
  baseMetrics: Record<string, number>,
  action: SupportedAction
): Record<string, number> {
  const delta = RULES[action];
  const result: Record<string, number> = { ...baseMetrics };

  for (const [key, change] of Object.entries(delta)) {
    if (key in result && change !== undefined) {
      result[key] = clamp(result[key] + change);
    }
  }

  return result;
}
