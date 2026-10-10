import { auth } from "@/auth";
import { db } from "@/lib/db";
import { assertSameOrigin, jsonError } from "@/lib/security";
import { z } from "zod";
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to view your focus history.", 401);
  const [sessions, totals] = await Promise.all([db.focusSession.findMany({ where: { userId: session.user.id }, orderBy: { completedAt: "desc" }, take: 20 }), db.focusSession.aggregate({ where: { userId: session.user.id }, _sum: { duration: true }, _count: true })]);
  return Response.json({ sessions, totalMinutes: totals._sum.duration ?? 0, completedSessions: totals._count }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to save focus sessions.", 401);
  if (!await assertSameOrigin(request)) return jsonError("Request could not be verified.", 403);
  const input = z.object({ duration: z.number().int().min(1).max(180) }).safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Invalid focus session.", 422);
  return Response.json(await db.focusSession.create({ data: { userId: session.user.id, duration: input.data.duration } }), { status: 201, headers: { "Cache-Control": "no-store" } });
}
