# Darren Langsford Memorial Milkrun Generator
# Feature Bible
Version 0.7 — 11 November 2026

## Revision history
0.7: Confirmed same-reference/day/direction consolidation at the earliest source time; Ship and Receive remain separate across directions and dates. Normal dumps are subregion-scoped and exclude Prep. Interstate activity remains visible and user-assignable to KIS or Live Event. Incorporated sample evidence for headerless tab-separated data and embedded address line breaks. Updated transfer identity, stop ownership and acceptance tests. Preserved prior scheduling and design requirements.

0.6: Adopted the supplied Tailwind CSS style reference for the app interface: white canvas, hairline structure, near-black typography, Inter, restrained monospace, black pill primary actions and compact neutral configuration panels. Preserved the schedule screenshot, operational colours and Outlook table output as separate requirements. This is a specification update, not implementation of app styling.

0.5: Added configurable base-location designation in Configuration > Venues, automatic designation when exactly one venue name contains the word Base, and a Change/Add/Cancel confirmation when selecting another base. Supports multiple base venues, including Adelaide Base and Major Events sharing a building. Explicit configuration supersedes name-based detection. Updated configuration portability, base classification and acceptance tests. No primary-base hierarchy is introduced.

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

### Base locations
In Configuration > Venues, provide a Base location setting on venues in the list. One or more active venues may be designated as base locations.
If no explicit base configuration exists and exactly one venue name contains the word Base, automatically designate that venue as the base location. If zero or multiple names contain Base, do not arbitrarily select one; let the user configure the base location(s).
When a base already exists and the user selects another venue as a base, ask whether to CHANGE the existing base location(s) or ADD another base location:
- Change: replace the existing base designation(s) with the selected venue.
- Add: retain existing base designation(s) and also mark the selected venue as a base.
- Cancel: leave the configuration unchanged.
The confirmation identifies the existing base venue(s) and the proposed venue.
A base venue need not contain Base in its name. Explicit user configuration takes precedence over automatic name detection and must not be overwritten by it.
Example: Adelaide can designate both Adelaide Base and Major Events, which operate from the same building. Melbourne can retain Melbourne Base alone. Multiple base venue records do not, by themselves, imply separate buildings, separate lunch groups or additional travel.
Configured base venues are used for base-job/return/transfer classification and warehouse/base recognition. A primary-versus-secondary base hierarchy is not a confirmed requirement.
An interstate destination such as Sydney Base is not automatically a local configured base merely because its name contains Base. Preserve explicit local base choices.

## 5. Default route order
Separate section below venue setup: each company-owned run vehicle has a table with assigned venues in AM and PM columns, with up/down arrows. Same as morning checkbox on right mirrors AM sequence; unticking enables independent PM order. Assignment stays the same; only sequence differs. Generated-day reassignment must not rewrite configuration.

## 6. Venue archive
Removing a venue moves it to an archive, not permanent deletion. Restore later with saved identity/contact/default assignment and recoverable ordering information. Exclude archived venues from active defaults. Dump matches to archived venues offer Restore rather than duplicate creation. Proposed: invalid former vehicle restores as unassigned; exact route reinsertion remains open. Permanent deletion is not a confirmed requirement.

## 7. Location/public holidays
User selects operational location linked to an internal public-holiday table. Required: Australia, Fiji, New Zealand, Singapore, Malaysia, Hong Kong, Thailand; aim for all APAC. Regional/subdivision and observed-day coverage must be verified. Use the best available maintained public holiday source for APAC coverage; exact provider, maintained years and update process remain open. Static bundled data/build-time updates are a proposal compatible with GitHub Pages, not an existing backend service.
Public holidays are user-facing flags only. They do not cancel or move work automatically.

## 8. Configuration portability
Buttons: Export configuration and Import configuration. Hide technical JSON/schema wording from normal UI. Internally use JSON.
Include all vehicle fields, availability/exceptions, provider settings, active/archived venues and contacts, assignments, AM/PM order, same-as-morning settings, location and holiday configuration. Include all base-location designations and preserve explicit base choices on export/import and refresh.
Importing a configuration JSON OVERWRITES the existing configuration. Versioned file and validation before changes remain proposed.
Configuration backup does not automatically include operational schedule edits. The Schedules tab has a separate full schedule backup/export.

## 9. Source dump and date range
Paste dump on Schedules and generate runs from configuration. One run per required vehicle, not per venue. From/To date controls default to today for one week (proposed exact interpretation: today through today+6 inclusive). Range controls generation/display/copy without discarding parsed source data. Preserve manual planning on regeneration/range changes.
Normal dumps are already scoped to the user's subregion. The supplied nationwide example was accidentally exported at country scope and does not establish a requirement for automatic state/address filtering. Interstate work present in a subregion dump must remain visible for user assignment.

