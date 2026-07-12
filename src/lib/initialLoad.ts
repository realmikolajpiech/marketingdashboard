import { Creator, PaymentLog } from "../types";

let loadPromise: Promise<{ creators: Creator[]; payments: PaymentLog[]; budget: number }> | null = null;

export function loadAppDataOnce(
  loader: () => Promise<{ creators: Creator[]; payments: PaymentLog[]; budget: number }>
): Promise<{ creators: Creator[]; payments: PaymentLog[]; budget: number }> {
  if (!loadPromise) {
    loadPromise = loader().catch((error) => {
      loadPromise = null;
      throw error;
    });
  }
  return loadPromise;
}

export function resetLoadCache() {
  loadPromise = null;
}
