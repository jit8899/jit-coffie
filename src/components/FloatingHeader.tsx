"use client";

import Link from "next/link";
import { ArrowUpRight, Coffee } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./floating-header.css";

const links = [{href:"#collection",label:"The collection"},{href:"#deep-work",label:"Your workspace"},{href:"#together",label:"Our ritual"}];

export default function FloatingHeader({signedIn,theme,onThemeChange,motion}:{signedIn:boolean;theme:string;onThemeChange:(theme:string)=>void;motion:boolean}) {
  const shell=useRef<HTMLElement>(null);
  const toggle=useRef<HTMLButtonElement>(null);
  const [open,setOpen]=useState(false);
  useEffect(()=>{
    const element=shell.current;
    if(!element)return;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    const desktop=matchMedia("(min-width: 901px) and (pointer: fine)");
    let frame=0, x=0, y=0;
    const paint=()=>{
      frame=0;
      const compact=Math.min(1,Math.max(0,window.scrollY/180));
      const animate=motion&&!reduced.matches;
      element.style.setProperty("--compact",String(compact));
      element.style.setProperty("--tilt-x",`${animate?y+compact*.7:0}deg`);
      element.style.setProperty("--tilt-y",`${animate?x:0}deg`);
      element.style.setProperty("--depth",`${animate?8+compact*8:0}px`);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint);};
    const pointer=(event:PointerEvent)=>{if(!desktop.matches||event.pointerType!=="mouse")return;const rect=element.getBoundingClientRect();x=((event.clientX-rect.left)/rect.width-.5)*1.5;y=((event.clientY-rect.top)/rect.height-.5)*-1.2;schedule();};
    const reset=()=>{x=0;y=0;schedule();};
    window.addEventListener("scroll",schedule,{passive:true});
    window.addEventListener("resize",reset,{passive:true});
    element.addEventListener("pointermove",pointer,{passive:true});
    element.addEventListener("pointerleave",reset,{passive:true});
    reduced.addEventListener("change",reset);schedule();
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",reset);element.removeEventListener("pointermove",pointer);element.removeEventListener("pointerleave",reset);reduced.removeEventListener("change",reset);};
  },[motion]);
  useEffect(()=>{
    if(!open)return;
    const close=(event:PointerEvent)=>{if(!shell.current?.contains(event.target as Node))setOpen(false);};
    const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"){setOpen(false);toggle.current?.focus();}};
    const desktop=matchMedia("(min-width: 901px)");
    const resize=()=>{if(desktop.matches)setOpen(false);};
    document.addEventListener("pointerdown",close);document.addEventListener("keydown",escape);desktop.addEventListener("change",resize);
    return()=>{document.removeEventListener("pointerdown",close);document.removeEventListener("keydown",escape);desktop.removeEventListener("change",resize);};
  },[open]);
  return <div className="glass-header-slot"><header ref={shell} className="glass-header" data-open={open}>
    <div className="glass-bar">
      <Link href="/" className="p-logo glass-logo"><Coffee size={26}/><span>JIT<span className="logo-fine"> COFFIE</span><small>THE ART OF A LITTLE PAUSE</small></span></Link>
      <nav className="glass-links" aria-label="Main navigation">{links.map(link=><a key={link.href} href={link.href}>{link.label}</a>)}</nav>
      <div className="glass-actions"><label className="glass-theme"><span>THEME</span><select aria-label="Website theme" value={theme} onChange={event=>onThemeChange(event.target.value)}><option value="default">Default</option><option value="dark">Dark</option><option value="blue">Blue</option><option value="white">White</option></select></label><Link className="glass-cta" href={signedIn?"/dashboard":"/signup"}><span>{signedIn?"Workspace":"Get started"}</span><span className="glass-cta-icon"><ArrowUpRight size={17}/></span></Link><button ref={toggle} className="glass-toggle" aria-expanded={open} aria-controls="glass-mobile-menu" aria-label={open?"Close navigation":"Open navigation"} onClick={()=>setOpen(value=>!value)}><span/><span/></button></div>
    </div>
    <div id="glass-mobile-menu" className="glass-dropdown" inert={!open}><nav aria-label="Mobile navigation">{links.map(link=><a key={link.href} href={link.href} onClick={()=>setOpen(false)}>{link.label}<ArrowUpRight size={17}/></a>)}<Link href={signedIn?"/dashboard":"/signup"} onClick={()=>setOpen(false)}>{signedIn?"Workspace":"Get started"}<ArrowUpRight size={17}/></Link></nav></div>
  </header></div>;
}
