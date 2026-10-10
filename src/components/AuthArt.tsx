import Image from "next/image";
import Link from "next/link";
import { Coffee } from "lucide-react";

export function AuthArt({ signup = false }: { signup?: boolean }) {
  return <aside className="auth-art"><div className="auth-art-image"><Image src={signup ? "/images/chai-pour.png" : "/images/jit-last-sip.png"} alt="A warm cup of chai in a golden café" fill sizes="50vw" /></div><div className="auth-art-shade"/><div className="steam"/><span className="bean bean-one"/><span className="bean bean-two"/><span className="bean bean-three"/><div className="auth-art-content"><Link className="auth-brand" href="/"><span className="wordmark-icon"><Coffee size={17}/></span><span>JIT COFFIE<small>YOUR DAILY RITUAL</small></span></Link><div className="auth-art-message"><div className="eyebrow"><span/> A LITTLE SPACE FOR YOU</div><h2>{signup ? <>Your next chapter<br/><em>starts with a sip.</em></> : <>Come on in.<br/><em>Your day is waiting.</em></>}</h2><p>Good work takes a little breathing room. Make yourself at home.</p></div></div></aside>;
}
