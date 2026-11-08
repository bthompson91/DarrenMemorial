"use strict";
window.parseDumpText = function (text) {
  var lines = text.replace(/\r\n?/g, "\n").split("\n").filter(function (line) { return line.trim() !== ""; });
  if (!lines.length) throw new Error("No Dump data was pasted.");
  var rows = lines.map(function (line) { return line.indexOf("\t") !== -1 ? line.split("\t") : line.split(","); });
  var first = String(rows[0][0] || "").trim().toUpperCase();
  if (first !== "TRUE" && first !== "FALSE") throw new Error('The first cell must be TRUE or FALSE. Found: "' + (rows[0][0] || "(blank)") + '".');
  return rows.map(function (cells) {
    function get(index) { return String(cells[index] == null ? "" : cells[index]).trim(); }
    return { validation: get(0), baseTime: get(4), transferType: get(5), direction: get(6), transfer: get(7).replace(/00000/g, ""), description: get(8), dateText: get(9), shipFrom: get(11), managedBy: get(15), closed: get(16) };
  });
};
window.parseDate = function (value) {
  var text = String(value == null ? "" : value).trim();
  var match = text.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (match) {
    var date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
    if (!isNaN(date.getTime())) return date;
  }
  var fallback = new Date(text);
  if (!isNaN(fallback.getTime())) return fallback;
  throw new Error('Unable to parse date: "' + text + '". Expected dd-mm-yyyy or dd/mm/yyyy.');
};
window.isExcluded = function (row) {
  if (row.closed.toUpperCase() === "CLOSED") return true;
  if (row.shipFrom === window.BASE && row.managedBy === window.BASE) return true;
  if (row.transferType !== "Transfer" && row.shipFrom === window.BASE) return true;
  return row.description.toUpperCase().indexOf("EA ONLINE WEBINARS") !== -1;
};
window.addOrCreate = function (map, key, value) {
  map.set(key, map.has(key) ? map.get(key) + ", " + value : value);
};
window.groupByDate = function (rows) {
  var days = new Map();
  rows.slice(1).forEach(function (row) {
    if (window.isExcluded(row)) return;
    var date = window.parseDate(row.dateText);
    var key = date.toISOString().slice(0, 10);
    if (!days.has(key)) days.set(key, { date: date, transfers: [], baseJobs: [], returns: "" });
    var day = days.get(key);
    if (row.shipFrom === window.BASE && row.transferType !== "Transfer") {
      var info = (row.transfer + " " + row.description).trim();
      var existing = day.baseJobs.find(function (job) { return job.time === row.baseTime; });
      if (existing) existing.info += ", " + info; else day.baseJobs.push({ time: row.baseTime, info: info });
      return;
    }
    if (row.shipFrom === window.BASE && !row.managedBy) return;
    if (row.direction === "Receive" && row.shipFrom === window.BASE && row.managedBy) {
      day.returns = day.returns ? day.returns + ", " + row.transfer : row.transfer;
      return;
    }
    day.transfers.push(row);
  });
  return Array.from(days.values()).sort(function (a, b) { return a.date - b.date; });
};
