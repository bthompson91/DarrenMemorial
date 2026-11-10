# Darren Langsford Memorial Milkrun Generator
# Feature Bible
Version 0.3 — 10 November 2026

## Revision history
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
Built-in methods: Uber (Courier, 24/7), KIS (Courier, weekdays only), Live Event (Freight, weekdays only). Allow additional external providers.
Built-in edit/delete permissions are not yet specified; do not silently relax their confirmed availability rules.

## 4. Venues and assignments
Each venue: name, onsite contact, Truck/Van type dropdown, secondary filtered dropdown of matching COMPANY-OWNED vehicles only. Exactly one default vehicle applies to both AM and PM. Rental/external methods are not default venue vehicles.
No venue weekday checkboxes.
Support default one-stop/two-stop behaviour with day-specific overrides.

## 5. Default route order
Separate section below venue setup: each company-owned run vehicle has a table with assigned venues in AM and PM columns, with up/down arrows. Same as morning checkbox on right mirrors AM sequence; unticking enables independent PM order. Assignment stays the same; only sequence differs. Generated-day reassignment must not rewrite configuration.

## 6. Venue archive
Removing a venue moves it to an archive, not permanent deletion. Restore later with saved identity/contact/default assignment and recoverable ordering information. Exclude archived venues from active defaults. Dump matches to archived venues offer Restore rather than duplicate creation. Proposed: invalid former vehicle restores as unassigned; exact route reinsertion remains open. Permanent deletion is not a confirmed requirement.

## 7. Location/public holidays
User selects operational location linked to an internal public-holiday table. Required: Australia, Fiji, New Zealand, Singapore, Malaysia, Hong Kong, Thailand; aim for all APAC. Regional/subdivision and observed-day coverage must be verified. Provider, maintained years and update process remain open. Static bundled data/build-time updates are a proposal compatible with GitHub Pages, not an existing backend service.
Holiday awareness does NOT yet imply automatic cancellation. Do not omit source work because of a holiday without an agreed rule.

## 8. Configuration portability
Buttons: Export configuration and Import configuration. Hide technical JSON/schema wording from normal UI. Internally use JSON.
Include all vehicle fields, availability/exceptions, provider settings, active/archived venues and contacts, assignments, AM/PM order, same-as-morning settings, location and holiday configuration.
Proposed: versioned file, validation before changes. Replace/merge/recovery policy open. Configuration backup does not automatically include operational schedule edits; full plan backup remains open.

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
Actual dump sample required: macro checks A1 but begins schedule parsing at row 2; confirm header/first-data-row handling. Group dates independent of row order; report malformed rows and unknown venues; retain raw references before cleanup for identity. Generalising Melbourne Base requires a confirmed rule.
Do not inherit silent omission of base-job-only dates or unknown venues.

## 11. Unknown venues
Prominent Schedules warning lists unknown venues and directs user to Configuration. Keep transfers visible, never silently discard them. Preserve dump/manual work across tabs. Archived matches offer restoration. Proposed UI: Configure venues action with unknown names available without retyping, per-day unresolved activity. Matching normalisation must not merge distinct venues silently.

## 12. Initial generation
Allocate recognised venues to default company-owned vehicles. Apply AM/PM order. Transfer-outs before lunch, transfer-ins after lunch. Group by venue/direction or default combined mode. Include warehouse start, returns/unload where relevant, lunch, afternoon start and run end.
VBA timing defaults: 09:00 start, 30-minute stop steps, 30-minute return/end allowance. Confirm final timing parameters independently of the now-confirmed one-hour lunch.
If default vehicle unavailable: proposed visible Unassigned/needs attention work, never omission; fallback allocation rule remains open.

