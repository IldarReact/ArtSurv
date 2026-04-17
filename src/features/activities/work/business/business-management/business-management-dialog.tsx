'use client'

import React, { useState, useMemo } from 'react'

import {
  calculateBusinessFinancials,
  checkMinimumStaffing,
  getEffectiveMaxEmployees,
  getTotalEmployeesCount,
  getOperationalRoles,
  getPlayerActiveRoles,
  isRoleFilled,
  calculateSalary,
  generateCandidates,
} from '@/core/lib/business'
import { useGameStore } from '@/core/model/store'
import type { EmployeeCandidate, EmployeeRole, BusinessPosition } from '@/core/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/dialog'
import { EmployeeHireDialog } from '@/src/features/activities/work/employee-hire/employee-hire-dialog'

import { BusinessGoals } from './components/business-goals'
import { LifecycleManagement } from './components/business-lifecycle/lifecycle-management'
import { NetworkManagement } from './components/business-lifecycle/network-management'
import { PartnershipManagement } from './components/business-lifecycle/partnership-management'
import { EmployeeManagement } from './components/employee-management'
import { MetricsOverview } from './components/metrics-overview'
import { PricingAndProduction } from './components/pricing-and-production'
import { useBusinessActions } from './hooks/use-business-actions'
import { calculateEmployeeSalary } from './hooks/use-employee-salary'
import type { BusinessManagementDialogProps } from './types'

export function BusinessManagementDialog({
  businessId,
  onOpenChange,
  open,
}: BusinessManagementDialogProps) {
  const {
    changePrice: setBusinessPrice,
    closeBusiness,
    countries,
    fireEmployee,
    freezeBusiness,
    globalMarket,
    hireEmployee: onHireEmployee,
    joinBusinessAsEmployee: onJoinAsEmployee,
    openBranch,
    player,
    setEmployeeEffort,
    setPlayerEmploymentEffort,
    setPlayerEmploymentSalary,
    setQuantity: setBusinessQuantity,
    unassignPlayerRole: unassignRole,
    unfreezeBusiness,
  } = useGameStore()

  const [hireDialogOpen, setHireDialogOpen] = useState(false)
  const [selectedRoleForHire, setSelectedRoleForHire] = useState<EmployeeRole | null>(null)
  const [generatedCandidates, setGeneratedCandidates] = useState<EmployeeCandidate[]>([])

  const business = useMemo(
    () => player?.businesses.find((b) => b.id === businessId),
    [player?.businesses, businessId],
  )

  const {
    handleCloseBusiness,
    handleDemoteEmployee,
    handleFireEmployee,
    handleFreezeBusiness,
    handleHire,
    handleOpenBranch,
    handlePriceChange,
    handlePromoteEmployee,
    handleQuantityChange,
    handleUnassignRole,
    handleUnfreezeBusiness,
  } = useBusinessActions(business)

  if (!business || !player) return null

  const country = countries[player.countryId]
  const playerSkills = player.personal.skills
  const playerShare = business.partners.find((p) => p.id === player.id)?.share ?? 0

  const staffingCheck = checkMinimumStaffing(business)
  const financials = calculateBusinessFinancials(
    business,
    true,
    playerSkills,
    globalMarket.value,
    country,
  )
  const forecastProfit = financials.netProfit
  const forecastDebug = financials.debug

  const activePlayerRoles = getPlayerActiveRoles(business)
  const availablePositions = getOperationalRoles()
    .filter((role) => !isRoleFilled(business, role))
    .map((role) => ({
      description: '',
      role,
      salary: calculateSalary(role, 3, country),
    })) as BusinessPosition[]
  const canHireMore = getTotalEmployeesCount(business) < getEffectiveMaxEmployees(business)
  const availableBudget = business.walletBalance ?? 0

  const openHireDialog = (role: EmployeeRole) => {
    setSelectedRoleForHire(role)
    // Harder hiring: only 3 candidates instead of 5
    const candidates = generateCandidates(role, 3, country, player.countryId)
    setGeneratedCandidates(candidates)
    setHireDialogOpen(true)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent
          className="max-h-[95vh] overflow-y-auto bg-[#0a0a0a]/95 border-white/10 text-white backdrop-blur-xl"
          maxWidth="6xl"
        >
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-black tracking-tighter italic uppercase text-white">
                  {business.name}
                </DialogTitle>
                <DialogDescription className="text-white/40 mt-1">
                  Управление предприятием • {business.type} • {country.name}
                </DialogDescription>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                  Баланс предприятия
                </p>
                <p className="text-2xl font-black text-emerald-400">
                  ${(business.walletBalance ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <MetricsOverview
              efficiency={business.efficiency}
              expensesBreakdown={financials.debug?.expensesBreakdown}
              maxEmployees={getEffectiveMaxEmployees(business)}
              reputation={business.reputation}
              safeExpenses={financials.expenses}
              safeIncome={financials.income}
              totalEmployees={getTotalEmployeesCount(business)}
            />

            <BusinessGoals goals={business.businessGoals} />

            <PricingAndProduction
              country={country}
              forecastDebug={forecastDebug}
              forecastProfit={forecastProfit}
              formatCurrency={formatCurrency}
              goals={business.businessGoals}
              handlePriceChange={(e) => {
                handlePriceChange(parseInt(e.target.value), setBusinessPrice)
              }}
              handleQuantityChange={(e) => {
                handleQuantityChange(parseInt(e.target.value), setBusinessQuantity)
              }}
              inventory={business.inventory}
              isServiceBased={business.isServiceBased}
              lastQuarterSummary={business.lastQuarterSummary}
              price={business.price}
              quantity={business.quantity}
            />

            <EmployeeManagement
              activePlayerRoles={activePlayerRoles}
              availableBudget={availableBudget}
              availablePositions={availablePositions}
              business={business}
              calculateEmployeeSalary={calculateEmployeeSalary}
              canHireMore={canHireMore}
              country={country}
              handleDemoteEmployee={handleDemoteEmployee}
              handleFireEmployee={(id, name) => {
                handleFireEmployee(id, name, fireEmployee)
              }}
              handlePromoteEmployee={handlePromoteEmployee}
              handleUnassignRole={(role) => {
                handleUnassignRole(role, unassignRole)
              }}
              openHireDialog={openHireDialog}
              player={player}
              playerSkills={playerSkills}
              setEmployeeEffort={setEmployeeEffort}
              setPlayerEmploymentEffort={setPlayerEmploymentEffort}
              setPlayerEmploymentSalary={setPlayerEmploymentSalary}
              staffingCheck={staffingCheck}
            />

            <PartnershipManagement business={business} player={player} playerShare={playerShare} />

            <NetworkManagement
              business={business}
              onOpenBranch={() => {
                handleOpenBranch(openBranch)
              }}
              playerCash={player.stats.money}
            />

            <LifecycleManagement
              business={business}
              handleClose={() => {
                handleCloseBusiness(closeBusiness)
              }}
              handleFreeze={() => {
                handleFreezeBusiness(freezeBusiness)
              }}
              handleUnfreeze={() => {
                handleUnfreezeBusiness(unfreezeBusiness)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {selectedRoleForHire && (
        <EmployeeHireDialog
          availableBudget={availableBudget}
          businessId={business.id}
          businessName={business.name}
          candidates={generatedCandidates}
          isOpen={hireDialogOpen}
          onClose={() => {
            setHireDialogOpen(false)
          }}
          onHire={(candidate: EmployeeCandidate) => {
            handleHire(candidate, onJoinAsEmployee, onHireEmployee, setHireDialogOpen)
          }}
        />
      )}
    </>
  )
}
