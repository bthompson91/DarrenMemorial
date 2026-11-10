# Darren Langsford Memorial Milkrun Generator
# Feature Bible
Version 0.4 — 10 November 2026

## Revision history
0.4: Confirmed shift and timing rules, equal-count combination, Time-column delink behaviour, multi-target joins, Dump identity/header rules, missing-transfer handling, unavailable-vehicle fallback, public-holiday flag behaviour, configuration import overwrite, separate full schedule backup, Outlook copy target, empty-date text and provider permissions. This edition consolidates the requirements discussion and supersedes version 0.3.

0.3: Confirmed stop split and join behaviour, including time, position, lock, vehicle, contact, cargo and colour rules. Removed resolved split/join conflict decisions from open decisions. This edition consolidates the requirements discussion and supersedes version 0.2.

0.2: Confirmed ONE-HOUR shared lunch. Removed lunch duration from open decisions. This edition consolidates the requirements discussion and supersedes version 0.1.

## 1. Purpose and platform
Rebuild the warehouse milk-run planning app from scratch. Desktop web browsers only; no mobile layouts for now. Deploy on GitHub Pages; repository DarrenMemorial. Variable venue and vehicle counts. Configuration defines defaults; users freely edit generated operational plans. No route sequence is declared impossible or blocked on operational grounds. Warnings support user judgement.
Original Excel VBA is the reference for dump handling and schedule formatting, not its fixed single-truck/single-van architecture. User screenshot defines the desired table appearance.

## 2. Navigation
Schedules is the first page. Configuration contains location, fleet, venues, vehicle route order, venue archive and import/export. Preserve pasted source data and manual edits when navigating.

## 3. Vehicles
Each entry requires a name and selectable type: Truck, Van, Courier or Freight.
Truck/Van: company-owned or rental. Registration mandatory for company-owned, optional for rental. Rental-only start/end dates. Company-owned vehicles instead support multiple unavailability periods with dates/reason (servicing, breakdown, interstate, loan).
Seven weekday availability checkboxes are PER VEHICLE, never per venue. Combine weekday selection with date-range restrictions.
Courier/Freight: free-text provider, no registration/ownership requirement or sequenced AM/PM runs.
Built-in methods: Uber (Courier, 24/7), KIS (Courier, weekdays only), Live Event (Freight, weekdays only). These three built-in providers cannot be edited or deleted by users.
Additional Courier/Freight providers are user-created entries in the vehicles table on Configuration.

## 4. Venues and assignments
Each venue: name, onsite contact, Truck/Van type dropdown, secondary filtered dropdown of matching COMPANY-OWNED vehicles only. Exactly one default vehicle applies to both AM and PM. Rental/external methods are not default venue vehicles.
No venue weekday checkboxes.
Support default one-stop/two-stop behaviour with day-specific overrides.

## 5. Default route order
Separate section below venue setup: each company-owned run vehicle has a table with assigned venues in AM and PM columns, with up/down arrows. Same as morning checkbox on right mirrors AM sequence; unticking enables independent PM order. Assignment stays the same; only sequence differs. Generated-day reassignment must not rewrite configuration.

## 6. Venue archive
Removing a venue moves it to an archive, not permanent deletion. Restore later with saved identity/contact/default assignment and recoverable ordering information. Exclude archived venues from active defaults. Dump matches to archived venues offer Restore rather than duplicate creation. Proposed: invalid former vehicle restores as unassigned; exact route reinsertion remains open. Permanent deletion is not a confirmed requirement.

## 7. Location/public holidays
User selects operational location linked to an internal public-holiday table. Required: Australia, Fiji, New Zealand, Singapore, Malaysia, Hong Kong, Thailand; aim for all APAC. Regional/subdivision and observed-day coverage must be verified. Use the best available maintained public holiday source for APAC coverage; exact provider, maintained years and update process remain open. Static bundled data/build-time updates are a proposal compatible with GitHub Pages, not an existing backend service.
Public holidays are user-facing flags only. They do not cancel or move work automatically.

