import crypto from "node:crypto";

export function generateId(prefix = "id"): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function now(): number {
  return Date.now();
}

export function toJson(value: unknown): string {
  return JSON.stringify(value);
}

export function fromJson<T>(text: string): T {
  return JSON.parse(text) as T;
}

export function createParticipantUrl(baseUrl: string, token: string): string {
  // Ensure baseUrl ends with a slash for proper URL construction
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Create path parameter URL to match Next.js route structure /participate/[token]
  return `${cleanBaseUrl}/${token}`;
}
