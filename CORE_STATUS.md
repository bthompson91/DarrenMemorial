# Standalone core development status

Run the baseline tests with `node core-tests.cjs`.

The original 12 tests passed in Node.js during development on 11 November 2026. They exercise selected pre-v0.8 core behaviours, not the full browser app. Some lunch scenarios in this baseline suite reflect the earlier rules and must be revised for v0.8.

`core.js` is not loaded by `index.html`. Its data model uses direction/reference/centre fields rather than the prototype's kind/ref/time fields; integration requires an explicit adapter or migration.

Known gaps: first stop still defaults to 09:00; finished morning-only drivers still affect lunch; no unlocked-task packing around future fixed commitments; no all-drop-offs morning fallback; no full venue/vehicle CRUD or default route UI; no holiday dataset; incomplete backup validation; no browser or Outlook verification. Blank-source identities currently depend on input position and require stable matching before integration.

Do not describe this commit as a feature-complete app or a deployed v0.8 scheduler. The Feature Bible v0.8 is normative; this development code does not supersede it.
