"use strict";
window.buildVanRun = function (day, vanOrder, ship, receive, oneStopMorning, oneStopAfternoon, afternoonStart) {
  var rows = [{ time: "09:00", site: window.BASE, transfers: "Start of Run", css: "base" }];
  function pushStop(venue, transfers, css) {
    rows.push({ time: window.formatTime(window.addMinutes(window.parseClock(rows[rows.length - 1].time, day.date), 30)), site: venue, transfers: transfers, css: css });
  }
  vanOrder.forEach(function (venue) { if (ship.has(venue)) pushStop(venue, ship.get(venue), "pickup"); });
  vanOrder.forEach(function (venue) {
    if (oneStopMorning.has(venue)) pushStop(venue, "PICKUP " + oneStopMorning.get(venue).pickup + " / DROPOFF " + oneStopMorning.get(venue).dropoff, "one-stop");
  });
  var lunch = window.addMinutes(window.parseClock(rows[rows.length - 1].time, day.date), 30);
  rows.push({ time: window.formatTime(lunch), site: window.BASE, transfers: "Lunch break - 1 hour", css: "lunch" });
  rows.push({ time: window.formatTime(afternoonStart), site: window.BASE, transfers: "Start Afternoon Run", css: "base" });
  vanOrder.forEach(function (venue) {
    if (oneStopAfternoon.has(venue)) pushStop(venue, "PICKUP " + oneStopAfternoon.get(venue).pickup + " / DROPOFF " + oneStopAfternoon.get(venue).dropoff, "one-stop");
  });
  vanOrder.forEach(function (venue) { if (receive.has(venue)) pushStop(venue, receive.get(venue), "dropoff"); });
  pushStop(window.BASE, "End of Run", "base");
  return { title: "VAN RUN - Approx. timings for " + day.date.toLocaleDateString("en-AU", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }), rows: rows };
};
