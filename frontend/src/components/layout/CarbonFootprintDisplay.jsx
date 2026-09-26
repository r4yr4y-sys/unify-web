import { useEffect, useState } from "react";
import { getBackendCarbonTotals } from "../../utils/carbonTracking";

const GRAMS_CO2_PER_GB = 50;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function CarbonFootprintDisplay() {
  const [bytesTransferred, setBytesTransferred] = useState(0);
  const [backendTotals, setBackendTotals] = useState(getBackendCarbonTotals);

  useEffect(() => {
    if (!("PerformanceObserver" in window)) return undefined;

    let total = 0;
    const seenEntries = new Set();
    const addEntries = (entries) => {
      for (const entry of entries) {
        const entryKey = `${entry.name}:${entry.startTime}`;
        if (seenEntries.has(entryKey)) continue;
        seenEntries.add(entryKey);
        // transferSize is zero when the browser serves a resource from cache or
        // when cross-origin timing details are unavailable.
        total += entry.transferSize || 0;
      }
      setBytesTransferred(total);
    };

    addEntries(performance.getEntriesByType("resource"));

    let observer;
    try {
      observer = new PerformanceObserver((list) => addEntries(list.getEntries()));
      observer.observe({ type: "resource", buffered: true });
    } catch (_error) {
      return undefined;
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateBackendTotals = () => setBackendTotals(getBackendCarbonTotals());
    window.addEventListener("unify-backend-carbon-update", updateBackendTotals);
    updateBackendTotals();
    return () => window.removeEventListener("unify-backend-carbon-update", updateBackendTotals);
  }, []);

  const co2Grams = (bytesTransferred / (1024 ** 3)) * GRAMS_CO2_PER_GB;

  return (
    <aside className="carbon-footprint" aria-label="Estimated network carbon footprint">
      <p className="carbon-footprint__eyebrow">Network carbon footprint</p>
      <p className="carbon-footprint__metric">
        <span>Browser data transferred</span>
        <strong>{formatBytes(bytesTransferred)}</strong>
      </p>
      <p className="carbon-footprint__metric">
        <span>Browser CO₂ estimate</span>
        <strong>{co2Grams.toFixed(3)} g</strong>
      </p>
      <p className="carbon-footprint__metric">
        <span>Backend data transferred</span>
        <strong>{formatBytes(backendTotals.backendBytes)}</strong>
      </p>
      <p className="carbon-footprint__metric">
        <span>Backend CO₂ estimate</span>
        <strong>{backendTotals.backendCo2Grams.toFixed(3)} g</strong>
      </p>
      <p className="carbon-footprint__note">
        Browser estimate uses 50 g/GB. Backend estimate uses CO2.js SWD.
      </p>
    </aside>
  );
}
