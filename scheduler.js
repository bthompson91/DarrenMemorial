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
// Picklist (.rtf) for base jobs: one order becomes a Delivery (Ship) job and
// a Pick up (Receive) job at the customer base, ref = order number.
// EA Online Webinars orders are excluded entirely, as in parse(). S-Assign
// (subrental) items ride on both jobs for the runsheet; the full item list
// rides on both jobs too, so the booklet can give the job its own page.
// Transfer items are also returned as a lookup keyed by transfer order +
// product, so the booklet can highlight them under their kit with the order
// they serve. Kit headers group the rows under them; kit headers with no
// rows contribute nothing.
const cp1252Decoder=new TextDecoder('windows-1252');
function rtfCellText(raw){
 let s=String(raw).replace(/\\'([0-9a-fA-F]{2})/g,(m,hex)=>cp1252Decoder.decode(new Uint8Array([parseInt(hex,16)])));
 s=s.replace(/\\u(-?\d+)\?/g,(m,n)=>{const code=Number(n);return String.fromCharCode(code<0?code+65536:code);});
 s=s.replace(/\\par\b/g,' ').replace(/\\[a-zA-Z]+-?\d* ?/g,'').replace(/[{}]/g,'');
 return s.replace(/\s+/g,' ').trim();
}
function parsePicklist(text){
 if(typeof text!=='string'||!text.includes('PICKLIST'))throw Error('No picklist orders found in this file');
 const rows=[];
 for(const chunk of text.split(/\\row\b/)){
  if(!chunk.includes('\\cell'))continue;
  // the first piece holds the row definition plus the first cell's text;
  // cleaning strips the definition and leaves that text, as for other cells
  const cells=chunk.split(/\\cell\b/).map(rtfCellText);
  while(cells.length&&cells[cells.length-1]==='')cells.pop();
  if(cells.length)rows.push(cells);
 }
 const starts=[];rows.forEach((r,i)=>{if(r.length===1&&r[0]==='PICKLIST')starts.push(i);});
 if(!starts.length)throw Error('No picklist orders found in this file');
 const field=(sec,label)=>{for(const r of sec)for(let j=0;j<r.length;j++)if(r[j].replace(/:\s*$/,'').trim()===label)for(let k=j+1;k<r.length;k++)if(r[k])return r[k];return '';};
 const parseWhen=value=>{const m=/^(\d{2})-(\d{2})-(\d{4})(\d{2}):(\d{2})$/.exec(String(value||'').replace(/\s+/g,''));if(!m)return null;const date=m[3]+'-'+m[2]+'-'+m[1],time=Number(m[4])*60+Number(m[5]);return validDate(date)&&Number(m[4])<24&&Number(m[5])<60?{date,time}:null;};
 const orders=new Map(),errors=[],statuses=['Reserved','S-Assign','S-Rent','Transfer'];
 starts.forEach((s,idx)=>{
  const sec=rows.slice(s,starts[idx+1]??rows.length);
  const orderNo=field(sec,'ORDER NO.'),desc=field(sec,'Order Desc'),cust=field(sec,'Cust Name'),delivery=field(sec,'Delivery'),pickup=field(sec,'Pick up');
  if(!orderNo){errors.push('Picklist section '+(idx+1)+' has no order number');return;}
  if(/EA Online Webinars/i.test(desc))return;
  let order=orders.get(orderNo);
  if(!order){order={orderNo,desc,cust,delivery,pickup,items:new Map(),notes:[]};orders.set(orderNo,order);}
  else if(JSON.stringify(parseWhen(order.delivery))!==JSON.stringify(parseWhen(delivery))||JSON.stringify(parseWhen(order.pickup))!==JSON.stringify(parseWhen(pickup))){errors.push('Order '+orderNo+' has inconsistent Delivery / Pick up times; later sections ignored');return;}
  let kit=null;
  for(const r of sec){
   const note=/Item\s+(\d+)\s+added to Transfer Order\s+#(T\d+)/i.exec(r.join(' '));
   if(note){order.notes.push({productId:note[1],transferId:note[2]});continue;}
   if(r[0]===''&&r[1]&&/^\d+$/.test(r[1])&&!r[2]&&r[5]){kit={id:r[1],name:r[5]};continue;}
   if(!statuses.includes(r[0])||!r[1]||!/^\d+$/.test(r[1]))continue;
   const item={status:r[0],productId:r[1],qty:r[2]||'',description:r[5]||'',transferPo:r[11]||'',kit};
   order.items.set(JSON.stringify([item.status,item.productId,item.description,item.qty,item.transferPo]),item);
  }
 });
 const jobs=[],lookup={};
 for(const order of orders.values()){
  if(!order.cust){errors.push('Order '+order.orderNo+' has no customer name');continue;}
  const whenD=parseWhen(order.delivery),whenP=parseWhen(order.pickup);
  const sAssign=[...order.items.values()].filter(i=>i.status==='S-Assign').map(i=>({qty:i.qty,description:i.description,transferPo:i.transferPo}));
  const items=[...order.items.values()].map(i=>({status:i.status,productId:i.productId,qty:i.qty,description:i.description,transferPo:i.transferPo,kit:i.kit?i.kit.name:''}));
  for(const [kind,when] of [['Ship',whenD],['Receive',whenP]]){
   if(!when){errors.push('Order '+order.orderNo+' is missing a '+(kind==='Ship'?'Delivery':'Pick up')+' time');continue;}
   jobs.push({id:JSON.stringify([order.orderNo,when.date,kind,true]),ref:order.orderNo,date:when.date,kind,site:order.cust,managed:'',time:when.time,job:true,localBase:false,description:order.desc,sources:[],sAssign,items});
  }
  for(const item of order.items.values()){
   if(item.status!=='Transfer')continue;
   const m=/T\d+/.exec(item.transferPo||'');
   if(!m)continue;
   lookup[JSON.stringify([transferKey(m[0]),item.productId])]={transferId:m[0],productId:item.productId,kit:item.kit?item.kit.name:'',orderNo:order.orderNo,orderDesc:order.desc};
  }
  for(const n of order.notes){
   const k=JSON.stringify([transferKey(n.transferId),n.productId]);
   if(!lookup[k])lookup[k]={transferId:n.transferId,productId:n.productId,kit:'',orderNo:order.orderNo,orderDesc:order.desc};
  }
 }
 return {jobs,lookup,orders:orders.size,errors};
}
function parseTransferCsv(text){const records=csvRecords(text.replace(/^\uFEFF/,''));if(!records.length)throw Error('Transfer CSV is empty');const header=records[0].map(x=>x.trim().toUpperCase()),columns=['TRANSFERORDERID','TRANSFERORDERDESCRIPTION','STATUS','FROMSITENAME','TOSITENAME','PRODUCT ID','ITEM DESCRIPTION','QUANTITY','PREP DATE','RETURNDATE'],indexes=Object.fromEntries(columns.map(name=>[name,header.indexOf(name)]));for(const name of columns)if(indexes[name]<0)throw Error('Transfer CSV is missing the '+name+' column');return records.slice(1).map((cells,i)=>{const value=name=>(cells[indexes[name]]||'').trim(),returnDate=value('RETURNDATE'),item={orderId:value('TRANSFERORDERID'),orderDescription:value('TRANSFERORDERDESCRIPTION'),status:value('STATUS'),fromSite:value('FROMSITENAME'),toSite:value('TOSITENAME'),productId:value('PRODUCT ID'),itemDescription:value('ITEM DESCRIPTION'),quantity:value('QUANTITY'),date:date(value('PREP DATE')),returnDate:returnDate?date(returnDate):''};if(!item.orderId||!item.fromSite||!item.toSite||!item.itemDescription||!item.quantity||!item.date||returnDate&&!item.returnDate)throw Error('Invalid transfer CSV row '+(i+2));return item;});}
function transferKey(value){const id=String(value||'').trim(),match=/^(.*?)(\d+)$/.exec(id);return match?match[1]+match[2].replace(/^0+(?=\d)/,''):id;}
function transfersWithReturns(rows){const all=rows.slice(),explicit=new Set(rows.map(r=>JSON.stringify([transferKey(r.orderId),r.date])));for(const row of rows){if(!row.returnDate)continue;const match=/^(.*?)(\d+)$/.exec(row.orderId);if(!match)throw Error('Cannot derive return transfer ID from '+row.orderId);const number=Number(match[2]);if(!Number.isSafeInteger(number))throw Error('Cannot derive return transfer ID from '+row.orderId);const orderId=match[1]+String(number+1).padStart(match[2].length,'0');if(explicit.has(JSON.stringify([transferKey(orderId),row.returnDate])))continue;all.push({...row,orderId,orderDescription:'Return: '+row.orderDescription,status:'Return (derived)',fromSite:row.toSite,toSite:row.fromSite,date:row.returnDate,returnDate:''});}return all;}
function consolidateTransferItems(items){const merged=[],indexes=new Map();for(const item of items){const quantity=Number(item.quantity);if(!Number.isSafeInteger(quantity)){merged.push(item);continue;}const key=JSON.stringify([item.productId,item.itemDescription,item.date,item.returnDate]),index=indexes.get(key);if(index===undefined){indexes.set(key,merged.length);merged.push({...item,quantity:String(quantity)});continue;}const total=Number(merged[index].quantity)+quantity;if(Number.isSafeInteger(total))merged[index].quantity=String(total);else merged.push(item);}return merged;}
function transferBooklet(stops,activities,transferRows,date,vehicleId,timeForStop,colorForStop,ignoreTransferDate=false,picklist,onlyStopIds=null){
 const availableRows=transfersWithReturns(transferRows),pages=[];
 const addPage=(stop)=>{let page=pages[pages.length-1];if(!page||page.venue!==stop.site){page={venue:stop.site,color:colorForStop?.(stop),direction:'',time:null,stops:[],orders:[],warnings:[],seen:new Set()};pages.push(page);}return page;};
 const scheduled=stops.filter(s=>s.date===date&&s.vehicle===vehicleId&&!s.job&&s.ids.length&&(!onlyStopIds||onlyStopIds.includes(s.id))).sort((a,b)=>timeForStop(a)-timeForStop(b));
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
   const items=consolidateTransferItems(rows).map(item=>{const hit=picklist?.[JSON.stringify([key,item.productId])];return hit?{...item,kit:hit.kit,picklistOrder:hit.orderNo,picklistDesc:hit.orderDesc}:item;});
   const picklistOrders=[...new Map(items.filter(i=>i.picklistOrder).map(i=>[i.picklistOrder,i.picklistDesc])).entries()].map(([orderNo,orderDesc])=>({orderNo,orderDesc}));
   page.orders.push({id:rows[0].orderId,direction,time,fromSite:rows[0].fromSite,toSite:rows[0].toSite,description:rows[0].orderDescription,status:rows[0].status,items,picklistOrders});
  }
 }
 // Base jobs with picklist items get their own page, like a transfer page,
 // but only in the vehicle booklet (never the Uber courier form, which uses
 // ignoreTransferDate). Jobs with no items (e.g. Dump jobs) get no page.
 if(!ignoreTransferDate){
  const jobStops=stops.filter(s=>s.date===date&&s.vehicle===vehicleId&&s.job&&s.ids.length&&(!onlyStopIds||onlyStopIds.includes(s.id))).sort((a,b)=>timeForStop(a)-timeForStop(b));
  for(const stop of jobStops){
   const jobActs=stop.ids.map(id=>activities.find(a=>a.id===id)).filter(Boolean);
   const items=(jobActs.find(a=>a.items?.length)?.items||[]).map(i=>({productId:i.productId,itemDescription:i.description,quantity:i.qty,status:i.status,transferPo:i.transferPo,kit:i.kit||''}));
   if(!items.length)continue;
   const time=timeForStop(stop);
   pages.push({venue:stop.site,color:colorForStop?.(stop),direction:'Job',time,stops:[{direction:'Job',time}],orders:[{id:jobActs[0]?.ref||'',description:jobActs[0]?.description||'',job:true,items}],warnings:[],seen:new Set()});
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
// Minimal .xlsx reader, no dependency: the PowerBI export is a zip of XML
// files, with inline strings and Excel serial dates. Only the first sheet
// is read. Stored and deflate entries are supported. Lives here, not in a
// separate file, because the Pages workflow only deploys listed files.
function fail(message){throw Error(message);}
function text(bytes){return new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/,'');}
function unescapeXml(s){return s.replace(/&(#\d+|#x[0-9a-fA-F]+|amp|lt|gt|quot|apos);/g,(m,body)=>{if(body==='amp')return '&';if(body==='lt')return '<';if(body==='gt')return '>';if(body==='quot')return '"';if(body==='apos')return "'";if(body[0]==='#'){const code=body[1]==='x'?parseInt(body.slice(2),16):parseInt(body.slice(1),10);return Number.isFinite(code)?String.fromCodePoint(code):m;}return m;});}
function attr(attrs,name){const match=new RegExp(name+'="([^"]*)"').exec(attrs||'');return match?match[1]:null;}
async function inflateRaw(bytes){if(!bytes.length)return new Uint8Array(0);return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());}
function zipEntries(buffer){
 const view=new DataView(buffer.buffer,buffer.byteOffset,buffer.byteLength);
 const findEocd=()=>{const start=Math.max(0,buffer.length-65557);for(let i=buffer.length-22;i>=start;i--)if(view.getUint32(i,true)===0x06054b50)return i;return -1;};
 const eocd=findEocd();if(eocd<0)fail('Not a valid .xlsx file (zip directory not found)');
 const total=view.getUint16(eocd+10,true),offset=view.getUint32(eocd+16,true),entries=new Map();
 let pos=offset;
 for(let n=0;n<total;n++){
  if(view.getUint32(pos,true)!==0x02014b50)fail('Not a valid .xlsx file (zip directory is corrupt)');
  const method=view.getUint16(pos+10,true),compressed=view.getUint32(pos+20,true),nameLen=view.getUint16(pos+28,true),extraLen=view.getUint16(pos+30,true),commentLen=view.getUint16(pos+32,true),localOffset=view.getUint32(pos+42,true),name=text(buffer.subarray(pos+46,pos+46+nameLen));
  entries.set(name,{method,compressed,localOffset});
  pos+=46+nameLen+extraLen+commentLen;
 }
 return entries;
}
async function entryBytes(buffer,entries,name){
 const entry=entries.get(name);if(!entry)fail('Missing '+name+' in .xlsx file');
 const view=new DataView(buffer.buffer,buffer.byteOffset,buffer.byteLength),local=entry.localOffset;
 if(view.getUint32(local,true)!==0x04034b50)fail('Not a valid .xlsx file (entry '+name+' is corrupt)');
 const nameLen=view.getUint16(local+26,true),extraLen=view.getUint16(local+28,true),start=local+30+nameLen+extraLen,data=buffer.subarray(start,start+entry.compressed);
 if(entry.method===0)return data;
 if(entry.method===8)return inflateRaw(data);
 fail('Unsupported .xlsx compression method '+entry.method+' for '+name);
}
function sharedStrings(xml){
 const out=[],pattern=/<(?:[\w.-]+:)?si\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?si>/g;let match;
 while((match=pattern.exec(xml))){let value='';const texts=/<(?:[\w.-]+:)?t\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?t>/g;let text;while((text=texts.exec(match[1])))value+=unescapeXml(text[1]);out.push(value);}
 return out;
}
function columnIndex(ref){const letters=/^[A-Z]+/.exec(ref||'');if(!letters)return null;let index=0;for(const ch of letters[0])index=index*26+(ch.charCodeAt(0)-64);return index-1;}
function sheetRows(xml,shared){
 const rows=[],rowPattern=/<(?:[\w.-]+:)?row\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?row>/g;let rowMatch;
 while((rowMatch=rowPattern.exec(xml))){
  const row=[],cellPattern=/<(?:[\w.-]+:)?c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:[\w.-]+:)?c>)/g;let cellMatch,position=0;
  while((cellMatch=cellPattern.exec(rowMatch[1]))){
   const attrs=cellMatch[1]||'',content=cellMatch[2]||'',type=attr(attrs,'t'),ref=attr(attrs,'r'),index=columnIndex(ref)??position++;
   let value=null;
   if(type==='inlineStr'){let joined='';const texts=/<(?:[\w.-]+:)?t\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?t>/g;let text;while((text=texts.exec(content)))joined+=unescapeXml(text[1]);value=joined;}
   else{const raw=/<(?:[\w.-]+:)?v\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?v>/.exec(content);if(raw){const text=unescapeXml(raw[1]);value=type==='s'?shared[Number(text)]??'':/^-?\d+(\.\d+)?$/.test(text)?Number(text):text;}}
   while(row.length<=index)row.push(null);
   row[index]=value;
  }
  rows.push(row);
 }
 return rows;
}
function sheetPath(workbookXml,relsXml){
 const sheets=[...workbookXml.matchAll(/<(?:[\w.-]+:)?sheet\b([^>]*?)\/?>/g)].map(m=>({id:attr(m[1],'r:id')||attr(m[1],'id'),name:attr(m[1],'name')}));
 const rels=new Map([...relsXml.matchAll(/<(?:[\w.-]+:)?Relationship\b([^>]*?)\/?>/g)].map(m=>[attr(m[1],'Id'),attr(m[1],'Target')]));
 for(const sheet of sheets){const target=rels.get(sheet.id);if(!target)continue;const path=target.replace(/^\//,'');return path.startsWith('xl/')?path:'xl/'+path;}
 return 'xl/worksheets/sheet1.xml';
}
async function parseXlsx(arrayBuffer){
 const buffer=arrayBuffer instanceof Uint8Array?arrayBuffer:new Uint8Array(arrayBuffer),entries=zipEntries(buffer);
 let path='xl/worksheets/sheet1.xml';
 if(entries.has('xl/workbook.xml')){const workbook=text(await entryBytes(buffer,entries,'xl/workbook.xml'));let rels='';if(entries.has('xl/_rels/workbook.xml.rels'))rels=text(await entryBytes(buffer,entries,'xl/_rels/workbook.xml.rels'));path=sheetPath(workbook,rels);}
 const shared=entries.has('xl/sharedStrings.xml')?sharedStrings(text(await entryBytes(buffer,entries,'xl/sharedStrings.xml'))):[];
 return sheetRows(text(await entryBytes(buffer,entries,path)),shared);
}
// Uber courier RTF form. Lives here, not in a separate file, for the same
// Pages reason as the .xlsx reader above: the workflow only deploys listed
// files, and a separate courier-rtf.js 404'd live.
function escapeRtfText(value){return String(value??'').replace(/\\/g,'\\\\').replace(/{/g,'\\{').replace(/}/g,'\\}').replace(/\r\n?|\n/g,'\\line ').replace(/[^\x20-\x7e]/g,c=>{const code=c.charCodeAt(0);return `\\u${code>32767?code-65536:code}?`;});}
function courierRow(cells,widths,height,header){
 let position=0;
 const borders='\\clbrdrt\\brdrs\\brdrw10\\clbrdrl\\brdrs\\brdrw10\\clbrdrb\\brdrs\\brdrw10\\clbrdrr\\brdrs\\brdrw10';
 const definitions=widths.map(width=>{position+=width;return borders+'\\clvertalt\\cellx'+position;}).join('');
 const content=cells.map(cell=>`\\pard\\intbl\\f0\\fs20 ${cell.bold?'\\b ':''}${escapeRtfText(cell.text)}${cell.bold?'\\b0':''}\\cell`).join('');
 return `\\trowd\\trgaph100${height?'\\trrh-'+height:''}${header?'\\trhdr':''}${definitions}${content}\\row\n`;
}
function createCourierRtf(data){
 const infoWidths=[2600,2633,2600,2633],itemWidths=[1300,4550,700,1958,1958];
 const cell=(text,bold=false)=>({text,bold}),info=[
  [cell('From Site',true),cell(data.fromSite),cell('To Site',true),cell(data.toSite)],
  [cell('From Site Address',true),cell(''),cell('To Site Address',true),cell('')],
  [cell('From Site Contact',true),cell(data.fromSiteContact),cell('To Site Contact',true),cell(data.toSiteContact)],
  [cell('Transfer Order Number',true),cell(data.orderNumber),cell(''),cell('')]
 ];
 const items=data.reliable?(data.items||[]).map(item=>[item.productId,item.itemDescription,item.quantity,item.date?`${item.date.slice(8,10)}-${item.date.slice(5,7)}-${item.date.slice(0,4)}`:'',item.returnDate?`${item.returnDate.slice(8,10)}-${item.returnDate.slice(5,7)}-${item.returnDate.slice(0,4)}`:'']):[];
 while(items.length<10)items.push(['','','','','']);
 return `{\\rtf1\\ansi\\deff0\\uc1
{\\fonttbl{\\f0 Arial;}}
\\viewkind4\\widowctrl\\paperw11906\\paperh16838\\margl720\\margr720\\margt720\\margb720
\\pard\\qc\\f0\\fs28\\b ENCORE UBER COURIER\\b0\\sa180\\par
${info.map(cells=>courierRow(cells,infoWidths)).join('')}
\\pard\\sb180\\sa80\\f0\\fs22\\b Items\\b0\\par
${courierRow(['Product ID','Item Description','Qty','Prep Date','Return Date'].map(text=>cell(text,true)),itemWidths,0,true)}
${items.map(values=>courierRow(values.map(value=>cell(value)),itemWidths,600)).join('')}}`;
}
const api={plan,place,moveStop,breakStop,unlinkStop,mergeStops,dates,resetRange,date,validDate,parse,parseTransferReport,parseTransferCsv,parseXlsx,xlsxSheetRows:sheetRows,xlsxSharedStrings:sharedStrings,xlsxSheetPath:sheetPath,transferBooklet,courierSheetData,courierRtf:{create:createCourierRtf},available,allocate,parsePicklist};if(typeof module!=='undefined')module.exports=api;root.MilkRunCore=api;root.MilkRunXlsx={parse:parseXlsx,sheetRows,sharedStrings,sheetPath};root.MilkRunCourierRtf={create:createCourierRtf};})(globalThis);