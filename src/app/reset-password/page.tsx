import { Suspense } from "react";
import { AuthArt } from "@/components/AuthArt";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
export default function ResetPasswordPage(){return <main className="auth-shell"><AuthArt/><section className="auth-panel"><div className="auth-card"><div className="eyebrow"><span/> BACK TO YOUR RHYTHM</div><h1>Pick a new password.</h1><Suspense fallback={<p className="auth-sub">Loading your reset link…</p>}><ResetPasswordForm/></Suspense></div></section></main>}
