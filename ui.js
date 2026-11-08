"use strict";
window.currentSchedule = [];
window.setStatus = function (message, type) {
  var element = window.$("dumpStatus");
  element.textContent = message;
  element.className = "status " + (type || "");
};
window.generate = function () {
  try {
    var config = window.collectConfigFromUi();
    var days = window.groupByDate(window.parseDumpText(window.$("dumpInput").value));
    window.currentSchedule = window.buildSchedule(config, days);
    window.renderSchedule(window.currentSchedule);
    window.$("exportCsvBtn").disabled = !window.currentSchedule.length;
    window.setStatus("Generated schedule for " + window.currentSchedule.length + " date(s).", "ok");
  } catch (error) {
    window.currentSchedule = [];
    window.renderSchedule(window.currentSchedule);
    window.$("exportCsvBtn").disabled = true;
    window.setStatus(error.message, "error");
  }
};
window.bindEvents = function () {
  window.$("generateBtn").addEventListener("click", window.generate);
  window.$("clearDumpBtn").addEventListener("click", function () { window.$("dumpInput").value = ""; window.setStatus(""); });
  window.$("exportCsvBtn").addEventListener("click", function () {
    if (window.currentSchedule.length) window.download("milk-run.csv", window.scheduleToCsv(window.currentSchedule), "text/csv;charset=utf-8");
  });
  window.$("vanDaysMode").addEventListener("change", window.collectConfigFromUi);
  window.$("addVenueBtn").addEventListener("click", function () {
    var config = window.collectConfigFromUi();
    config.venues.push({ name: "", contact: "", type: "TRUCK", stopsPerDay: 2, truckOrderAM: "", truckOrderPM: "", vanOrder: "" });
    window.saveConfig(config);
    window.renderConfig();
  });
  window.$("venueRows").addEventListener("input", function (event) {
    if (event.target.matches("input, select")) window.collectConfigFromUi();
  });
  window.$("venueRows").addEventListener("click", function (event) {
    var index = event.target.getAttribute("data-remove");
    if (index === null) return;
    var config = window.collectConfigFromUi();
    config.venues.splice(Number(index), 1);
    window.saveConfig(config);
    window.renderConfig();
  });
  window.$("exportConfigBtn").addEventListener("click", function () {
    window.download("milkrun-config.json", JSON.stringify(window.collectConfigFromUi(), null, 2), "application/json");
  });
  window.$("importConfigInput").addEventListener("change", function (event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var imported = JSON.parse(reader.result);
        if (!Array.isArray(imported.venues)) throw new Error("Invalid config file: missing venues array.");
        var config = Object.assign(window.defaultConfig(), imported);
        if (config.vanDaysMode !== 2 && config.vanDaysMode !== 3) config.vanDaysMode = 3;
        window.saveConfig(config);
        window.renderConfig();
        window.setStatus("Configuration imported and saved locally.", "ok");
      } catch (error) {
        window.setStatus(error.message, "error");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  });
  window.$("resetConfigBtn").addEventListener("click", function () {
    if (!confirm("Reset the local venue configuration?")) return;
    window.saveConfig(window.defaultConfig());
    window.renderConfig();
    window.setStatus("Local configuration reset.", "ok");
  });
};
window.renderConfig();
window.bindEvents();
window.renderSchedule([]);
