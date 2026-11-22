# Country Economy Events

## Data flow

1. Initial country values come from `src/shared/data/world/countries/us/economy.json`.
2. The country economy loader validates and initializes these values for the Zustand store.
3. Event cards are loaded from `src/shared/data/world/countries/us/economic-events.json` and validated with `EconomicEventDefinitionSchema`.
4. `generateEconomicEvent` selects a card for the USA with a 30% chance per turn. Economic thresholds constrain the eligible card types.
5. `processCountryEconomy` is the only runtime owner of country economy changes. It applies the selected card once, clamps rates, records actual before/after changes, and appends the event to `country.eventHistory`.
6. `economyStep` replaces the country in the turn state and creates a notification with the resulting inflation and key-rate values.
7. `commitTurn` commits the updated country map and notifications through the Zustand store. Zustand persistence uses `saveManager` and browser `localStorage`; there is no server database.
8. The `EventsActivity` renders country event history. The shared notifications toast shows the in-game event notification.

The USA is currently the only enabled country for setup and relocation tests. The Brazil and Germany data files remain in the repository and are still loaded; they are not deleted.

## One owner for country values

Country event effects for inflation, the key rate, personal taxes, corporate taxes, GDP growth, unemployment, salary modifiers, and psychological stability are applied in `processCountryEconomy`. Other turn steps consume those values; they must not independently rewrite country economy values.

The former `inflation-processor` and `inflation-system` yearly update paths were removed. The economic cycle processor only updates its cycle and market modifier; it does not create a second country event. Player debt-crisis helpers do not generate country events.

Inflation history is maintained as yearly snapshots: the current year's entry is updated when the country inflation changes, and a new snapshot is added at year-end. Event history is stored separately from the transient active-event list so a later turn does not erase earlier events.

## Category-specific price volatility — keep this

`INFLATION_MULTIPLIERS` in `inflation-engine.ts` is intentionally retained. It adjusts the calculated price for each category without changing `country.inflation`:

- Housing uses a higher multiplier than the default price category.
- Food uses a lower multiplier than the default price category.
- Salaries, education, services, and other categories retain their own multipliers.

This is price-category volatility, not another mutation of the country's inflation rate. `getInflatedPrice` applies it when calculating a price; it must not be removed or used to write the country economy.

## Main consumers

- `price-helpers.ts` reads inflation history and applies category multipliers to prices.
- `calculate-quarterly-taxes.ts` uses the country's personal income tax rate.
- `business-financials.ts` uses the country's corporate tax rate.
- `world-map-card.tsx` displays current inflation and both country tax rates.
- `economic-events-panel.tsx` displays persisted event history and the resulting inflation and key-rate values.

## Tests

Focused coverage is in:

- `src/core/lib/economic-events/generator.test.ts`
- `src/core/model/logic/economy/country-economy-processor.test.ts`
- `src/core/model/logic/steps/economy.step.test.ts`
- `src/core/model/logic/turn/commit-turn.test.ts`
- `src/features/events/economic-events-panel.test.tsx`
- `src/core/lib/calculations/price-helpers.test.ts`
