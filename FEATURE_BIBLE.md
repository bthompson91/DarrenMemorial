# Darren Langsford Memorial Milkrun Generator
# Feature Bible
Version 0.9 — 11 November 2026

## Specification baseline and precedence
All requirements, palettes, source-column mappings, acceptance tests and outstanding decisions in Feature Bible v0.7 remain part of this specification except where explicitly superseded below. The complete immutable baseline is retained in Git history:
https://github.com/bthompson91/DarrenMemorial/blob/57f5a142af9bacf04990c645836e91a597264bcb/FEATURE_BIBLE.md

This edition retains the v0.8 amendments in sections 1–5 and adds the v0.9 clarifications and action register in sections 7–10. Read the v0.7 baseline together with these amendments; v0.9 takes precedence over v0.8, which takes precedence over v0.7, wherever they conflict. No inherited requirement is waived merely because it is not repeated in the action register. Previous revision history is retained in the baseline.

## Revision 0.9
Recorded all 21 outstanding implementation action points and a separate verification checklist, as requested on 11 November 2026 at 12:36 AEDT. Incorporated confirmed local-base loading/unloading treatment, travel-inclusive base-job blocks, retained pickup locks after splitting, free manual ordering, scheduling-only locked-row borders and Change run wording. This is a documentation update, not implementation of the listed changes.

## Revision 0.8
Confirmed first-stop departure allowance, exclusion of completed drivers from shared lunch, fixed venue-access commitments, rescheduling unlocked work around commitments, and morning fallback when no runs have morning work. Added explicit acceptance tests and implementation-status distinctions.

## 1. First-stop timing
The first venue stop is 30 minutes after run start. A 09:00 run starts at base at 09:00 and reaches its first venue stop at 09:30.
This initial allowance is 30 minutes, including when the first venue is regional; it is separate from venue stop duration and return-to-base allowance. City stops remain 30 minutes, regional stops 60 minutes; city return travel remains 30 minutes and regional return travel 60 minutes.
Fixed source-defined commitments and manually locked times are not silently shifted to meet a generated default.

## 2. Drivers who finish before lunch
When a driver completes all work before lunch and has no post-lunch activity, the driver returns to base and ends the run immediately.
Do not display lunch for that driver. Do not include that driver's return time in the shared-lunch calculation for continuing drivers.
Shared lunch remains one 60-minute event for participating drivers who have further work afterwards. Its start is the latest warehouse-return time after their pre-break commitments and return allowances.
Afternoon-only drivers start when the shared lunch ends. A second base venue record in the same building does not create another lunch group.
If all drivers have completed all work, there is no shared lunch to generate.
This supersedes any v0.7 wording implying that every morning driver must participate in lunch or that an end-of-run row precedes that driver's lunch.

## 3. Fixed commitments and venue access
Base jobs happen at their source-defined times because those times reflect venue access. Retain the locked two-hour block centred on the job time: 15:00 means 14:00–16:00. Do not move it to preserve a route order, a default morning/afternoon division, or a preferred lunch time.
Manually locked stop times are also fixed.
Schedule unlocked activity around all fixed commitments. Unlocked stops may shift earlier or later, be reordered, or cross the lunch boundary where required. Pickup-before-lunch and drop-off-after-lunch remain initial defaults rather than prohibitions overriding fixed commitments.
A fixed base job is not classified solely by an arbitrary noon threshold. Its actual block and relationship to other work must determine placement. Pre-lunch fixed commitments contribute to warehouse availability for lunch only for participating drivers.
Do not schedule unlocked activity over a fixed commitment and merely warn about that avoidable overlap.
If fixed commitments themselves conflict, keep both at their fixed times, show the conflict and allow the user to resolve it. Do not silently move either or block the operational plan.
All other advisory warnings remain: lunch more than four hours into shift, shift exceeding eleven hours, run past 17:00, and applicable vehicle/availability conflicts. These do not automatically prohibit user decisions.

## 4. No-morning-work fallback
If there is no morning work across any vehicle run, move unlocked drop-offs into the morning and build schedules around them.
Use 09:00 starts with the first venue stop at 09:30. Preserve fixed base jobs and manually locked drop-off times while fitting unlocked activity around them.
Drivers who finish all resulting work return and end their runs without lunch. Shared lunch is only generated for drivers who continue working afterwards.
This fallback applies across all runs, not merely because one individual vehicle lacks pickups. Preserve source Ship/Receive direction; moving a drop-off to the morning does not turn it into a pickup.

