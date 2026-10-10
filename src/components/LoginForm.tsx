"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export function LoginForm({ verified = false }: { verified?: boolean }) {
  const [visible,setVisible]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState(verified?"Your email is verified. You’re all set to sign in.":"");const [remember,setRemember]=useState(true);
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");const data=new FormData(event.currentTarget);try{const result=await signIn("credentials",{email:data.get("email"),password:data.get("password"),remember:String(remember),redirect:false,callbackUrl:"/dashboard"});if(result?.error)setError("We couldn’t sign you in. Check your email and password, and make sure your email is verified.");else window.location.assign(result?.url??"/dashboard");}catch{setError("We couldn’t reach the server. Try again in a moment.");}finally{setBusy(false)}}
  return <form onSubmit={submit}>
    <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="username" placeholder="you@example.com" required/></div>
    <div className="field"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><label htmlFor="password">Password</label><Link href="/forgot-password" style={{fontSize:9,color:"#a47049",marginBottom:6}}>Forgot password?</Link></div><div className="password-wrap"><input id="password" name="password" type={visible?"text":"password"} autoComplete="current-password" placeholder="Your password" required/><button className="password-eye" type="button" onClick={()=>setVisible(v=>!v)} aria-label={visible?"Hide password":"Show password"}>{visible?<EyeOff size={15}/>:<Eye size={15}/>}</button></div></div>
    <label className="terms-row" style={{marginTop:4}}><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/><span>Keep me signed in on this device</span></label>
    <button className="auth-submit" disabled={busy}>{busy?"Opening your workspace…":<>Log in to your space <ArrowRight size={15}/></>}</button>
    {error&&<div className={`auth-message ${verified?"":"auth-error"}`} role="status">{error}</div>}
    <div className="auth-divider">OR CONTINUE WITH</div><button className="google-button" type="button" onClick={()=>signIn("google",{callbackUrl:"/dashboard"})}><span className="google-mark">G</span> Continue with Google</button>
    <p className="auth-bottom">New to JIT COFFIE? <Link href="/signup">Make yourself at home</Link></p>
  </form>;
}
