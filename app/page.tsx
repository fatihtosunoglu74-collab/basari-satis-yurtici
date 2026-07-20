"use client";
import React, { useState, useRef, useEffect } from "react";
import { plasiyeriBul } from "@/lib/musteriPlasiyer";
import { telefonBul, whatsappUrl, bildirimAlacakKisi } from "@/lib/plasiyerler";

function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// Silinen sipariş için plasiyere WhatsApp bildirim linki üretir; bulunamazsa null döner
function silinenBildirimUrl(r: { no: string; musteri: string; depo: string; tarih: string }): string | null {
  const plasiyer = plasiyeriBul(r.musteri);
  if (!plasiyer) return null;
  const alici = bildirimAlacakKisi(plasiyer);
  const tel = telefonBul(alici);
  if (!tel) return null;
  const msg = `⚠️ *Sipariş İptal Bildirimi*\n\n👤 Müşteri: ${r.musteri}\n📋 Belge No: ${r.no}\n🏭 Depo: ${r.depo}\n📅 Tarih: ${r.tarih}\n\nBu sipariş sistemde "Silindi" olarak görünüyor — muhtemelen stok veya başka bir nedenle iptal edildi. Müşterinizi bilgilendirmeniz rica olunur.`;
  return whatsappUrl(tel, msg);
}

// ─── Supabase ─────────────────────────────────────────────────────────────────
const SB_URL="https://dqoreukmpkxmdputjigy.supabase.co";
const SB_KEY="sb_publishable_gKwtDDLun7O0UybI4R71cA_xMDT2DX8";
const TABLE="satis_yurtici_raporlar";
async function sbSave(p:object):Promise<string|null>{try{const r=await fetch(`${SB_URL}/rest/v1/${TABLE}`,{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,Prefer:"return=representation"},body:JSON.stringify(p)});const d=await r.json();return d[0]?.id??null;}catch{return null;}}
async function sbUpdate(id:string,p:object){try{await fetch(`${SB_URL}/rest/v1/${TABLE}?id=eq.${id}`,{method:"PATCH",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`},body:JSON.stringify(p)});}catch{}}
async function sbLoad(id:string){try{const r=await fetch(`${SB_URL}/rest/v1/${TABLE}?id=eq.${id}&select=*`,{headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`}});const d=await r.json();return d[0]??null;}catch{return null;}}

// ─── Yardımcılar ──────────────────────────────────────────────────────────────
const sv=(v:any)=>String(v??"").trim();
const todayStr=()=>new Date().toISOString().split("T")[0];
function xd(v:any):string{
  if(v instanceof Date)return v.toLocaleDateString("tr-TR");
  if(typeof v==="number"&&v>1){const d=new Date(Math.round((v-25569)*86400*1000));return d.toLocaleDateString("tr-TR");}
  return sv(v);
}
function normDepo(v:string):string{
  const s=sv(v).toUpperCase().replace(/\s/g,"");
  if(s.includes("KARTEPE"))return"KARTEPE";
  if(s.includes("TEM"))return"TEM.34";
  if(s.includes("ÇATALCA")||s.includes("CATALCA"))return"ÇATALCA";
  return sv(v).toUpperCase()||"TEM.34";
}
// Zeus Durum sözlüğü: Başlamadı / İşlemde / Bitti / Silindi
function zeusType(durum:string):string{
  const d=durum.toUpperCase();
  if(d.includes("SİLİNDİ")||d.includes("SILINDI"))return"gray"; // iptal — Gitmeyen'e sayılmaz
  if(d.includes("BİTTİ")||d.includes("BITTI")||d.includes("TAMAMLAN"))return"green";
  if(d.includes("İŞLEMDE")||d.includes("ISLEMDE")||d.includes("DEVAM"))return"yellow";
  return"red"; // Başlamadı, tanımsız
}
// Satış ekibinin diliyle: Gitmeyen / Toplaması Devam Eden / Giden / İptal
function displayDurum(durum:string):string{
  const t=zeusType(durum);
  if(t==="green")return"GİDEN";
  if(t==="yellow")return"TOPLAMASI DEVAM EDEN";
  if(t==="gray")return"İPTAL EDİLDİ";
  return"GİTMEYEN";
}

