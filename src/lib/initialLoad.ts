import { Creator, PaymentLog } from "../types";

let loadPromise: Promise<{ creators: Creator[]; payments: PaymentLog[] }> | null = null;

export function loadAppDataOnce(
  loader: () => Promise<{ creators: Creator[]; payments: PaymentLog[] }>
): Promise<{ creators: Creator[]; payments: PaymentLog[] }> {
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
