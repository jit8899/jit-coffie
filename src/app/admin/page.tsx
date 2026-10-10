import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Coffee, ArrowLeft } from "lucide-react";
import { AdminDashboard } from "@/components/AdminDashboard";
export default async function AdminPage(){const session=await auth();if(!session?.user?.id)redirect("/login");const actor=await db.user.findUnique({where:{id:session.user.id},select:{role:true}});if(actor?.role!=="ADMIN")redirect("/dashboard");return <main className="admin-shell"><header className="admin-head"><Link className="wordmark" href="/"><span className="wordmark-icon"><Coffee size={17}/></span><span>JIT COFFIE<small>ADMIN STUDIO</small></span></Link><Link className="admin-back" href="/dashboard"><ArrowLeft size={14}/> Your workspace</Link></header><section className="admin-body"><div className="eyebrow"><span/> THE HOUSE, IN NUMBERS</div><h1>A thoughtful overview.</h1><p>Private account details are masked in this workspace.</p><AdminDashboard/></section></main>}
