# Integrated production build

index.html now loads planner.js and scheduler.js. The historical core.js and core-tests.cjs are not loaded by the app.

The scheduler has 13 Node regression tests for v0.8 timing, finished-driver lunch exclusion, fixed commitments, drop-off fallback, dates, availability and parsing. The workflow runs these and JavaScript syntax validation before deployment.

This replaces the earlier partial production entry point. Existing prototype localStorage uses the same key; direction/phase fields are normalised on load. Export current backups before editing operational work.

No full browser end-to-end test or real Outlook paste test has been performed. This is an integrated operational candidate, not a claim of complete Feature Bible acceptance. Source returns classification, split-placement edge cases and backup validation need further acceptance coverage. Venue-name edits do not rewrite the original source dump. Blank-source record matching may be ambiguous.

Holiday data is bundled by GitHub Actions where installation succeeds; failed holiday installation is shown in the app as unavailable, not represented as no holidays. Dataset source and attribution: https://github.com/commenthol/date-holidays (ISC code / CC BY-SA 3.0 data). Package metadata and relevant license files are retained with the deployment where available. Coverage depends on the dataset; newly announced and lunar-calendar holidays need official verification.

Deployment is successful only when GitHub Actions reports success. GitHub Pages may require Settings > Pages > Source: GitHub Actions; committing this workflow does not establish the setting or prove a live deployment.
