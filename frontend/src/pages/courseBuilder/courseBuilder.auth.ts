// src/pages/courseBuilder/courseBuilder.auth.ts
function base64UrlDecode(str: string) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) base64 += "=".repeat(4 - pad);
  return atob(base64);
}

export function getAccountIdFromJwtSub(): string {
  const token = localStorage.getItem("token");
  if (!token) return "";

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return "";
    const json = base64UrlDecode(parts[1]);
    const payload = JSON.parse(json);
    return typeof payload?.sub === "string" ? payload.sub : "";
  } catch {
    return "";
  }
}