## 10. VBA dump reference and confirmed input rules
Columns: E base-job time; F row type; G Ship/Receive; H reference; I description; J operational date; L venue/source; P Managed By; Q status.
Legacy VBA exclusions: trimmed uppercased Q=CLOSED; L and P both Melbourne Base; F!=Transfer AND L!=Melbourne Base; I contains EA Online Webinars (case-insensitive).
Legacy classification after exclusion:
- L=Melbourne Base and F!=Transfer: base job from E/H/I.
- Melbourne Base transfers with blank P: skipped by original macro.
- G=Receive, L=Melbourne Base, P nonblank: returns to base.
- Otherwise L is venue; Ship=pickup/transfer-out, Receive=drop-off/transfer-in.
VBA concatenates H per venue/direction; rebuild retains logical transfer activities and their underlying source records rather than concatenated display text as identity.
Paste macro validates A1 TRUE/FALSE and removes occurrences of 00000 from H. Date formats dd-mm-yyyy, dd/mm/yyyy or Excel date values.
The app should detect whether pasted data includes a header row. Group dates independent of row order; report malformed rows and unknown venues; retain raw references before cleanup for identity. The Melbourne Base tests above describe the legacy macro. In the rebuild, recognise the configured base-location set from section 4 rather than hardcoding Melbourne Base or requiring every base name to contain Base. Apply base-job/return/transfer classification using those configured base venues.
Do not inherit silent omission of base-job-only dates or unknown venues. The legacy both-base exclusion must not silently discard interstate activity that the user needs to assign to KIS or Live Event.

### Sample and scope
The example Dump was supplied on 11 November 2026 as paste.txt, distinct from the earlier VBA file with the same filename. It is tab-separated and begins with a data record, not a header. Do not discard the first data record. Address fields contain embedded line breaks; distinguish field content from record boundaries instead of splitting blindly on every newline. The sample is country-wide; normal operational dumps are subregion-scoped.
Prep rows are NOT included in normal operational dumps. They appear only in the oversized example and must not be converted into pickup/drop-off activity. No Prep scheduling workflow is required.
Do not infer operational subregion solely from an address state or automatically drop interstate work. Blank Managed By alone is not a confirmed exclusion rule for otherwise valid venue transfers.

### Same-reference consolidation
For a nonblank reference on the same operational day, combine entries of the SAME activity type into one logical activity, retaining the EARLIEST source time:
- Same reference + date + Ship: one Ship activity at the earliest Ship time.
- Same reference + date + Receive: one Receive activity at the earliest Receive time.
- Ship and Receive remain separate even when they share a reference.
- Different operational dates remain separate.
- Prep rows do not participate in this consolidation.
Example: a reference with Ship at 09:00 and 11:00, and Receive at 14:00 and 16:00, produces Ship at 09:00 and Receive at 14:00 on that day.
Apply consolidation to eligible transfer activity before stop grouping and transfer-count-based combination decisions, so repeated source rows do not inflate the scheduled transfer count. Preserve raw source records for traceability. The earliest SOURCE time is not a user-entered stop lock and must not override existing manually locked stop times.
Blank references must not all collapse into a single activity merely because they are blank; retain them visibly with separate source identities. Exact fallback source identity remains an implementation detail to validate against the sample.

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
Interstate work, such as Melbourne Base to Sydney Base, remains visible and can be assigned by the user to KIS or Live Event through Change run. Assigned activity appears in this external table. Do not automatically allocate a provider merely because the work is interstate, and do not add the destination base to the local configured base set automatically.

## 18. Base jobs
Unassigned bucket below each day. Assign to a vehicle at a locked TWO-HOUR BLOCK CENTRED ON JOB TIME. 15:00 => 14:00–16:00. Preserve source time/reference/description. Assigned job appears in run. Remove sends it back to bucket, not deletion. Pre-break block finish contributes to latest warehouse availability/shared lunch. Persist assignments/removals. Duration editability and automatic insertion relative to lunch remain open.

