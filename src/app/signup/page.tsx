import Link from "next/link";
import { AuthArt } from "@/components/AuthArt";
import { SignupForm } from "@/components/SignupForm";
export default function SignupPage(){return <main className="auth-shell"><AuthArt signup/><section className="auth-panel"><div className="auth-card"><div className="auth-card-top"><div className="eyebrow"><span/> YOUR EVERYDAY EDITION</div><Link className="auth-toggle" href="/login">Log in instead</Link></div><h1>A little space, just for you.</h1><p className="auth-sub">Let’s make your day feel a little more like yours.</p><SignupForm/></div></section></main>}
