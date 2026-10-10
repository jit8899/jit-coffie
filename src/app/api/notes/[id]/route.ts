import { auth } from "@/auth";
import { db } from "@/lib/db";
import { assertSameOrigin, jsonError } from "@/lib/security";
import { z } from "zod";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to update notes.", 401);
  if (!await assertSameOrigin(request)) return jsonError("Request could not be verified.", 403);
  const { id } = await params;
  const input = z.object({ title: z.string().trim().min(1).max(140), content: z.string().max(10000) }).safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Check your note details.", 422);
  const updated = await db.note.updateMany({ where: { id, userId: session.user.id }, data: input.data });
  return updated.count ? Response.json({ ok: true }) : jsonError("Note not found.", 404);
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to delete notes.", 401);
  if (!await assertSameOrigin(request)) return jsonError("Request could not be verified.", 403);
  const { id } = await params;
  const deleted = await db.note.deleteMany({ where: { id, userId: session.user.id } });
  return deleted.count ? Response.json({ ok: true }) : jsonError("Note not found.", 404);
}
