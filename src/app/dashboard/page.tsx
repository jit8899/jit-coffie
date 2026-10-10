import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Dashboard } from "@/components/Dashboard";
export default async function DashboardPage(){const session=await auth();if(!session?.user?.id)redirect("/login");const user=await db.user.findUnique({where:{id:session.user.id},select:{mobileNumber:true,address:true,city:true,state:true,pinCode:true,termsAcceptedAt:true}});if(!user?.mobileNumber||!user.address||!user.city||!user.state||!user.pinCode||!user.termsAcceptedAt)redirect("/onboarding");return <Dashboard/>}
