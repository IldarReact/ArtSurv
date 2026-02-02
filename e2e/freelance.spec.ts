import { test, expect } from '@playwright/test'

test.describe('Freelance E2E', () => {
  test('should be able to take and complete a freelance gig', async ({ page }) => {
    // 1. Start the game
    await page.goto('/')
    await page.evaluate(() => {
      ;(window as unknown as { isE2E: boolean }).isE2E = true
    })
    await page.getByRole('button', { name: /Одиночная игра/i }).click()

    // 2. Select Country (США)
    const usaHeading = page.getByRole('heading', { name: /США/i })
    while (!(await usaHeading.isVisible())) {
      await page.getByLabel(/Next country|Следующая страна/i).click()
    }
    await page.getByRole('button', { name: /Выбрать и продолжить/i }).click()

    // 3. Select Archetype (Wall Street Analyst has finance skills now)
    while (!(await page.getByText('Wall Street Analyst').isVisible())) {
      await page.getByLabel('Next character').click()
    }
    await page.getByRole('button', { name: /Выбрать/i }).click()

    // 4. Navigate to Work activity
    await page.getByRole('button', { exact: true, name: 'РАБОТА' }).click()
    await expect(page.getByText('Фриланс')).toBeVisible()

    // 5. Find a freelance gig
    // Click on the Freelance opportunity card
    await page.getByText('Искать заказы').click()

    // Take the first available gig in the dialog
    const dialogContent = page.getByRole('dialog')
    await expect(dialogContent).toBeVisible()

    const firstGigButton = dialogContent.getByRole('button', { name: /Взять заказ/i }).first()
    await firstGigButton.click()

    // 6. Verify feedback
    await expect(page.getByText(/Заявка на заказ .* отправлена/i)).toBeVisible()
    await page.keyboard.press('Escape') // Close the dialog

    // 7. Pass the turn to get the gig approved
    await page.getByRole('button', { name: /ЗАВЕРШИТЬ ХОД/i }).click()

    // Wait for turn processing to finish (button becomes enabled again)
    await expect(page.getByRole('button', { name: /ЗАВЕРШИТЬ ХОД/i })).toBeEnabled({
      timeout: 20000,
    })

    // Check for notifications and close them if they exist
    let closeNotification = page.getByRole('button', { name: /Закрыть/i }).first()
    while (await closeNotification.isVisible()) {
      await closeNotification.click()
      await expect(closeNotification).not.toBeVisible({ timeout: 5000 })
      closeNotification = page.getByRole('button', { name: /Закрыть/i }).first()
    }

    // 8. Verify it appears in ActiveFreelanceSection
    await page.getByRole('button', { exact: true, name: 'РАБОТА' }).click()
    // Wait a bit for the section to appear
    await expect(page.getByText(/Активные заказы/i)).toBeVisible({ timeout: 20000 })
    await expect(page.getByText(/Выполняется автоматически/i).first()).toBeVisible({
      timeout: 10000,
    })
  })
})
