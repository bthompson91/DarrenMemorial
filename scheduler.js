(function(root){'use strict';
const len=(s,next)=>s.job?120:!!s.regional!==!!next?.regional?60:30,ret=s=>!s||s.job?0:s.regional?60:30;
function place(t,n,blocks){for(const b of [...blocks].sort((a,b)=>a.start-b.start)){if(t+n<=b.start)break;if(t<b.end&&t+n>b.start)t=b.end;}return t;}
function plan(input){
 const runs=structuredClone(input);
 const duration=(r,s)=>{if(s.job)return 120;const i=r.stops.indexOf(s),next=r.stops.slice(i+1).find(x=>!x.job&&x.section===s.section);return next?len(s,next):ret(s);};
 const fallback=!runs.some(r=>r.stops.some(s=>s.section==='am'||s.lock!=null&&s.lock<570||s.job&&s.centre-60<570));
 if(fallback)for(const r of runs)for(const s of r.stops)if(!s.job&&s.lock==null)s.section='am';
 let parts=runs.map(r=>{
  const fixed=r.stops.filter(s=>s.job||s.lock!=null).map(s=>({id:s.id,s,start:s.job?(Number.isInteger(s.departureOverride)&&s.departureOverride>=0&&s.departureOverride<1440?s.departureOverride:s.centre-60):s.lock,end:(s.job?(Number.isInteger(s.departureOverride)&&s.departureOverride>=0&&s.departureOverride<1440?s.departureOverride:s.centre-60):s.lock)+duration(r,s)}));
  const rows=[...fixed],blocks=[...fixed],warnings=[];
  const followers=r.stops.filter(s=>!s.job&&s.lock==null&&s.follow),placed=new Set();
  let cursor=570;
  for(const s of r.stops.filter(s=>!s.job&&s.lock==null&&s.section==='am'&&!s.follow)){
   const n=duration(r,s),t=place(cursor,n,blocks),x={id:s.id,s,start:t,end:t+n};rows.push(x);blocks.push(x);cursor=x.end;
  }
  let progress=true;
  while(progress){progress=false;
   for(const s of followers){
    if(placed.has(s.id))continue;
    const f=rows.find(x=>x.id===s.follow);
    if(!f)continue;
    const n=duration(r,s),t=place(f.end,n,blocks),x={id:s.id,s,start:t,end:t+n};rows.push(x);blocks.push(x);placed.add(s.id);progress=true;
   }
  }
  let morning=rows.filter(x=>x.s.section==='am'&&!x.s.job);
  let arrival=morning.length?Math.max(...morning.map(x=>x.end)):null,changed=true;
  while(changed&&arrival!==null){changed=false;for(const x of fixed)if(!morning.includes(x)&&x.start<arrival){morning.push(x);arrival=Math.max(arrival,x.end);changed=true;}}
  const pm=r.stops.filter(s=>!morning.some(x=>x.id===s.id));
  return {...r,rows,morning,pm,arrival,blocks,fixed,warnings,followers,placed};
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
  for(const s of r.pm.filter(s=>!s.job&&s.lock==null&&!s.follow)){
   const n=duration(r,s),t=place(cursor,n,blocks),x={id:s.id,s,start:t,end:t+n};r.rows.push(x);blocks.push(x);cursor=x.end;
  }
  let progress=true;
  while(progress){progress=false;
   for(const s of r.followers){
    if(r.placed.has(s.id))continue;
    const f=r.rows.find(x=>x.id===s.follow);
    if(!f)continue;
    const n=duration(r,s),t=place(f.end,n,blocks),x={id:s.id,s,start:t,end:t+n};r.rows.push(x);blocks.push(x);r.placed.add(s.id);progress=true;
   }
  }
  for(const s of r.followers){
   if(r.placed.has(s.id))continue;
   const base=s.section==='pm'?cursor:(r.arrival??570);
   const n=duration(r,s),t=place(base,n,blocks),x={id:s.id,s,start:t,end:t+n};r.rows.push(x);blocks.push(x);r.placed.add(s.id);
   r.warnings.push('Follow-up placed without its parent: '+s.id);
  }
  r.rows.sort((a,b)=>a.start-b.start||a.end-b.end);
  r.lunchStart=hasLunch?lunch:null;
  r.lunchEnd=hasLunch?lunch+60:null;
  r.start=r.morning.length?Math.min(540,...r.rows.map(x=>x.start)):(lunch===null?540:lunch+60);
  r.end=r.rows.length?Math.max(...r.rows.map(x=>x.end)):(hasLunch?lunch+60:r.start);
  r.returnMorning=r.arrival;
  r.returnFinal=r.end;
  for(let i=0;i<r.fixed.length;i++)for(let j=i+1;j<r.fixed.length;j++)if(r.fixed[i].start<r.fixed[j].end&&r.fixed[j].start<r.fixed[i].end)r.warnings.push('Fixed commitments overlap: '+r.fixed[i].id+' / '+r.fixed[j].id);
  if(hasLunch&&r.fixed.some(x=>x.start<lunch+60&&x.end>lunch))r.warnings.push('Generated lunch overlaps fixed commitment');
  if(hasLunch&&lunch-r.start>240)r.warnings.push('Lunch starts more than four hours into shift');
  if(r.end>1020)r.warnings.push('Run extends past 17:00');
  if(r.end-r.start>660)r.warnings.push('Shift exceeds eleven hours');
 }
 return {runs:parts,lunchStart:lunch,lunchEnd:lunch===null?null:lunch+60,fallback};
}
function moveStop(stops,rows,id,step,lunchStart,lunchEnd){const ordered=rows.map(row=>stops.find(stop=>stop.id===row.id)).filter(Boolean),from=ordered.findIndex(stop=>stop.id===id),target=ordered[from+step],currentRow=rows.find(row=>row.id===id),targetRow=target&&rows.find(row=>row.id===target.id);if(from<0||!target||!currentRow||!targetRow)return null;const crossesLunch=lunchStart!==null&&lunchEnd!==null&&(step<0&&currentRow.start>=lunchEnd&&targetRow.start<lunchStart||step>0&&currentRow.start<lunchStart&&targetRow.start>=lunchEnd);if(!crossesLunch){ordered.splice(from,1);const targetIndex=ordered.indexOf(target);ordered.splice(step<0?targetIndex:targetIndex+1,0,stops.find(stop=>stop.id===id));}return {stops:[...stops.filter(stop=>!ordered.includes(stop)),...ordered],target};}
function breakStop(stops,selectedId,makeId){const selected=stops.find(s=>s.id===selectedId);if(!selected||selected.ids.length<2)return null;const ids=[...selected.ids];selected.ids=[ids[0]];selected.autoKey='manual';selected.edited=true;let follow=selected.id;const split=ids.slice(1).map(activityId=>{const stop={...selected,id:makeId(),ids:[activityId],lock:null,follow};follow=stop.id;return stop;});stops.splice(stops.indexOf(selected)+1,0,...split);return stops;}
function unlinkStop(stops,selectedId,activityId,makeId){const selected=stops.find(s=>s.id===selectedId);if(!selected||selected.ids.length<2||!selected.ids.includes(activityId))return null;selected.ids=selected.ids.filter(id=>id!==activityId);selected.autoKey='manual';selected.edited=true;const split={...selected,id:makeId(),ids:[activityId],lock:null,follow:selected.id};stops.splice(stops.indexOf(selected)+1,0,split);return stops;}
function mergeStops(stops,all,selectedId){const selected=all.find(s=>s.id===selectedId);if(!selected||!stops.some(s=>s.id===selectedId))return null;const removed=new Set(all.filter(s=>s.id!==selectedId).map(s=>s.id)),conflicts=all.filter(s=>s.id!==selectedId&&s.lock!==null&&s.lock!==selected.lock),merged={...selected,ids:[...new Set(all.flatMap(s=>s.ids))],autoKey:'manual',edited:true};if(removed.has(merged.follow))delete merged.follow;const result=stops.filter(s=>!all.some(q=>q.id===s.id)||s.id===selectedId).map(s=>s.id===selectedId?merged:s.follow&&removed.has(s.follow)?{...s,follow:selectedId}:s);return {stops:result,selected:merged,conflicts};}
function dates(a,b){if(!validDate(a)||!validDate(b)||a>b)throw Error('Invalid date range');let out=[],d=new Date(a+'T12:00:00Z');while(d.toISOString().slice(0,10)<=b){out.push(d.toISOString().slice(0,10));d.setUTCDate(d.getUTCDate()+1);}return out;}
function resetRange(state,dates,regenerate){const selected=new Set(dates),activities=state.activities,stops=state.stops,outside=stops.filter(s=>!selected.has(s.date));let generated;try{state.activities=activities.filter(a=>selected.has(a.date));state.stops=[];regenerate();generated=state.stops;}finally{state.activities=activities;state.stops=stops;}state.stops=outside.concat(generated);}
function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}
function date(s){if(/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(s)){const a=s.split(/[-/]/);s=a[2]+'-'+a[1]+'-'+a[0];}else if(/^\d+(\.\d+)?$/.test(s))s=new Date(Date.UTC(1899,11,30)+Math.floor(Number(s))*86400000).toISOString().slice(0,10);return validDate(s)?s:null;}
function parse(text,bases){const records=[],errors=[];for(const rawLine of text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').split('\n')){const line=rawLine.replace(/^[ \t]+/,'');if(/^(true|false)\t/i.test(line))records.push(line);else if(records.length)records[records.length-1]+='\n'+line;else if(line.trim()&&!/reference|description|status|date/i.test(line))errors.push('Unrecognised leading line');}const map=new Map(),blank=new Map();records.forEach((line,i)=>{const c=line.split('\t');if(c.length<17||!date(c[9])){errors.push('Malformed record '+(i+1));return;}const kind=c[6].trim(),site=c[11].trim(),managed=c[15].trim(),job=c[5].trim()!=='Transfer';if(c[16].trim().toUpperCase()==='CLOSED'||/EA Online Webinars/i.test(c[8])||!['Ship','Receive'].includes(kind)||job&&!bases.includes(site))return;let localBase=!job&&bases.includes(site);const signature=JSON.stringify([c[7].trim(),date(c[9]),kind,job]),raw=c[7].trim(),seed=JSON.stringify([c[5],kind,c[8],date(c[9]),site,managed]),count=blank.get(seed)||0;blank.set(seed,count+1);const id=raw?signature:seed+':'+count,tm=/^(\d\d):(\d\d)$/.exec(c[4]),time=tm?Number(tm[1])*60+Number(tm[2]):null;if(time===null||time>=1440||Number(tm[2])>=60){errors.push('Invalid time in record '+(i+1));return;}const a={id,ref:raw,date:date(c[9]),kind,site,managed,time,job,localBase,description:c[8],sources:[]};if(!map.has(id))map.set(id,a);const target=map.get(id);target.sources.push(c);if(time<target.time){target.time=time;target.site=site;}});return {items:[...map.values()],errors};}
function csvRecords(text){let records=[],row=[],value='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){value+='"';i++;}else if(c==='"')quoted=false;else value+=c;}else if(c==='"'){if(value)throw Error('Malformed CSV quoting');quoted=true;}else if(c===','){row.push(value);value='';}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);if(row.some(x=>x.trim()))records.push(row);row=[];value='';}else value+=c;}if(quoted)throw Error('Unclosed quote in CSV');row.push(value);if(row.some(x=>x.trim()))records.push(row);return records;}
function parseTransferReport(rows,bases){
 // PowerBI transfer report: one row per item, grouped by transfer order id
 // and dispatch date. Each transfer becomes a Ship at its From site and a
 // Receive at its To site; a base end is warehouse activity, as in parse().
 // Dispatch times are ignored: the app calculates run order, so activities
 // use midday as a neutral time (time only anchors base jobs). Returns are
 // explicit rows in this report, so returnDate stays blank and no return
 // is derived from them.
 if(!Array.isArray(rows)||!rows.length)throw Error('Transfer report is empty');
 const header=rows[0].map(x=>String(x??'').trim().toUpperCase()),columns=['DISPATCHDATE','TRANSFERORDERID','TRANSFER DESCRIPTION','SKU','EQUIPMENT DESCRIPTION','FROM SITENAME','TO SITENAME','MANAGED BY','ORDEREDQTY'],indexes=Object.fromEntries(columns.map(name=>[name,header.indexOf(name)]));
 for(const name of columns)if(indexes[name]<0)throw Error('Transfer report is missing the '+name+' column');
 const groups=new Map(),transferRows=[];
 rows.slice(1).forEach((cells,i)=>{
  if(!cells||cells.every(x=>x===null||x===undefined||String(x).trim()===''))return;
  const value=name=>{const cell=cells[indexes[name]];return cell===null||cell===undefined?'':String(cell).trim();};
  if(!value('TRANSFERORDERID'))return; // footer rows, e.g. the PowerBI "Applied filters" line
  const quantity=Number(cells[indexes['ORDEREDQTY']]);
  if(!Number.isFinite(quantity)||quantity===0)return; // qty-0 lines move nothing
  const itemDate=date(value('DISPATCHDATE')),orderId=value('TRANSFERORDERID'),fromSite=value('FROM SITENAME'),toSite=value('TO SITENAME'),description=value('TRANSFER DESCRIPTION');
  if(!itemDate||!orderId||!fromSite||!toSite||!value('EQUIPMENT DESCRIPTION'))throw Error('Invalid transfer report row '+(i+2));
  const key=JSON.stringify([orderId,itemDate]),group=groups.get(key);
  if(group&&(group.fromSite!==fromSite||group.toSite!==toSite||group.description!==description))throw Error('Transfer '+orderId+' has inconsistent route details');
  if(!group)groups.set(key,{orderId,date:itemDate,fromSite,toSite,description,managed:value('MANAGED BY')});
  transferRows.push({orderId,orderDescription:description,status:/^returnorder\b/i.test(description)?'ReturnOrder':'',fromSite,toSite,productId:value('SKU'),itemDescription:value('EQUIPMENT DESCRIPTION'),quantity:String(quantity),date:itemDate,returnDate:''});
 });
 const activities=[];
 for(const group of groups.values())for(const kind of ['Ship','Receive']){
  const site=kind==='Ship'?group.fromSite:group.toSite;
  activities.push({id:JSON.stringify([group.orderId,group.date,kind,false]),ref:group.orderId,date:group.date,kind,site,managed:group.managed,time:720,job:false,localBase:(bases||[]).includes(site),description:group.description,sources:[]});
 }
 return {activities,transferRows,transfers:groups.size};
}
function parseTransferCsv(text){const records=csvRecords(text.replace(/^\uFEFF/,''));if(!records.length)throw Error('Transfer CSV is empty');const header=records[0].map(x=>x.trim().toUpperCase()),columns=['TRANSFERORDERID','TRANSFERORDERDESCRIPTION','STATUS','FROMSITENAME','TOSITENAME','PRODUCT ID','ITEM DESCRIPTION','QUANTITY','PREP DATE','RETURNDATE'],indexes=Object.fromEntries(columns.map(name=>[name,header.indexOf(name)]));for(const name of columns)if(indexes[name]<0)throw Error('Transfer CSV is missing the '+name+' column');return records.slice(1).map((cells,i)=>{const value=name=>(cells[indexes[name]]||'').trim(),returnDate=value('RETURNDATE'),item={orderId:value('TRANSFERORDERID'),orderDescription:value('TRANSFERORDERDESCRIPTION'),status:value('STATUS'),fromSite:value('FROMSITENAME'),toSite:value('TOSITENAME'),productId:value('PRODUCT ID'),itemDescription:value('ITEM DESCRIPTION'),quantity:value('QUANTITY'),date:date(value('PREP DATE')),returnDate:returnDate?date(returnDate):''};if(!item.orderId||!item.fromSite||!item.toSite||!item.itemDescription||!item.quantity||!item.date||returnDate&&!item.returnDate)throw Error('Invalid transfer CSV row '+(i+2));return item;});}
function transferKey(value){const id=String(value||'').trim(),match=/^(.*?)(\d+)$/.exec(id);return match?match[1]+match[2].replace(/^0+(?=\d)/,''):id;}
function transfersWithReturns(rows){const all=rows.slice(),explicit=new Set(rows.map(r=>JSON.stringify([transferKey(r.orderId),r.date])));for(const row of rows){if(!row.returnDate)continue;const match=/^(.*?)(\d+)$/.exec(row.orderId);if(!match)throw Error('Cannot derive return transfer ID from '+row.orderId);const number=Number(match[2]);if(!Number.isSafeInteger(number))throw Error('Cannot derive return transfer ID from '+row.orderId);const orderId=match[1]+String(number+1).padStart(match[2].length,'0');if(explicit.has(JSON.stringify([transferKey(orderId),row.returnDate])))continue;all.push({...row,orderId,orderDescription:'Return: '+row.orderDescription,status:'Return (derived)',fromSite:row.toSite,toSite:row.fromSite,date:row.returnDate,returnDate:''});}return all;}
function consolidateTransferItems(items){const merged=[],indexes=new Map();for(const item of items){const quantity=Number(item.quantity);if(!Number.isSafeInteger(quantity)){merged.push(item);continue;}const key=JSON.stringify([item.productId,item.itemDescription,item.date,item.returnDate]),index=indexes.get(key);if(index===undefined){indexes.set(key,merged.length);merged.push({...item,quantity:String(quantity)});continue;}const total=Number(merged[index].quantity)+quantity;if(Number.isSafeInteger(total))merged[index].quantity=String(total);else merged.push(item);}return merged;}
function transferBooklet(stops,activities,transferRows,date,vehicleId,timeForStop,colorForStop,ignoreTransferDate=false){
 const availableRows=transfersWithReturns(transferRows),pages=[];
 const addPage=(stop)=>{let page=pages[pages.length-1];if(!page||page.venue!==stop.site){page={venue:stop.site,color:colorForStop?.(stop),direction:'',time:null,stops:[],orders:[],warnings:[],seen:new Set()};pages.push(page);}return page;};
 const scheduled=stops.filter(s=>s.date===date&&s.vehicle===vehicleId&&!s.job&&s.ids.length).sort((a,b)=>timeForStop(a)-timeForStop(b));
 for(const stop of scheduled){
  const page=addPage(stop),time=timeForStop(stop);
  const addStop=(direction)=>{if(!page.stops.some(s=>s.direction===direction&&s.time===time))page.stops.push({direction,time});};
  for(const id of stop.ids){
   const activity=activities.find(a=>a.id===id),directionHint=activity?.kind==='Receive'?'Drop-off':'Pickup';
   if(!activity||!activity.ref){addStop(directionHint);page.warnings.push({id:'Unknown transfer',text:'Transfer details are missing from the schedule. Please check R2 for details.'});continue;}
   const key=transferKey(activity.ref);
   let rows;
   if(ignoreTransferDate){rows=transferRows.filter(r=>transferKey(r.orderId)===key);if(!rows.length)rows=availableRows.filter(r=>transferKey(r.orderId)===key);}
   else rows=availableRows.filter(r=>transferKey(r.orderId)===key&&r.date===date);
   if(!rows.length){addStop(directionHint);page.warnings.push({id:activity.ref,text:`Transfer ${activity.ref} is missing. Please check R2 for details.`});continue;}
   const routes=new Set(rows.map(r=>JSON.stringify([r.fromSite,r.toSite])));
   if(routes.size!==1){addStop(directionHint);page.warnings.push({id:activity.ref,text:`Transfer ${activity.ref} has inconsistent route details. Please check R2 for details.`});continue;}
   const direction=rows[0].fromSite===stop.site?'Pickup':rows[0].toSite===stop.site?'Drop-off':'';
   if(!direction){addStop(directionHint);page.warnings.push({id:activity.ref,text:`Transfer ${activity.ref} does not match scheduled venue ${stop.site}. Please check R2 for details.`});continue;}
   addStop(direction);
   const seenKey=JSON.stringify([key,direction]);
   if(page.seen.has(seenKey))continue;
   page.seen.add(seenKey);
   page.orders.push({id:rows[0].orderId,direction,time,fromSite:rows[0].fromSite,toSite:rows[0].toSite,description:rows[0].orderDescription,status:rows[0].status,items:consolidateTransferItems(rows)});
  }
 }
 for(const page of pages){
  page.direction=[...new Set(page.stops.map(s=>s.direction))].join(' / ');
  page.time=page.stops[0]?.time??570;
  delete page.seen;
 }
 return pages.filter(page=>page.orders.length||page.warnings.length);
}
function courierSheetData(page){
 const routes=new Set(page.orders.map(order=>JSON.stringify([order.fromSite,order.toSite]))),route=routes.size===1?page.orders[0]:null,reliable=page.warnings.length===0&&page.orders.length>0&&routes.size===1;
 return {reliable,orderIds:[...new Set([...page.orders.map(order=>order.id),...page.warnings.map(warning=>warning.id).filter(id=>id&&id!=='Unknown transfer')])],fromSite:route?.fromSite||'',toSite:route?.toSite||'',items:reliable?page.orders.flatMap(order=>order.items):[]};
}
function available(v,d){const w=new Date(d+'T12:00:00Z').getUTCDay();if(v.builtin)return v.id==='uber'||w>0&&w<6;return v.days.includes(w)&&(!v.start||d>=v.start)&&(!v.end||d<=v.end)&&!(v.off||[]).some(p=>d>=p[0]&&p[1]>=d);}
function allocate(q,vs,d){if(!q)return '';const all=vs.filter(v=>['Truck','Van'].includes(v.type)&&available(v,d));return (all.find(v=>v.id===q.vehicle)||all.find(v=>v.rental&&v.type===q.type)||all.find(v=>!v.rental&&v.type===q.type)||all.find(v=>v.rental&&v.type!==q.type))?.id||'';}
const api={plan,place,moveStop,breakStop,unlinkStop,mergeStops,dates,resetRange,date,validDate,parse,parseTransferReport,parseTransferCsv,transferBooklet,courierSheetData,available,allocate};if(typeof module!=='undefined')module.exports=api;root.MilkRunCore=api;})(globalThis);