import { db } from "@/lib/db";
import { assertSameOrigin, enforceRateLimit, jsonError } from "@/lib/security";
import { z } from "zod";
export async function POST(request: Request) {
  if (!await assertSameOrigin(request)) return jsonError("Request could not be verified.", 403);
  if (!await enforceRateLimit("contact", 4, 60)) return jsonError("You’ve sent quite a few notes. Please try again later.", 429);
  const parsed = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(254).transform(v=>v.toLowerCase()), message: z.string().trim().min(10).max(3000) }).safeParse(await request.json().catch(()=>null));
  if (!parsed.success) return Response.json({ error:"Please add your name, a valid email, and a little more detail." },{status:422});
  await db.contactMessage.create({ data: parsed.data });
  return Response.json({ message:"Your note is with us. We’ll be in touch soon." },{status:201,headers:{"Cache-Control":"no-store"}});
}
