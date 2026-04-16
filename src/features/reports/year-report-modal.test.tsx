/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { GameStore } from '@/core/model/slices/types'
import { useGameStore } from '@/core/model/store'

import { YearReportModal } from './year-report-modal'

// Mock the store
vi.mock('@/core/model/store', () => ({
  useGameStore: vi.fn(),
}))

describe('YearReportModal', () => {
  const mockCloseYearReport = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null when gameStatus is not year_report', () => {
    vi.mocked(useGameStore).mockReturnValue({
      closeYearReport: mockCloseYearReport,
      gameStatus: 'playing',
      history: [],
    } as unknown as GameStore)

    const { container } = render(<YearReportModal />)
    expect(container.firstChild).toBeNull()
  })

  it('should render correctly with history data', () => {
    vi.mocked(useGameStore).mockReturnValue({
      closeYearReport: mockCloseYearReport,
      gameStatus: 'year_report',
      history: [
        {
          happiness: 85,
          health: 90,
          netWorth: 150000,
          turn: 3,
          year: 2024,
        },
      ],
    } as unknown as GameStore)

    render(<YearReportModal />)

    expect(screen.getByText(/отчет за 2024 год/i)).toBeDefined()
    // Use regex to be flexible about spaces/commas in formatted numbers
    expect(screen.getByText(/150.*000/)).toBeDefined()
    expect(screen.getByText('85')).toBeDefined()
    expect(screen.getByText('90')).toBeDefined()
  })

  it('should render error message when history is empty instead of black screen', () => {
    vi.mocked(useGameStore).mockReturnValue({
      closeYearReport: mockCloseYearReport,
      gameStatus: 'year_report',
      history: [],
    } as unknown as GameStore)

    render(<YearReportModal />)

    expect(screen.getByText(/данные за прошедший год отсутствуют/i)).toBeDefined()
    expect(screen.getByText(/продолжить/i)).toBeDefined()
  })

  it('should call closeYearReport when clicking continue', () => {
    vi.mocked(useGameStore).mockReturnValue({
      closeYearReport: mockCloseYearReport,
      gameStatus: 'year_report',
      history: [],
    } as unknown as GameStore)

    render(<YearReportModal />)

    fireEvent.click(screen.getByText(/продолжить/i))
    expect(mockCloseYearReport).toHaveBeenCalledTimes(1)
  })
})
