/* eslint-disable no-console */
import { test, expect } from '@playwright/test'

test.describe('Business Management Advanced E2E', () => {
  test('should manage production, employee lifecycle and view reports', async ({ page }) => {
    // Capture browser logs
    page.on('console', (msg) => {
      if (msg.type() === 'log' && msg.text().includes('[E2E')) {
        console.log(`BROWSER: ${msg.text()}`)
      }
    })

    console.log('Starting Business Advanced Test...')

    test.setTimeout(180000) // 3 minutes for deep coverage

    // Enable E2E mode for deterministic logic
    await page.addInitScript(() => {
      ;(window as Window & { isE2E?: boolean }).isE2E = true
    })

    // 1. Setup - Start Game and Open Business
    await page.goto('/')
    await page.getByRole('button', { name: /Одиночная игра/i }).click()

    // Select USA
    const usaHeading = page.getByRole('heading', { name: /США/i })
    while (!(await usaHeading.isVisible())) {
      await page.getByLabel(/Next country|Следующая страна/i).click()
    }
    await page.getByRole('button', { name: /Выбрать и продолжить/i }).click()

    // Select Wall Street Analyst (High starting capital)
    while (!(await page.getByText('Wall Street Analyst').isVisible())) {
      await page.getByLabel('Next character').click()
    }
    await page.getByRole('button', { name: /Выбрать/i }).click()

    // Navigate to Business
    await page.getByTitle('Карьера и доход').click()
    await page.getByText('Открыть бизнес').click()

    // Open the first available business
    const openButton = page.getByText(/Открыть за/i).first()
    await expect(openButton).toBeVisible({ timeout: 10000 })
    await openButton.click()

    // Clear initial notifications if any
    console.log('Clearing initial notifications...')
    const initialToasts = page.getByTestId('notification-toast')
    await expect(async () => {
      const count = await initialToasts.count()
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const closeButton = initialToasts.first().getByRole('button').first()
          if (await closeButton.isVisible()) {
            await closeButton.click()
          }
        }
      }
      await expect(initialToasts).toHaveCount(0)
    }).toPass({ timeout: 10000 })

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('all-businesses-dialog-content')).toBeHidden()

    // 2. Open Business Management
    console.log('Opening business management...')
    const businessCard = page.locator('[data-testid^="business-card-"]').first()
    await expect(businessCard).toBeVisible({ timeout: 15000 })

    const manageButton = businessCard.getByTestId('manage-business-button')
    if (await manageButton.isVisible()) {
      await manageButton.click()
    } else {
      await businessCard.getByRole('button', { name: /Подробнее/i }).click()
      const dialogManageButton = page.getByTestId('manage-business-button')
      await expect(dialogManageButton).toBeVisible({ timeout: 5000 })
      await dialogManageButton.click()
    }

    const managementDialog = page.getByRole('dialog').filter({ hasText: /Управление/i })
    await expect(managementDialog).toBeVisible({ timeout: 10000 })

    // 3. Production Management
    console.log('Testing production volume control...')
    // Price slider is index 0, Production slider is index 1 (if not service)
    const sliders = managementDialog.locator('input[type="range"]')
    if ((await sliders.count()) >= 2) {
      const productionSlider = sliders.nth(1)
      await productionSlider.fill('500')

      // Verify production display updates
      const productionDisplay = managementDialog
        .locator('span.text-2xl.font-bold.text-blue-400')
        .first()
      await expect(productionDisplay).toHaveText(/500/)
      console.log('Production volume set to 500')
    } else {
      console.log('Business is service-based, skipping production volume test')
    }

    // Clear notifications again before lifecycle tests
    console.log('Clearing notifications before lifecycle tests...')
    const notificationToasts = page.getByTestId('notification-toast')
    await expect(async () => {
      const count = await notificationToasts.count()
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const closeButton = notificationToasts.first().getByRole('button').first()
          if (await closeButton.isVisible()) {
            await closeButton.click()
          }
        }
      }
      await expect(notificationToasts).toHaveCount(0)
    }).toPass({ timeout: 10000 })

    // 4. Employee Lifecycle - Hire, Promote, Fire
    console.log('Testing employee lifecycle...')
    const hireButton = page.getByRole('button', { name: /Нанять \/ Занять/i }).first()
    await expect(hireButton).toBeVisible({ timeout: 10000 })
    await hireButton.click()

    const hireDialog = page.getByRole('dialog').filter({ hasText: /Выбор кандидата/i })
    await expect(hireDialog).toBeVisible({ timeout: 10000 })

    // Click first candidate and hire
    const candidateCard = hireDialog.locator('[data-slot="card"]').first()
    await candidateCard.click()

    // Check if selected
    await expect(candidateCard).toHaveClass(/border-blue-500/)

    const confirmHireButton = hireDialog.locator('button').filter({ hasText: /Нанять/i })
    await expect(confirmHireButton).toBeEnabled({ timeout: 5000 })
    await confirmHireButton.click()

    // Wait for success toast
    const successToast = page.getByTestId('notification-toast').filter({ hasText: /нанят/i })
    await expect(successToast).toBeVisible({ timeout: 20000 })

    // Close toast
    const closeToast = successToast.getByRole('button').first()
    if (await closeToast.isVisible()) {
      await closeToast.click()
    }

    // Promote Employee
    console.log('Promoting employee...')
    const employeeCard = managementDialog
      .locator('[data-slot="card"]')
      .filter({ hasText: /Уволить/i })
      .first()
    await expect(employeeCard).toBeVisible({ timeout: 10000 })

    // Clear notifications before promotion
    console.log('Clearing notifications before promotion...')
    const prePromoteToasts = page.getByTestId('notification-toast')
    await expect(async () => {
      const count = await prePromoteToasts.count()
      for (let i = 0; i < count; i++) {
        const closeBtn = prePromoteToasts.first().getByRole('button').first()
        if (await closeBtn.isVisible()) await closeBtn.click()
      }
      await expect(prePromoteToasts).toHaveCount(0)
    }).toPass({ timeout: 10000 })

    const initialSalaryText = await employeeCard.getByTestId('employee-salary').innerText()
    const initialSalary = parseInt(initialSalaryText.replace(/[^0-9]/g, ''), 10)
    console.log(`Initial salary before promotion: ${String(initialSalary)}`)

    const promoteButton = employeeCard.getByRole('button', { name: /Повысить/i })
    await promoteButton.click()

    // Wait for promotion toast
    console.log('Waiting for promotion toast...')
    const promotionToast = page.getByTestId('notification-toast').filter({ hasText: /повышен/i })
    await expect(promotionToast).toBeVisible({ timeout: 15000 })

    // Close promotion toast to avoid blocking
    const closePromoteToast = promotionToast.getByRole('button').first()
    if (await closePromoteToast.isVisible()) {
      await closePromoteToast.click()
    }

    // Verify salary increased
    console.log('Verifying salary increase...')
    await expect(async () => {
      const newSalaryText = await employeeCard.getByTestId('employee-salary').innerText()
      const newSalary = parseInt(newSalaryText.replace(/[^0-9]/g, ''), 10)
      console.log(`Salary check: Initial=${String(initialSalary)}, Current=${String(newSalary)}`)

      // Check for success notification if we are stuck
      const successNotification = page.locator('div:has-text("повышен до")').first()
      if (await successNotification.isVisible()) {
        console.log('Success notification seen during salary check')
      }

      if (newSalary <= initialSalary) {
        throw new Error(
          `Salary not increased yet: ${String(newSalary)} <= ${String(initialSalary)}. UI Text: "${newSalaryText}"`,
        )
      }
    }).toPass({ intervals: [500, 1000, 2000], timeout: 15000 })

    console.log('Salary increased successfully')

    // Fire Employee
    console.log('Firing employee...')
    const fireButton = employeeCard.getByRole('button', { name: /Уволить/i })
    await fireButton.click()

    // Wait for firing toast
    const fireToast = page
      .getByTestId('notification-toast')
      .filter({ hasText: /Сотрудник уволен/i })
    await expect(fireToast).toBeVisible({ timeout: 10000 })

    // Verify vacancy returns
    await expect(
      managementDialog.getByRole('button', { name: /Нанять \/ Занять/i }).first(),
    ).toBeVisible({
      timeout: 10000,
    })
    console.log('Employee fired and vacancy returned')

    // 5. Advance Turn and Check Reports
    console.log('Advancing turn to generate report...')
    // Close management dialog more robustly
    console.log('Closing management dialog...')
    const closeButton = managementDialog.locator('button[data-slot="dialog-close"]').first()
    if (await closeButton.isVisible()) {
      await closeButton.click()
    } else {
      await page.keyboard.press('Escape')
    }

    // Wait for the dialog to be hidden with a retry logic
    await expect(async () => {
      if (await managementDialog.isVisible()) {
        await page.keyboard.press('Escape')
      }
      await expect(managementDialog).toBeHidden({ timeout: 5000 })
    }).toPass({ intervals: [1000, 2000], timeout: 15000 })
    console.log('Management dialog closed')

    // Also ensure the details dialog is closed
    const detailsDialog = page.getByRole('dialog').filter({ hasText: /Описание бизнеса/i })
    if (await detailsDialog.isVisible()) {
      await page.keyboard.press('Escape')
      await expect(detailsDialog).toBeHidden({ timeout: 5000 })
    }
    console.log('Details dialog closed')

    const turnButton = page.getByRole('button', { name: /ЗАВЕРШИТЬ ХОД/i })
    await expect(turnButton).toBeVisible({ timeout: 10000 })
    await turnButton.click()
    await expect(turnButton).toBeEnabled({ timeout: 60000 }) // Increase timeout for processing

    // Close turn notifications
    let closeNotif = page.getByRole('button', { name: /Закрыть/i }).first()
    while (await closeNotif.isVisible()) {
      await closeNotif.click()
      await expect(closeNotif).toBeHidden({ timeout: 5000 })
      closeNotif = page.getByRole('button', { name: /Закрыть/i }).first()
    }

    await page.getByTitle('Карьера и доход').click()
    await expect(page.getByText(/Мои бизнесы/i)).toBeVisible({ timeout: 10000 })

    // 6. View Reports
    console.log('Viewing reports...')
    // Re-open management dialog to see the summary
    const businessCardAfterTurn = page.locator('[data-testid^="business-card-"]').first()
    await expect(businessCardAfterTurn).toBeVisible({ timeout: 15000 })

    const manageButtonAfterTurn = businessCardAfterTurn.getByTestId('manage-business-button')
    if (await manageButtonAfterTurn.isVisible()) {
      await manageButtonAfterTurn.click()
    } else {
      await businessCardAfterTurn.getByRole('button', { name: /Подробнее/i }).click()
      const dialogManageButton = page.getByTestId('manage-business-button')
      await expect(dialogManageButton).toBeVisible({ timeout: 5000 })
      await dialogManageButton.click()
    }

    // Verify report sections in the summary
    await expect(page.getByText(/Прошлый квартал/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Доход/i).first()).toBeVisible()
    await expect(page.getByText(/Расходы/i).first()).toBeVisible()
    await expect(page.getByText(/Прибыль/i).first()).toBeVisible()

    console.log('Business Advanced Test Completed Successfully!')
  })
})
