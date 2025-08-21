

export function bytesToGB(x) { return (x || 0) / (1024 ** 3) } //bytes to gigabytes.
export function fmtGB(x) { return `${bytesToGB(x).toFixed(2)} GB` } //2 decimal places with a " GB" suffix.
export function pct(n, d) { if (!d) return 0; return Math.min(100, Math.max(0, (n / d) * 100)) } //Calculates a percentage
export function fmtPct(p) { return `${Math.round(p)}%` } //Rounds a number to the nearest integer and appends %
export function shortTs(ts) { const d = new Date(ts); return d.toLocaleTimeString() } //Takes a timestamp (ts) and returns a localized time string