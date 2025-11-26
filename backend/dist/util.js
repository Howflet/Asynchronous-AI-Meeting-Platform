import crypto from "node:crypto";
export function generateId(prefix = "id") {
    return `${prefix}_${crypto.randomUUID()}`;
}
export function now() {
    return Date.now();
}
export function toJson(value) {
    return JSON.stringify(value);
}
export function fromJson(text) {
    return JSON.parse(text);
}
export function createParticipantUrl(baseUrl, token) {
    // Ensure baseUrl ends with a slash for proper URL construction
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    // Create path parameter URL to match Next.js route structure /participate/[token]
    return `${cleanBaseUrl}/${token}`;
}
