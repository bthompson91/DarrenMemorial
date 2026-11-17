# DarrenMemorial — Milk Run Scheduler

A local, offline web app that replaces the Excel/VBA Milk Run workflow.

- Paste the Dump data directly into the app, then click **Generate Milk Run**.
- Venue, contact, vehicle and run-order configuration is stored in the browser's `localStorage`.
- Configuration can be exported to and imported from a JSON file.
- The generated schedule can be downloaded as CSV.
- Upload the transfer CSV on the Schedules page, then click **Download PDF** beside a vehicle's schedule to download its booklet. Pages use landscape A4, with that vehicle's schedule first. Stops are matched by transfer order ID (ignoring leading zeroes in its numeric part) and use the scheduled stop time. Consecutive stops at a venue share a page; returning to that venue after other stops starts a new page in schedule order. Identical product lines within a transfer are combined by summing their quantities. Return transfers are paired by incrementing the transfer ID and reversing the route, using the CSV return date. Missing transfer rows are flagged with an R2 warning without stopping the booklet.
- Each Uber stop also has a **Download RTF** action. Its A4 form includes the transfer IDs and site contacts when available; addresses remain blank because they are not in the source data. Item rows are filled only when every transfer matches and shares one route; otherwise the form provides ten blank rows for handwriting. RTF files open in Word without an additional export library.
- No Dump data, configuration, or generated schedule is uploaded to any server.

## Run it

1. Download or clone this repository.
2. Open `index.html` in Chrome, Edge, Firefox or Safari.
3. Paste the Dump table into the **Paste Dump data** area.
4. Click **Generate Milk Run**.

No installation, build step, internet connection, or backend server is required.

The PDF export uses locally bundled jsPDF and jsPDF-AutoTable libraries; their MIT licenses are in `vendor/`.

## Dump input

The app expects the same tab-separated columns used by the existing Excel Dump sheet:

| Column | Use |
|---|---|
| A | Must contain `TRUE` or `FALSE` |
| E | Base-job time |
| F | Transfer type |
| G | `Ship` or `Receive` |
| H | Transfer / job number |
| I | Description |
| J | Date, preferably `dd-mm-yyyy` or `dd/mm/yyyy` |
| L | Ship-from venue |
| P | Managed-by / receive venue |
| Q | `CLOSED` exclusion flag |

The app removes `00000` from column H before processing, matching the original VBA behaviour.

## Configuration

Open **Config** to manage venues and the van-days mode.

- `Van days mode 2`: Tuesday and Thursday
- `Van days mode 3`: Monday, Wednesday and Friday

Venue fields:

- Venue name
- Onsite contact
- Vehicle type: `TRUCK` or `VAN`
- Stops per day
- Truck AM order
- Truck PM order
- Van order

Changes are saved automatically to `localStorage` on the current computer.

Use **Export config JSON** to create a portable backup, and **Import config JSON** to restore it.

## Privacy

This is a fully local application:

- Pasted Dump data remains in browser memory only.
- Imported files are read locally by the browser.
- Configuration is saved in the browser's local storage.
- Exports are generated and downloaded locally.
- There is no backend, telemetry, cloud storage, or external API call.
