// Deja visible el prefijo y el final para reconocer la key sin exponerla entera.
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return "•".repeat(apiKey.length);
  return `${apiKey.slice(0, 3)}${"•".repeat(12)}${apiKey.slice(-4)}`;
}
