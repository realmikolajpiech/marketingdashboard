import { Creator, PaymentLog } from "./types";
import { normalizeCreator } from "./utils";

export const EXPORT_VERSION = 1;

export interface TrailoExport {
  version: number;
  exportedAt: string;
  creators: Creator[];
  payments: PaymentLog[];
}

export function buildExport(creators: Creator[], payments: PaymentLog[]): TrailoExport {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    creators,
    payments,
  };
}

export function downloadExport(creators: Creator[], payments: PaymentLog[]) {
  const payload = buildExport(creators, payments);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `trailo-export-${date}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseImport(raw: unknown): { creators: Creator[]; payments: PaymentLog[] } {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid file — expected a JSON object.");
  }

  const data = raw as Record<string, unknown>;
  const creatorsRaw = data.creators;
  const paymentsRaw = data.payments;

  if (!Array.isArray(creatorsRaw)) {
    throw new Error("Invalid file — missing creators array.");
  }
  if (!Array.isArray(paymentsRaw)) {
    throw new Error("Invalid file — missing payments array.");
  }

  const creators = creatorsRaw.map((entry) => normalizeCreator(entry as Record<string, unknown>));
  const payments = paymentsRaw as PaymentLog[];

  for (const payment of payments) {
    if (!payment.id || !payment.creatorId || typeof payment.amount !== "number") {
      throw new Error("Invalid file — payments data is malformed.");
    }
  }

  return { creators, payments };
}

export async function readImportFile(file: File): Promise<{ creators: Creator[]; payments: PaymentLog[] }> {
  const text = await file.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid file — could not parse JSON.");
  }

  return parseImport(parsed);
}
