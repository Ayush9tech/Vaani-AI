# Vaani AI

**🚀 Live Deployment:** [https://vaani-ai-rho.vercel.app](https://vaani-ai-rho.vercel.app)

A bilingual, voice-first interview-readiness PWA for an NCS-focused Ministry of Labour & Employment Ideathon proposal. Independent prototype; no government affiliation or live NCS connection is claimed.

## Start the full stack

Requirements: Docker with Compose. From the repository root:

```bash
cp .env.example .env
docker compose up --build
```

Open **http://localhost:8080**. The stack contains the React/Tailwind PWA, a FastAPI API and PostgreSQL 16 with a named persistent volume. PostgreSQL and the API are reachable only inside the Compose network. To expose a deployment, configure HTTPS, a private database password, `ALLOWED_ORIGINS`, and `COOKIE_SECURE=true`. Microphone capture and installation require HTTPS or localhost.

For live LLM coaching, put an API key in the **server-side** `OPENAI_API_KEY` setting, then enable **Privacy & preferences → Live AI coaching**. The optional default model is `gpt-4o-mini`; `OPENAI_MODEL` can select another model supporting strict JSON-schema output. Never place the key in frontend code. Without a key or during provider failures, the app uses an explicitly labelled local practice rubric.

## Included journeys

- 40 clearly labelled mock vacancies across eight sectors, searchable in English or Hindi.
- Client-side text/PDF resume extraction (5 MB, 10 pages), mock NCS import, spoken experience, skill evidence and gap list. Scanned PDFs display a clear text-paste fallback.
- Seven-question text or voice interview, role-specific practical and STAR questions, feedback after each answer, and a final scorecard.
- Working speech synthesis and speech recognition adapters with browser support/permission fallbacks. The browser vendor may process speech online.
- Browser-only missed-call simulation with callback, Hindi/English keypad choice and the same spoken practice pipeline. No actual calls or phone-number collection.
- Four scenario exercises. Live AI grades strict structured output when configured; the demo uses documented option scores.
- History, streaks, role-specific readiness and badge unlock after three completed same-role interviews in a row at 75+. Sample data never unlocks a badge. A downloadable SVG badge can be added to a **mock** NCS profile.
- Service worker precaches the built shell. Scores have a local offline copy. Speech services and live AI may require connectivity. Audio, resumes, answers and transcripts are never persisted by Vaani.

## Two deployment surfaces

| Surface | Frontend/API | Durable scores |
| --- | --- | --- |
| Hosted click-through demo | React/Tailwind with a Cloudflare-compatible API facade | D1, scoped to an opaque HttpOnly browser cookie |
| Docker full stack | React/Tailwind PWA + Python FastAPI | PostgreSQL via SQLAlchemy |

The hosted environment does not execute Python. The included FastAPI/PostgreSQL stack is the requested self-hostable deployment. Set the hosted server's `FASTAPI_URL` to an HTTPS FastAPI origin to use that backend instead of the hosted API facade. Forwarding preserves the opaque browser profile cookie. There is no hidden switch claiming D1 is PostgreSQL.

## Development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The registered hosted project uses the supplied Sites build/deployment scripts. For a portable static PWA build:

```bash
pnpm run build:pwa
```

The standalone build emits `frontend-dist/standalone.html`; the frontend Dockerfile renames it to `index.html` and Nginx proxies `/api/` to FastAPI.

To run FastAPI directly:

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.lock
export DATABASE_URL='postgresql+psycopg://vaani:YOUR_PASSWORD@localhost:5432/vaani'
PYTHONPATH=backend uvicorn app.main:app --host 127.0.0.1 --port 8000
```

API documentation: `/docs` on the FastAPI origin. `GET /api/health` reports storage and key configuration without disclosing secrets.

## Code map

- `components/vaani/app.tsx`: accessible bilingual journey and UI state.
- `lib/vaani/data.ts`: shared role expansion, question templates, explicit demo scoring, readiness rules.
- `data/`: role catalogue, exported bilingual banks and scenarios for Python.
- `lib/vaani/speech.ts`: `SpeechAdapter`, Web Speech implementation, live Web Audio features.
- `app/api/coach/route.ts`: hosted facade, strict schema validation, optional AI requests and score storage.
- `backend/app/`: FastAPI, Pydantic schemas, AI provider, privacy-scoped PostgreSQL storage.
- `public/sw.js` and `scripts/generate-precache.mjs`: offline shell; API responses are never cached.
- `docs/`: architecture, validation and 90-second demo script.

## Privacy and scoring boundaries

Microphone permission is explicit and visit-scoped. No `MediaRecorder` recording is made: the app uses live Web Audio buffers for features and releases them when capture stops. Web Speech may use the browser vendor's speech service; the consent notice says so. Only numeric score summaries, role, mode and date are persisted. Transcripts are temporary. “Delete my recordings” stops capture and clears in-memory audio/transcript data; “Start fresh” also deletes saved scores.

Live AI text processing is opt-in and server-side. Provider retention policy is separate from Vaani’s storage. The database schema contains no audio, resume, answer or transcript columns. Prototype consent/minimisation/deletion choices are informed by the DPDP Act, 2023; this is not a claim of certified legal compliance.

Pace, pauses and pitch variance produce an approximate **voice delivery** coaching score. Text answers and insufficient audio use `null` for this metric. It is not a measurement of personality, honesty, accent quality or psychological confidence. Local fit is declared-skill overlap, not eligibility. LLM schemas constrain shape and ranges; they do not guarantee truth or eliminate model bias.

The peer-benchmark card is explicitly illustrative. No real peer data is collected or fabricated. A production version would need opt-in aggregation, small-cohort suppression, audited rubrics, accessible speech options, and authenticated NCS integration.

## Speech adapter / Bhashini handoff

`SpeechAdapter` defines `supported`, `speak`, `stopSpeaking`, `listen`, `stop`, and `clear`. The current provider is `BrowserSpeechAdapter`. A production `BhashiniSpeechAdapter` or Whisper adapter must implement this same interface, using a server-side broker and its own explicit processing notice. No Bhashini endpoint, credentials or language coverage are invented. NCS OAuth/profile-write APIs and a telephony provider are integration boundaries, not live services in this prototype.

## Technical references

- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs): strict response schemas plus server-side validation.
- [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition): browser support and service-based recognition considerations.

See `docs/VALIDATION.md` for checks completed and remaining integration limits.