## 19. Whole-stop split/combine
One-stop venues can be split into pickup/drop-off stops for a day; two-stop venues can combine for a day without changing defaults.
Combine based on count of individual transfers: more pickups => immediately BEFORE lunch; more drop-offs => immediately AFTER lunch. Equal counts => immediately BEFORE lunch. Immediate adjacency takes priority over default route position on the combination action. Afterwards user can move freely. Recalculate shared lunch.
Count logical transfer activities after same-reference/day/direction consolidation, not duplicate source rows.

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
Use localStorage and stable hashes/identities for manual planning. The editable transfer unit is a LOGICAL TRANSFER ACTIVITY after same-reference/day/direction consolidation, not a concatenated display string or every duplicate source row. Preserve underlying source occurrences for traceability.
Proposed entities: logical transfer activity (reference/date/direction/earliest source time/member source records/venue/raw metadata), stop (planning ID/member activity IDs/assignment/order/section/contact/time lock), base job (source identity/centre/block/assignment), day plan (run and stop ordering/overrides/derived shared lunch).
For nonblank transfer references, reference + operational date + Ship/Receive identifies the consolidation group; reference alone is insufficient. Earliest source time is derived from group members, not a mutable planning identity. Source-row identity and blank-reference fallback must avoid accidental merging.
Identity must exclude mutable vehicle/order/time/contact AND whole-dump hash. An unrelated dump change must not discard existing planning. Save override contents as well as hash.
If a transfer disappears from a later Dump, remove it from the current display. The STOP retains assignment, order, contact and time lock; transfers belong to a stop and do not independently retain those overrides. If a duplicate source row disappears but other rows remain in its consolidation group, retain the logical activity and recalculate its earliest source time without resetting stop edits.
Regeneration: parse, apply eligible-row rules, consolidate same-reference/day/direction activities, match identities, restore stop membership/assignments/orders/contacts/locks, default new work, exclude missing work from current display without deleting unrelated changes, flag unresolved references, recalculate unlocked timings/warehouse arrival/60-minute shared lunch/warnings.
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

### App interface design direction (v0.6)
Use the user-supplied Tailwind CSS style reference dated 11 November 2026 for the surrounding app interface. It is a visual reference, not a requirement to adopt a particular CSS framework.
Keep the existing schedule screenshot authoritative for run-table structure, operational colours and Outlook output. The interface styling must not replace or mute the schedule palette above.
- Canvas and structure: white Paper #FFFFFF background; subtle 1px Guide Wash #F2F2F3 rules; clean, compact desktop workspace. Use neutral panels and thin borders rather than heavy shadows or coloured section backgrounds.
- Text: Midnight Ink #030712 headings/navigation, Body Slate #4A5565 supporting copy, Muted Gray #6A7282 secondary metadata and placeholders. Near-black text, with pure black reserved for filled primary actions.
- Typography: Inter with system sans-serif fallback for headings, navigation, forms and body; IBM Plex Mono with system monospace fallback used sparingly for times, references or secondary metadata. Maintain readable schedule text and bold venue names.
- Navigation: compact top bar with Schedules and Configuration, a clear active tab and a small version label. Schedules remains the first page.
- Actions: black #000000 pill-shaped primary buttons with white labels; quieter outlined or text secondary controls. Reference proportions are 14px semibold labels and approximately 40px-high primary controls, adapted for operational density.
- Configuration: clearly grouped panels with restrained 8–16px rounding, consistent spacing and fine borders. Keep vehicles, venues, base settings, route order, archive and import/export easy to scan.
- Spacing: use a consistent 4px-based scale with compact 8–24px working gaps; prioritise useful table width and visible work over marketing-style whitespace.
- Colour: keep surrounding navigation/forms neutral so schedule row semantics and user-facing warnings remain distinguishable.
- Do not reproduce the marketing site's 96px hero, huge section gaps, code-demo windows, decorative class-name annotations or decorative gutters at the expense of working space. No landing-page layout is required.
- Outlook copy remains a bordered, coloured table with the existing four columns and formatting. Do not copy the surrounding app navigation, panels, buttons or other interface decoration.

## 23. Copying/forecast
Copy day per date. Copy all schedules copies ENTIRE selected range inclusive, chronologically, including empty dates displaying “No stops scheduled”, not merely visible cards or a fixed week. Copy all schedules excludes warnings because warnings are user-facing. Include current runs, external activity and base jobs as appropriate. Copy current edited plan without regeneration.
The paste target is Outlook.
Actual formatted tables required: borders, headings, backgrounds, bold sites, wrapping/contacts, not padded plain text. Omit editing icons/buttons/input styles. Proposed rich HTML clipboard with inline formatting plus plain-text fallback; test Outlook rendering.

