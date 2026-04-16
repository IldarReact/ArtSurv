# Business Gap Audit (Docs -> Core -> Slices -> UI)

This audit tracks mismatches between business requirements and implementation for the business module only.

## Critical Gaps

## GAP-01: Partnership gating bypass via direct store actions

- Business risk: minor owners may bypass intended governance by calling low-level actions directly.
- Evidence:
  - UI uses guarded executor:
    - `src/features/activities/work/business/business-management/hooks/use-business-actions/action-executor.ts`
  - Core store actions still allow direct updates without ownership checks:
    - `src/core/model/slices/activities/work/business/employees-slice.ts`
    - `src/core/model/slices/activities/work/business/pricing-production-slice.ts`
    - `src/core/model/slices/activities/work/business/core-business-slice.ts`
- Priority: P0.
- Fix point: enforce permission checks in domain/slice layer for write actions, not only in UI.

## GAP-02: Employee add path bypasses validation pipeline

- Business risk: `addEmployeeToBusiness` can insert/replace employees without energy, budget, and max-employee checks.
- Evidence:
  - Validation exists in `handleHireEmployee`.
  - `handleAddEmployeeToBusiness` writes employee list directly.
  - Proposal approval path for hiring uses `addEmployeeToBusiness`.
- Priority: P0.
- Fix point: centralize validation and employee insertion in one guarded function used by direct and proposal flows.

## GAP-03: Fire path lacks strict target validation

- Business risk: firing a non-existing employee still emits success-like flow and may hide state inconsistencies.
- Evidence:
  - `handleFireEmployee` filters list and proceeds without explicit existence validation.
- Priority: P1.
- Fix point: require employee existence before mutation and notify on invalid target.

## GAP-04: Lifecycle operations are not ownership-aware in core path

- Business risk: freeze/unfreeze/close operations can be triggered through core methods without explicit partnership policy checks.
- Evidence:
  - `lifecycle-management` UI currently triggers direct lifecycle methods.
  - Core lifecycle handlers do not evaluate ownership matrix.
- Priority: P0.
- Fix point: route lifecycle through governance-aware action layer and enforce ownership in slice methods.

## GAP-05: Branch opening not linked to governance checks

- Business risk: branch expansion may be applied directly even in cases requiring approval.
- Evidence:
  - `openBranch` exists as direct slice action.
  - Proposal system supports branch/open_branch types, but direct path is still open.
- Priority: P0.
- Fix point: normalize branch opening through partnership-aware executor and backend checks.

## GAP-06: Wallet-affecting operations not uniformly guarded

- Business risk: money-impacting actions can diverge in validation and rights handling.
- Evidence:
  - Wallet deposit and fund collection are implemented via different paths.
  - Fund collection uses proposal logic in one path, direct state update in another.
- Priority: P1.
- Fix point: unify wallet mutation policy and event sync for all ownership scenarios.

## GAP-07: Financial determinism is implicit, not asserted at module boundary

- Business risk: financial regressions can slip through if deterministic contract is not tested across combined inputs.
- Evidence:
  - Existing business tests validate pieces.
  - Missing explicit cross-scenario matrix tying price/quantity/staffing to expected net-profit direction.
- Priority: P1.
- Fix point: add matrix-based integration tests for financial direction and invariants.

## GAP-08: UI transparency for blocked actions is inconsistent by action type

- Business risk: players can experience denied operations without clear reason for every workflow.
- Evidence:
  - Permission messaging is solid for price/hiring actions.
  - Lifecycle/branch/deposit visibility and denial reasons are less standardized.
- Priority: P1.
- Fix point: unify error/success notification contract for all business action families.

## Remediation Order

1. Close governance bypasses for all write actions (GAP-01/04/05).
2. Harden hiring/firing validation path (GAP-02/03).
3. Align money mutation flows and partnership sync (GAP-06).
4. Add deterministic financial regression matrix (GAP-07).
5. Standardize UX feedback for blocked/approved actions (GAP-08).