## 13. CONFIRMED SHARED LUNCH RULE
Lunch duration is exactly ONE HOUR (60 minutes).
Lunch is one shared event displayed on every participating driver run.
For each run, calculate when the driver can reach the warehouse after all pre-break commitments, INCLUDING the return-to-warehouse allowance. Shared lunch start is the LATEST warehouse-arrival time across those runs. Shared lunch end = shared start + 60 minutes.
Earlier drivers wait for the others. If all drivers finish and return within three hours, lunch can happen early. Never delay lunch merely to reach four hours.
Recalculate continuously when stops are reordered, moved between runs/external methods, broken out, split/joined, timed or affected by base-job allocation. Unlocked afternoon times follow the updated lunch end. Preserve locked activity times and flag conflicts rather than blocking judgement.
Example: Truck 1 back 11:30; Truck 2 back 12:15; Van 1 back 11:45 => all lunch 12:15–13:15.
A manual shared-lunch lock was suggested previously by the assistant but is NOT confirmed; do not introduce an exception to live synchronisation without agreement.
Participation of afternoon-only runs remains to be specified.

## 14. Warnings
Confirmed new advisory flags per driver run:
- Lunch begins MORE THAN four hours into shift.
- Shift exceeds eleven hours.
These do not set lunch time, reject movements or prohibit a route. User redistributes workload as appropriate.
Legacy VBA references: base-job alert (even without clash), base-job clash against +/-1 hour using estimated truck stop timestamps, weekend work, more than one van-venue stop on truck run. Decide which legacy warnings carry forward/generalise.
VBA validation messages: invalid van-days mode (defaults to 3), date parse error, invalid pasted A1, invalid new-venue truck/van type, duplicate venue name, no venues to sort.
Public holiday/availability/overlap flags are separate proposed additions, not automatic scheduling prohibitions.

## 15. Operational editing
Stop up/down reordering; onsite contact editing per generated stop; Change run on each stop; truck/van/rental/external destinations; editable times lock when manually changed. Persist grouping, vehicle, order, contact and timing edits. Do not rewrite venue configuration.
Vehicle run-block up/down ordering is retained as an intended capability pending clarification of original wording about movable schedules.

## 16. Non-run transfer activity
One consolidated per-day table UNDER main vehicle runs lists all Courier, Freight and Uber work. Provider, venue, direction, references/contact; each row has Change run identical to main stops. Move to vehicle run or another external method. No route sequence/shared lunch for external services. Move, never duplicate.

## 17. Base jobs
Unassigned bucket below each day. Assign to a vehicle at a locked TWO-HOUR BLOCK CENTRED ON JOB TIME. 15:00 => 14:00–16:00. Preserve source time/reference/description. Assigned job appears in run. Remove sends it back to bucket, not deletion. Pre-break block finish contributes to latest warehouse availability/shared lunch. Persist assignments/removals. Duration editability and automatic insertion relative to lunch remain open.

## 18. Whole-stop split/combine
One-stop venues can be split into pickup/drop-off stops for a day; two-stop venues can combine for a day without changing defaults.
Combine based on count of individual transfers: more pickups => immediately BEFORE lunch; more drop-offs => immediately AFTER lunch. Equal counts unresolved (before-lunch was assistant proposal only). Immediate adjacency takes priority over default route position on the combination action. Afterwards user can move freely. Recalculate shared lunch.

### CONFIRMED SPLIT RULES
When a stop is split into a pickup and drop-off:

- The new pickup and drop-off inherit the original stop’s venue details.
- The new pickup and drop-off initially retain the original stop’s vehicle assignment.
- The new pickup and drop-off initially use the original stop’s on-site contact.
- Pickup and drop-off assignment follows the transfer type and the app’s normal scheduling logic.
- Both resulting stops have unlocked times, so they can be rescheduled and reordered independently.
- If the original stop’s time was locked, the red pickup retains that locked time; the green drop-off is placed immediately after the pickup, ready for reordering.
- If the original stop’s time was not locked, the pickup is placed immediately before lunch and the drop-off immediately after lunch.