## 8. Configuration portability
Buttons: Export configuration and Import configuration. Hide technical JSON/schema wording from normal UI. Internally use JSON.
Include all vehicle fields, availability/exceptions, provider settings, active/archived venues and contacts, assignments, AM/PM order, same-as-morning settings, location and holiday configuration.
Importing a configuration JSON OVERWRITES the existing configuration. Versioned file and validation before changes remain proposed.
Configuration backup does not automatically include operational schedule edits. The Schedules tab has a separate full schedule backup/export.

## 9. Source dump and date range
Paste dump on Schedules and generate runs from configuration. One run per required vehicle, not per venue. From/To date controls default to today for one week (proposed exact interpretation: today through today+6 inclusive). Range controls generation/display/copy without discarding parsed source data. Preserve manual planning on regeneration/range changes.

## 10. VBA dump reference
Columns: E base-job time; F row type; G Ship/Receive; H reference; I description; J operational date; L venue/source; P Managed By; Q status.
Exclusions: trimmed uppercased Q=CLOSED; L and P both Melbourne Base; F!=Transfer AND L!=Melbourne Base; I contains EA Online Webinars (case-insensitive).
Classification after exclusion:
- L=Melbourne Base and F!=Transfer: base job from E/H/I.
- Melbourne Base transfers with blank P: skipped by original macro.
- G=Receive, L=Melbourne Base, P nonblank: returns to base.
- Otherwise L is venue; Ship=pickup/transfer-out, Receive=drop-off/transfer-in.
VBA concatenates H per venue/direction; rebuild retains atomic transfer records.
Paste macro validates A1 TRUE/FALSE and removes occurrences of 00000 from H. Date formats dd-mm-yyyy, dd/mm/yyyy or Excel date values.
The app should detect whether pasted data includes a header row. Group dates independent of row order; report malformed rows and unknown venues; retain raw references before cleanup for identity. The base venue varies by state, but its name always contains the word “Base”. Generalising Melbourne Base requires a confirmed rule.
Do not inherit silent omission of base-job-only dates or unknown venues.

## 11. Unknown venues
Prominent Schedules warning lists unknown venues and directs user to Configuration. Keep transfers visible, never silently discard them. Preserve dump/manual work across tabs. Archived matches offer restoration. Proposed UI: Configure venues action with unknown names available without retyping, per-day unresolved activity. Matching normalisation must not merge distinct venues silently.
Venue name is sufficient as venue identity.

## 12. Initial generation
Allocate recognised venues to default company-owned vehicles. Apply AM/PM order. Transfer-outs before lunch, transfer-ins after lunch. Group by venue/direction or default combined mode. Include warehouse start, returns/unload where relevant, lunch, afternoon start and run end.
If a default vehicle is unavailable, use this fallback order:
1. Rental vehicle of the same type.
2. Company-owned vehicle of the same type.
3. Rental vehicle of a different type.
If a van venue is assigned to a truck, display a flag; do not block the assignment.

## 13. CONFIRMED TIMING AND SHIFT RULES
Standard shift start is 09:00.
Standard finish is 17:00, or immediately after all stops are completed if earlier.
A run extending past 17:00 is allowed but flagged.
Venue stops are 30 minutes, except regional venues are 60 minutes.
Return travel to base is 30 minutes from city venues and 60 minutes from regional venues.
After the final stop and return, the run ends immediately.
Afternoon-only drivers begin when the shared lunch ends.

