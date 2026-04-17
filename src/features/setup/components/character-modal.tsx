import { motion } from 'framer-motion'
import { User, DollarSign, Home, CreditCard, PieChart, ArrowLeft, X } from 'lucide-react'

import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/utils/utils'
import { CATEGORY_IMAGES, DETAIL_IMAGES } from '@/src/features/setup/shared-constants'

import type { ModalView, CategoryCardProps, DetailCardProps } from '../types'
import { MOCK_DETAILED_INFO } from '../utils'

interface CharacterModalProps {
  characterName: string
  isOpen: boolean
  modalView: ModalView
  onBack: () => void
  onClose: () => void
  onSelect: () => void
  setModalView: (view: ModalView) => void
}

function MainView({ setModalView }: { setModalView: (view: ModalView) => void }) {
  let totalDebts = 0
  for (const debt of MOCK_DETAILED_INFO.debts) {
    totalDebts += debt.remainingAmount
  }

  let totalSavings = 0
  for (const saving of MOCK_DETAILED_INFO.savings) {
    totalSavings += saving.amount
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CategoryCard
        count={`${String(MOCK_DETAILED_INFO.family.children.length + 1)} чел.`}
        icon={<User className="w-8 h-8 text-blue-400" />}
        image={CATEGORY_IMAGES.family}
        onClick={() => {
          setModalView('family')
        }}
        title="Семья"
      />
      <CategoryCard
        count={`${String(MOCK_DETAILED_INFO.assets.length)} объектов`}
        icon={<Home className="w-8 h-8 text-green-400" />}
        image={CATEGORY_IMAGES.assets}
        onClick={() => {
          setModalView('assets')
        }}
        title="Имущество"
      />
      <CategoryCard
        count={`-${totalDebts.toLocaleString()}$`}
        icon={<CreditCard className="w-8 h-8 text-red-400" />}
        image={CATEGORY_IMAGES.debts}
        onClick={() => {
          setModalView('debts')
        }}
        title="Долги"
      />
      <CategoryCard
        count={`${totalSavings.toLocaleString()}$`}
        icon={<DollarSign className="w-8 h-8 text-yellow-400" />}
        image={CATEGORY_IMAGES.savings}
        onClick={() => {
          setModalView('savings')
        }}
        title="Сбережения"
      />
      <CategoryCard
        count={`${String(MOCK_DETAILED_INFO.investments.length)} активов`}
        icon={<PieChart className="w-8 h-8 text-purple-400" />}
        image={CATEGORY_IMAGES.investments}
        onClick={() => {
          setModalView('investments')
        }}
        title="Инвестиции"
      />
    </div>
  )
}

function FamilyView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DetailCard
        image={DETAIL_IMAGES.spouse}
        subtitle={`${String(MOCK_DETAILED_INFO.family.spouse.age)} лет, ${MOCK_DETAILED_INFO.family.spouse.job ?? ''}`}
        tags={['Отношения: 100%', 'Счастье: Высокое']}
        title={`Жена: ${MOCK_DETAILED_INFO.family.spouse.name}`}
      />
      {MOCK_DETAILED_INFO.family.children.map((child) => (
        <DetailCard
          image={DETAIL_IMAGES.child}
          key={child.name}
          subtitle={`${String(child.age)} лет`}
          tags={['Образование: Начальное', 'Здоровье: 100%']}
          title={`Ребенок: ${child.name}`}
        />
      ))}
      <DetailCard
        image={DETAIL_IMAGES.pet}
        subtitle={MOCK_DETAILED_INFO.family.pet.type}
        tags={['Лояльность: 100%']}
        title={`Питомец: ${MOCK_DETAILED_INFO.family.pet.name}`}
      />
    </div>
  )
}

function AssetsView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {MOCK_DETAILED_INFO.assets.map((asset) => (
        <DetailCard
          details={[
            { label: 'Стоимость', value: `${asset.value.toLocaleString()}$` },
            { label: 'Ежемес. расходы', value: `${asset.monthly.toLocaleString()}$` },
          ]}
          image={asset.image}
          key={asset.name}
          subtitle="Недвижимость"
          title={asset.name}
        />
      ))}
    </div>
  )
}

function DebtsView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {MOCK_DETAILED_INFO.debts.map((debt) => (
        <DetailCard
          details={[
            { label: 'Остаток', value: `${debt.remainingAmount.toLocaleString()}$` },
            { label: 'Ставка', value: `${String(debt.rate)}%` },
          ]}
          image={CATEGORY_IMAGES.debts}
          isRed
          key={debt.name}
          subtitle={`Мин. платеж: ${debt.minPayment.toLocaleString()}$/мес`}
          title={debt.name}
        />
      ))}
    </div>
  )
}

