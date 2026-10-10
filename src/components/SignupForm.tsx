"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { indianStates, signupSchema } from "@/lib/validation";

type Fields = Record<string, string[]>;
export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Fields>({});
  const [strength, setStrength] = useState(0);
  const strengthLabel = useMemo(() => ["", "A little more", "Getting there", "Nice and strong", "Lovely and strong"][strength], [strength]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setErrors({});
    const data = new FormData(event.currentTarget);
    const body = Object.fromEntries(data.entries());
    body.acceptedTerms = data.get("acceptedTerms") === "on" ? "true" : "false";
    body.country = "India";
    const parsed = signupSchema.safeParse({ ...body, acceptedTerms: body.acceptedTerms === "true" });
    if (!parsed.success) { setErrors(parsed.error.flatten().fieldErrors as Fields); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const result = await response.json();
      if (!response.ok) { setErrors(result.fields ?? {}); setMessage(result.error ?? "Please try again."); }
      else { setMessage(result.message); (event.currentTarget as HTMLFormElement).reset(); }
    } catch { setMessage("We couldn't reach the server. Check your connection and try again."); }
    finally { setBusy(false); }
  }
  const field = (name: string) => errors[name]?.[0];
  const strengthOf = (value: string) => !value ? 0 : Math.min(4, Number(value.length >= 10) + Number(/[a-z]/.test(value) && /[A-Z]/.test(value)) + Number(/\d/.test(value)) + Number(/[^A-Za-z0-9]/.test(value)));
  return <form onSubmit={submit} noValidate>
    <div className="auth-grid">
      <div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" autoComplete="name" placeholder="Your name" required aria-invalid={!!field("fullName")}/>{field("fullName")&&<div className="field-error">{field("fullName")}</div>}</div>
      <div className="field"><label htmlFor="mobileNumber">Mobile number</label><input id="mobileNumber" name="mobileNumber" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit number" maxLength={10} required aria-invalid={!!field("mobileNumber")}/>{field("mobileNumber")&&<div className="field-error">{field("mobileNumber")}</div>}</div>
    </div>
    <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required aria-invalid={!!field("email")}/>{field("email")&&<div className="field-error">{field("email")}</div>}</div>
    <div className="auth-grid">
      <div className="field"><label htmlFor="password">Password</label><div className="password-wrap"><input id="password" name="password" type={showPassword?"text":"password"} autoComplete="new-password" placeholder="10+ characters" required onChange={e=>setStrength(strengthOf(e.target.value))}/><button className="password-eye" type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={15}/>:<Eye size={15}/>}</button></div><div className="strength">{[1,2,3,4].map(i=><i key={i} className={i<=strength?"on":""}/>)}</div><div className="strength-label">{strengthLabel}</div>{field("password")&&<div className="field-error">{field("password")}</div>}</div>
      <div className="field"><label htmlFor="confirmPassword">Confirm password</label><div className="password-wrap"><input id="confirmPassword" name="confirmPassword" type={showConfirm?"text":"password"} autoComplete="new-password" placeholder="Type it again" required/><button className="password-eye" type="button" onClick={()=>setShowConfirm(v=>!v)} aria-label={showConfirm?"Hide password":"Show password"}>{showConfirm?<EyeOff size={15}/>:<Eye size={15}/>}</button></div>{field("confirmPassword")&&<div className="field-error">{field("confirmPassword")}</div>}</div>
    </div>
    <div className="field"><label htmlFor="address">Full residential address</label><input id="address" name="address" autoComplete="street-address" placeholder="House, street, neighbourhood" required/>{field("address")&&<div className="field-error">{field("address")}</div>}</div>
    <div className="auth-grid">
      <div className="field"><label htmlFor="city">City</label><input id="city" name="city" autoComplete="address-level2" placeholder="Your city" required/>{field("city")&&<div className="field-error">{field("city")}</div>}</div>
      <div className="field"><label htmlFor="state">State or union territory</label><select id="state" name="state" defaultValue="" required><option value="" disabled>Choose a state</option>{indianStates.map(state=><option key={state} value={state}>{state}</option>)}</select>{field("state")&&<div className="field-error">{field("state")}</div>}</div>
    </div>
    <div className="auth-grid">
      <div className="field"><label htmlFor="pinCode">PIN code</label><input id="pinCode" name="pinCode" inputMode="numeric" autoComplete="postal-code" placeholder="6-digit PIN" maxLength={6} required/>{field("pinCode")&&<div className="field-error">{field("pinCode")}</div>}</div>
      <div className="field"><label htmlFor="country">Country</label><input id="country" value="India" readOnly aria-readonly="true"/></div>
    </div>
    <label className="terms-row"><input name="acceptedTerms" type="checkbox" required/><span>I agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>. Your details stay yours.</span></label>
    <button className="auth-submit" disabled={busy} type="submit">{busy?"Preparing your space…":<>Create your account <ArrowRight size={15}/></>}</button>
    {message&&<div className={`auth-message ${errors && Object.keys(errors).length?"auth-error":""}`} role="status">{message}</div>}
    <div className="auth-divider">OR CONTINUE WITH</div>
    <button className="google-button" type="button" onClick={()=>signIn("google",{callbackUrl:"/dashboard"})}><span className="google-mark">G</span> Continue with Google</button>
    <p className="auth-bottom">Already have an account? <Link href="/login">Come on in</Link></p>
    <p className="auth-form-note">By signing up, you’ll receive a one-time email verification link. We never sell your personal information.</p>
  </form>;
}
