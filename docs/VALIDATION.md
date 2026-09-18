# Validation record

## Completed

- TypeScript check and both hosted and standalone production builds succeeded.
- FastAPI integration checks: **4 passed**. Coverage includes 40 roles, seven bilingual questions, consent refusal, fit evidence, absent/insufficient audio yielding null confidence, invalid metrics, independent browser histories, idempotent session saves, deletion, cross-origin rejection, and in-memory resume extraction.
- PDF.js extracted expected skill text from a synthetic PDF resume. Browser file-chooser automation stalled; parsing was verified separately rather than claiming the browser upload check passed.
- A full browser interview completed all seven answers, produced an 88/100 scorecard, and appeared in progress after reload. After the browser test session restarted, the private stored history was retrieved again.
- All four soft-skills scenarios were completed in the browser, produced feedback, and saved a final 95/100 practice result.
- English and Hindi layouts were inspected in a 360-pixel iframe (345-pixel content area after the scrollbar). The dashboard and Hindi job-fit screen had matching client/scroll widths with no horizontal overflow. The temporary QA route was removed before publication.
- Badge invariants verified: three 75+ completed interviews for the same role unlock; sample history, a sub-75 latest result, other roles, or incomplete interviews do not.
- Generated offline precache includes the production JavaScript and CSS. PDF code is lazy-loaded. API responses are excluded from caching.
- Five screenshot deliverables and a timed 196-word walkthrough script are included.

## Integration limits

- No live LLM key was available. API adapters and strict output validation are implemented; paid provider execution was not exercised. Runtime scores visibly use the demo rubric until a key is configured and processing is enabled.
- Actual microphone capture and PWA installation could not be exercised in the HTTP-only internal browser preview. Use HTTPS or localhost and a compatible browser for those capabilities. Audio-provider availability and Hindi voices vary by browser and operating system.
- The PostgreSQL Compose deployment is supplied; Docker/PostgreSQL are not installed in the authoring environment, so the Python integration suite used an isolated SQLite database. Hosted durable scores use D1, as documented, not PostgreSQL.
- WebMCP actions are feature-detected and registered when supported, but this test browser did not expose `document.modelContext`; tool invocation could not be validated here.
- IVR, NCS import/profile update and benchmark text are clearly labelled simulations/examples. No real telephone call, government API operation or peer ranking took place.