## 14. CONFIRMED SHARED LUNCH RULE
Lunch duration is exactly ONE HOUR (60 minutes).
Lunch is one shared event displayed on every participating driver run.
For each run, calculate when the driver can reach the warehouse after all pre-break commitments, INCLUDING the return-to-warehouse allowance. Shared lunch start is the LATEST warehouse-arrival time across those runs. Shared lunch end = shared start + 60 minutes.
Earlier drivers wait for the others. If all drivers finish and return within three hours, lunch can happen early. Never delay lunch merely to reach four hours.
Recalculate continuously when stops are reordered, moved between runs/external methods, broken out, split/joined, timed or affected by base-job allocation. Unlocked afternoon times follow the updated lunch end. Preserve locked activity times and flag conflicts rather than blocking judgement.
Example: Truck 1 back 11:30; Truck 2 back 12:15; Van 1 back 11:45 => all lunch 12:15–13:15.
A manual shared-lunch lock was suggested previously by the assistant but is NOT confirmed; do not introduce an exception to live synchronisation without agreement.
Afternoon-only drivers start when the shared lunch ends.

## 15. Warnings
Confirmed advisory flags per driver run:
- Lunch begins MORE THAN four hours into shift.
- Shift exceeds eleven hours.
- Run extends past 17:00.
These do not set lunch time, reject movements or prohibit a route. User redistributes workload as appropriate.
Legacy VBA references: base-job alert (even without clash), base-job clash against +/-1 hour using estimated truck stop timestamps, weekend work, more than one van-venue stop on truck run. Decide which legacy warnings carry forward/generalise.
VBA validation messages: invalid van-days mode (defaults to 3), date parse error, invalid pasted A1, invalid new-venue truck/van type, duplicate venue name, no venues to sort.
Public holiday, availability and overlap flags are user-facing warnings, not automatic scheduling prohibitions.
Vehicle overlap means overlapping unavailability/restriction periods on the same vehicle. For example, servicing 10–12 November and a rental restriction 11–13 November overlap on 11–12 November; the app should recognise combined unavailability 10–13 November and flag ambiguity rather than silently allowing or blocking the run.

## 16. Operational editing
Stop up/down reordering; onsite contact editing per generated stop; Change run on each stop; truck/van/rental/external destinations; editable times lock when manually changed. Persist grouping, vehicle, order, contact and timing edits. Do not rewrite venue configuration.
Vehicle run-block up/down ordering is retained as an intended capability pending clarification of original wording about movable schedules.

## 17. Non-run transfer activity
One consolidated per-day table UNDER main vehicle runs lists all Courier, Freight and Uber work. Provider, venue, direction, references/contact; each row has Change run identical to main stops. Move to vehicle run or another external method. No route sequence/shared lunch for external services. Move, never duplicate.

## 18. Base jobs
Unassigned bucket below each day. Assign to a vehicle at a locked TWO-HOUR BLOCK CENTRED ON JOB TIME. 15:00 => 14:00–16:00. Preserve source time/reference/description. Assigned job appears in run. Remove sends it back to bucket, not deletion. Pre-break block finish contributes to latest warehouse availability/shared lunch. Persist assignments/removals. Duration editability and automatic insertion relative to lunch remain open.

## 19. Whole-stop split/combine
One-stop venues can be split into pickup/drop-off stops for a day; two-stop venues can combine for a day without changing defaults.
Combine based on count of individual transfers: more pickups => immediately BEFORE lunch; more drop-offs => immediately AFTER lunch. Equal counts => immediately BEFORE lunch. Immediate adjacency takes priority over default route position on the combination action. Afterwards user can move freely. Recalculate shared lunch.

### CONFIRMED SPLIT RULES
When a stop is split into a pickup and drop-off:

- The new pickup and drop-off inherit the original stop’s venue details.
- The new pickup and drop-off initially retain the original stop’s vehicle assignment.
- The new pickup and drop-off initially use the original stop’s on-site contact.
- Pickup and drop-off assignment follows the transfer type and the app’s normal scheduling logic.
- Both resulting stops have unlocked times, so they can be rescheduled and reordered independently.
- If the original stop’s time was locked, the red pickup retains that locked time; the green drop-off is placed immediately after the pickup, ready for reordering.
- If the original stop’s time was not locked, the pickup is placed immediately before lunch and the drop-off immediately after lunch.

