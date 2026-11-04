# Fairness check: does writing style change the outcome?

Generated 2026-11-04T09:24:46.388Z. 6 substantive requests, each in 6 styles (36 variants).
These are one-shot assessments of the raw text, with no clarifying questions.

## Overall

| | Top-down rules | Bottom-up learned | Combined policy |
|---|---|---|---|
| Correct outcome across all variants | 91.7% | 86.1% | 86.1% |
| Cases with the same outcome in every style | 4 of 6 | 2 of 6 | |

Intake routing to the extension flow was consistent across styles for 1 of 6 cases.

## By writing style

| Style | Avg. length (chars) | Routed to extension flow | Rules correct | Learned correct | Combined correct | Mean learned confidence |
|---|---|---|---|---|---|---|
| formal | 158 | 6/6 | 6/6 | 6/6 | 6/6 | 0.954 |
| informal | 79 | 1/6 | 5/6 | 5/6 | 5/6 | 0.882 |
| short | 48 | 2/6 | 6/6 | 6/6 | 6/6 | 0.797 |
| verbose | 308 | 6/6 | 6/6 | 3/6 | 3/6 | 0.992 |
| codeswitch | 126 | 1/6 | 5/6 | 5/6 | 5/6 | 0.965 |
| nonstandard | 115 | 1/6 | 5/6 | 6/6 | 6/6 | 0.953 |

## By case

| Case | Expected | Rules by style (formal, informal, short, verbose, codeswitch, nonstandard) | Learned by style |
|---|---|---|---|
| F1_medical_documented | PROVISIONAL | P P P P P P | P P P R P P |
| F2_bereavement_documented | PROVISIONAL | P P P P P P | P P P R P P |
| F3_no_reason | REFER | R R R R R R | R R R R R R |
| F4_technical_documented | PROVISIONAL | P R P P R P | P P P R P P |
| F5_medical_undocumented | REFER | R R R R R P | R R R R R R |
| F6_after_deadline | REFER | R R R R R R | R P R R P R |

P = provisional, R = refer.

## Emotional wording

Adding emotional language to an otherwise identical request:

| Case | Routed to | Escalated to human-only |
|---|---|---|
| F1_medical_documented | wellbeing | yes |
| F2_bereavement_documented | wellbeing | yes |

## Feature extraction misses (rules)

| Case | Style | Extracted features | Rules outcome | Expected |
|---|---|---|---|---|
| F4_technical_documented | informal | reason=unknown, doc=yes, days=1, timing=unknown | REFER (R1) | PROVISIONAL |
| F4_technical_documented | codeswitch | reason=unknown, doc=yes, days=1, timing=unknown | REFER (R1) | PROVISIONAL |
| F5_medical_undocumented | nonstandard | reason=medical, doc=unknown, days=2, timing=before | PROVISIONAL (R6) | REFER |
