import { db } from "@/lib/db";
import { emailIsConfigured, sendActionEmail } from "@/lib/mail";
import { assertSameOrigin, enforceRateLimit, hashToken, jsonError, token } from "@/lib/security";
import { emailSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!await assertSameOrigin(request)) return jsonError("Request could not be verified.", 403);
  if (!await enforceRateLimit("forgot", 4, 60)) return jsonError("Too many attempts. Please try again later.", 429);
  const input = await request.json().catch(() => null);
  const email = emailSchema.safeParse(input?.email);
  if (!email.success) return jsonError("Enter a valid email address.");
  const user = await db.user.findUnique({ where: { email: email.data }, select: { id: true, email: true } });
  if (user && emailIsConfigured()) {
    const raw = token();
    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await db.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + 30 * 60_000) } });
    try { await sendActionEmail(user.email, "Reset your password", `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${encodeURIComponent(raw)}`); }
    catch { await db.passwordResetToken.deleteMany({ where: { userId: user.id } }); }
  }
  return Response.json({ message: "If an account exists for that email, a reset link is on its way." }, { headers: { "Cache-Control": "no-store" } });
}
