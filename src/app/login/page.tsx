import Link from "next/link";
import { AuthArt } from "@/components/AuthArt";
import { LoginForm } from "@/components/LoginForm";
export default async function LoginPage({searchParams}:{searchParams:Promise<{verified?:string}>}){const q=await searchParams;return <main className="auth-shell"><AuthArt/><section className="auth-panel"><div className="auth-card"><div className="auth-card-top"><div className="eyebrow"><span/> GOOD TO HAVE YOU BACK</div><Link className="auth-toggle" href="/signup">Create account</Link></div><h1>Your day starts here.</h1><p className="auth-sub">A little room to find your rhythm again.</p><LoginForm verified={q.verified==="1"}/></div></section></main>}