## 20. Chain-icon controls
In Transfers column: broken-chain icon ⛓️‍💥 beside transfer reference breaks that transfer into a separate stop; link icon 🔗 rejoins it with a compatible stop.
In Time column: the delink control appears ONLY on orange combined stops. Delinking creates a red pickup and a green drop-off.
If several compatible join targets exist for the same venue on the same day, join ALL of them into one stop. No per-target picker is required.
Keep individual-reference ungrouping distinct from whole-stop pickup/drop-off split.

### CONFIRMED JOIN RULES
When stops are joined:

- If the stops have different locked times, display a warning and allow the user to select which time to retain.
- The combined stop uses the selected time.
- The combined stop takes the run-order position associated with the selected time.
- The combined stop inherits the time-lock status of the selected time.
- If the source stops are assigned to different vehicles, the user chooses which vehicle receives the combined stop.
- If the source stops have different edited on-site contacts, the user chooses which contact to retain.
- The combined stop retains the cargo/load details from all source stops.
- If several compatible join targets exist for the same venue on the same day, join all of them.

## 21. Persistence and internal model
Use localStorage and stable hashes/identities for manual planning. Atomic unit is an INDIVIDUAL TRANSFER OCCURRENCE, not concatenated display text.
Proposed entities: transfer occurrence (source identity/date/venue/direction/reference/raw metadata), stop (planning ID/member transfer IDs/assignment/order/section/contact/time lock), base job (source identity/centre/block/assignment), day plan (run and stop ordering/overrides/derived shared lunch).
Identity must exclude mutable vehicle/order/time/contact AND whole-dump hash. An unrelated dump change must not discard existing planning. Prefer immutable source IDs; otherwise documented composite with duplicate handling. Repeated reference alone is insufficient. Save override contents as well as hash.
If a transfer disappears from a later Dump, remove it from the current display. The STOP retains assignment, order, contact and time lock; transfers belong to a stop and do not independently retain those overrides.
Regeneration: parse, match identities, restore matching grouping/assignments/orders/contacts/locks, default new work, exclude missing work from current display without deleting unrelated changes, flag unresolved references, recalculate unlocked timings/warehouse arrival/60-minute shared lunch/warnings.
localStorage is not cross-device backup; export/import files support moving between computers.

## 22. Formatting
Match supplied screenshot: four primary columns Time, Site, Transfers, Onsite Contact; centred full-width run title with vehicle/date, black cell borders, bold venue names, grey headers, wrapping transfer lists and variable row heights. Compact desktop edit controls.
VBA palette:
- Run start/afternoon start/end: RGB(200,220,255), #C8DCFF.
- Pickup: RGB(255,200,200), #FFC8C8.
- Drop-off: RGB(200,255,200), #C8FFC8.
- Combined: RGB(255,200,100), #FFC864.
- Van venue serviced by truck: RGB(230,200,250), #E6C8FA.
- Returns: RGB(150,180,255), #96B4FF.
- Lunch: RGB(220,220,220), #DCDCDC.
- Headers: RGB(200,200,200), #C8C8C8.
- Base alert: RGB(0,168,255), white bold text.
- Weekend: RGB(255,200,0), dark-red bold text.
- Multiple van-stop warning: yellow/red bold.
VBA precedence: combined orange > van-on-truck purple > pickup/drop-off.

## 23. Copying/forecast
Copy day per date. Copy all schedules copies ENTIRE selected range inclusive, chronologically, including empty dates displaying “No stops scheduled”, not merely visible cards or a fixed week. Copy all schedules excludes warnings because warnings are user-facing. Include current runs, external activity and base jobs as appropriate. Copy current edited plan without regeneration.
The paste target is Outlook.
Actual formatted tables required: borders, headings, backgrounds, bold sites, wrapping/contacts, not padded plain text. Omit editing icons/buttons/input styles. Proposed rich HTML clipboard with inline formatting plus plain-text fallback; test Outlook rendering.

