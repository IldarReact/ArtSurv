# Business Contract (ArtSurv)

This document defines the expected product behavior for the in-game business system.
It is the acceptance contract for implementation, tests, and release checks.

## Scope

Included:

- Business lifecycle: open, freeze, unfreeze, close, branch expansion.
- Operational controls: price, quantity, production.
- Hiring and firing: NPC employees and player-as-employee.
- Business finances: income, expenses, taxes, net profit.
- Partnership governance and synchronization.

Excluded:

- Non-business personal events, education, banking-only features.

## 1) BusinessLifecycle

### Player actions

- Open new business.
- Open branch from existing business.
- Freeze and unfreeze business.
- Close business permanently.

### Invariants

- Closed business is removed from player businesses.
- Frozen business cannot keep active employees and loses stock.
- Unfreeze requires funding according to unfreeze rules.
- Branch opening requires sufficient money.

### Expected state updates

- `player.businesses[]` is the source of truth for lifecycle transitions.
- Freeze sets `state: "frozen"` and resets operational resources.
- Unfreeze transitions to `state: "opening"` with opening progress.
- Close removes business and returns liquidation value to player.

### Expected user signals

- Error notifications on insufficient funds.
- Success/info notifications on lifecycle transitions.

## 2) PricingAndQuantity

### Player actions

- Change price.
- Change production quantity (non-service businesses).

### Invariants

- Price must be clamped to valid range.
- Quantity change is not allowed for service businesses.
- Networked businesses keep price sync behavior where applicable.

### Expected state updates

- Price/quantity are updated on the selected business (or synchronized network).
- Product `pricePerUnit` recalculates after price changes for goods businesses.

### Expected user signals

- Error message when quantity is changed for service business.
- Proposal notifications when approval is required by partnership rules.

## 3) HiringAndFiring

### Player actions

- Hire NPC candidate.
- Hire family member.
- Join business as employee.
- Fire employee or leave own role.

### Invariants

- Hiring requires energy cost.
- Hiring must respect employee capacity and budget validations.
- Firing must remove only target employee.
- Role ownership consistency must be preserved after fire/leave.

### Expected state updates

- `business.employees` updates are followed by metrics recalculation.
- Family member hiring marks family employment linkage.
- Join/leave actions maintain player employment consistency.

### Expected user signals

- Errors for validation failures (energy, rights, limits, funds).
- Success/info notifications for hire/fire results.

## 4) EmployeeAndPlayerRoles

### Player actions

- Promote/demote employee.
- Set salary.
- Assign/unassign player role.

### Invariants

- Role changes are bounded by partnership permissions.
- Salary and stars updates keep employee object valid.
- Operational and managerial role constraints are respected.

### Expected state updates

- Employee updates are applied to target employee only.
- Role updates can trigger downstream KPI effects through business metrics.

### Expected user signals

- Promotion/demotion notifications.
- Rights-related error notifications for blocked actions.

## 5) FinancialOutcome

### Player actions

- Modify parameters that affect revenue/expenses.
- Run turn and receive quarterly business outcomes.

### Invariants

- For equal inputs, financial output is deterministic.
- Net profit depends on demand, pricing, market, employees, expenses, taxes.
- Metrics and finances remain finite and non-NaN.

### Expected state updates

- Quarterly summary and business metrics are updated through business logic.
- Wallet and player money changes happen through transactions where defined.

### Expected user signals

- Forecast and quarterly summaries reflect meaningful financial changes.

## 6) PartnershipRights

### Player actions

- Directly apply changes or submit proposals depending on ownership share.
- Approve/reject partner proposals.

### Invariants

- `share > 50`: direct change allowed.
- `share = 50`: approval flow required.
- `share < 50`: write operations denied.
- Applies to all business actions, not only price/quantity.

### Expected state updates

- Proposal lifecycle statuses: pending -> approved/rejected.
- Approved proposals apply changes to business state.
- Direct updates and approved proposals trigger synchronization events.

### Expected user signals

- Clear permission feedback (blocked/direct/proposal).
- Proposal status visibility in UI.

## Business Acceptance Matrix

- Lifecycle transitions are valid and recoverable.
- Hiring/firing cannot bypass rights, limits, or budget checks.
- Financial outcomes react predictably to business actions.
- Partnership matrix works consistently for all business action types.
- All critical flows are backed by automated tests.
