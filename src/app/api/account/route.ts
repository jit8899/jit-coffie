import { auth } from "@/auth";
import { db } from "@/lib/db";
import { assertSameOrigin, jsonError } from "@/lib/security";
import { z } from "zod";
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to manage your account.", 401);
  if (!await assertSameOrigin(request)) return jsonError("Request could not be verified.", 403);
  const input = z.object({ confirmation: z.literal("DELETE") }).safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Type DELETE to confirm account removal.", 422);
  await db.$transaction([
    db.auditLog.create({ data: { actorId: session.user.id, action: "USER_ACCOUNT_DELETED" } }),
    db.user.delete({ where: { id: session.user.id } }),
  ]);
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