## 24. Acceptance tests
- Vehicle ownership/type/registration/date validations and per-vehicle weekdays.
- Venue filtered company-owned defaults; independent AM/PM arrows and same-as-morning.
- Archive/restore and complete configuration export/import round-trip.
- Unknown/archived dump venues surfaced without losing pasted data/edits.
- Multiple vehicles; date filter; base-only/external-only dates visible.
- Combined-stop lunch adjacency; individual split/rejoin/move without duplication.
- Splitting inherits venue, vehicle, contact and transfer-based pickup/drop-off assignment; unlocks both resulting times.
- Locked split pickup retains its locked time; unlocked split places pickup before lunch and drop-off after lunch.
- Joining selects one conflicting time; selected time determines combined time, position and lock status.
- Joining prompts for vehicle and contact where they differ; retains cargo from all source stops.
- Multiple same-venue same-day join targets are all joined.
- Refresh/regenerate/new unrelated dump row preserves existing manual edits.
- Shared lunch updates to latest WAREHOUSE arrival and lasts exactly 60 minutes on all runs, including an early break when everyone returns early.
- Four-hour warning does not move lunch; >11-hour warning advisory.
- Run past 17:00 is allowed but flagged.
- Locked times survive automatic recalculation; conflicts do not block user decisions.
- 15:00 base job blocks 14:00–16:00; Remove returns to bucket.
- External table Change run is fully bidirectional.
- Day/all copy retains formatted current plan, no edit controls; all includes every selected date; empty dates show “No stops scheduled”; warnings excluded from copy-all.

## 25. Remaining decisions
Lunch duration is RESOLVED: one hour.
Stop split/join conflict rules are RESOLVED: selected time determines time, position and lock status; user selects vehicle and contact where they differ; cargo is retained from all source stops.
Timing and shift rules are RESOLVED: 09:00 start, 17:00 target finish, 30-minute city stops, 60-minute regional stops, 30-minute city return, 60-minute regional return, immediate run end, afternoon-only drivers start at lunch end.
Equal-count combination is RESOLVED: immediately before lunch.
Time-column delink is RESOLVED: only on orange combined stops; creates red pickup and green drop-off.
Multi-target joins are RESOLVED: join all compatible same-venue same-day targets.
Dump header detection is RESOLVED: app detects header presence.
Venue identity is RESOLVED: venue name is sufficient.
Base venue is RESOLVED: state-specific base whose name contains “Base”.
Missing transfers are RESOLVED: removed from display; stop retains assignment/order/contact/lock.
Unavailable default vehicle fallback is RESOLVED: rental same type, company same type, rental different type; van-on-truck flagged.
Public holidays are RESOLVED: user-facing flags only.
Configuration import is RESOLVED: overwrites existing configuration.
Full schedule backup is RESOLVED: separate export on Schedules tab.
Copy target is RESOLVED: Outlook.
Copy-all warnings are RESOLVED: excluded.
Empty-date text is RESOLVED: “No stops scheduled”.
Built-in providers are RESOLVED: Uber, KIS and Live Event cannot be edited or deleted; additional providers are user-created.
Still open: public-holiday provider/coverage years/regional handling; actual dump sample and exact header/first-data-row structure; full schedule backup file format/schema; Outlook HTML rendering details; exact one-week default end date; exact route reinsertion after archive restore; base-job duration editability and automatic insertion relative to lunch; vehicle run-block ordering clarification.

## 26. Sources and implementation status
Requirements conversation dated 10 November 2026; supplied paste.txt VBA; supplied image.jpeg schedule reference. This document is the specification, not a claim that these features have been implemented. No repository write or deployment is performed by producing this document.
