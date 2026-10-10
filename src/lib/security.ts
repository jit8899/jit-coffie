import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export const token = () => randomBytes(32).toString("base64url");
export const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");

export async function enforceRateLimit(scope: string, maximum: number, windowMinutes: number) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = hashToken(`${scope}:${ip}`);
  const since = new Date(Date.now() - windowMinutes * 60_000);
  const count = await db.rateLimitEntry.count({ where: { key, createdAt: { gte: since } } });
  if (count >= maximum) return false;
  if (count % 100 === 0) await db.rateLimitEntry.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60_000) } } });
  await db.rateLimitEntry.create({ data: { key } });
  return true;
}

export async function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").host;
  } catch { return false; }
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
