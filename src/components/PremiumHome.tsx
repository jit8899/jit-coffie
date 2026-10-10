"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowUpRight, Coffee, Pause, Play } from "lucide-react";
import "./premium-home.css";
import FloatingHeader from "./FloatingHeader";

const stories = [
  { id: "first-sip", label: "01 / THE MORNING RITUAL", title: "A little warmth.\nA whole new day.", text: "Fresh chai, familiar spices, and a moment that belongs entirely to you. Start here. Start slowly.", image: "chai-spices.png", alt: "Golden masala chai pouring into a glass among fragrant spices", action: "Begin your ritual", kind: "wide" },
  { id: "deep-work", label: "02 / FIND YOUR FOCUS", title: "Less noise.\nMore possibility.", text: "One cup. One intention. Give your best ideas the space they deserve with a focused workspace.", image: "midnight-coffee.png", alt: "Sculptural black coffee cup with floating roasted beans", action: "Find your focus", kind: "split" },
  { id: "slow-mornings", label: "03 / MAKE A LITTLE SPACE", title: "Great thoughts\nstart quietly.", text: "A blank page, a warm latte, a fresh perspective. Save the little thoughts that become something bigger.", image: "quiet-morning.png", alt: "Sunlit notebook and ivory latte cup on a stone desk", action: "Capture an idea", kind: "split reverse" },
  { id: "blue-hour", label: "04 / A DIFFERENT KIND OF BREAK", title: "Meet your\nblue-hour mood.", text: "Cool coffee. Clear mind. Step out of the rush and find a rhythm that feels like you.", image: "blue-hour.png", alt: "Iced coffee with swirling cream against a cobalt blue background", action: "Take a breather", kind: "wide blue-story" },
  { id: "the-pour", label: "05 / CRAFTED WITH PATIENCE", title: "Good things\ntake their time.", text: "Watch the steam rise. Let the world wait. There is something beautiful in simply being here.", image: "chai-pour.png", alt: "Copper-lit kettle pouring steaming chai into a clear glass", action: "Explore the lounge", kind: "split" },
  { id: "together", label: "06 / BETTER, TOGETHER", title: "Make the\nlast sip count.", text: "For the conversations that run long, the ideas shared, and the small moments worth coming back for.", image: "jit-last-sip.png", alt: "Two friends toast their chai glasses outside JIT Coffee", action: "Find your place", kind: "wide" },
];

