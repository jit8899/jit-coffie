import { auth } from "@/auth";
import { db } from "@/lib/db";
import { assertSameOrigin, jsonError } from "@/lib/security";
import { z } from "zod";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to update tasks.", 401);
  if (!await assertSameOrigin(request)) return jsonError("Request could not be verified.", 403);
  const { id } = await params;
  const body = z.object({ title: z.string().trim().min(1).max(160).optional(), completed: z.boolean().optional() }).safeParse(await request.json().catch(() => null));
  if (!body.success) return jsonError("Invalid task update.", 422);
  const changed = await db.task.updateMany({ where: { id, userId: session.user.id }, data: { ...(body.data.title ? { title: body.data.title } : {}), ...(body.data.completed !== undefined ? { completedAt: body.data.completed ? new Date() : null } : {}) } });
  if (!changed.count) return jsonError("Task not found.", 404);
  return Response.json({ ok: true });
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to delete tasks.", 401);
  if (!await assertSameOrigin(request)) return jsonError("Request could not be verified.", 403);
  const { id } = await params;
  const deleted = await db.task.deleteMany({ where: { id, userId: session.user.id } });
  return deleted.count ? Response.json({ ok: true }) : jsonError("Task not found.", 404);
}
