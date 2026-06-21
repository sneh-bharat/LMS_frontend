import slaMonitoringAxios from "./axios";

export type SlaPriority = "ROUTINE" | "URGENT" | "STAT" | "NORMAL";
export type SlaStatus = "ON_TRACK" | "NEAR_BREACH" | "BREACHED";

export interface SlaMonitoringRecord {
  id: number;
  sampleId: string;
  patientName: string;
  testName: string;
  priority: SlaPriority;
  receivedAt: string;
  dueAt: string;
  remainingMinutes: number;
  status: SlaStatus;
}

export interface GetSlaMonitoringResponse {
  data: SlaMonitoringRecord[];
  message: string;
  response: boolean;
  status: string;
  timestamp: string;
}

function normalizePriority(value: unknown): SlaPriority {
  const raw = String(value ?? "ROUTINE").toUpperCase();
  if (raw === "URGENT" || raw === "STAT" || raw === "NORMAL") return raw;
  return "ROUTINE";
}

function normalizeStatus(value: unknown, remainingMinutes?: number): SlaStatus {
  const raw = String(value ?? "").toUpperCase().replace(/\s+/g, "_");
  if (raw === "ON_TRACK" || raw === "ONTRACK") return "ON_TRACK";
  if (raw === "NEAR_BREACH" || raw === "NEAR_BREACH" || raw === "NEARBREACH") {
    return "NEAR_BREACH";
  }
  if (raw === "BREACHED" || raw === "BREACH") return "BREACHED";

  if (typeof remainingMinutes === "number") {
    if (remainingMinutes < 0) return "BREACHED";
    if (remainingMinutes <= 60) return "NEAR_BREACH";
    return "ON_TRACK";
  }

  return "ON_TRACK";
}

function pickString(record: Record<string, unknown>, keys: string[], fallback = "—"): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

export function normalizeSlaMonitoringRecord(
  raw: Record<string, unknown>,
  index: number
): SlaMonitoringRecord {
  const remainingMinutes =
    pickNumber(raw, ["remainingMinutes", "remaining", "remainingMins", "minutesRemaining"]) ?? 0;

  return {
    id: pickNumber(raw, ["id", "sampleDbId"]) ?? index + 1,
    sampleId: pickString(raw, ["sampleId", "sampleCode", "requestId"], `SMP${String(index + 1).padStart(3, "0")}`),
    patientName: pickString(raw, ["patientName", "patient", "patientFullName"], "Unknown Patient"),
    testName: pickString(raw, ["testName", "test", "description"], "—"),
    priority: normalizePriority(raw.priority),
    receivedAt: pickString(raw, ["receivedAt", "receivedTime", "received", "createdAt"], "—"),
    dueAt: pickString(raw, ["dueAt", "dueTime", "due"], "—"),
    remainingMinutes,
    status: normalizeStatus(raw.status ?? raw.slaStatus, remainingMinutes),
  };
}

export const getSlaMonitoring = async (): Promise<GetSlaMonitoringResponse> => {
  const response = (await slaMonitoringAxios.get("/api/v1/sla-monitoring")) as GetSlaMonitoringResponse;

  if (response?.response === false) {
    throw new Error(response.message || 'Failed to load SLA monitoring data.');
  }

  const rows = Array.isArray(response?.data) ? response.data : [];

  return {
    ...response,
    data: rows.map((row, index) =>
      normalizeSlaMonitoringRecord(row as unknown as Record<string, unknown>, index)
    ),
  };
};
