"use strict";
(function(){
function moveButtons(){document.querySelectorAll('#scheduleOutput .schedule-table').forEach(table=>{if(table.tHead?.rows[0]?.cells[0]?.textContent.trim()!=='Time')return;Array.from(table.tBodies[0]?.rows||[]).forEach(row=>{const cell=row.cells[0];if(!cell)return;const arrows=Array.from(row.querySelectorAll('.run-actions button')).filter(button=>button.textContent.trim()==='🔼'||button.textContent.trim()==='🔽');if(!arrows.length)return;let group=cell.querySelector('.time-order-controls');if(!group){group=document.createElement('div');group.className='time-order-controls';group.setAttribute('role','group');group.setAttribute('aria-label','Stop order');cell.append(group);}arrows.forEach(button=>group.append(button));});});}
setTimeout(function(){const render=window.renderSchedule;window.renderSchedule=function(schedule){const result=render(schedule);moveButtons();return result;};moveButtons();},0);
const style=document.createElement('style');style.textContent='.time-order-controls{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px}@media print{.time-order-controls{display:none!important}}';document.head.append(style);
})();