// ─── Tipler ───────────────────────────────────────────────────────────────────
interface Row{depo:string;no:string;musteri:string;tip:string;tarih:string;durum:string;type:string;}
type US="idle"|"loading"|"ok"|"err";

const C={navy:"#0B2F78",navyDk:"#061F55",navyH:"#062B66",green:"#22C55E",red:"#EF4444",yellow:"#F59E0B",
  pageBg:"#F8FAFD",card:"#FFFFFF",border:"#E2E8F0",text:"#0F2A5F",muted:"#64748B",
  softRed:"#FEF2F2",softYellow:"#FFF7E8",softGreen:"#F0FDF4"};

// ─── Küçük bileşenler ─────────────────────────────────────────────────────────
function Badge({type,label}:{type:string;label:string}){
  const bg=type==="green"?C.softGreen:type==="yellow"?C.softYellow:type==="gray"?"#F1F5F9":C.softRed;
  const cl=type==="green"?"#15803D":type==="yellow"?"#B45309":type==="gray"?"#64748B":"#B91C1C";
  const br=type==="green"?"#BBF7D0":type==="yellow"?"#FDE68A":type==="gray"?"#CBD5E1":"#FECACA";
  return <span style={{display:"inline-flex",alignItems:"center",padding:"4px 11px",borderRadius:6,fontSize:11,fontWeight:900,letterSpacing:0.3,background:bg,color:cl,border:`1px solid ${br}`,whiteSpace:"nowrap"}}>{label}</span>;
}
function SummaryCard({type,title,val,sub,onClick,active}:{type:string;title:string;val:number;sub:string;onClick?:()=>void;active?:boolean}){
  const cl=type==="red"?C.red:type==="yellow"?C.yellow:type==="gray"?"#64748B":C.green;
  const ic=type==="red"?"📋":type==="yellow"?"🕐":type==="gray"?"🚫":"✓";
  return(
    <div onClick={onClick} style={{flex:1,background:active?`${cl}0F`:C.card,border:`${active?2:1}px solid ${active?cl:C.border}`,borderRadius:16,padding:"20px 24px",display:"flex",alignItems:"center",gap:18,
      boxShadow:active?`0 8px 24px ${cl}33`:"0 6px 20px rgba(11,47,120,0.05)",cursor:onClick?"pointer":"default",transition:"all .15s",position:"relative"}}>
      {active&&<span style={{position:"absolute",top:10,right:12,fontSize:11,fontWeight:900,color:cl}}>✕ Kaldır</span>}
      <div style={{width:72,height:72,borderRadius:"50%",border:`3px solid ${cl}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:type==="green"?30:26,color:cl,background:`${cl}0D`,flexShrink:0,fontWeight:900}}>{ic}</div>
      <div>
        <div style={{fontSize:13,fontWeight:900,color:cl,letterSpacing:0.5,marginBottom:3}}>{title}</div>
        <div style={{fontSize:38,fontWeight:900,color:C.text,lineHeight:1}}>{val.toLocaleString("tr-TR")}</div>
        <div style={{fontSize:12,fontWeight:600,color:C.muted,marginTop:3}}>{sub}</div>
      </div>
    </div>
  );
}
function MobileCard({title,badge,meta,extra}:{title:React.ReactNode;badge:React.ReactNode;meta:{label:string;value:React.ReactNode}[];extra?:React.ReactNode}){
  return(
    <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:9}}>
        <div style={{fontSize:14,fontWeight:800,color:C.text,lineHeight:1.3,flex:1}}>{title}</div>
        <div style={{flexShrink:0}}>{badge}</div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"3px 16px"}}>
        {meta.map((m,i)=>(
          <div key={i} style={{fontSize:12,color:C.muted}}>
            <span style={{fontWeight:700,color:"#94A3B8"}}>{m.label}:</span> <span style={{fontWeight:600,color:C.text}}>{m.value}</span>
          </div>
        ))}
      </div>
      {extra}
    </div>
  );
}
function ContactCard(){
  const rows=[
    {icon:"📍",text:"Akçaburgaz Mah. 3126. Sk. No: 10/1 DMN Plaza Kat:2 Esenyurt / İSTANBUL"},
    {icon:"📞",text:"+90 537 952 06 13"},
    {icon:"📞",text:"+90 212 632 59 65 (Fax)"},
    {icon:"🟢",text:"90 537 952 06 13"},
    {icon:"✈️",text:"info@basariotomotive.com"},
  ];
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 18px",boxShadow:"0 6px 20px rgba(11,47,120,0.05)"}}>
      {rows.map(({icon,text},i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:11,padding:"7px 0"}}>
          <span style={{fontSize:15,flexShrink:0,lineHeight:1.3}}>{icon}</span>
          <span style={{fontSize:12.5,fontWeight:700,color:C.text,lineHeight:1.45}}>{text}</span>
        </div>
      ))}
    </div>
  );
}
function DayEndSummary({title,rows}:{title:string;rows:[string,number,string][]}){
  return(
    <div style={{background:`linear-gradient(160deg,${C.navyH} 0%,${C.navy} 100%)`,borderRadius:14,padding:"20px",color:"#fff",marginBottom:14,boxShadow:"0 10px 30px rgba(6,31,85,0.25)"}}>
      <div style={{fontWeight:900,fontSize:14,letterSpacing:0.5,marginBottom:12}}>{title}</div>
      {rows.map(([l,v,c],i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<rows.length-1?"1px solid rgba(255,255,255,0.12)":"none"}}>
          <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.85)"}}>{l}</span>
          <span style={{fontSize:16,fontWeight:900,color:c}}>{v.toLocaleString("tr-TR")}</span>
        </div>
      ))}
      <div style={{marginTop:14,display:"flex",justifyContent:"space-around",fontSize:30,opacity:0.18,filter:"grayscale(1) brightness(3)"}}>
        <span>🚛</span><span>📦</span><span>🚚</span>
      </div>
    </div>
  );
}

// ─── ANA SAYFA ────────────────────────────────────────────────────────────────
export default function App(){
  const [mobile,setMobile]=useState(false);
  const [depoFiltre,setDepoFiltre]=useState("Tümü");
  const [durumFiltre,setDurumFiltre]=useState<string>("");
  const [rows,setRows]=useState<Row[]>([]);
  const [stU,setStU]=useState<US>("idle");
  const [msgU,setMsgU]=useState("");
  const fileRef=useRef<HTMLInputElement>(null);
  const editingRef=useRef(false);
  const [raporId,setRaporId]=useState<string|null>(null);
  const [saving,setSaving]=useState(false);
  const [shareUrl,setShareUrl]=useState("");
  const [copied,setCopied]=useState(false);
  const [isView,setIsView]=useState(false);
  const [lastRefresh,setLastRefresh]=useState<Date|null>(null);

  const today=new Date().toLocaleDateString("tr-TR",{day:"2-digit",month:"long",year:"numeric",weekday:"long"});

  useEffect(()=>{
    const chk=()=>setMobile(window.innerWidth<900);
    chk();window.addEventListener("resize",chk);
    return()=>window.removeEventListener("resize",chk);
  },[]);

  useEffect(()=>{
    const id=new URLSearchParams(window.location.search).get("rapor");
    if(id){
      setRaporId(id);setIsView(true);loadReport(id);
      const iv=setInterval(()=>{if(!editingRef.current)loadReport(id).then(()=>setLastRefresh(new Date()));},30000);
      return()=>clearInterval(iv);
    } else {
      (async()=>{
        try{
          const r=await fetch(`${SB_URL}/rest/v1/${TABLE}?tarih=eq.${todayStr()}&select=id&order=created_at.desc&limit=1`,
            {headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`}});
          const d=await r.json();
          if(d?.[0]?.id){setRaporId(d[0].id);setShareUrl(`${window.location.origin}?rapor=${d[0].id}`);}
        }catch{}
      })();
    }
  // eslint-disable-next-line
  },[]);

  async function loadReport(id:string){
    const d=await sbLoad(id);
    if(d){
      if(Array.isArray(d.yurtici_rows))setRows(d.yurtici_rows);
      setLastRefresh(new Date());
    }
  }

  async function resetRapor(){
    if(!window.confirm("Bugünkü yurtiçi raporunu sıfırlamak istediğine emin misin? Tüm veriler silinecek."))return;
    setRows([]);setStU("idle");setMsgU("");setDurumFiltre("");setDepoFiltre("Tümü");
    if(raporId)await sbUpdate(raporId,{yurtici_rows:[]});
  }

  async function handleSave(){
    setSaving(true);
    const p={tarih:todayStr(),yurtici_rows:rows};
    let id=raporId;
    if(id){await sbUpdate(id,p);}
    else{id=await sbSave(p);if(id){setRaporId(id);const u=`${window.location.origin}?rapor=${id}`;setShareUrl(u);window.history.pushState({},"",`?rapor=${id}`);}}
    setSaving(false);
    if(id){
      const base=shareUrl||`${window.location.origin}?rapor=${id}`;
      const u=`${base}${base.includes("?")?"&":"?"}v=${Date.now()}`;
      const caption=`📊 *Başarı Otomotiv Yurtiçi Sevkiyat Durumu*\nCanlı takip için:\n${u}`;
      try{
        const imgResp=await fetch("/opengraph-image.jpg");
        const blob=await imgResp.blob();
        const file=new File([blob],"yurtici-sevkiyat.jpg",{type:"image/jpeg"});
        const nav=navigator as any;
        if(nav.canShare&&nav.canShare({files:[file]})){await nav.share({files:[file],text:caption});return;}
      }catch(e){}
      window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`,"_blank");
    }
  }

  // ─── Excel parse — Firma|Depo|BelgeNo|Cari|Gönderi Tipi|Tarih|Durum
  async function parseExcel(file:File){
    editingRef.current=true;
    setStU("loading");
    try{
      const XLSX=await import("xlsx");
      const wb=XLSX.read(await file.arrayBuffer(),{cellDates:true});
      const ws=wb.Sheets["data"]??wb.Sheets[wb.SheetNames[0]];
      const raw:any[][]=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
      const hi=raw.findIndex(r=>r.some((c:any)=>sv(c)==="Firma"));
      const h=hi>=0?raw[hi]:raw[0];
      const col=(k:string)=>h.findIndex((c:any)=>sv(c)===k);
      const iDep=col("Depo"),iBno=col("BelgeNo"),iCari=col("Cari"),iTip=col("Gönderi Tipi"),iTar=col("Tarih"),iDur=col("Durum");

      let fileDepo="TEM.34";
      const cnt:Record<string,number>={};
      for(let i=(hi>=0?hi+1:1);i<raw.length;i++){
        const r=raw[i];if(!sv(r[iCari>=0?iCari:3]))continue;
        const d=normDepo(sv(r[iDep>=0?iDep:1]));if(d)cnt[d]=(cnt[d]||0)+1;
      }
      const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
      if(top)fileDepo=top[0];

      const newRows:Row[]=[];
      for(let i=(hi>=0?hi+1:1);i<raw.length;i++){
        const r=raw[i];const mus=sv(r[iCari>=0?iCari:3]);if(!mus)continue;
        const durum=sv(r[iDur>=0?iDur:6])||"Başlamadı";
        newRows.push({depo:normDepo(sv(r[iDep>=0?iDep:1]))||fileDepo,no:sv(r[iBno>=0?iBno:2])||("BLG-"+Math.random().toString(36).slice(2,8)),
          musteri:mus,tip:sv(r[iTip>=0?iTip:4])||"—",tarih:xd(r[iTar>=0?iTar:5]),durum,type:zeusType(durum)});
      }
      setRows(prev=>[...prev.filter(x=>x.depo!==fileDepo),...newRows]);
      setMsgU(`${fileDepo} · ${newRows.length} kayıt yüklendi`);
      setStU("ok");
    }catch{
      setMsgU("Dosya okunamadı");setStU("err");
    }
  }

  // ─── Filtreleme ────────────────────────────────────────────────────────────
  const depolar=Array.from(new Set(rows.map(r=>r.depo))).filter(Boolean);
  const grand={b:rows.filter(r=>r.type==="red").length,y:rows.filter(r=>r.type==="yellow").length,g:rows.filter(r=>r.type==="green").length,gray:rows.filter(r=>r.type==="gray").length};

  const th:React.CSSProperties={padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:800,color:C.muted,borderBottom:`1px solid ${C.border}`,letterSpacing:0.2,whiteSpace:"nowrap"};
  const td:React.CSSProperties={padding:"13px 16px",fontSize:13,fontWeight:700,borderBottom:`1px solid ${C.border}`,color:C.text};

  const tableCard=(count:number,head:string[],body:React.ReactNode,depotLabel?:string,mobileList?:React.ReactNode)=>(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:"0 6px 20px rgba(11,47,120,0.05)"}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:9,fontWeight:900,fontSize:15,color:C.text,letterSpacing:0.4}}>
          <span style={{fontSize:17}}>📋</span>SİPARİŞ LİSTESİ
        </div>
        <span style={{fontSize:12,fontWeight:700,color:C.muted}}>{count} kayıt{depotLabel?` · ${depotLabel}`:""}{durumFiltre?` · ${durumFiltre==="red"?"GİTMEYEN":durumFiltre==="yellow"?"TOPLAMASI DEVAM EDEN":durumFiltre==="gray"?"SİLİNENLER":"GİDEN"} filtresi aktif`:""}</span>
      </div>
      {mobile&&mobileList?(
        <div>{mobileList}</div>
      ):(
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch" as any}}>
          <table style={{width:"100%",minWidth:640,borderCollapse:"collapse"}}>
            <thead><tr>{head.map((h,i)=><th key={i} style={th}>{h}</th>)}</tr></thead>
            <tbody>{body}</tbody>
          </table>
        </div>
      )}
    </div>
  );

  function renderSections(){
    const depotsToShow:(string|null)[]=depolar.length<=1?[null]:(depoFiltre==="Tümü"?depolar:[depoFiltre]);
    const showGrandTotal=depolar.length>1&&depoFiltre==="Tümü";
    return(
      <>
        {showGrandTotal&&(
          <div style={{marginBottom:24,paddingBottom:20,borderBottom:`2px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:9,margin:"2px 0 12px",fontWeight:900,fontSize:14,color:C.navy,letterSpacing:0.4}}>
              <span style={{width:9,height:9,borderRadius:"50%",background:C.navy,display:"inline-block",flexShrink:0}}/>
              🏬 TÜM DEPOLAR — TOPLAM ({depolar.join(" + ")})
            </div>
            <div style={{display:"flex",flexDirection:mobile?"column":"row",gap:mobile?10:14}}>
              <SummaryCard type="red"    title="GİTMEYEN" val={grand.b} sub="Sipariş" active={durumFiltre==="red"}    onClick={()=>setDurumFiltre(f=>f==="red"?"":"red")}/>
              <SummaryCard type="yellow" title="TOPLAMASI DEVAM EDEN" val={grand.y} sub="Sipariş" active={durumFiltre==="yellow"} onClick={()=>setDurumFiltre(f=>f==="yellow"?"":"yellow")}/>
              <SummaryCard type="green"  title="GİDEN" val={grand.g} sub="Sipariş" active={durumFiltre==="green"}  onClick={()=>setDurumFiltre(f=>f==="green"?"":"green")}/>
              <SummaryCard type="gray"   title="SİLİNENLER" val={grand.gray} sub="Sipariş" active={durumFiltre==="gray"} onClick={()=>setDurumFiltre(f=>f==="gray"?"":"gray")}/>
            </div>
          </div>
        )}
        {depotsToShow.map(depot=>{
          const rowsForDepot=depot?rows.filter(r=>r.depo===depot):rows;
          const rowsForTable=durumFiltre?rowsForDepot.filter(r=>r.type===durumFiltre):rowsForDepot;
          // Zübeyir Bey talebi: liste kronolojik artan geliyordu, en yeni sipariş üstte görünsün diye ters çevriliyor
          const displayRows=[...rowsForTable].reverse();
          const b=rowsForDepot.filter(r=>r.type==="red").length;
          const y=rowsForDepot.filter(r=>r.type==="yellow").length;
          const g=rowsForDepot.filter(r=>r.type==="green").length;
          const gray=rowsForDepot.filter(r=>r.type==="gray").length;
          return(
            <div key={depot??"tek"} style={{marginBottom:22}}>
              {depot&&(
                <div style={{display:"flex",alignItems:"center",gap:9,margin:"2px 0 12px",fontWeight:900,fontSize:14,color:C.navy,letterSpacing:0.4}}>
                  <span style={{width:9,height:9,borderRadius:"50%",background:depot==="KARTEPE"?C.yellow:C.green,display:"inline-block",flexShrink:0}}/>
                  🏬 {depot} DEPOSU
                </div>
              )}
              <div style={{display:"flex",flexDirection:mobile?"column":"row",gap:mobile?10:14,marginBottom:14}}>
                <SummaryCard type="red"    title="GİTMEYEN" val={b} sub="Sipariş" active={durumFiltre==="red"}    onClick={()=>setDurumFiltre(f=>f==="red"?"":"red")}/>
                <SummaryCard type="yellow" title="TOPLAMASI DEVAM EDEN" val={y} sub="Sipariş" active={durumFiltre==="yellow"} onClick={()=>setDurumFiltre(f=>f==="yellow"?"":"yellow")}/>
                <SummaryCard type="green"  title="GİDEN" val={g} sub="Sipariş" active={durumFiltre==="green"}  onClick={()=>setDurumFiltre(f=>f==="green"?"":"green")}/>
                <SummaryCard type="gray"   title="SİLİNENLER" val={gray} sub="Sipariş" active={durumFiltre==="gray"} onClick={()=>setDurumFiltre(f=>f==="gray"?"":"gray")}/>
              </div>
              {tableCard(rowsForTable.length,
                ["Belge No","Müşteri","Gönderi Tipi","Depo","Tarih","Durum",""],
                displayRows.length===0
                  ?<tr><td colSpan={7} style={{...td,textAlign:"center",color:C.muted,padding:24}}>Excel yüklendikten sonra siparişler burada listelenir</td></tr>
                  :displayRows.map((r,i)=>{
                    const bildirimUrl=r.type==="gray"?silinenBildirimUrl(r):null;
                    return(
                      <tr key={i}>
                        <td style={{...td,fontWeight:900}}>{r.no}</td>
                        <td style={td}>{r.musteri}</td>
                        <td style={td}>{r.tip}</td>
                        <td style={td}><Badge type={r.depo==="KARTEPE"?"yellow":"green"} label={r.depo}/></td>
                        <td style={td}>{r.tarih}</td>
                        <td style={td}><Badge type={r.type} label={displayDurum(r.durum)}/></td>
                        <td style={{...td,textAlign:"center"}}>
                          {r.type==="gray"&&(bildirimUrl?(
                            <a href={bildirimUrl} target="_blank" rel="noopener noreferrer"
                              style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:7,background:"#25D366",color:"#fff",fontSize:11.5,fontWeight:800,textDecoration:"none",whiteSpace:"nowrap"}}>
                              <WhatsAppIcon size={13}/>Bildir
                            </a>
                          ):(
                            <span style={{fontSize:11,color:C.muted}}>Plasiyer yok</span>
                          ))}
                        </td>
                      </tr>
                    );
                  }),
                depot??undefined,
                displayRows.length===0
                  ?<div style={{padding:24,textAlign:"center",color:C.muted,fontSize:13}}>Excel yüklendikten sonra siparişler burada listelenir</div>
                  :displayRows.map((r,i)=>{
                    const bildirimUrl=r.type==="gray"?silinenBildirimUrl(r):null;
                    return(
                      <MobileCard key={i} title={<>{r.musteri}<div style={{fontSize:11,color:C.muted,fontWeight:700,marginTop:2}}>{r.no}</div></>}
                        badge={<Badge type={r.type} label={displayDurum(r.durum)}/>}
                        meta={[{label:"Tip",value:r.tip},{label:"Depo",value:<Badge type={r.depo==="KARTEPE"?"yellow":"green"} label={r.depo}/>},{label:"Tarih",value:r.tarih}]}
                        extra={r.type==="gray"?(
                          bildirimUrl?(
                            <a href={bildirimUrl} target="_blank" rel="noopener noreferrer"
                              style={{marginTop:9,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px 0",borderRadius:9,background:"#25D366",color:"#fff",fontSize:12.5,fontWeight:800,textDecoration:"none"}}>
                              <WhatsAppIcon size={14}/>Plasiyere Bildir
                            </a>
                          ):(
                            <div style={{marginTop:8,fontSize:11.5,color:C.muted,textAlign:"center"}}>Plasiyer bulunamadı</div>
                          )
                        ):undefined}/>
                    );
                  })
              )}
            </div>
          );
        })}
      </>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:C.pageBg,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',color:C.text}}>

      {/* HEADER */}
      <header style={{minHeight:mobile?56:70,background:C.navyDk,display:"flex",alignItems:"center",flexWrap:"wrap",gap:mobile?8:0,padding:mobile?"8px 16px":"0 36px",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 16px rgba(6,31,85,0.35)"}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-white-clean.png" alt="Başarı Otomotiv" style={{height:mobile?30:42,objectFit:"contain"}}/>
        <div style={{width:1,height:mobile?24:36,background:"rgba(255,255,255,0.25)",margin:mobile?"0 12px":"0 22px"}}/>
        <span style={{color:"#fff",fontSize:mobile?16:22,fontWeight:900,letterSpacing:-0.4}}>Yurtiçi Sevkiyat Takibi <span style={{fontSize:mobile?11:13,fontWeight:700,color:"rgba(255,255,255,0.55)"}}>· Satış</span></span>
        {!mobile&&<span style={{display:"inline-flex",alignItems:"center",gap:8,marginLeft:20,color:"rgba(255,255,255,0.85)",fontSize:14,fontWeight:700}}>
          <span style={{fontSize:16}}>📅</span>{today}
        </span>}
        {raporId&&<span style={{marginLeft:"auto",fontSize:12,fontWeight:800,color:"#86efac",background:"rgba(34,197,94,0.15)",border:"1px solid rgba(134,239,172,0.4)",borderRadius:20,padding:"4px 14px"}}>🟢 Canlı</span>}
      </header>

      {/* HERO */}
      <div style={{width:"100%",lineHeight:0,background:C.navyDk}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/basari-logistics-hero.png" alt="Güçlü Lojistik" style={{width:"100%",height:"auto",maxHeight:mobile?120:220,objectFit:"cover",objectPosition:"center",display:"block"}}/>
      </div>

      {/* ANA CONTAINER */}
      <div style={{maxWidth:1500,margin:"-18px auto 0",padding:mobile?"0 10px 40px":"0 24px 60px",position:"relative",zIndex:5}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:mobile?16:22,boxShadow:"0 20px 60px rgba(11,47,120,0.10)",padding:mobile?"14px 12px":"22px 24px"}}>

          {isView&&(
            <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:12,padding:"9px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontSize:13,fontWeight:700,color:"#15803D"}}>🔄 Otomatik güncelleniyor{lastRefresh&&` · ${lastRefresh.toLocaleTimeString("tr-TR")}`}</span>
              <button onClick={()=>raporId&&loadReport(raporId)} style={{border:"1px solid #86EFAC",borderRadius:8,background:"#fff",color:"#15803D",padding:"4px 12px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>↺ Yenile</button>
            </div>
          )}
          {shareUrl&&(
            <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:12,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <span>🔗</span>
              <span style={{flex:1,fontSize:12,color:C.muted,fontFamily:"monospace",wordBreak:"break-all"}}>{shareUrl}</span>
              <button onClick={async()=>{await navigator.clipboard.writeText(shareUrl);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
                style={{border:"1px solid #BFDBFE",borderRadius:8,background:"#fff",color:C.navy,padding:"5px 12px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                {copied?"✅":"📋 Kopyala"}
              </button>
            </div>
          )}

          {/* KAYDET / İNDİR — sekme yok, tek amaçlı ekran */}
          <div style={{display:"flex",flexDirection:mobile?"column":"row",alignItems:"stretch",gap:mobile?10:14,marginBottom:14}}>
            <div style={{flex:1,display:"flex",alignItems:"center",gap:12,background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,padding:"0 20px",height:mobile?50:62}}>
              <span style={{fontSize:24}}>🚚</span>
              <span style={{fontWeight:900,fontSize:mobile?14:16,color:C.navy}}>Yurtiçi Sipariş Durumu</span>
            </div>
            <a href="/opengraph-image.jpg" download="yurtici-sevkiyat.jpg"
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:"#fff",color:C.navy,border:`1.5px solid ${C.border}`,borderRadius:12,padding:mobile?"0 14px":"0 18px",height:mobile?48:62,fontWeight:800,fontSize:mobile?12:13,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",textDecoration:"none"}}>
              <span style={{fontSize:16}}>🖼️</span>Görseli İndir
            </a>
            <button onClick={handleSave} disabled={saving}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:9,background:C.green,color:"#fff",border:"none",borderRadius:12,padding:"0 24px",height:mobile?48:62,fontWeight:900,fontSize:mobile?14:15,cursor:"pointer",boxShadow:"0 10px 24px rgba(34,197,94,0.30)",fontFamily:"inherit",whiteSpace:"nowrap"}}>
              <span style={{fontSize:18}}>{saving?"⏳":"🔗"}</span>{saving?"Kaydediliyor...":"Kaydet ve Paylaş"}
            </button>
          </div>

          {/* DEPO FİLTRE ÇUBUĞU */}
          {depolar.length>1&&(
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              <span style={{fontSize:12,fontWeight:800,color:C.muted,letterSpacing:0.4}}>🏬 DEPO:</span>
              {["Tümü",...depolar].map(d=>{
                const act=depoFiltre===d;
                return(
                  <button key={d} onClick={()=>setDepoFiltre(d)}
                    style={{padding:"7px 18px",borderRadius:20,border:act?"none":`1px solid ${C.border}`,
                      background:act?C.navy:"#fff",color:act?"#fff":C.navy,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",
                      boxShadow:act?"0 6px 14px rgba(11,47,120,0.25)":"none",transition:"all .15s"}}>
                    {d}
                  </button>
                );
              })}
            </div>
          )}

          {/* UPLOAD BAR */}
          <div style={{background:"#fff",border:`1px solid ${stU==="ok"?"#BBF7D0":stU==="err"?"#FECACA":C.border}`,borderRadius:14,padding:mobile?"12px 14px":"14px 20px",display:"flex",flexDirection:mobile?"column":"row",alignItems:mobile?"stretch":"center",gap:mobile?10:0,justifyContent:"space-between",marginBottom:18,boxShadow:"0 4px 14px rgba(11,47,120,0.04)"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:48,height:48,borderRadius:12,background:"#E7F6EC",border:"1px solid #C6E9D2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{color:"#1D6F42",fontWeight:900,fontSize:20,fontFamily:"Georgia,serif"}}>X</span>
              </div>
              <div>
                <div style={{fontWeight:900,fontSize:15,color:C.text}}>
                  {stU==="ok"?`✅ ${msgU}`:stU==="err"?`❌ ${msgU}`:"Yurtiçi Excel Dosyası Yükle"}
                </div>
                <div style={{fontSize:12,color:C.muted,fontWeight:600,marginTop:2}}>
                  {stU==="ok"?"Değiştirmek için tekrar Excel seçebilirsiniz":"Zeus'tan aldığın yurtiçi sipariş raporunu yükle."}
                </div>
              </div>
            </div>
            <button onClick={()=>fileRef.current?.click()}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,border:`1.5px solid ${C.navy}`,color:C.navy,background:"#fff",borderRadius:11,padding:"11px 22px",fontWeight:900,fontSize:14,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
              <span>⇧</span>{stU==="loading"?"Yükleniyor...":"Excel Seç"}
            </button>
          </div>

          {/* İKİ KOLON */}
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 300px",gap:18,alignItems:"start"}}>
            <div>{renderSections()}</div>
            <div>
              <DayEndSummary title="GÜN SONU ÖZETİ · Tüm Depolar" rows={[
                ["Toplam Sipariş",rows.length,"#fff"],["Gitmeyen",grand.b,"#FCA5A5"],["Toplaması Devam Eden",grand.y,"#FCD34D"],["Giden",grand.g,"#86EFAC"],["Silinenler",grand.gray,"#CBD5E1"]]}/>
              <ContactCard/>
            </div>
          </div>

          {raporId&&(
            <div style={{textAlign:"right",marginTop:18,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
              <button onClick={resetRapor}
                style={{background:"none",border:"none",color:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:0.6,padding:"4px 2px"}}
                onMouseEnter={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.color=C.red;}}
                onMouseLeave={e=>{e.currentTarget.style.opacity="0.6";e.currentTarget.style.color=C.muted;}}>
                🗑️ Bugünkü raporu sıfırla
              </button>
            </div>
          )}
        </div>
      </div>

      <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{display:"none"}}
        onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f);e.target.value="";}}/>
    </div>
  );
}
