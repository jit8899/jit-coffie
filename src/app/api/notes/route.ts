import { auth } from "@/auth";
import { db } from "@/lib/db";
import { assertSameOrigin, jsonError } from "@/lib/security";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to view your notes.", 401);
  const notes = await db.note.findMany({ where: { userId: session.user.id }, orderBy: { updatedAt: "desc" } });
  return Response.json(notes, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to save notes.", 401);
  if (!await assertSameOrigin(request)) return jsonError("Request could not be verified.", 403);
  const input = z.object({ title: z.string().trim().min(1).max(140), content: z.string().max(10000) }).safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Add a title and note to continue.", 422);
  return Response.json(await db.note.create({ data: { ...input.data, userId: session.user.id } }), { status: 201, headers: { "Cache-Control": "no-store" } });
}
