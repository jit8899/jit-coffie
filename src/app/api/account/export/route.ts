import { auth } from "@/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/security";
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to export your account data.", 401);
  const [profile, tasks, notes, focusSessions] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, select: { fullName: true, email: true, mobileNumber: true, address: true, city: true, state: true, pinCode: true, country: true, emailVerified: true, createdAt: true, updatedAt: true } }),
    db.task.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" } }),
    db.note.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" } }),
    db.focusSession.findMany({ where: { userId: session.user.id }, orderBy: { completedAt: "asc" } }),
  ]);
  return Response.json({ profile, tasks, notes, focusSessions }, { headers: { "Cache-Control": "no-store", "Content-Disposition": `attachment; filename="jit-coffie-account-${new Date().toISOString().slice(0,10)}.json"` } });
}
