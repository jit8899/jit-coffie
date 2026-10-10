import { auth } from "@/auth";
import { db } from "@/lib/db";
import { assertSameOrigin, jsonError } from "@/lib/security";
import { z } from "zod";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const session=await auth();if(!session?.user?.id)return jsonError("Sign in required.",401);
  const admin=await db.user.findUnique({where:{id:session.user.id},select:{role:true}});if(admin?.role!=="ADMIN")return jsonError("You don’t have access to this page.",403);
  if(!await assertSameOrigin(request))return jsonError("Request could not be verified.",403);
  const input=z.object({resolved:z.boolean()}).safeParse(await request.json().catch(()=>null));if(!input.success)return jsonError("Invalid message status.",422);
  const {id}=await params;const result=await db.contactMessage.updateMany({where:{id},data:{resolved:input.data.resolved}});if(!result.count)return jsonError("Message not found.",404);
  await db.auditLog.create({data:{actorId:session.user.id,action:"ADMIN_UPDATED_CONTACT_MESSAGE",metadata:{messageId:id,resolved:input.data.resolved}}});
  return Response.json({ok:true});
}
