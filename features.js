"use strict";
(function(){
function initDates(){const from=window.$('scheduleFrom'),to=window.$('scheduleTo');const today=new Date(),week=new Date();week.setDate(today.getDate()+7);const fmt=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');from.value=fmt(today);to.value=fmt(week);from.addEventListener('change',render);to.addEventListener('change',render);function render(){const start=from.value,end=to.value;document.querySelectorAll('#scheduleOutput .day').forEach((article,i)=>{const day=window.currentSchedule[i];if(!day)return;const key=window.Editor?window.Editor.dateKey(day):day.date.toISOString().slice(0,10);article.hidden=!!(start&&key<start)||!!(end&&key>end);});}
window._filterSchedule=render;}
const render=window.renderSchedule;window.renderSchedule=function(schedule){render(schedule);if(window._filterSchedule)window._filterSchedule();};
const oldCopy=window.copySchedule;window.copySchedule=function(){const text=window.scheduleToText?window.scheduleToText(window.currentSchedule):JSON.stringify(window.currentSchedule,null,2);return navigator.clipboard.writeText(text);};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initDates);else initDates();
})();
