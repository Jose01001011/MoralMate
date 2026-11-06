# MoralMate

A human-centred AI prototype for triaging student support requests at the Namibia University of Science and Technology (NUST). Built for HCA820S Human-Centred Artificial Intelligence.

MoralMate holds a short conversation with a student, classifies the request, explains every decision in plain language, and keeps people in control. Safety, wellbeing and misconduct concerns are never handled by the assistant. For one routine, lower-stakes decision (pre-assessing an assignment extension request) it uses two different reasoning approaches and compares them.

## Running it

You need Node.js 18 or later. Open two terminals.

```
cd moralmate-backend
npm install
npm run dev          # API on http://localhost:4000
```

```
cd moralmate-frontend
npm install
npm run dev          # app on http://localhost:5173
```

Other backend commands:

```
npm test             # 26 automated tests (guard, rules, agent, Gemini safeguards, API, accountability)
npm run evaluate     # regenerates evaluation/engine-comparison.md and evaluation/fairness-report.md
```

Gemini is off by default. To enable it, copy `moralmate-backend/.env.example` to `.env` and set `GEMINI_API_KEY`. With a key, Gemini writes the replies to routine academic and administrative questions (and follow-ups to them) and words clarifying questions. MoralMate's own rules still classify every message first, and sensitive messages never reach Gemini. Without a key the scripted agent runs on its own.

## How it is built

```
moralmate-backend/
  src/guard.js                 Escalation guard: zero-automation zone, runs first on every turn
  src/engine.js                Top-down intake triage (privacy, academic, administrative, general)
  src/agent.js                 Conversational agent: clarifying questions, slot filling, session lock
  src/gemini.js                Gemini client and MoralMate system instruction
  src/llm.js                   Gemini safeguards: routine-only replies, history re-check, output re-check, fallback
  src/extension/features.js    Extracts reason, documentation, days, timing from free text
  src/extension/rules.js       Top-down decision rules R1 to R8
  src/extension/learned.js     Bottom-up naive Bayes classifier trained on labelled examples
  src/extension/assess.js      Runs both, reconciles (disagreement always goes to a lecturer)
  src/store.js                 Saved requests and append-only audit log
  src/resources.js             Escalation contacts (must be verified before real use)
  src/i18n.js                  Agent phrase table (English in use; structure ready for other languages)
  data/                        Synthetic training, test and fairness datasets
  scripts/                     Engine comparison and fairness evaluation
  evaluation/                  Generated results (baseline/ holds the first run)
  test/                        Automated tests
moralmate-frontend/
  src/components/ChatPanel.jsx         Assistant with "Why this answer?" and "Talk to a person"
  src/components/SubmitRequestForm.jsx Structured extension request
  src/components/AssessmentCard.jsx    Both approaches shown side by side
  src/components/MyRequests.jsx        Student view: history, human review, contest
  src/components/StaffReview.jsx       Lecturer view: review queue, decisions, audit log
docs/screenshots/              Screens from an end-to-end run
```

## Mapping to the project brief

| Requirement | Where |
|---|---|
| Request intake and classification | `engine.js`: safety, misconduct, wellbeing, privacy, academic, administrative, general |
| Two ethical-reasoning approaches, compared | `extension/rules.js` and `extension/learned.js`; `npm run evaluate:compare` |
| Mandatory escalation zones | `guard.js` runs before everything; agent locks the conversation once escalated; sensitive home cards bypass the assistant |
| Explainable recommendations | Every reply carries a plain-language explanation and principles; learned model shows its influential words |
| Fairness check | `data/fairness-set.json` (6 requests in 6 styles); `npm run evaluate:fairness` |
| Accountability | Audit log, request history, named reviewer on every decision, contest flow |
| Cultural and linguistic awareness | Code-switched and non-standard English test cases in the fairness check; constant "Talk to a person" option and no requirement to disclose sensitive details; multilingual interface planned as future work |
| AI agent architecture | `agent.js` multi-turn dialogue with clarification and Gemini replies for routine questions; `/api/chat` stateless chat with history; escalation enforced every turn |

## Known limitations

The training and test data are synthetic and small (63 and 20 examples). The extraction vocabulary was improved after the first fairness run and then re-tested on the same set, so the final rules result on that set is optimistic. The interface is English only; multilingual support (for example Oshiwambo, Afrikaans and Otjiherero) is planned future work, and the phrase tables in `src/i18n.js` on both sides are structured for it. When Gemini is enabled, routine student messages are sent to Google's service, which a real deployment would need to cover in its privacy notice. Staff pages have no authentication. Escalation contacts must be verified against official NUST sources. Sessions are held in memory and are lost when the backend restarts.
