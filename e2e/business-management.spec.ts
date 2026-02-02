import { test, expect } from '@playwright/test'

test.describe('Business Management Advanced E2E', () => {
  test('should be able to open, manage and advance turns with a business', async ({ page }) => {
    test.setTimeout(120000) // Increase timeout for complex test

    // Enable E2E mode for deterministic logic
    await page.addInitScript(() => {
      ;(window as Window & { isE2E?: boolean }).isE2E = true
    })

    // 1. Start the game
    await page.goto('/')
    await page.getByRole('button', { name: /Одиночная игра/i }).click()

    // 2. Select Country (США)
    const usaHeading = page.getByRole('heading', { name: /США/i })
    while (!(await usaHeading.isVisible())) {
      await page.getByLabel(/Next country|Следующая страна/i).click()
    }
    await page.getByRole('button', { name: /Выбрать и продолжить/i }).click()

    // 3. Select Archetype (Wall Street Analyst)
    while (!(await page.getByText('Wall Street Analyst').isVisible())) {
      await page.getByLabel('Next character').click()
    }
    await page.getByRole('button', { name: /Выбрать/i }).click()

    // 4. Navigate to Work activity
    await page.getByTitle('Карьера и доход').click()
    await expect(page.getByText('Открыть бизнес')).toBeVisible()

    // 5. Open a business
    await page.getByText('Открыть бизнес').click()
    const openButton = page.getByText(/Открыть за/i).first()
    await expect(openButton).toBeVisible({ timeout: 10000 })
    await openButton.click()

    // Verify success and close notifications
    await expect(
      page
        .getByText(/успешно открыли/i)
        .or(page.getByText(/успешно открыт/i))
        .first(),
    ).toBeVisible({ timeout: 10000 })

    let closeNotification = page.getByRole('button', { name: /Закрыть/i }).first()
    while (await closeNotification.isVisible()) {
      await closeNotification.click()
      await expect(closeNotification).toBeHidden({ timeout: 5000 })
      closeNotification = page.getByRole('button', { name: /Закрыть/i }).first()
    }

    // 6. Manage Business - Hire Employee
    // Close any open dialogs from opening business
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('all-businesses-dialog-content')).toBeHidden()

    // Ensure we are in "Мои бизнесы" section or it is visible
    const myBusinessesSection = page.getByText(/Мои бизнесы/i)
    await expect(myBusinessesSection).toBeVisible({ timeout: 15000 })

    // Click "Подробнее" on the business card
    // Use a more robust locator that waits for the business card to appear
    const businessCard = page.locator('[data-testid^="business-card-"]').first()
    await expect(businessCard).toBeVisible({ timeout: 15000 })

    // Click 'Manage' button directly if possible, or 'Details' then 'Manage'
    const manageButton = businessCard.getByTestId('manage-business-button')
    if (await manageButton.isVisible()) {
      await manageButton.click()
    } else {
      await businessCard.getByRole('button', { name: /Подробнее/i }).click()
      const dialogManageButton = page.getByTestId('manage-business-button')
      await expect(dialogManageButton).toBeVisible({ timeout: 5000 })
      await dialogManageButton.click()
    }

    // Find a vacancy and click "Нанять / Занять"
    const vacancies = page.getByRole('button', { name: /Нанять \/ Занять/i })
    await expect(vacancies.first()).toBeVisible({ timeout: 10000 })
    const initialHireButtons = await vacancies.count()

    await vacancies.first().click()

    // Wait for Hire Dialog
    const hireDialog = page.getByRole('dialog').filter({ has: page.getByText(/Выбор кандидата/i) })
    await expect(hireDialog).toBeVisible({ timeout: 10000 })

    // Loop to handle potential rejections
    const maxAttempts = 3
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Select the candidate card at index 'attempt' to try different ones if needed
      const candidateCards = hireDialog.locator('[data-slot="card"]')
      const count = await candidateCards.count()
      if (count === 0) {
        break
      }

      const candidateCard = candidateCards.nth(attempt % count)
      await candidateCard.click()

      const confirmHireButton = hireDialog.getByRole('button', { name: /Нанять/i })
      await confirmHireButton.click()

      // Check if success or rejection notification appears
      const result = await Promise.race([
        page
          .getByText(/Сотрудник нанят/i)
          .waitFor({ state: 'visible', timeout: 10000 })
          .then(() => 'success'),
        page
          .getByText(/отклонил ваше предложение/i)
          .waitFor({ state: 'visible', timeout: 10000 })
          .then(() => 'rejection'),
        page
          .getByText(/Недостаточно энергии/i)
          .waitFor({ state: 'visible', timeout: 10000 })
          .then(() => 'no_energy'),
      ]).catch(() => 'timeout')

      if (result === 'success') {
        break
      } else {
        // Close the notification if it's there
        const closeToast = page.getByRole('button', { name: /Закрыть/i }).first()
        if (await closeToast.isVisible()) {
          await closeToast.click()
        }

        if (result === 'no_energy') {
          break
        }

        // If it was a timeout, maybe it actually succeeded?
        // Let's check if the dialog is still there
        if (!(await hireDialog.isVisible())) {
          const currentCount = await page.getByRole('button', { name: /Нанять \/ Занять/i }).count()
          if (currentCount < initialHireButtons) {
            break
          }
        }
      }
    }

    // Wait for hire dialog to close if it's still open
    if (await hireDialog.isVisible()) {
      await page.keyboard.press('Escape')
      await expect(hireDialog).toBeHidden()
    }

    // Verify hire success - vacancy count should decrease
    await expect(async () => {
      const currentHireButtons = await page
        .getByRole('button', { name: /Нанять \/ Занять/i })
        .count()
      expect(currentHireButtons).toBeLessThan(initialHireButtons)
    }).toPass({ timeout: 5000 })

    // 7. Manage Business - Change Price
    const managementDialog = page.getByRole('dialog').filter({ hasText: /Управление/i })
    await expect(managementDialog).toBeVisible({ timeout: 15000 })

    const priceSlider = managementDialog.locator('input[type="range"]').first()
    await expect(priceSlider).toBeVisible({ timeout: 15000 })
    await priceSlider.fill('8')

    // Verify price changed in UI
    const priceDisplay = managementDialog.getByTestId('price-display').first()
    await expect(priceDisplay).toHaveText(/8 \/ 10/)

    // Close management dialog
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

    // Also ensure the details dialog is closed
    const detailsDialog = page.getByRole('dialog').filter({ hasText: /Описание бизнеса/i })
    if (await detailsDialog.isVisible()) {
      await page.keyboard.press('Escape')
      await expect(detailsDialog).toBeHidden({ timeout: 5000 })
    }

    // 8. Advance Turn
    const turnButton = page.getByRole('button', { name: /ЗАВЕРШИТЬ ХОД/i })
    await expect(turnButton).toBeVisible({ timeout: 15000 })
    await expect(turnButton).toBeEnabled({ timeout: 15000 })
    await turnButton.click()

    // Wait for turn processing
    await expect(turnButton).toBeEnabled({ timeout: 45000 })

    // 9. Verify business still exists and check status
    // First close any turn notifications
    let closeTurnNotification = page.getByRole('button', { name: /Закрыть/i }).first()
    while (await closeTurnNotification.isVisible()) {
      await closeTurnNotification.click()
      await expect(closeTurnNotification).toBeHidden({ timeout: 5000 })
      closeTurnNotification = page.getByRole('button', { name: /Закрыть/i }).first()
    }

    await page.getByTitle('Карьера и доход').click()
    await expect(page.getByText(/Мои бизнесы/i)).toBeVisible({ timeout: 15000 })

    // Wait for the business card and click "Подробнее"
    const finalBusinessCard = page
      .locator('[data-slot="card"]')
      .filter({ hasText: /Сотрудники/i })
      .filter({ hasText: /Доход/i })
      .first()
    await expect(finalBusinessCard).toBeVisible({ timeout: 15000 })

    const finalDetailsButton = finalBusinessCard.getByRole('button', { name: /Подробнее/i })
    await expect(finalDetailsButton).toBeVisible({ timeout: 10000 })
    await finalDetailsButton.click()

    // Re-open business management and verify price
    await page.getByRole('button', { name: /Управление персоналом/i }).click()

    // Check if price is still 8
    const finalManagementDialog = page.getByRole('dialog').filter({ hasText: /Управление/i })
    await expect(finalManagementDialog).toBeVisible({ timeout: 15000 })

    const priceSliderAfter = finalManagementDialog.locator('input[type="range"]').first()
    await expect(priceSliderAfter).toBeVisible({ timeout: 15000 })
    await expect(priceSliderAfter).toHaveValue('8')
  })
})