## 19. Chain-icon controls
In Transfers column: broken-chain icon ⛓️‍💥 beside transfer reference breaks that transfer into a separate stop; link icon 🔗 rejoins it with a compatible stop.
In Time column: same icons operate on whole stops. Keep individual-reference ungrouping distinct from whole-stop pickup/drop-off split. Exact whole-stop all-reference behaviour requires confirmation.
If several join targets exist or work spans vehicles, ask for target; do not silently move every venue transfer to an arbitrary run.

### CONFIRMED JOIN RULES
When stops are joined:

- If the stops have different locked times, display a warning and allow the user to select which time to retain.
- The combined stop uses the selected time.
- The combined stop takes the run-order position associated with the selected time.
- The combined stop inherits the time-lock status of the selected time.
- If the source stops are assigned to different vehicles, the user chooses which vehicle receives the combined stop.
- If the source stops have different edited on-site contacts, the user chooses which contact to retain.
- The combined stop retains the cargo/load details from all source stops.

## 20. Persistence and internal model
Use localStorage and stable hashes/identities for manual planning. Atomic unit is an INDIVIDUAL TRANSFER OCCURRENCE, not concatenated display text.
Proposed entities: transfer occurrence (source identity/date/venue/direction/reference/raw metadata), stop (planning ID/member transfer IDs/assignment/order/section/contact/time lock), base job (source identity/centre/block/assignment), day plan (run and stop ordering/overrides/derived shared lunch).
Identity must exclude mutable vehicle/order/time/contact AND whole-dump hash. An unrelated dump change must not discard existing planning. Prefer immutable source IDs; otherwise documented composite with duplicate handling. Repeated reference alone is insufficient. Save override contents as well as hash.
Regeneration: parse, match identities, restore matching grouping/assignments/orders/contacts/locks, default new work, exclude missing work from current display without deleting unrelated changes, flag unresolved references, recalculate unlocked timings/warehouse arrival/60-minute shared lunch/warnings.
Retention of missing-work overrides needs decision. localStorage is not cross-device backup; full-plan backup remains open.

## 21. Formatting
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

## 22. Copying/forecast
Copy day per date. Copy all schedules copies ENTIRE selected range inclusive, chronologically, including empty dates (No scheduled work), not merely visible cards or a fixed week. Include current runs, external activity, base jobs, unresolved work/warnings and holiday status as appropriate. Copy current edited plan without regeneration.
Actual formatted tables required: borders, headings, backgrounds, bold sites, wrapping/contacts, not padded plain text. Omit editing icons/buttons/input styles. Proposed rich HTML clipboard with inline formatting plus plain-text fallback; test actual recipient applications.

## 23. Acceptance tests
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
- Refresh/regenerate/new unrelated dump row preserves existing manual edits.
- Shared lunch updates to latest WAREHOUSE arrival and lasts exactly 60 minutes on all runs, including an early break when everyone returns early.
- Four-hour warning does not move lunch; >11-hour warning advisory.
- Locked times survive automatic recalculation; conflicts do not block user decisions.
- 15:00 base job blocks 14:00–16:00; Remove returns to bucket.
- External table Change run is fully bidirectional.
- Day/all copy retains formatted current plan, no edit controls; all includes every selected date.

## 24. Remaining decisions
Lunch duration is RESOLVED: one hour.
Stop split/join conflict rules are RESOLVED: selected time determines time, position and lock status; user selects vehicle and contact where they differ; cargo is retained from all source stops.
Still open: shift start/finish and duration basis; stop/warehouse timing parameters; equal-count combination; public-holiday effects/source/region/year coverage; actual dump sample/header/identifiers; regional base identity; unavailable-default fallback; afternoon-only driver lunch participation; whole-stop break details; import policy/full operational backup; target clipboard applications; exact one-week default end date.

## 25. Sources and implementation status
Requirements conversation dated 10 November 2026; supplied paste.txt VBA; supplied image.jpeg schedule reference. This document is the specification, not a claim that these features have been implemented. No repository write or deployment is performed by producing this document.