## 24. Acceptance tests
- Vehicle ownership/type/registration/date validations and per-vehicle weekdays.
- Venue filtered company-owned defaults; independent AM/PM arrows and same-as-morning.
- Archive/restore and complete configuration export/import round-trip.
- Automatically designate the sole venue whose name contains the word Base when no explicit base configuration exists.
- Zero or multiple Base-name candidates do not cause arbitrary automatic selection.
- Selecting another base prompts Change/Add/Cancel with named venues; Change replaces prior designation(s), Add retains them, Cancel changes nothing.
- Adelaide Base and Major Events can both be bases even though Major Events lacks Base in its name; Melbourne can use Melbourne Base alone.
- Explicit base designations survive refresh/export/import and are used for base-job, return and transfer classification.
- Unknown/archived dump venues surfaced without losing pasted data/edits.
- Multiple vehicles; date filter; base-only/external-only dates visible.
- Headerless sample retains its first record; header detection does not assume row 1 is a header.
- Embedded address line breaks do not create phantom rows or shift the key columns.
- Same reference/day Ship entries at 09:00 and 11:00 consolidate to one Ship at 09:00; Receive entries at 14:00 and 16:00 consolidate separately to Receive at 14:00.
- Same reference across dates is not merged; Prep rows create no pickup/drop-off work.
- Blank-reference records are not all merged into one activity.
- Consolidation happens before stop grouping/count comparisons and preserves stop assignment/order/contact/locks on regeneration.
- Removing one duplicate source row retains the logical activity while other group members remain; removing all members removes that activity from display.
- Interstate Melbourne Base to Sydney Base work stays visible and can be assigned to KIS or Live Event without adding Sydney Base to local bases or dropping the activity through legacy both-base filtering.
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
- App navigation and configuration follow the white, thin-ruled, near-black design direction with compact controls and no marketing hero.
- Schedule colours, four-column structure, borders and bold sites remain intact despite the neutral app interface.
- Outlook output retains schedule formatting and excludes surrounding interface decoration.

## 25. Remaining decisions
Lunch duration is RESOLVED: one hour.
Stop split/join conflict rules are RESOLVED: selected time determines time, position and lock status; user selects vehicle and contact where they differ; cargo is retained from all source stops.
Timing and shift rules are RESOLVED: 09:00 start, 17:00 target finish, 30-minute city stops, 60-minute regional stops, 30-minute city return, 60-minute regional return, immediate run end, afternoon-only drivers start at lunch end.
Equal-count combination is RESOLVED: immediately before lunch.
Time-column delink is RESOLVED: only on orange combined stops; creates red pickup and green drop-off.
Multi-target joins are RESOLVED: join all compatible same-venue same-day targets.
Dump header detection is RESOLVED: app detects header presence; supplied sample is headerless and begins with data.
Dump sample is RECEIVED: nationwide example supplied 11 November 2026; normal dumps are subregion-scoped and contain no Prep rows. Embedded line breaks require record-aware parsing.
Repeated transfer references are RESOLVED: consolidate by reference + operational date + Ship/Receive, retaining earliest source time; directions and dates remain separate.
Interstate work is RESOLVED: retain for user assignment to KIS or Live Event; no automatic state/address filtering or destination-base designation.
Venue identity is RESOLVED: venue name is sufficient.
Base designation is RESOLVED: configure one or more base venues in Configuration > Venues; automatically designate a sole Base-name candidate only when no explicit base configuration exists; selecting another base prompts Change/Add/Cancel. Explicit designation, not the venue name, controls base recognition.
Missing transfers are RESOLVED: removed from display; stop retains assignment/order/contact/lock.
Unavailable default vehicle fallback is RESOLVED: rental same type, company same type, rental different type; van-on-truck flagged.
Public holidays are RESOLVED: user-facing flags only.
Configuration import is RESOLVED: overwrites existing configuration.
Full schedule backup is RESOLVED: separate export on Schedules tab.
Copy target is RESOLVED: Outlook.
Copy-all warnings are RESOLVED: excluded.
Empty-date text is RESOLVED: “No stops scheduled”.
Built-in providers are RESOLVED: Uber, KIS and Live Event cannot be edited or deleted; additional providers are user-created.
Interface design direction is RESOLVED: adapt the supplied Tailwind CSS style reference to a compact desktop app; preserve screenshot-based operational tables and Outlook output separately.
Still open: public-holiday provider/coverage years/regional handling; validation of parser edge cases/source identities against the supplied sample; full schedule backup file format/schema; Outlook HTML rendering details; exact one-week default end date; exact route reinsertion after archive restore; base-job duration editability and automatic insertion relative to lunch; vehicle run-block ordering clarification.

## 26. Sources and implementation status
Requirements conversation dated 10–11 November 2026; supplied paste.txt VBA; supplied image.jpeg schedule reference; supplied Tailwind CSS — Style Reference (pasted_text_1794338130.txt) dated 11 November 2026; example Dump supplied as a separate paste.txt on 11 November 2026. This document is the specification, not a claim that these features or styles have been implemented. Committing this specification does not implement or deploy the app.
