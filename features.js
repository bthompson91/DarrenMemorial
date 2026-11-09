"use strict";
(function(){
function showPage(name){document.querySelectorAll('.page').forEach(page=>page.classList.toggle('active',page.id==='page-'+name));document.querySelectorAll('.main-nav a').forEach(link=>link.classList.toggle('active',link.dataset.page===name));if(name==='schedule'&&window._filterSchedule)window._filterSchedule();}
function initNavigation(){document.querySelectorAll('.main-nav a').forEach(link=>{link.addEventListener('click',event=>{event.preventDefault();showPage(link.dataset.page);});});showPage('schedule');}
function initDates(){const from=window.$('scheduleFrom'),to=window.$('scheduleTo');const today=new Date(),week=new Date();week.setDate(today.getDate()+7);const fmt=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');from.value=fmt(today);to.value=fmt(week);from.addEventListener('change',render);to.addEventListener('change',render);function render(){const start=from.value,end=to.value;document.querySelectorAll('#scheduleOutput .day').forEach((article,i)=>{const day=window.currentSchedule[i];if(!day)return;const key=window.Editor?window.Editor.dateKey(day):day.date.toISOString().slice(0,10);article.hidden=!!(start&&key<start)||!!(end&&key>end);});}
window._filterSchedule=render;}
const render=window.renderSchedule;window.renderSchedule=function(schedule){render(schedule);if(window._filterSchedule)window._filterSchedule();};
const oldCopy=window.copySchedule;window.copySchedule=function(){const text=window.scheduleToText?window.scheduleToText(window.currentSchedule):JSON.stringify(window.currentSchedule,null,2);return navigator.clipboard.writeText(text);};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{initNavigation();initDates();});else{initNavigation();initDates();}
})();
