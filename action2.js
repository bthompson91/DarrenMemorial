(function(){
'use strict';
const keyFor=button=>{
 const text=(button.textContent||'').trim();
 const target=button.dataset.vehicleTarget;
 if(target) return 'vehicle:'+target;
 if(text==='Change run') return 'change-run';
 if(text==='❌'||/remove from uber/i.test(text)) return 'remove';
 if(text==='🔼') return 'order-up';
 if(text==='🔽') return 'order-down';
 if(text==='✏️') return 'edit';
 if(text==='🗑️') return 'delete';
 if(text==='↩️') return 'reset';
 if(text==='Copy day') return 'copy-day';
 return 'text:'+text;
};
function prune(container){
 if(!container) return;
 const seen=new Set();
 Array.from(container.querySelectorAll('button')).forEach(button=>{
  const key=keyFor(button);
  if(seen.has(key)){ button.remove(); return; }
  seen.add(key);
 });
}
function normalize(){
 document.querySelectorAll('#scheduleOutput .day').forEach(day=>{
  day.querySelectorAll('.run-actions').forEach(prune);
  const actions=day.querySelector('.day-actions');
  if(actions) prune(actions);
 });
}
const previous=window.renderSchedule;
window.renderSchedule=function(schedule){
 const result=previous(schedule);
 normalize();
 return result;
};
if(window.currentSchedule?.length) normalize();
})();