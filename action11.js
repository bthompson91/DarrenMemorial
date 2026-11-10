(function(){
'use strict';
const originalPlan=window.RunEngine&&window.RunEngine.plan;
if(originalPlan){
 window.RunEngine.plan=function(items,jobs){
  const result=originalPlan(items,jobs);
  const rows=result.rows||[];
  let lastWork=-1;
  rows.forEach(function(row,index){
   if(row.editorStop||row.editorJob||/^RETURNS\b/.test(String(row.transfers||'')))lastWork=index;
  });
  if(lastWork>=0){
   const trimmed=[];
   rows.forEach(function(row,index){
    if(index<=lastWork){trimmed.push(row);return;}
    const text=String(row.transfers||'');
    if(text==='Return to base'||text==='End of Run')trimmed.push(row);
   });
   result.rows=trimmed;
  }
  return result;
 };
}
const originalBuildRun=window.buildRun;
if(originalBuildRun){
 window.buildRun=function(vehicle,day,assignment,returns,origin,destination){
  const hasAm=assignment.am.length>0,hasPm=assignment.pm.length>0;
  if(!hasAm&&!hasPm&&!returns)return null;
  const run=originalBuildRun(vehicle,day,assignment,returns,origin,destination);
  if(!hasPm){
   run.rows=run.rows.filter(function(row){
    return row.css!=='lunch'&&row.transfers!=='Start Afternoon Run';
   });
  }
  return run;
 };
}
const originalBuildSchedule=window.buildSchedule;
if(originalBuildSchedule){
 window.buildSchedule=function(config,days){
  return originalBuildSchedule(config,days).filter(function(day){
   return day.runs.length>0||((day.baseJobs||[]).length>0);
  });
 };
}
})();