# DarrenMemorial — Milk Run Scheduler

A local, offline web app that replaces the Excel/VBA Milk Run workflow.

- Paste the Dump data directly into the app, then click **Generate Milk Run**.
- Venue, contact, vehicle and run-order configuration is stored in the browser's `localStorage`.
- Configuration can be exported to and imported from a JSON file.
- The generated schedule can be downloaded as CSV.
- Upload the transfer report (.xlsx, PowerBI export) on the Schedules page to build the schedule from transfers and load the booklet items in one step — no Dump paste needed for transfers. Then click **Download PDF** beside a vehicle's schedule to download its booklet. Pages use landscape A4, with that vehicle's schedule first. Stops are matched by transfer order ID (ignoring leading zeroes in its numeric part) and scheduled date. Consecutive stops at a venue share a page; returning to that venue after other stops starts a new page in schedule order. Identical product lines within a transfer are combined by summing their quantities. Missing transfer rows are flagged with an R2 warning without stopping the booklet.
- Upload the transfer CSV on the Schedules page instead if you only need booklet item details without changing the schedule. Return transfers are paired by incrementing the transfer ID and reversing the route, using the CSV return date. That pairing does not run on the transfer report, whose returns are explicit rows.
- Each Uber stop also has a **Download RTF** action. Its A4 form includes transfer IDs and configured site contacts when available; addresses remain blank because they are not in the source data. Uber transfers match by normalized transfer ID regardless of date, since urgent runs may not follow the CSV schedule. Item rows are filled only when every transfer matches and shares one route; otherwise the form provides ten blank rows for handwriting. RTF files open in Word without an additional export library.
- No Dump data, configuration, or generated schedule is uploaded to any server.

## Run it

1. Download or clone this repository.
2. Open `index.html` in Chrome, Edge, Firefox or Safari.
3. Paste the Dump table into the **Paste Dump data** area (only base jobs are needed if you uploaded the transfer report), or upload the transfer report (.xlsx) instead for transfers.
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

## Transfer report (.xlsx)

The PowerBI export has one row per item, with these columns: `DISPATCHDATE`, `TRANSFERORDERID`, `Transfer DESCRIPTION`, `SKU`, `Equipment DESCRIPTION`, `From SITENAME`, `To SITENAME`, `Managed by`, `ORDEREDQTY`.

- Each transfer becomes a Ship at its From site and a Receive at its To site, on the dispatch date. A base end is warehouse activity, not a stop — the same as a Dump transfer at the base.
- Dispatch times are ignored; the app calculates run order, so activities use a neutral midday time.
- Returns are explicit rows in the report (description starts `ReturnOrder`), so no return is derived from them.
- Blank rows, zero-quantity lines and the `Applied filters` footer row are skipped.
- Once a report is loaded, Dump transfer rows are ignored on Generate — only base-job rows from the Dump are merged in. Use **Clear transfer report** to go back to Dump-only scheduling. The report also supplies the booklet item details, replacing the transfer CSV.

## Picklist (.rtf)

Upload a picklist export on the Schedules page to build base jobs without pasting the Dump. Each order becomes two base jobs at the customer base (ref = order number, description = Order Desc): a Ship on the Delivery date/time and a Receive on the Pick up date/time. Repeated sections for one order are merged.

- EA Online Webinars orders are excluded entirely.
- S-Assign (subrental) items show in the unassigned base jobs area in dark green, with Qty, Description and Transfer/PO.
- Transfer items are kept with their kit grouping and the order they serve: in the booklet they appear grouped under their kit name, highlighted amber, with a Picklist order line on the transfer. Kit headers with no item rows contribute nothing. Transfer items with no transfer ID in Transfer/PO cannot be linked and show without the highlight.
- Picklist base jobs win over Dump base jobs with the same order, date and kind. Use **Clear picklist** to go back to Dump base jobs.
- A base job assigned to a vehicle gets its own page in that vehicle's PDF booklet, listing all its picklist items grouped under their kit names, with Product ID, Description, Qty, Status and Transfer/PO. The runsheet keeps just the job number (leading zeroes dropped, e.g. `1008082`) and the job description; Dump base jobs have no items so they get no page.

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
