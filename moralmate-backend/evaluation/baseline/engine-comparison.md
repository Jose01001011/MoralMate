# Top-down versus bottom-up: extension pre-assessment

Generated 2026-11-04T09:24:46.341Z. Training set: 63 synthetic labelled requests.
"Combined policy" is what MoralMate actually does: provisional only when both approaches agree, otherwise refer to the lecturer.

## Held-out test set (n = 20)

| Measure | Top-down rules | Bottom-up learned | Combined policy |
|---|---|---|---|
| Accuracy against labelled outcome | 95.0% | 95.0% | 95.0% |
| False "provisional" (should have been referred) | 0 | 1 | 0 |

Agreement between the two approaches: **90.0%**.

| | Count |
|---|---|
| Both correct | 18 |
| Only rules correct | 1 |
| Only learned model correct | 1 |
| Both wrong | 0 |

### Where they disagree

| Request | Expected | Rules (rule) | Learned (confidence) | Learned model's main terms |
|---|---|---|---|---|
| My internet was off, can't prove it, 2 days. | REFER | REFER (R5) | PROVISIONAL (0.701) | off, my, days |
| I attended a university debate tournament with a letter from the faculty, need 2 days. | PROVISIONAL | REFER (R8) | PROVISIONAL (0.957) | letter, attended, university, days |

## Leave-one-out cross-validation on the training set (n = 63)

| Measure | Top-down rules | Bottom-up learned | Combined policy |
|---|---|---|---|
| Accuracy against labelled outcome | 93.7% | 84.1% | 87.3% |
| False "provisional" (should have been referred) | 1 | 5 | 0 |

Agreement between the two approaches: **77.8%**.

| | Count |
|---|---|
| Both correct | 49 |
| Only rules correct | 10 |
| Only learned model correct | 4 |
| Both wrong | 0 |

### Where they disagree

| Request | Expected | Rules (rule) | Learned (confidence) | Learned model's main terms |
|---|---|---|---|---|
| I was admitted to hospital last week and missed the assignment. I have a medical certificate and need 5 more days. | PROVISIONAL | PROVISIONAL (R6) | REFER (0.551) | need more, more days, more, assignment |
| Moodle was down when I tried to submit and I have screenshots of the error. I need one day. | PROVISIONAL | PROVISIONAL (R7) | REFER (0.962) | submit, to submit, moodle, to |
| I was sick with a fever and have a doctor's note. Could I submit 3 days late? | PROVISIONAL | PROVISIONAL (R6) | REFER (0.995) | doctor's, submit, late, doctor's note |
| The network was down at the residence and I have proof from IT services, need 1 day. | PROVISIONAL | PROVISIONAL (R7) | REFER (0.891) | proof, it, at, need |
| My computer got a virus and I lost my work, I have the technician's report, need 3 days. | PROVISIONAL | PROVISIONAL (R7) | REFER (0.594) | lost, work, my work, need |
| I work night shifts and my employer's letter confirms extra shifts this week, I need 2 days. | PROVISIONAL | REFER (R8) | PROVISIONAL (0.641) | letter, my, days, need days |
| I was hospitalised for ten days with pneumonia, medical certificate attached, I need 10 days. | PROVISIONAL | REFER (R4) | PROVISIONAL (0.989) | medical, medical certificate, attached, certificate |
| I was on an official university sports trip and have the letter from the sports office, requesting 3 days. | PROVISIONAL | REFER (R8) | PROVISIONAL (0.975) | requesting days, letter, requesting, days |
| I had a wedding to attend this weekend, need 4 days | REFER | REFER (R8) | PROVISIONAL (0.757) | need days, weekend, days |
| I missed the deadline last week because I was confused about the date. | REFER | REFER (R1) | PROVISIONAL (0.694) | last, last week, missed, week |
| I didn't know the assignment was due, please give me extra days | REFER | REFER (R1) | PROVISIONAL (0.843) | me, extra days, days, extra |
| I had transport problems, I don't have any proof, need 2 days. | REFER | REFER (R5) | PROVISIONAL (0.645) | need days, days |
| Request extension of 2 days, reason: personal. | REFER | REFER (R1) | PROVISIONAL (0.553) | request, days, of days |
| I have a doctor's note from a month ago, can I get 5 days for this assignment? | REFER | PROVISIONAL (R6) | REFER (0.812) | month, ago, assignment, doctor's |