export default function PremiumHome({ signedIn }: { signedIn: boolean }) {
  const [theme, setTheme] = useState("default");
  const [progress, setProgress] = useState(0);
  const [motion, setMotion] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const destination = signedIn ? "/dashboard" : "/signup";
  useEffect(() => {
    try { const saved = localStorage.getItem("jit-theme"); if (saved && ["default","dark","blue","white"].includes(saved)) setTheme(saved); } catch {}
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    setMotion(!query.matches);
    const update = () => setMotion(!query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    let frame = 0;
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => {
      if (!hero.current) return;
      const rect = hero.current.getBoundingClientRect();
      setProgress(Math.max(0, Math.min(1, -rect.top / Math.max(1, hero.current.offsetHeight - innerHeight))));
    }); };
    update(); window.addEventListener("scroll",update,{passive:true}); window.addEventListener("resize",update);
    return () => {cancelAnimationFrame(frame);window.removeEventListener("scroll",update);window.removeEventListener("resize",update);};
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add("is-visible"); }), { threshold: .12 });
    root.current?.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
    return () => observer.disconnect();
  }, []);
  function selectTheme(value:string) { setTheme(value); try {localStorage.setItem("jit-theme",value);} catch {} }
  return <div ref={root} className={`premium-home ${motion ? "motion-on" : "motion-off"}`} data-theme={theme}>
    <FloatingHeader signedIn={signedIn} theme={theme} onThemeChange={selectTheme} motion={motion} />
    <main>
      <section ref={hero} className="p-hero" id="ritual"><div className="p-hero-sticky"><div className="hero-grain"/>
        <div className="p-hero-copy" style={{transform:motion?`translateY(${-progress*45}px)`:undefined}}><p className="p-kicker"><span/> THE JIT COFFIE SIGNATURE RITUAL</p><h1><span>Beautiful days.</span><br/><em>Begin with chai.</em></h1><p className="p-description">Rich spices. A slow, golden pour.<br/>Make a little room for the moments that matter.</p><div className="p-actions"><Link className="p-button" href={destination}>Find your ritual <ArrowUpRight size={19}/></Link><a href="#collection" className="p-text-link">Explore the collection <ArrowDown size={16}/></a></div><div className="p-hero-foot"><span>CRAFTED TO SLOW YOU DOWN</span><span>01 — 07</span></div></div>
        <div className="p-photo-stage" style={{ "--hero-progress": motion ? progress : 0 } as CSSProperties} onPointerMove={e=>{if(!motion||e.pointerType==="touch")return; const rect=e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--photo-x",`${((e.clientX-rect.left)/rect.width-.5)*-9}px`); e.currentTarget.style.setProperty("--photo-y",`${((e.clientY-rect.top)/rect.height-.5)*-7}px`);}} onPointerLeave={e=>{e.currentTarget.style.setProperty("--photo-x","0px");e.currentTarget.style.setProperty("--photo-y","0px");}}><div className="p-photo-frame"><Image src="/images/chai-pour.png" alt="Realistic close-up of a metal kettle pouring steaming golden chai into a glass" fill priority sizes="(max-width: 700px) 100vw, 65vw" className="p-hero-photograph"/><div className="p-photo-warmth" aria-hidden="true"/></div><div className="p-photo-label"><span className="photo-label-line"/><div><small>SLOWLY POURED. FULLY SAVOURED.</small><strong>The signature chai.</strong></div><span className="photo-label-index">01</span></div></div>
        <div className="p-scroll"><span>SCROLL TO SAVOUR</span><div><i style={{transform:`scaleX(${progress})`}}/></div><b>{Math.round(progress*100)}%</b></div><button className="motion-control" onClick={()=>setMotion(v=>!v)} aria-label={motion?"Pause decorative animations":"Enable animations"}>{motion?<Pause size={14}/>:<Play size={14}/>}</button>
      </div></section>
      <div className="p-marquee" aria-hidden="true"><div>{Array.from({length:4},(_,i)=><span key={i}>GOOD CHAI <b>✳</b> CLEAR MIND <b>✳</b> BEAUTIFUL DAYS <b>✳</b></span>)}</div></div>
      <section className="p-intro reveal" id="collection"><p className="p-kicker">SIX MOMENTS. ONE BEAUTIFUL RITUAL.</p><h2>Made for your <em>kind of day.</em></h2><p>From the first warm sip to your last good idea.<br/>Find a little inspiration in every moment.</p></section>
      <div className="p-stories">{stories.map((story,index)=><section key={story.id} id={story.id} className={`p-story reveal ${story.kind}`} style={{"--order":index} as CSSProperties} onPointerMove={e=>{if(!motion||e.pointerType==="touch")return;const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty("--rx",`${((e.clientY-r.top)/r.height-.5)*-3}deg`);e.currentTarget.style.setProperty("--ry",`${((e.clientX-r.left)/r.width-.5)*4}deg`);}} onPointerLeave={e=>{e.currentTarget.style.setProperty("--rx","0deg");e.currentTarget.style.setProperty("--ry","0deg");}}><div className="story-visual"><Image src={`/images/${story.image}`} alt={story.alt} fill sizes="(max-width: 760px) 100vw, 70vw"/><div className="story-light"/><span className="story-number">0{index+1}</span></div><div className="story-copy"><p className="p-kicker">{story.label}</p><h2>{story.title.split("\n").map((line,i)=><span key={line} className={i===1?"serif-line":""}>{line}</span>)}</h2><p>{story.text}</p><Link href={destination} className="story-link">{story.action}<ArrowUpRight size={20}/></Link></div></section>)}</div>
      <section className="p-closing reveal"><Coffee size={35}/><p className="p-kicker">YOUR NEXT CHAPTER STARTS HERE</p><h2>Take a breath.<br/><em>Make something good.</em></h2><Link href={destination} className="p-button">Enter your workspace<ArrowUpRight size={19}/></Link></section>
    </main><footer className="p-footer"><Link href="/" className="p-logo">JIT COFFIE<span>© {new Date().getFullYear()}</span></Link><p>A little ritual. A lot of possibility.</p><div><Link href="/login">Log in</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link></div></footer>
  </div>;
}



