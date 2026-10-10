import argon2 from "argon2";
import { db } from "@/lib/db";
import { assertSameOrigin, enforceRateLimit, hashToken, jsonError } from "@/lib/security";
import { passwordSchema } from "@/lib/validation";
import { z } from "zod";

export async function POST(request: Request) {
  if (!await assertSameOrigin(request)) return jsonError("Request could not be verified.", 403);
  if (!await enforceRateLimit("reset", 5, 60)) return jsonError("Too many attempts. Please request a fresh link later.", 429);
  const body = await request.json().catch(() => null);
  const parsed = z.object({ token: z.string().min(20).max(100), password: passwordSchema }).safeParse(body);
  if (!parsed.success) return jsonError("Use at least 10 characters with uppercase, lowercase and a number.", 422);
  const record = await db.passwordResetToken.findUnique({ where: { tokenHash: hashToken(parsed.data.token) } });
  if (!record || record.expiresAt < new Date()) return jsonError("This reset link has expired. Request a new one.", 400);
  const passwordHash = await argon2.hash(parsed.data.password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash, sessionVersion: { increment: 1 } } }),
    db.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
    db.session.deleteMany({ where: { userId: record.userId } }),
  ]);
  return Response.json({ message: "Password updated. Sign in with your new password." }, { headers: { "Cache-Control": "no-store" } });
}