function SavingsView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {MOCK_DETAILED_INFO.savings.map((saving) => (
        <DetailCard
          details={[{ label: 'Сумма', value: `${saving.amount.toLocaleString()}$` }]}
          image={CATEGORY_IMAGES.savings}
          key={saving.name}
          subtitle={saving.type}
          title={saving.name}
        />
      ))}
    </div>
  )
}

function InvestmentsView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {MOCK_DETAILED_INFO.investments.map((inv) => (
        <DetailCard
          details={[{ label: 'Вложено', value: `${inv.amount.toLocaleString()}$` }]}
          image={CATEGORY_IMAGES.investments}
          key={inv.name}
          subtitle={inv.type}
          title={inv.name}
        />
      ))}
    </div>
  )
}

const VIEW_TITLES: Record<ModalView, string> = {
  assets: 'Имущество',
  debts: 'Долги',
  family: 'Семья',
  investments: 'Инвестиции',
  main: '', // Будет переопределено в компоненте
  savings: 'Сбережения',
}

export function CharacterModal({
  characterName,
  isOpen,
  modalView,
  onBack,
  onClose,
  onSelect,
  setModalView,
}: CharacterModalProps) {
  if (!isOpen) return null

  const modalTitle =
    modalView === 'main' ? `Личное дело: ${characterName}` : VIEW_TITLES[modalView as ModalView]

  const renderContent = () => {
    switch (modalView) {
      case 'main':
        return <MainView setModalView={setModalView} />
      case 'family':
        return <FamilyView />
      case 'assets':
        return <AssetsView />
      case 'debts':
        return <DebtsView />
      case 'savings':
        return <SavingsView />
      case 'investments':
        return <InvestmentsView />
      default:
        return null
    }
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900/90 border border-white/10 w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <Button
          className="absolute top-4 right-4 z-50 text-white/50 hover:text-white"
          onClick={onClose}
          size="icon"
          variant="ghost"
        >
          <X className="h-8 w-8" />
        </Button>

        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            {modalView !== 'main' && (
              <Button
                className="text-white hover:bg-white/10"
                onClick={onBack}
                size="icon"
                variant="ghost"
              >
                <ArrowLeft />
              </Button>
            )}
            <div>
              <h2 className="text-3xl font-bold text-white">{modalTitle}</h2>
              <p className="text-white/50">
                {modalView === 'main'
                  ? 'Полная информация о персонаже'
                  : 'Детальный обзор категории'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/20">
          {renderContent()}
        </div>

        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-4">
          <Button
            className="text-white hover:bg-white/10 h-12 px-8"
            onClick={onClose}
            size="lg"
            variant="ghost"
          >
            Отмена
          </Button>
          <Button
            className="bg-white text-black hover:bg-white/90 px-8 h-12 text-lg font-bold rounded-xl shadow-lg"
            onClick={onSelect}
            size="lg"
          >
            Выбрать этого персонажа
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function CategoryCard({ count, icon, image, onClick, title }: CategoryCardProps) {
  return (
    <motion.div
      className="cursor-pointer group relative h-48 rounded-2xl overflow-hidden border border-white/10 bg-black/40"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
          src={image}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 to-transparent transition-colors" />
      </div>
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div className="bg-white/10 w-fit p-3 rounded-xl backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">
            {title}
          </h3>
          <p className="text-white/60 font-medium">{count}</p>
        </div>
      </div>
    </motion.div>
  )
}

function DetailCard({
  details = [],
  image,
  isRed = false,
  subtitle,
  tags = [],
  title,
}: DetailCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row h-full group hover:border-white/20 transition-colors">
      <div className="w-full md:w-40 h-48 md:h-auto relative shrink-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          src={image}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent md:hidden" />
      </div>
      <div className="p-5 flex-1 flex flex-col justify-center">
        <h3 className={cn('text-xl font-bold mb-1', isRed ? 'text-red-400' : 'text-white')}>
          {title}
        </h3>
        <p className="text-white/50 mb-4 text-sm">{subtitle}</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge
                className="bg-white/10 text-white/80 hover:bg-white/20 font-normal"
                key={tag}
                variant="secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {details.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-white/5">
            {details.map((d) => (
              <div key={d.label}>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">
                  {d.label}
                </p>
                <p className="text-sm font-medium text-white/90">{d.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
