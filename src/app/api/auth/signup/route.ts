import argon2 from "argon2";
import { db } from "@/lib/db";
import { emailIsConfigured, sendActionEmail } from "@/lib/mail";
import { assertSameOrigin, enforceRateLimit, hashToken, jsonError, token } from "@/lib/security";
import { signupSchema } from "@/lib/validation";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!await assertSameOrigin(request)) return jsonError("Request could not be verified.", 403);
  if (!await enforceRateLimit("signup", 5, 60)) return jsonError("Too many attempts. Please try again later.", 429);
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Please review the highlighted fields.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  if (!emailIsConfigured()) return jsonError("Email verification is temporarily unavailable. Please try again later.", 503);
  const input = parsed.data;
  const existing = await db.user.findFirst({ where: { OR: [{ email: input.email }, { mobileNumber: input.mobileNumber }] }, select: { email: true, mobileNumber: true } });
  if (existing?.email === input.email) return jsonError("An account with this email already exists.", 409);
  if (existing?.mobileNumber === input.mobileNumber) return jsonError("An account with this mobile number already exists.", 409);
  const rawToken = token();
  try {
    const user = await db.user.create({ data: {
      fullName: input.fullName, name: input.fullName, mobileNumber: input.mobileNumber, email: input.email,
      passwordHash: await argon2.hash(input.password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 }),
      address: input.address, city: input.city, state: input.state, pinCode: input.pinCode, country: "India",
      termsAcceptedAt: new Date(),
    }, select: { id: true, email: true } });
    await db.emailVerificationToken.create({ data: { userId: user.id, tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + 30 * 60_000) } });
    const link = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/verify?token=${encodeURIComponent(rawToken)}`;
    try { await sendActionEmail(user.email, "Verify your email", link); }
    catch {
      await db.user.delete({ where: { id: user.id } });
      return jsonError("We could not send your verification email. Please try again later.", 503);
    }
    return Response.json({ message: "Your account is ready. Check your inbox to verify your email." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return jsonError("An account with these details already exists.", 409);
    return jsonError("We could not create your account. Please try again.", 500);
  }
}
