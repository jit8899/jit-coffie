import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OnboardingForm } from "@/components/OnboardingForm";
import { AuthArt } from "@/components/AuthArt";
export default async function OnboardingPage(){const session=await auth();if(!session?.user?.id)redirect("/login");const user=await db.user.findUnique({where:{id:session.user.id},select:{mobileNumber:true,address:true,city:true,state:true,pinCode:true,termsAcceptedAt:true}});if(user?.mobileNumber&&user.address&&user.city&&user.state&&user.pinCode&&user.termsAcceptedAt)redirect("/dashboard");return <main className="auth-shell"><AuthArt signup/><section className="auth-panel"><div className="auth-card"><div className="auth-card-top"><div className="eyebrow"><span/> MAKE YOURSELF AT HOME</div></div><h1>A few details to settle in.</h1><p className="auth-sub">Finish setting up your private workspace.</p><OnboardingForm/></div></section></main>}
