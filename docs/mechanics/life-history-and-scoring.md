# Life history and final scoring

The canonical event types, annual snapshot, and score calculation live in
`src/core/model/history/life-history.ts`. The player's history is stored in Zustand state as
`lifeEvents` and `history`; it is not stored in a shared JSON data file. Zustand persists it with
the game save through `saveManager` in the browser's `localStorage`. It is not shown as a live
timeline during the game, but browser storage is not a secure or secret store.

## What is recorded

- One annual snapshot is added after the Q4 financial result has been committed. It records cash,
  net worth after debt, happiness, health, sanity, intelligence, and the investment
  portfolio's current value and cost basis.
- Structured life events are recorded from the authoritative outcome handlers, not reconstructed
  from notification text. The ledger covers employment and active business quarters, job changes, completed education,
  family changes, investment purchases/sales, and completed rest activities.
- Notifications remain transient UI messages; deleting or reading one does not change the ledger.
- Event IDs are stable for turn-processor outcomes, and the state writer and turn commit both avoid
  appending duplicate IDs.

The save format is version 6. Migration initializes `lifeEvents` to an empty array for earlier
saves and preserves their existing history. Newly started games begin at turn 0 (Q1); 80 quarterly
turns represent 20 years, and the final Q4 commit ends the game. Existing saves retain their turn
position.

## Scoring

The final result is deterministic and ranges from 0 to 90:

| Component   | Maximum | Rule                                                                                                                                                                           |
| ----------- | ------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Four stats  |      40 | Average available annual values (and the current value if the game ended between annual snapshots); 10 points per stat.                                                        |
| Capital     |      15 | `15 × clamp(max(net worth, 0) / 250,000, 0, 1)`. Net worth is cash plus asset value and the player's business share, minus outstanding debt.                                   |
| Family      |       7 | Relationship starts and births add points; adding or removing a family member changes points.                                                                                  |
| Work        |       7 | Work quarters, job changes, salary gains, and active business profit/loss change points.                                                                                       |
| Education   |       7 | Course and university completions add points.                                                                                                                                  |
| Investments |       7 | Based on current portfolio return plus recorded sales; purchases alone do not earn return points. No portfolio gives 0; a flat return gives 3.5; a 100% loss/gain maps to 0/7. |
| Rest        |       7 | Based on actual happiness, health, intelligence, and sanity changes from completed rest actions; energy cost is not treated as a restorative benefit.                          |

For family, work, education, and rest, the net change is limited to ±1.5 points per year and each
category is clamped to 0–7 overall. This limits repeated-action farming. Investment return is
calculated from current eligible assets and recorded sales, not from purchase count.

### Event values before the yearly cap

| Category  | Recorded outcome                                                 |                                                                   Points |
| --------- | ---------------------------------------------------------------- | -----------------------------------------------------------------------: |
| Family    | Start relationship / child born / family member added / removed  |                                      +1 / +0.75 per child / +0.35 / -0.8 |
| Work      | Work quarter / job started / salary increased / quit / dismissed |                                        +0.15 / +0.25 / +0.75 / -0.5 / -1 |
| Work      | Active business quarter                                          |              Quarterly net profit divided by $10,000, capped at -1 to +1 |
| Education | Course completed / university completed                          |                                                             +0.75 / +1.5 |
| Rest      | Completed rest action                                            | Sum of happiness, health, intelligence, and sanity changes divided by 20 |

Older history snapshots may not contain the newer stats or portfolio fields. The scorer ignores
missing snapshot values rather than treating them as zero. Energy remains a gameplay stat but is
excluded from annual reports and the final score.

In an active multiplayer room, each finished player publishes their total through Liveblocks
presence. The final screen shows the player's detailed breakdown on the left and a score-ranked
table of room participants on the right; unfinished participants remain listed as waiting.
