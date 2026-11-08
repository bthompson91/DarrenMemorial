"use strict";
window.renderRun = function (run, venues) {
  var container = document.createElement("div");
  container.innerHTML = '<div class="run-title">' + window.escapeAttr(run.title) + '</div>';
  var table = document.createElement("table");
  table.className = "schedule-table";
  table.innerHTML = '<thead><tr><th>Time</th><th>Site</th><th>Transfers</th><th>Onsite contact</th></tr></thead>';
  var body = document.createElement("tbody");
  run.rows.forEach(function (row) {
    var tr = document.createElement("tr");
    tr.className = row.css;
    tr.innerHTML = '<td class="time">' + window.escapeAttr(row.time) + '</td><td class="site">' + window.escapeAttr(row.site) + '</td><td>' + window.escapeAttr(row.transfers) + '</td><td>' + window.escapeAttr(venues.get(row.site) ? venues.get(row.site).contact : "") + '</td>';
    body.appendChild(tr);
  });
  table.appendChild(body);
  container.appendChild(table);
  (run.warnings || []).forEach(function (warning) {
    var warningDiv = document.createElement("div");
    warningDiv.className = "warning multi-van";
    warningDiv.textContent = warning;
    container.appendChild(warningDiv);
  });
  return container;
};
window.renderSchedule = function (schedule) {
  var output = window.$("scheduleOutput");
  output.innerHTML = "";
  if (!schedule.length) { output.innerHTML = '<p class="hint">No schedule generated yet.</p>'; return; }
  var venues = window.venueMap(window.loadConfig());
  schedule.forEach(function (day) {
    var section = document.createElement("article");
    section.className = "day";
    section.innerHTML = '<div class="day-header">' + day.date.toLocaleDateString("en-AU", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }) + '</div>';
    section.appendChild(window.renderRun(day.truck, venues));
    if (day.van) section.appendChild(window.renderRun(day.van, venues));
    day.baseJobs.forEach(function (job) {
      var warning = document.createElement("div");
      warning.className = "warning base";
      warning.textContent = "BASE JOB: " + job.info + " at " + job.time;
      section.appendChild(warning);
    });
    if (day.isWeekend) {
      var weekend = document.createElement("div");
      weekend.className = "warning weekend";
      weekend.textContent = "WEEKEND JOB: Transfers scheduled on " + day.date.toLocaleDateString("en-AU");
      section.appendChild(weekend);
    }
    output.appendChild(section);
  });
};
window.csvValue = function (value) {
  var text = String(value == null ? "" : value);
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
};
window.scheduleToCsv = function (schedule) {
  var venues = window.venueMap(window.loadConfig());
  var lines = ["Date,Run,Time,Site,Transfers,Onsite contact"];
  schedule.forEach(function (day) {
    var dateText = day.date.toLocaleDateString("en-AU");
    day.truck.rows.forEach(function (row) { lines.push([dateText, "TRUCK", row.time, row.site, row.transfers, venues.get(row.site) ? venues.get(row.site).contact : ""].map(window.csvValue).join(",")); });
    if (day.van) day.van.rows.forEach(function (row) { lines.push([dateText, "VAN", row.time, row.site, row.transfers, venues.get(row.site) ? venues.get(row.site).contact : ""].map(window.csvValue).join(",")); });
  });
  return lines.join("\n");
};
window.download = function (filename, content, type) {
  var blob = new Blob([content], { type: type });
  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
