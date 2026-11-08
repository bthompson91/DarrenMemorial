"use strict";
window.BASE = "Melbourne Base";
window.CONFIG_KEY = "darrenmemorial.milkrun.config.v1";
window.$ = function (id) { return document.getElementById(id); };
window.defaultConfig = function () { return { version: 1, vanDaysMode: 3, venues: [] }; };
window.loadConfig = function () {
  var config;
  try { config = JSON.parse(localStorage.getItem(window.CONFIG_KEY)); } catch (error) { config = null; }
  if (!config || !Array.isArray(config.venues)) config = window.defaultConfig();
  if (config.vanDaysMode !== 2 && config.vanDaysMode !== 3) config.vanDaysMode = 3;
  return config;
};
window.saveConfig = function (config) { localStorage.setItem(window.CONFIG_KEY, JSON.stringify(config)); };
window.venueMap = function (config) {
  var map = new Map();
  config.venues.forEach(function (venue) { if (venue.name) map.set(String(venue.name).trim(), venue); });
  return map;
};
window.escapeAttr = function (value) {
  return String(value == null ? "" : value).replace(/[&"<>]/g, function (character) {
    return { "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" }[character];
  });
};
window.renderConfig = function () {
  var config = window.loadConfig();
  window.$("vanDaysMode").value = String(config.vanDaysMode);
  var body = window.$("venueRows");
  body.innerHTML = "";
  config.venues.forEach(function (venue, index) {
    var row = document.createElement("tr");
    row.innerHTML = '<td><input data-field="name" data-index="' + index + '" value="' + window.escapeAttr(venue.name) + '"></td>' +
      '<td><input data-field="contact" data-index="' + index + '" value="' + window.escapeAttr(venue.contact) + '"></td>' +
      '<td><select data-field="type" data-index="' + index + '"><option value="TRUCK"' + (venue.type === "TRUCK" ? " selected" : "") + '>TRUCK</option><option value="VAN"' + (venue.type === "VAN" ? " selected" : "") + '>VAN</option></select></td>' +
      '<td><input data-field="stopsPerDay" data-index="' + index + '" type="number" min="0" value="' + window.escapeAttr(venue.stopsPerDay) + '"></td>' +
      '<td><input data-field="truckOrderAM" data-index="' + index + '" type="number" min="0" value="' + window.escapeAttr(venue.truckOrderAM) + '"></td>' +
      '<td><input data-field="truckOrderPM" data-index="' + index + '" type="number" min="0" value="' + window.escapeAttr(venue.truckOrderPM) + '"></td>' +
      '<td><input data-field="vanOrder" data-index="' + index + '" type="number" min="0" value="' + window.escapeAttr(venue.vanOrder) + '"></td>' +
      '<td><button class="danger" data-remove="' + index + '">Remove</button></td>';
    body.appendChild(row);
  });
};
window.collectConfigFromUi = function () {
  var config = window.loadConfig();
  config.vanDaysMode = Number(window.$("vanDaysMode").value) || 3;
  config.venues = Array.from(window.$("venueRows").querySelectorAll("tr")).map(function (row) {
    function get(field) { return row.querySelector('[data-field="' + field + '"]').value.trim(); }
    function number(field) { var value = get(field); return value === "" ? "" : Number(value); }
    return { name: get("name"), contact: get("contact"), type: get("type"), stopsPerDay: number("stopsPerDay"), truckOrderAM: number("truckOrderAM"), truckOrderPM: number("truckOrderPM"), vanOrder: number("vanOrder") };
  }).filter(function (venue) { return venue.name; });
  window.saveConfig(config);
  return config;
};
