"use strict";
window.parseDumpText = function(text) {
  text = String(text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!text.trim()) throw new Error('No Dump data was pasted.');
  var delimiter = text.includes('\t') ? '\t' : (text.includes(',') ? ',' : null);
  if (!delimiter) throw new Error('Paste the original tab-separated Dump table, including empty columns; no tab or comma delimiter found.');
  var splitLine = function(line) {
    var cells = [], field = '', quoted = false;
    for (var p = 0; p < line.length; p++) {
      var ch = line[p];
      if (ch === '"' && field === '' && !quoted) { quoted = true; continue; }
      if (ch === '"' && quoted) { if (line[p + 1] === '"') { field += '"'; p++; } else { quoted = false; } continue; }
      if (ch === delimiter && !quoted) { cells.push(field); field = ''; } else { field += ch; }
    }
    cells.push(field);
    return cells;
  };
  var lines = text.split('\n');
  var starts = [];
  lines.forEach(function(line, index) {
    if (/^(?:true|false)\s*(?:\t|,)(?:true|false)\s*(?:\t|,)[^\t,\n]*(?:\t|,)(?:true|false)\s*(?:\t|,)/i.test(line)) starts.push(index);
  });
  if (!starts.length || starts[0] > 0) throw new Error('Expected Dump records beginning with TRUE/FALSE, TRUE/FALSE, status, TRUE/FALSE. Paste the complete table without a header.');
  return starts.map(function(start, i) {
    var end = i + 1 < starts.length ? starts[i + 1] : lines.length;
    var record = lines.slice(start, end).join('\n').replace(/\n+$/, '');
    var cells = splitLine(record);
    function get(n) { return String(cells[n] || '').trim(); }
    if (cells.length < 17) throw new Error('Record ' + (i + 1) + ': Expected at least 17 columns, found ' + cells.length + '.');
    return { recordNumber: i + 1, sourceLine: start + 1, validation: get(0), baseTime: get(4), transferType: get(5), direction: get(6), transfer: get(7).replace(/00000/g, ''), description: get(8), dateText: get(9), shipFrom: get(11), managedBy: get(15), closed: get(16) };
  });
};
window.parseDate = function(value) {
  var text = String(value || '').trim(), m = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (!m) throw new Error('Invalid or missing date ' + JSON.stringify(text) + '. Expected dd-mm-yyyy or dd/mm/yyyy.');
  var d = Number(m[1]), month = Number(m[2]), year = Number(m[3]), date = new Date(year, month - 1, d);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== d) throw new Error('Invalid calendar date: ' + text);
  return date;
};
window.isExcluded = function(row) {
  if (row.closed.toUpperCase() === 'CLOSED') return true;
  if (row.shipFrom === window.BASE && row.managedBy === window.BASE) return true;
  if (row.transferType !== 'Transfer' && row.shipFrom !== window.BASE) return true;
  return row.description.toUpperCase().includes('EA ONLINE WEBINARS');
};
window.addOrCreate = function(map, key, value) { map.set(key, map.has(key) ? map.get(key) + ', ' + value : value); };
window.groupByDate = function(rows) {
  var days = new Map();
  rows.forEach(function(row) {
    if (window.isExcluded(row)) return;
    var date;
    try { date = window.parseDate(row.dateText); } catch (error) { throw new Error('Record ' + row.recordNumber + ' (source line ' + row.sourceLine + ', job ' + (row.transfer || 'blank') + '): ' + error.message); }
    var key = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
    if (!days.has(key)) days.set(key, { date: date, transfers: [], baseJobs: [], returns: '' });
    var day = days.get(key);
    if (row.shipFrom === window.BASE && row.transferType !== 'Transfer') {
      var info = (row.transfer + ' ' + row.description).trim(), existing = day.baseJobs.find(function(job) { return job.time === row.baseTime; });
      if (existing) existing.info += ', ' + info; else day.baseJobs.push({ time: row.baseTime, info: info });
      return;
    }
    if (row.direction !== 'Ship' && row.direction !== 'Receive') return;
    if (row.direction === 'Receive' && row.shipFrom === window.BASE) {
      if (row.managedBy) day.returns = day.returns ? day.returns + ', ' + row.transfer : row.transfer;
      return;
    }
    day.transfers.push(row);
  });
  return Array.from(days.values()).sort(function(a, b) { return a.date - b.date; });
};
