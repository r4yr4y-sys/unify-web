let backendBytes = 0;
let backendCo2Grams = 0;
let installed = false;

export function getBackendCarbonTotals() {
  return { backendBytes, backendCo2Grams };
}

export function installBackendCarbonTracking() {
  if (installed || typeof window === "undefined" || !window.fetch) return;
  installed = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = (...args) => originalFetch(...args).then((response) => {
    const transferred = Number(response.headers.get("X-Data-Transferred-Bytes"));
    const co2Grams = Number(response.headers.get("X-Estimated-CO2-Grams"));

    if (Number.isFinite(transferred) && Number.isFinite(co2Grams)) {
      backendBytes += transferred;
      backendCo2Grams += co2Grams;
      window.dispatchEvent(new CustomEvent("unify-backend-carbon-update"));
    }

    return response;
  });
}