## 5. Additional acceptance tests
- A normal 09:00 run has its first venue stop at 09:30, not 09:00.
- The same initial 30-minute allowance applies before a first regional stop; its 60-minute stop duration and regional return allowance remain separate.
- A driver with morning work only returns to base and ends the run without a lunch row.
- A completed driver's late return does not delay the shared lunch of continuing drivers.
- All drivers finished means no shared lunch is generated.
- Continuing drivers share exactly 60 minutes of lunch based on their latest required warehouse return.
- Afternoon-only drivers start at the shared lunch end when a shared lunch exists.
- A 15:00 base job remains 14:00–16:00 after generation, edits, reordering and regeneration.
- Unlocked work moves around fixed base jobs and locked stops rather than occupying those blocks.
- An unlocked stop can cross the lunch boundary when required to fit around fixed commitments.
- A base job is not forcibly assigned to AM or PM using noon alone.
- Two overlapping fixed commitments remain fixed, visible and warned.
- If every run initially lacks morning work, unlocked drop-offs move to the morning, with their transfer directions unchanged.
- The no-morning-work fallback does not move a manually locked drop-off.
- If only one run lacks morning work while another has morning work, do not globally invoke this fallback.
- All applicable v0.7 acceptance tests continue to apply.

## 6. Historical source and implementation status (v0.8)
The following snapshot records the implementation status when v0.8 was written. It is retained for history, not a description of the current production entry point. See section 10 for the later recorded checkpoint.

Sources: the v0.7 baseline, previously supplied VBA, schedule screenshot, design reference and example dump, and user clarifications on 11 November 2026.

The repository's existing index.html remains the partial browser prototype. The newly added core.js is a standalone development module; index.html does not load it. core-tests.cjs exercises selected core behaviours. Neither these files nor their tests establish feature completeness.

IMPORTANT: core.js was developed before the v0.8 clarifications. Its current plan function still starts unlocked AM work at 09:00, includes morning-only drivers in lunch calculations and does not pack unlocked work around future fixed commitments. These are known noncompliances to correct before integration, not authorised exceptions to this specification.

The latest accepted rules above are specification changes; this commit does not claim they are implemented. Remaining v0.7 work, the previously identified UI gaps, holiday coverage, full backup validation, browser integration and Outlook verification are not complete.

## 7. Confirmed operational clarifications (v0.9)
- Local-base transfers are warehouse loading/unloading activity, not extra venue visits. Morning collections return to base, gear is unloaded and sorted, warehouse-originating gear is added, and outgoing loads leave for deliveries. Preserve the source/load records without creating duplicate stops, stop durations or travel allowances for the local-base transfer rows. Keep warehouse start, return/unload, lunch, afternoon departure and finish markers. Apply the configured local-base set, not a hardcoded name. A remote destination such as Sydney Base is still destination work unless explicitly configured as a local base. Actual base jobs remain distinct and assignable.
- The fixed two-hour base-job block already includes travel to and from the job. A 15:00 job occupies 14:00–16:00 with no additional travel allowance outside that block. Other activity may finish at 14:00 or resume at 16:00 subject to its own timing requirements. Do not silently add an extra loading/sorting duration; no separate duration has been agreed.
- Splitting a locked combined stop retains the pickup's original time AND its locked status. The drop-off is unlocked and initially follows immediately after the pickup. This overrides the earlier blanket statement that both resulting stops unlock.
- Generated lunch must not overlap a participating driver's fixed commitment. Recalculate the shared break and unlocked work around commitments and warehouse-return requirements; do not merely warn about an avoidable generated-lunch overlap. Preserve genuinely conflicting fixed commitments and flag them.
- Manual ordering must work across the lunch boundary for unlocked stops. AM/PM defaults are not restrictions that silently undo the user's chosen sequence. Fixed times remain fixed, with any resulting incompatibility visible.
- Locked rows, including fixed base jobs, receive a thicker whole-row border on the scheduling page only. Copy/paste output retains normal borders and operational colours.
- Use Change run as the visible button label. Use Unassign for removing a base job's assignment; bucket is an internal concept and must not appear in user-facing wording.
- Onsite contact edits belong to the generated stop and use a pencil button next to the contact, not a control in the Time column. Such edits do not change the venue default. Day headings use DDD DD MMM, for example Wed 11 Nov.

