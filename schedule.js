"use strict";
window.orderedVenues = function (config, type, field) {
  return config.venues.filter(function (venue) { return venue.type === type && Number(venue[field]) > 0; }).sort(function (a, b) { return Number(a[field]) - Number(b[field]); }).map(function (venue) { return venue.name; });
};
window.addMinutes = function (date, minutes) { return new Date(date.getTime() + minutes * 60000); };
window.formatTime = function (date) { return date.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false }); };
window.parseClock = function (timeText, date) {
  var parts = timeText.split(":");
  var result = new Date(date);
  result.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
  return result;
};
window.vehicleDays = function (config, vehicle) {
  var days = config[vehicle + 'Days'];
  if (Array.isArray(days)) return days.map(Number);
  return vehicle === 'van' ? (config.vanDaysMode === 2 ? [2, 4] : [1, 3, 5]) : [1, 2, 3, 4, 5];
};
window.buildSchedule = function (config, days) {
  var schedule = [];
  var venues = window.venueMap(config);
  var truckDays = window.vehicleDays(config, 'truck');
  var vanDays = window.vehicleDays(config, 'van');
  days.forEach(function (day) {
    if (!day.transfers.length) return;
    var weekday = day.date.getDay();
    var isTruckDay = truckDays.includes(weekday);
    var isVanDay = vanDays.includes(weekday);
    var isWeekend = weekday === 0 || weekday === 6;
    var ship = new Map(), receive = new Map(), oneStopMorning = new Map(), oneStopAfternoon = new Map(), vanOnTruckShip = new Map(), vanOnTruckReceive = new Map();
    day.transfers.forEach(function (row) { window.addOrCreate(row.direction === "Ship" ? ship : receive, row.shipFrom, row.transfer); });
    Array.from(ship.keys()).forEach(function (venue) {
      var venueConfig = venues.get(venue);
      if (!venueConfig || venueConfig.stopsPerDay !== 1 || !receive.has(venue)) return;
      var pickups = String(ship.get(venue) || '').split(', ').filter(Boolean).length;
      var dropoffs = String(receive.get(venue) || '').split(', ').filter(Boolean).length;
      var morning = dropoffs <= pickups;
      var target = morning ? oneStopMorning : oneStopAfternoon;
      target.set(venue, { pickup: ship.get(venue), dropoff: receive.get(venue) });
      ship.delete(venue); receive.delete(venue);
    });
    var origin = new Map(), destination = new Map();
    ship.forEach(function (value, venue) { String(value).split(', ').forEach(function (transfer) { origin.set(transfer, venue); }); });
    receive.forEach(function (value, venue) { String(value).split(', ').forEach(function (transfer) { destination.set(transfer, venue); }); });
    oneStopMorning.forEach(function (value, venue) { String(value.pickup).split(', ').forEach(function (transfer) { origin.set(transfer, venue); destination.set(transfer, venue); }); });
    oneStopAfternoon.forEach(function (value, venue) { String(value.pickup).split(', ').forEach(function (transfer) { origin.set(transfer, venue); destination.set(transfer, venue); }); });
    function destinationsFor(value) { return String(value).split(', ').map(function (transfer) { return destination.get(transfer); }).filter(Boolean).join(', '); }
    function originsFor(value) { return String(value).split(', ').map(function (transfer) { return origin.get(transfer); }).filter(Boolean).join(', '); }
    if (!isVanDay) {
      Array.from(ship.keys()).forEach(function (venue) { if (venues.get(venue) && venues.get(venue).type === "VAN") { vanOnTruckShip.set(venue, ship.get(venue)); ship.delete(venue); } });
      Array.from(receive.keys()).forEach(function (venue) { if (venues.get(venue) && venues.get(venue).type === "VAN") { vanOnTruckReceive.set(venue, receive.get(venue)); receive.delete(venue); } });
    }
    var truckAM = window.orderedVenues(config, "TRUCK", "truckOrderAM");
    var truckPM = window.orderedVenues(config, "TRUCK", "truckOrderPM");
    var vanOrder = window.orderedVenues(config, "VAN", "vanOrder");
    var truckMorning = new Date(day.date); truckMorning.setHours(9, 0, 0, 0);
    truckAM.forEach(function (venue) { if (ship.has(venue)) truckMorning = window.addMinutes(truckMorning, 30); });
    truckAM.forEach(function (venue) { if (oneStopMorning.has(venue)) truckMorning = window.addMinutes(truckMorning, 30); });
    if (!isVanDay) Array.from(vanOnTruckShip.keys()).forEach(function () { truckMorning = window.addMinutes(truckMorning, 30); });
    var truckLunch = window.addMinutes(truckMorning, 30);
    var truckAfternoon = window.addMinutes(truckLunch, 60);
    var vanAfternoon = truckAfternoon;
    if (isVanDay) {
      var vanMorning = new Date(day.date); vanMorning.setHours(9, 0, 0, 0);
      vanOrder.forEach(function (venue) { if (ship.has(venue)) vanMorning = window.addMinutes(vanMorning, 30); });
      vanOrder.forEach(function (venue) { if (oneStopMorning.has(venue)) vanMorning = window.addMinutes(vanMorning, 30); });
      var vanLunch = window.addMinutes(vanMorning, 30);
      vanAfternoon = window.addMinutes(vanLunch, 60);
      var latest = vanAfternoon > truckAfternoon ? vanAfternoon : truckAfternoon;
      truckAfternoon = latest; vanAfternoon = latest;
    }
    var truckRows = [{ time: "09:00", site: window.BASE, transfers: "Start of Run", css: "base" }];
    function pushStop(rows, venue, transfers, css, siteFrom, siteTo) { rows.push({ time: window.formatTime(window.addMinutes(window.parseClock(rows[rows.length - 1].time, day.date), 30)), site: venue, transfers: transfers, css: css, siteFrom: siteFrom || venue, siteTo: siteTo || '' }); }
    truckAM.forEach(function (venue) { if (ship.has(venue)) pushStop(truckRows, venue, ship.get(venue), "pickup", venue, destinationsFor(ship.get(venue))); });
    truckAM.forEach(function (venue) { if (oneStopMorning.has(venue)) pushStop(truckRows, venue, "PICKUP " + oneStopMorning.get(venue).pickup + " / DROPOFF " + oneStopMorning.get(venue).dropoff, "one-stop", venue, venue); });
    vanOnTruckShip.forEach(function (value, venue) { pushStop(truckRows, venue, value, "van-on-truck", venue, destinationsFor(value)); });
    if (day.returns) pushStop(truckRows, window.BASE, "RETURNS " + day.returns, "base");
    truckRows.push({ time: window.formatTime(truckLunch), site: window.BASE, transfers: "Lunch break - 1 hour, returns unloaded", css: "lunch" });
    truckRows.push({ time: window.formatTime(truckAfternoon), site: window.BASE, transfers: "Start Afternoon Run", css: "base" });
    truckPM.forEach(function (venue) { if (oneStopAfternoon.has(venue)) pushStop(truckRows, venue, "PICKUP " + oneStopAfternoon.get(venue).pickup + " / DROPOFF " + oneStopAfternoon.get(venue).dropoff, "one-stop", venue, venue); });
    truckPM.forEach(function (venue) { if (receive.has(venue)) pushStop(truckRows, venue, receive.get(venue), "dropoff", originsFor(receive.get(venue)), venue); });
    vanOnTruckReceive.forEach(function (value, venue) { pushStop(truckRows, venue, value, "van-on-truck", originsFor(value), venue); });
    pushStop(truckRows, window.BASE, "End of Run", "base");
    var warnings = [];
    var vanCount = vanOnTruckShip.size + vanOnTruckReceive.size;
    if (vanCount > 1) warnings.push(vanCount + " van venues on truck day - consider moving transfers or adding a van run.");
    if (!isTruckDay) warnings.push("Truck is not scheduled on this day. Assign required work to another available vehicle or enable an extra Truck run.");
    schedule.push({ date: day.date, isWeekend: isWeekend, truck: isTruckDay ? { title: "TRUCK RUN - Approx. timings for " + day.date.toLocaleDateString("en-AU", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }), rows: truckRows, warnings: warnings } : { title: "TRUCK NOT SCHEDULED", rows: [], warnings: warnings }, van: isVanDay ? window.buildVanRun(day, vanOrder, ship, receive, oneStopMorning, oneStopAfternoon, vanAfternoon) : null, baseJobs: day.baseJobs });
  });
  return schedule;
};
