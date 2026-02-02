import { test, expect } from '@playwright/test'

test.describe('Business Management E2E', () => {
  test('should be able to open a business and manage it', async ({ page }) => {
    // 1. Start the game
    await page.goto('/')
    await page.getByRole('button', { name: /Одиночная игра/i }).click()

    // 2. Select Country (США)
    const usaHeading = page.getByRole('heading', { name: /США/i })
    while (!(await usaHeading.isVisible())) {
      await page.getByLabel(/Next country|Следующая страна/i).click()
    }
    await page.getByRole('button', { name: /Выбрать и продолжить/i }).click()

    // 3. Select Archetype (Wall Street Analyst starts with $50k)
    while (!(await page.getByText('Wall Street Analyst').isVisible())) {
      await page.getByLabel('Next character').click()
    }
    await page.getByRole('button', { name: /Выбрать/i }).click()

    // 4. Navigate to Work activity
    await page.getByTitle('Карьера и доход').click()
    await expect(page.getByText('Открыть бизнес')).toBeVisible()

    // 5. Find and open a business
    // Click on the Business opportunity card
    await page.getByText('Открыть бизнес').click()

    // Find the first affordable business and click// Open the business
    const openButton = page.getByText(/Открыть за/i).first()
    await expect(openButton).toBeVisible({ timeout: 10000 })
    await openButton.click()

    // 6. Verify feedback
    await expect(
      page
        .getByText(/успешно открыли/i)
        .or(page.getByText(/успешно открыт/i))
        .first(),
    ).toBeVisible({ timeout: 10000 })

    // Check if it appears in "Мои бизнесы" section
    await page.keyboard.press('Escape') // Close templates list
    await page.keyboard.press('Escape') // Close Business card dialog
    await expect(page.getByText(/Мои бизнесы/i)).toBeVisible({ timeout: 10000 })
  })
})
