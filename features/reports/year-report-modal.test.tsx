/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { YearReportModal } from './year-report-modal'
import { useGameStore } from '@/core/model/store'

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
      gameStatus: 'playing',
      history: [],
      closeYearReport: mockCloseYearReport,
    } as any)

    const { container } = render(<YearReportModal />)
    expect(container.firstChild).toBeNull()
  })

  it('should render correctly with history data', () => {
    vi.mocked(useGameStore).mockReturnValue({
      gameStatus: 'year_report',
      history: [
        {
          turn: 3,
          year: 2024,
          netWorth: 150000,
          happiness: 85,
          health: 90,
        },
      ],
      closeYearReport: mockCloseYearReport,
    } as any)

    render(<YearReportModal />)

    expect(screen.getByText(/Отчет за 2024 год/i)).toBeDefined()
    // Use regex to be flexible about spaces/commas in formatted numbers
    expect(screen.getByText(/150.*000/)).toBeDefined()
    expect(screen.getByText('85')).toBeDefined()
    expect(screen.getByText('90')).toBeDefined()
  })

  it('should render error message when history is empty instead of black screen', () => {
    vi.mocked(useGameStore).mockReturnValue({
      gameStatus: 'year_report',
      history: [],
      closeYearReport: mockCloseYearReport,
    } as any)

    render(<YearReportModal />)

    expect(screen.getByText(/Данные за прошедший год отсутствуют/i)).toBeDefined()
    expect(screen.getByText(/ПРОДОЛЖИТЬ/i)).toBeDefined()
  })

  it('should call closeYearReport when clicking continue', () => {
    vi.mocked(useGameStore).mockReturnValue({
      gameStatus: 'year_report',
      history: [],
      closeYearReport: mockCloseYearReport,
    } as any)

    render(<YearReportModal />)

    fireEvent.click(screen.getByText(/ПРОДОЛЖИТЬ/i))
    expect(mockCloseYearReport).toHaveBeenCalledTimes(1)
  })
})
