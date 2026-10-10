import { auth } from "@/auth";
import { db } from "@/lib/db";
import { assertSameOrigin, jsonError } from "@/lib/security";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to view your tasks.", 401);
  const tasks = await db.task.findMany({ where: { userId: session.user.id }, orderBy: [{ completedAt: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }] });
  return Response.json(tasks, { headers: { "Cache-Control": "no-store" } });
}
const createSchema = z.object({ title: z.string().trim().min(1).max(160), description: z.string().max(2000).optional(), dueAt: z.string().datetime().optional() });
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to add tasks.", 401);
  if (!await assertSameOrigin(request)) return jsonError("Request could not be verified.", 403);
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Add a task title to continue.", 422);
  const task = await db.task.create({ data: { ...parsed.data, ...(parsed.data.dueAt ? { dueAt: new Date(parsed.data.dueAt) } : {}), userId: session.user.id } });
  return Response.json(task, { status: 201, headers: { "Cache-Control": "no-store" } });
}
