import {
  Award,
  TrendingUp,
  DollarSign,
  Star,
  Activity,
  Users,
  Scale,
  UserCheck,
} from 'lucide-react'
import React from 'react'

import type { EmployeeRole } from '@/core/types'

export const ROLE_LABELS: Record<EmployeeRole, string> = {
  accountant: 'Бухгалтер',
  hr: 'HR-менеджер',
  lawyer: 'Юрист',
  manager: 'Управляющий',
  marketer: 'Маркетолог',
  salesperson: 'Продавец',
  technician: 'Техник',
  worker: 'Рабочий',
}

export const ROLE_ICONS: Record<EmployeeRole, React.ReactNode> = {
  accountant: <DollarSign className="w-4 h-4" />,
  hr: <UserCheck className="w-4 h-4" />,
  lawyer: <Scale className="w-4 h-4" />,
  manager: <Award className="w-4 h-4" />,
  marketer: <Star className="w-4 h-4" />,
  salesperson: <TrendingUp className="w-4 h-4" />,
  technician: <Activity className="w-4 h-4" />,
  worker: <Users className="w-4 h-4" />,
}

export const ROLE_DESCRIPTIONS: Record<EmployeeRole, string> = {
  accountant: 'Бухгалтерия и финансы',
  hr: 'Управление персоналом',
  lawyer: 'Юридическое сопровождение',
  manager: 'Управление бизнесом',
  marketer: 'Маркетинг и реклама',
  salesperson: 'Продажи и работа с клиентами',
  technician: 'Техническая поддержка',
  worker: 'Работа в бизнесе',
}
