# Architecture and handoff

The frontend is a React PWA styled with Tailwind and shared accessible UI primitives. Practice content is bilingual. Both hosting surfaces use the same request/response contract:

- `POST /api/coach` with `task: questions | fit | grade | scenario` for coaching.
- `POST /api/coach` with `task: save-session | history | delete-history` for private score summaries.
- FastAPI also exposes `GET /api/roles`, `GET /api/health`, and consent-gated `POST /api/resume`.

Scores are numeric bounded fields with Pydantic/Zod validation. Live model requests use `response_format: json_schema`, `strict: true`, and `additionalProperties: false`. Backend recomputation constrains fit to known role skills and keeps audio confidence null unless measured speech exists. An invalid, refused or unavailable model response falls back to the labelled demo rubric.

## Skill extraction

`jobFit`/`core.fit` form a deterministic dictionary/alias skill recogniser. Its output is known skill spans and gaps; it does not infer unstated experience or qualifications. This normalised skill-vocabulary boundary can be shared with Disha AI and replaced with an audited NER model. No trained skill-NER model is claimed in this prototype.

## Audio lifecycle

1. User chooses a speech action and explicitly enables visit-scoped microphone consent.
2. Browser asks for permission. Web Speech performs ASR; its provider may process speech online.
3. Web Audio samples amplitude and autocorrelation at 10 Hz. It estimates voiced frames, pauses of at least 0.8 seconds, and pitch variance in Hz².
4. When capture stops, tracks are stopped, audio context is closed, the timer is cleared and audio buffers are zeroed. No recording Blob is produced or stored.
5. Word count / actual capture duration estimates speaking pace. A small explicit filler lexicon is used for English and Hindi.
6. Current transcript is shown for correction. Transcripts clear on the next answer or leaving the session. Only numeric aggregate scores are stored.

Voice-delivery scoring is a rough coaching proxy. Noise, microphone quality, speech differences, low pitch tracking reliability and language can change the estimate. The UI does not claim it measures a person's actual confidence. Fewer than 8 seconds or 12 voiced frames leaves the metric unscored.

## Persistence and identity

An unpredictable HttpOnly, SameSite cookie scopes scores to this browser. Only its SHA-256 hash is used as the database owner identifier. No phone number, Aadhaar, email or identifying NCS record is collected. This is anonymous browser continuity, not cross-device user authentication. Local scores support intermittent connectivity; completed online sessions sync to durable storage. The user's answers, resume and audio are never database fields.

The badge is based on actual completed sessions in the current role; sample rows and incomplete sessions are excluded. Because this prototype accepts client-calculated practice summaries, the badge is an explicitly unverified self-assessment. A real credential would need authenticated, server-issued session results and NCS authorisation.

## Integration boundaries

| Integration | Prototype | Production work |
| --- | --- | --- |
| ASR/TTS | `BrowserSpeechAdapter` | Implement the same `SpeechAdapter` interface for authorised Bhashini/Whisper services; local-language QA and updated processing notice |
| LLM | Strict JSON schema API adapter plus transparent fallback | Enable server-side key, evaluate score consistency/bias, configure provider retention and spending controls |
| NCS | Mock profile and badge update | Authenticated profile/skills consent and official API access |
| Telephony | Callback and language keypad simulation | Authorised telephone provider, consent/retention handling and real call streaming |
| Peer benchmark | Clearly labelled example | Opt-in anonymised same-sector weekly cohort, minimum group size and suppression rules |
| Database | Hosted D1 demo; Docker PostgreSQL | Managed PostgreSQL, backups, migration lifecycle and authenticated NCS identities |

## Validation boundaries

`strict` JSON schemas prevent malformed result shapes, not fabricated meaning. Demo scores remain illustrative coaching, not selection advice. DPDP-related design controls are implemented, but a production deployment requires review of its actual processors, data flows and current obligations.
