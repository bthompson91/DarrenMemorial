(function(root){'use strict';
const len=s=>s.job?120:s.regional?60:30,ret=s=>!s||s.job?0:s.regional?60:30;
function place(t,n,blocks){for(const b of [...blocks].sort((a,b)=>a.start-b.start)){if(t+n<=b.start)break;if(t<b.end&&t+n>b.start)t=b.end;}return t;}
function plan(input){
 const runs=structuredClone(input);
 const fallback=!runs.some(r=>r.stops.some(s=>s.section==='am'||s.lock!=null&&s.lock<570||s.job&&s.centre-60<570));
 if(fallback)for(const r of runs)for(const s of r.stops)if(!s.job&&s.lock==null)s.section='am';
 let parts=runs.map(r=>{
  const fixed=r.stops.filter(s=>s.job||s.lock!=null).map(s=>({id:s.id,s,start:s.job?s.centre-60:s.lock,end:(s.job?s.centre-60:s.lock)+len(s)}));
  const rows=[...fixed],blocks=[...fixed];
  let cursor=570;
  for(const s of r.stops.filter(s=>!s.job&&s.lock==null&&s.section==='am')){
   const t=place(cursor,len(s),blocks),x={id:s.id,s,start:t,end:t+len(s)};rows.push(x);blocks.push(x);cursor=x.end;
  }
  let morning=rows.filter(x=>x.s.section==='am'&&!x.s.job);
  let arrival=morning.length?Math.max(...morning.map(x=>x.end+ret(x.s))):null,changed=true;
  while(changed&&arrival!==null){changed=false;for(const x of fixed)if(!morning.includes(x)&&x.start<arrival){morning.push(x);arrival=Math.max(arrival,x.end+ret(x.s));changed=true;}}
  const pm=r.stops.filter(s=>!morning.some(x=>x.id===s.id));
  return {...r,rows,morning,pm,arrival,blocks,fixed};
 });
 const participating=parts.filter(r=>r.morning.length&&r.pm.length);
 let lunch=participating.length?Math.max(...participating.map(r=>r.arrival)):null;
 if(lunch!==null){
  let moved=true;
  while(moved){
   moved=false;
   for(const r of participating)for(const x of r.fixed){
    if(x.start<lunch+60&&x.end>lunch){lunch=x.end;moved=true;}
   }
  }
 }
 for(const r of parts){
  const hasLunch=lunch!==null&&r.morning.length&&r.pm.length;
  const blocks=[...r.blocks];
  if(hasLunch)blocks.push({start:lunch,end:lunch+60});
  let cursor=hasLunch?lunch+90:r.morning.length?r.arrival:lunch===null?570:lunch+90;
  for(const s of r.pm.filter(s=>!s.job&&s.lock==null)){
   const t=place(cursor,len(s),blocks),x={id:s.id,s,start:t,end:t+len(s)};
   r.rows.push(x);blocks.push(x);cursor=x.end;
  }
  r.rows.sort((a,b)=>a.start-b.start||a.end-b.end);
  r.lunchStart=hasLunch?lunch:null;
  r.lunchEnd=hasLunch?lunch+60:null;
  r.start=r.morning.length?Math.min(540,...r.rows.map(x=>x.start)):(lunch===null?540:lunch+60);
  r.end=r.rows.length?Math.max(...r.rows.map(x=>x.end+ret(x.s))):(hasLunch?lunch+60:r.start);
  r.returnMorning=r.arrival;
  r.returnFinal=r.end;
  r.warnings=[];
  for(let i=0;i<r.fixed.length;i++)for(let j=i+1;j<r.fixed.length;j++)if(r.fixed[i].start<r.fixed[j].end&&r.fixed[j].start<r.fixed[i].end)r.warnings.push('Fixed commitments overlap: '+r.fixed[i].id+' / '+r.fixed[j].id);
  if(hasLunch&&r.fixed.some(x=>x.start<lunch+60&&x.end>lunch))r.warnings.push('Generated lunch overlaps fixed commitment');
  if(hasLunch&&lunch-r.start>240)r.warnings.push('Lunch starts more than four hours into shift');
  if(r.end>1020)r.warnings.push('Run extends past 17:00');
  if(r.end-r.start>660)r.warnings.push('Shift exceeds eleven hours');
 }
 return {runs:parts,lunchStart:lunch,lunchEnd:lunch===null?null:lunch+60,fallback};
}
function dates(a,b){if(!validDate(a)||!validDate(b)||a>b)throw Error('Invalid date range');let out=[],d=new Date(a+'T12:00:00Z');while(d.toISOString().slice(0,10)<=b){out.push(d.toISOString().slice(0,10));d.setUTCDate(d.getUTCDate()+1);}return out;}
function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}
function date(s){if(/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(s)){const a=s.split(/[-/]/);s=a[2]+'-'+a[1]+'-'+a[0];}else if(/^\d+(\.\d+)?$/.test(s))s=new Date(Date.UTC(1899,11,30)+Math.floor(Number(s))*86400000).toISOString().slice(0,10);return validDate(s)?s:null;}
function parse(text,bases){const records=[],errors=[];for(const line of text.replace(/\r\n?/g,'\n').split('\n')){if(/^(true|false)\t/i.test(line))records.push(line);else if(records.length)records[records.length-1]+='\n'+line;else if(line.trim()&&!/reference|description|status|date/i.test(line))errors.push('Unrecognised leading line');}const map=new Map(),blank=new Map();records.forEach((line,i)=>{const c=line.split('\t');if(c.length<17||!date(c[9])){errors.push('Malformed record '+(i+1));return;}const kind=c[6].trim(),site=c[11].trim(),managed=c[15].trim(),job=c[5].trim()!=='Transfer';if(c[16].trim().toUpperCase()==='CLOSED'||/EA Online Webinars/i.test(c[8])||!['Ship','Receive'].includes(kind)||job&&!bases.includes(site))return;if(!job&&bases.includes(site)&&bases.includes(managed))return;const signature=JSON.stringify([c[7].trim(),date(c[9]),kind,job]),raw=c[7].trim(),seed=JSON.stringify([c[5],kind,c[8],date(c[9]),site,managed]),count=blank.get(seed)||0;blank.set(seed,count+1);const id=raw?signature:seed+':'+count,time=/^\d\d:\d\d$/.test(c[4])?Number(c[4].slice(0,2))*60+Number(c[4].slice(3)):null;if(time===null||time>=1440){errors.push('Invalid time in record '+(i+1));return;}const a={id,ref:raw,date:date(c[9]),kind,site,managed,time,job,description:c[8],sources:[]};if(!map.has(id))map.set(id,a);const target=map.get(id);target.sources.push(c);if(time<target.time){target.time=time;target.site=site;}});return {items:[...map.values()],errors};}
function available(v,d){const w=new Date(d+'T12:00:00Z').getUTCDay();if(v.builtin)return v.id==='uber'||w>0&&w<6;return v.days.includes(w)&&(!v.start||d>=v.start)&&(!v.end||d<=v.end)&&!(v.off||[]).some(p=>d>=p[0]&&d<=p[1]);}
function allocate(q,vs,d){if(!q)return '';const all=vs.filter(v=>['Truck','Van'].includes(v.type)&&available(v,d));return (all.find(v=>v.id===q.vehicle)||all.find(v=>v.rental&&v.type===q.type)||all.find(v=>!v.rental&&v.type===q.type)||all.find(v=>v.rental&&v.type!==q.type))?.id||'';}
const api={plan,place,dates,date,validDate,parse,available,allocate};if(typeof module!=='undefined')module.exports=api;root.MilkRunCore=api;})(globalThis);
