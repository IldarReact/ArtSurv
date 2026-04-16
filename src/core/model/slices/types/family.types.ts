export interface FamilySlice {
  acceptPartner: () => void
  // Actions
  addFamilyMember: (
    name: string,
    type: 'wife' | 'husband' | 'child' | 'pet',
    age: number,
    income: number,
    expenses: number,
  ) => void
  adoptPet: (petType: 'dog' | 'cat' | 'hamster', name: string, cost: number) => void
  completeLifeGoal: (goalId: string) => void

  rejectPartner: () => void
  removeFamilyMember: (id: string) => void
  setMemberFoodPreference: (memberId: string, foodId: string) => void
  setMemberTransportPreference: (memberId: string, transportId: string) => void
  // Relationship Actions
  startDating: () => void
  tryForBaby: () => void
  updateLifeGoal: (goalId: string, progress: number) => void
}
