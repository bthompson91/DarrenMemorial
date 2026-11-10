"use strict";
(function(root){
function minutes(s){const m=String(s).match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);if(!m)return NaN;let h=+m[1],n=+m[2];if(n>59||h>23||m[3]&&(h<1||h>12))return NaN;if(m[3])h=h%12+(/PM/i.test(m[3])?12:0);return h*60+n;}
function clock(n){const day=Math.floor(n/1440),v=(n%1440+1440)%1440;return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')+(day?' ('+(day>0?'+':'')+day+'d)':'');}
function plan(items,jobs){
 const rows=[],errors=[],blocks=jobs.map(j=>({...j,center:minutes(j.time)})).sort((a,b)=>a.center-b.center);
 blocks.forEach(j=>{if(!Number.isFinite(j.center))throw Error('Invalid base-job time: '+j.time);j.start=j.center-60;j.end=j.center+60;});
 const start=Math.min(540,...blocks.map(j=>j.start));let t=start,work=0,rest=0,k=0,last='Melbourne Base';
 function pause(){rows.push({time:clock(t),site:last,transfers:'Rest break — 30 minutes (no work) | '+clock(t)+'–'+clock(t+30),css:'lunch',duration:30});t+=30;rest+=30;work=0;}
 function activity(duration){if(duration>240)errors.push('Work block exceeds four hours.');if(work+duration>240)pause();t+=duration;work+=duration;}
 function emit(j){
  if(last!=='Melbourne Base'){activity(30);last='Melbourne Base';rows.push({time:clock(t),site:last,transfers:'Return for base job',css:'base'});}
  if(t<j.start){const gap=j.start-t;while(t<j.start){if(work===240&&t+30<=j.start){pause();continue;}const n=Math.min(j.start-t,240-work);if(n<=0)break;activity(n);}if(t<j.start){errors.push('Break cannot fit before base job: '+j.info);work+=j.start-t;t=j.start;} }
  const duration=j.end-j.start;
  if(work+duration>240)pause();
  if(t>j.start)errors.push('Required travel / break / earlier work conflicts with fixed base job '+j.info+' at '+clock(j.start));
  rows.push({time:clock(j.start),site:'Melbourne Base',transfers:'BASE JOB '+j.info+' | '+clock(j.start)+'–'+clock(j.end)+' | Dump '+j.time,css:'base-job',editorJob:j.key});
  if(t<j.end){work+=j.end-t;t=j.end;}last='Melbourne Base';
  if(work>240)errors.push('More than four hours of work without a 30-minute break: '+j.info);
 }
 rows.push({time:clock(t),site:last,transfers:'Start of Run',css:'base'});
 const stops=items.filter(r=>r.css!=='lunch');
 function direction(row){const text=String(row.transfers||'').toUpperCase();const out=(text.match(/T-OUT|SHIP|PICKUP/g)||[]).length;const inn=(text.match(/T-IN|RECEIVE|DROPOFF/g)||[]).length;return out>inn?'out':inn>out?'in':'equal';}
 function isCombined(row){const text=String(row.transfers||'').toUpperCase();return /T-OUT|SHIP|PICKUP/.test(text)&&/T-IN|RECEIVE|DROPOFF/.test(text);}
 const morning=[],afternoon=[];
 stops.forEach(row=>{
  if(isCombined(row)){const d=direction(row);(d==='in'?afternoon:morning).push(row);return;}
  const d=direction(row);(d==='in'?afternoon:morning).push(row);
 });
 const ordered=morning.concat(afternoon);
 let lunchInserted=false;
 ordered.forEach(row=>{
  if(!lunchInserted&&row===afternoon[0]){while(rest<60)pause();lunchInserted=true;}
  while(k<blocks.length&&blocks[k].start<t+30+(work+30>240?30:0)+30)emit(blocks[k++]);
  activity(30);last=row.site;rows.push({...row,time:clock(t)});
 });
 while(k<blocks.length)emit(blocks[k++]);
 if(last!=='Melbourne Base'){activity(30);last='Melbourne Base';rows.push({time:clock(t),site:last,transfers:'Return to base',css:'base'});}
 while(rest<60)pause();
 rows.push({time:clock(t),site:last,transfers:'End of Run',css:'base'});
 if(t-start>660)errors.push('RUN OVER LIMIT: '+Math.floor((t-start)/60)+'h '+((t-start)%60)+'m including breaks; maximum 11 hours. Reallocate work.');
 return {rows,errors:[...new Set(errors)]};
}
root.RunEngine={minutes,clock,plan};if(typeof module!=='undefined')module.exports=root.RunEngine;
if(typeof window==='undefined')return;
setTimeout(function(){
 const apply=Editor.apply;
 Editor.apply=function(day){apply(day);const fleet=[['truck',day.truck],['van',day.van],...(day.rentals||[]).map(r=>[r.id,r])];
 fleet.forEach(([id,run])=>{if(!run||!run.rows.length)return;const jobs=(day.editorJobs||[]).filter(j=>Editor.state().assignments[j.key]===id);const items=run.rows.filter(r=>r.editorStop||/^RETURNS\b/.test(r.transfers));if(!items.length&&!jobs.length)return;const result=plan(items,jobs);run.rows=result.rows;run.warnings=[...new Set([...(run.warnings||[]),...result.errors])];day.editorErrors=[...new Set([...(day.editorErrors||[]),...result.errors.map(e=>Editor.name(id)+': '+e)])];});return day;};
 window.addEventListener('click',async function(event){
 const button=event.target.closest&&event.target.closest('button');if(!button)return;
 const label=button.textContent.trim();if(button.id!=='copyAllBtn'&&!/^Copy (day|whole schedule|to clipboard)$/i.test(label))return;
 const output=document.getElementById('scheduleOutput');if(!output)return;
 const day=button.closest('.day'),source=day||output;if(!source.querySelector('table'))return;
 event.preventDefault();event.stopImmediatePropagation();
 const clone=source.cloneNode(true),original=[source,...source.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];
 original.forEach((node,i)=>{const style=getComputedStyle(node),dest=copies[i];['background-color','color','font-family','font-size','font-weight','text-align','vertical-align','border-top','border-right','border-bottom','border-left','padding','white-space'].forEach(p=>dest.style.setProperty(p,style.getPropertyValue(p)));if(node.matches('table')){dest.style.borderCollapse='collapse';dest.style.width='100%';}if(node.matches('.vehicle-pair')){dest.style.display='table';dest.style.width='100%';Array.from(dest.children).forEach(child=>{child.style.display='table-cell';child.style.width='50%';child.style.verticalAlign='top';});}});
 clone.querySelectorAll('button,input,select,textarea,.run-actions,.day-actions').forEach(n=>n.remove());
 const html='<html><head><meta charset="utf-8"></head><body>'+clone.outerHTML+'</body></html>';
 const text=Array.from(clone.querySelectorAll('.day-header,.run-title,tr,.editor-error,.warning')).map(n=>n.matches('tr')?Array.from(n.cells).map(c=>c.textContent.trim()).join('\t'):n.textContent.trim()).join('\n');
 function legacy(){let copied=false;function handler(e){if(e.clipboardData){e.preventDefault();e.clipboardData.setData('text/html',html);e.clipboardData.setData('text/plain',text);copied=true;}}document.addEventListener('copy',handler);try{return document.execCommand('copy')&&copied;}finally{document.removeEventListener('copy',handler);}}
 try{if(navigator.clipboard&&navigator.clipboard.write&&window.ClipboardItem&&window.isSecureContext){try{await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),type:'text/plain',text})]);}catch(e){if(!legacy())throw e;}}else if(!legacy())throw Error('Clipboard blocked');button.textContent='Copied with formatting';setTimeout(()=>button.textContent=label,1800);}
 catch(e){let preview=document.getElementById('formattedCopyPreview');if(!preview){preview=document.createElement('div');preview.id='formattedCopyPreview';output.after(preview);}preview.replaceChildren();const help=document.createElement('p');help.textContent='Automatic copy blocked. The formatted sheet below is selected: press Ctrl+C / Cmd+C, then paste with source formatting.';preview.append(help,clone);const range=document.createRange();range.selectNodeContents(clone);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);}
 },true);
 if(window.currentSchedule&&currentSchedule.length)window.renderSchedule(currentSchedule);
},0);
})(typeof window==='undefined'?globalThis:window);
