import { auth } from "@/auth";
import { db } from "@/lib/db";
import { assertSameOrigin, jsonError } from "@/lib/security";
import { indianStates } from "@/lib/validation";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to view your profile.", 401);
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true, fullName: true, email: true, mobileNumber: true, address: true, city: true, state: true, pinCode: true, country: true, profileImage: true, emailVerified: true, role: true, theme: true, createdAt: true, _count: { select: { tasks: true, notes: true, focusSessions: true } } } });
  return Response.json(user, { headers: { "Cache-Control": "no-store" } });
}

const profileSchema = z.object({ fullName: z.string().trim().min(2).max(100), mobileNumber: z.string().regex(/^[6-9]\d{9}$/), address: z.string().trim().min(8).max(300), city: z.string().trim().min(2).max(100), state: z.enum(indianStates), pinCode: z.string().regex(/^[1-9]\d{5}$/), acceptedTerms: z.literal(true).optional(), theme: z.enum(["espresso", "midnight", "cream"]).optional() });

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to update your profile.", 401);
  if (!await assertSameOrigin(request)) return jsonError("Request could not be verified.", 403);
  const data = profileSchema.safeParse(await request.json().catch(() => null));
  if (!data.success) return Response.json({ error: "Check your profile details.", fields: data.error.flatten().fieldErrors }, { status: 422 });
  const current = await db.user.findUnique({ where: { id: session.user.id }, select: { mobileNumber: true } });
  if (current?.mobileNumber && data.data.mobileNumber !== current.mobileNumber) return jsonError("Mobile number changes require a verification flow. Contact support to update it.", 422);
  try {
    const user = await db.user.update({ where: { id: session.user.id }, data: { fullName: data.data.fullName, name: data.data.fullName, mobileNumber: current?.mobileNumber ?? data.data.mobileNumber, address: data.data.address, city: data.data.city, state: data.data.state, pinCode: data.data.pinCode, ...(data.data.acceptedTerms ? { termsAcceptedAt: new Date() } : {}), ...(data.data.theme ? { theme: data.data.theme } : {}) }, select: { fullName: true, address: true, city: true, state: true, pinCode: true, theme: true } });
    return Response.json(user, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return jsonError("That mobile number is already in use.", 409);
    return jsonError("Could not update your profile.", 500);
  }
}