## 8. Outstanding implementation action register
All items below are outstanding at the time this register is created. Some have partial implementations; an unchecked item means its complete acceptance criteria are not yet satisfied. Work through the numbered items individually in the order below, retaining existing features. No additional operational clarification is currently required for these items. Record implementation commits and verification separately; do not mark the whole app complete after a partial fix.

### Immediate operational fixes
- [ ] AP-01 — Remove configured local-base transfers as separate venue stops. Associate base-originating and base-returning gear with warehouse loading/unloading without additional visits or allowances; preserve the underlying records. Keep actual two-hour base jobs and remote destinations distinct. Apply every configured local base. Existing generated plans must reconcile without losing unrelated manual edits.
- [ ] AP-02 — Make manual stop ordering work properly. Up/down movement must change the actual plan, including moving unlocked work across lunch. Do not silently restore the former AM/PM grouping. Preserve locked times and show conflicts when a requested order cannot coexist with fixed commitments.
- [ ] AP-03 — Schedule unlocked work around fixed commitments. Keep base jobs in their source-centred, travel-inclusive two-hour blocks and locked stops at their fixed times. Fit unlocked activity around them, allowing reordering and lunch-boundary changes rather than avoidable overlap or unnecessary end-of-day deferral.
- [ ] AP-04 — Correct shared lunch calculation. Generate one shared, non-overlapping 60-minute lunch for continuing drivers after required warehouse returns and around their fixed commitments. Exclude completed drivers; start afternoon-only drivers at lunch end; recalculate after edits. Preserve the no-morning-work fallback.
- [ ] AP-05 — Fix base-job-only and fixed-work start-time cases. A run-start marker must not appear after work already assigned to the driver. Do not classify early fixed jobs as afternoon-only merely because there are no morning venue stops. Preserve standard starts and afternoon-only behaviour where applicable.
- [ ] AP-06 — Show warehouse return/unload explicitly and render chronologically. Display return/unload, lunch, afternoon departure, venue stops and fixed jobs together in their proper time positions. Keep genuine fixed-time conflicts visible and flagged. End runs immediately after final work and the required return.
- [ ] AP-07 — Add the locked-row visual cue. Use a thicker whole-row border for manually locked stops and fixed base-job rows in the scheduling UI only. Keep normal borders in copied output and retain operational row colours.
- [ ] AP-08 — Restore the full button label. Replace Run with Change run wherever it is the stop reassignment control, including applicable run, external and unassigned sections.

### Split, join and transfer editing
- [ ] AP-09 — Finish locked-stop split placement. The pickup retains the original locked time and lock status. The drop-off is unlocked and initially immediately follows it, not merely placed somewhere in the same section. Preserve venue, assignment, contact and transfer membership.
- [ ] AP-10 — Finish unlocked split and combine placement. Initially place an unlocked split's pickup immediately before lunch and drop-off immediately after. Place an unlocked combined stop immediately before or after lunch according to logical transfer counts; equal counts go before. Preserve later manual movement and recalculate lunch.
- [ ] AP-11 — Finish join-time and conflict handling. Explicitly identify conflicting locked times when applicable. The selected source stop determines retained time, run-order position and lock status. Preserve all transfer membership and the user's chosen vehicle and contact.
- [ ] AP-12 — Complete individual-reference rejoin behaviour. Keep reference-level unlink/rejoin distinct from whole-stop pickup/drop-off splitting. Join all compatible same-venue/day targets as specified, retaining cargo, membership and resolved stop choices without duplication. Chain icons alone do not establish acceptance.

