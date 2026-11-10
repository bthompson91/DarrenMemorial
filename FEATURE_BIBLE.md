# Darren Langsford Memorial Milkrun Generator
# Feature Bible
Version 0.8 — 11 November 2026

## Specification baseline and precedence
All requirements, palettes, source-column mappings, acceptance tests and outstanding decisions in Feature Bible v0.7 remain part of this specification except where explicitly superseded below. The complete immutable baseline is retained in Git history:
https://github.com/bthompson91/DarrenMemorial/blob/57f5a142af9bacf04990c645836e91a597264bcb/FEATURE_BIBLE.md

This edition is a versioned amendment to that complete baseline, not permission to omit its features. Read v0.7 together with these amendments; v0.8 takes precedence wherever they conflict. Previous revision history is retained in the baseline.

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

## 6. Source and implementation status
Sources: the v0.7 baseline, previously supplied VBA, schedule screenshot, design reference and example dump, and user clarifications on 11 November 2026.

The repository's existing index.html remains the partial browser prototype. The newly added core.js is a standalone development module; index.html does not load it. core-tests.cjs exercises selected core behaviours. Neither these files nor their tests establish feature completeness.

IMPORTANT: core.js was developed before the v0.8 clarifications. Its current plan function still starts unlocked AM work at 09:00, includes morning-only drivers in lunch calculations and does not pack unlocked work around future fixed commitments. These are known noncompliances to correct before integration, not authorised exceptions to this specification.

The latest accepted rules above are specification changes; this commit does not claim they are implemented. Remaining v0.7 work, the previously identified UI gaps, holiday coverage, full backup validation, browser integration and Outlook verification are not complete.
