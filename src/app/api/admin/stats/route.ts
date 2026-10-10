import { auth } from "@/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/security";
import { z } from "zod";
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in required.", 401);
  const actor = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (actor?.role !== "ADMIN") return jsonError("You don’t have access to this page.", 403);
  const url = new URL(request.url);
  const query = z.string().trim().max(80).catch("").parse(url.searchParams.get("q") ?? "");
  const [totalUsers, recentUsers, tasks, completedFocus, users, messages, activity] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
    db.task.count(),
    db.focusSession.count({ where: { completedAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
    db.user.findMany({ where: query ? { OR: [{ email: { contains: query, mode: "insensitive" } }, { fullName: { contains: query, mode: "insensitive" } }] } : {}, take: 50, orderBy: { createdAt: "desc" }, select: { id: true, fullName: true, email: true, mobileNumber: true, city: true, role: true, emailVerified: true, createdAt: true } }),
    db.contactMessage.findMany({ take: 20, orderBy: { createdAt: "desc" } }),
    db.auditLog.findMany({ take: 12, orderBy: { createdAt: "desc" }, select: { action: true, createdAt: true, actor: { select: { fullName: true } } } }),
  ]);
  await db.auditLog.create({ data: { actorId: session.user.id, action: "ADMIN_VIEWED_OVERVIEW", metadata: { searched: Boolean(query) } } });
  return Response.json({ totalUsers, newUsersLast30Days: recentUsers, tasks, focusSessionsLast30Days: completedFocus, users: users.map((u: { id: string; fullName: string | null; email: string; mobileNumber: string | null; city: string | null; role: "USER" | "ADMIN"; emailVerified: Date | null; createdAt: Date }) => ({ ...u, email: u.email.replace(/^(.{1,2}).*(@.*)$/, "$1••••$2"), mobileNumber: u.mobileNumber ? `••••••${u.mobileNumber.slice(-4)}` : "—" })), messages, activity: activity.map(a => ({ action: a.action, createdAt: a.createdAt, actor: a.actor?.fullName ?? "Deleted account" })) }, { headers: { "Cache-Control": "no-store" } });
}