### Configuration and regeneration reliability
- [ ] AP-13 — Repair unknown-venue configuration and restoration. Configuring an unknown venue must correctly default its unresolved existing work without overwriting manual planning. Archived matches offer restoration rather than duplicate creation. If a restored venue's former vehicle was deleted, leave a valid unassigned default.
- [ ] AP-14 — Make venue renaming survive regeneration. A renamed venue must not return under its old name as unknown work after the next generation. Preserve surviving stop identities and manual overrides and reconcile stored source activity appropriately.
- [ ] AP-15 — Replace the availability-period JSON editor. Provide proper start/end/reason rows with add, edit and remove controls. Flag overlapping restriction periods advisorially and recognise their combined unavailability without prohibiting operational judgement.
- [ ] AP-16 — Make vehicle fields conditional. Show ownership, registration and rental dates only where applicable. Courier/Freight providers must not require irrelevant truck/van ownership fields. Preserve company registration requirements and per-vehicle weekday checkboxes.
- [ ] AP-17 — Set the initial date range to a week. Use today through today + 6 days inclusive on initial setup. Do not reset existing saved choices or discard parsed source data when the display range changes.

### Data handling, backups and output
- [ ] AP-18 — Harden dump parsing and blank-reference matching. Reject invalid times such as 09:99, report malformed records clearly, and prevent unrelated source changes from misapplying blank-reference planning. Preserve the headerless first record, embedded line breaks, raw references, reference/day/direction consolidation and underlying source records. Do not filter away interstate work.
- [ ] AP-19 — Complete backup validation and safe replacement. Validate the full supported configuration/schedule structure before replacement. Invalid imports must leave the current state unchanged. Preserve base settings, availability, active/archived venues, route/run order, memberships, assignments, contacts and timing/grouping overrides. Keep configuration and full-schedule backups separate.
- [ ] AP-20 — Complete clipboard-copy fallback. Preserve formatted Outlook tables where supported; provide a usable fallback and clear feedback if rich clipboard writing is unavailable. Exclude edit controls, user-facing warnings and locked-row emphasis from copied output. Preserve selected-range copying, empty dates, external activity and base jobs as applicable.
- [ ] AP-21 — Finish typography details. Load and apply the specified Inter and restrained IBM Plex Mono typography rather than only naming unavailable fonts in CSS. Keep the interface compact and preserve the operational schedule palette and output formatting.

## 9. Outstanding verification checklist
These are verification obligations, not declarations that the corresponding whole features are absent. The user will perform operational/browser testing after implementation. Development syntax checks and targeted regression checks remain part of delivering each implementation step.

- [ ] V-01 — Verify required holiday coverage for Australia, Fiji, New Zealand, Singapore, Malaysia, Hong Kong and Thailand, including applicable subdivisions and observed days. Holiday flags must not cancel or move work. A selectable state is not proof that holiday data loaded or is correct.
- [ ] V-02 — Verify complete configuration and full-schedule export/import round trips, including cross-device use and invalid-import nonreplacement.
- [ ] V-03 — Verify persistence after reordering, reassignment, lock changes, split/join, venue changes, navigation, refresh and dump regeneration, including disappearing source activities and surviving overrides.
- [ ] V-04 — Verify actual Outlook rendering: four bordered coloured columns, headings, contacts, wrapping and empty dates, with no edit controls, warnings or locked-row emphasis.
- [ ] V-05 — Verify production deployment serves the intended commit and assets. A successful repository write is not a verified deployment.
- [ ] V-06 — Check the inherited v0.7 and v0.8 acceptance requirements together with sections 7–8. A small passing regression suite is not full Bible acceptance. Record user-test results and defects without weakening the specification.

## 10. Recorded implementation checkpoint and action tracking
The integrated app replaced the earlier prototype in commit afb124a. The compact interface update was committed to main as 526fe4c46aba3541856459072f174fc889daaeda. These are recorded repository checkpoints, not proof of successful deployment or complete acceptance.

The latter update added weekday checkboxes, compact configuration/route tables, the PM-header Same as morning checkbox, clipboard paste with manual-paste fallback, directly visible country/state selectors, date headings, inline transfer icons, a single padlock toggle, pencil editing next to the generated stop contact, and Unassign wording. Do not relist those presentation features as wholly absent; the unchecked items above identify their remaining behavioural requirements and other outstanding work.

The local-base correction, scheduler corrections, scheduling-only locked-row borders and Change run label requested after that update were not yet committed when this action register was created. No action point is marked complete by this documentation commit. For each subsequent action point, record the implementation commit, developer checks, user verification result and any remaining limitations separately.
