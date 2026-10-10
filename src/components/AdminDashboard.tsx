"use client";
import { useCallback, useEffect, useState } from "react";
import { Search, Users, CheckCircle2, Timer, ClipboardList, Mail } from "lucide-react";

type State = {
  totalUsers:number; newUsersLast30Days:number; tasks:number; focusSessionsLast30Days:number;
  users:{id:string;fullName:string|null;email:string;mobileNumber:string;city:string|null;role:string;emailVerified:Date|null;createdAt:string}[];
  messages:{id:string;name:string;email:string;message:string;createdAt:string;resolved:boolean}[];
  activity:{action:string;createdAt:string;actor:string}[];
};

export function AdminDashboard(){
  const [data,setData]=useState<State|null>(null);const [query,setQuery]=useState("");const [error,setError]=useState("");
  const load=useCallback(()=>fetch(`/api/admin/stats?q=${encodeURIComponent(query)}`).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setData(d);setError("")}).catch(e=>setError(e.message)),[query]);
  useEffect(()=>{const timer=setTimeout(()=>void load(),220);return()=>clearTimeout(timer)},[load]);
  async function markResolved(id:string,resolved:boolean){try{const r=await fetch(`/api/admin/contact/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({resolved})});const value=await r.json();if(!r.ok)throw Error(value.error);await load()}catch(e){setError(e instanceof Error?e.message:"Could not update message")}}
  return <>
    {error&&<div className="auth-message auth-error">{error}</div>}
    <div className="admin-stats">{[{icon:Users,label:"REGISTERED MEMBERS",value:data?.totalUsers??"—"},{icon:CheckCircle2,label:"NEW THIS MONTH",value:data?.newUsersLast30Days??"—"},{icon:ClipboardList,label:"WORKSPACE TASKS",value:data?.tasks??"—"},{icon:Timer,label:"FOCUS SESSIONS · 30D",value:data?.focusSessionsLast30Days??"—"}].map(x=><article className="admin-stat" key={x.label}><x.icon size={15}/><small>{x.label}</small><strong>{x.value}</strong></article>)}</div>
    <section className="admin-table-card"><div className="admin-table-title"><div><h2>Recently joined</h2><p>Up to 50 accounts · sensitive fields are masked</p></div><label className="admin-search"><Search size={14}/><input placeholder="Search name or email" value={query} onChange={e=>setQuery(e.target.value)}/></label></div><div className="admin-table-scroll"><table><thead><tr><th>MEMBER</th><th>EMAIL</th><th>MOBILE</th><th>CITY</th><th>STATUS</th><th>JOINED</th></tr></thead><tbody>{data?.users.map(u=><tr key={u.id}><td>{u.fullName??"New member"}</td><td>{u.email}</td><td>{u.mobileNumber}</td><td>{u.city??"—"}</td><td><span className="status-pill">{u.emailVerified?"Verified":"Pending"}</span></td><td>{new Date(u.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td></tr>)}</tbody></table>{data?.users.length===0&&<p className="site-empty">No matches yet.</p>}</div></section>
    <section className="admin-secondary"><div className="admin-table-card"><div className="admin-table-title"><div><h2><Mail size={15}/> Notes from the lounge</h2><p>Private contact messages · visible to administrators</p></div></div><div className="admin-messages">{data?.messages.map(m=><article className="admin-message" key={m.id}><div className="admin-message-meta"><b>{m.name}</b><a href={`mailto:${m.email}`}>{m.email}</a><time>{new Date(m.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</time></div><p>{m.message}</p><button onClick={()=>void markResolved(m.id,!m.resolved)} className={m.resolved?"resolved":""}>{m.resolved?"✓ Resolved":"Mark resolved"}</button></article>)}{data?.messages.length===0&&<p className="site-empty">No notes from the house yet.</p>}</div></div>
      <div className="admin-table-card"><div className="admin-table-title"><div><h2>Recent activity</h2><p>System audit trail</p></div></div><div className="admin-activity">{data?.activity.map((a,i)=><div key={`${a.createdAt}-${i}`}><span className="activity-mark"/><span><b>{a.action.replaceAll("_"," ").toLowerCase()}</b><small>{a.actor}</small></span><time>{new Date(a.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</time></div>)}</div></div></section>
    <p className="admin-audit-note">Admin views and message status changes are recorded in the security audit trail.</p>
  </>;
}
