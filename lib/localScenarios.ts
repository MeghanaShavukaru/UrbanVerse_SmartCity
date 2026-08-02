import type { SimulationResult } from "@/types";

export type LocalScenario = SimulationResult & { id: string };

const STORAGE_KEY = "urbanverse-local-scenarios";

function read(): LocalScenario[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as LocalScenario[];
  } catch {
    return [];
  }
}

export function getLocalScenarios(): LocalScenario[] {
  return read();
}

export function saveLocalScenario(result: SimulationResult): LocalScenario {
  const scenario = { ...result, id: result.scenarioId };
  const scenarios = [scenario, ...read().filter((item) => item.id !== scenario.id)].slice(0, 50);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  return scenario;
}

export function deleteLocalScenario(id: string): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(read().filter((item) => item.id !== id)));
}
