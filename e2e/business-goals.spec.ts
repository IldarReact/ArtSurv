import { expect, test } from '@playwright/test'

test.describe('Business Goals E2E', () => {
  test.setTimeout(180000) // Increase timeout for complex game flow

  test('should be able to complete business goals for price and quantity', async ({ page }) => {
    // 1. Setup - Start Game using the flow from business-advanced.spec.ts
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

    // 2. Navigate to Career/Income section
    await page.getByTitle('Карьера и доход').click()

    // 3. Open business opening dialog
    await page.getByText('Открыть бизнес').click()

    // Select the business
    const businessId = 'bus_retail_vape'

    const businessCard = page.getByTestId(`business-card-${businessId}`)
    await expect(businessCard).toBeVisible({ timeout: 15000 })
    await businessCard.click()

    const openButton = page.getByTestId(`business-card-open-button-${businessId}`)
    await expect(openButton).toBeVisible({ timeout: 15000 })

    await openButton.click()

    // Wait for the opening dialog to close
    // We expect the dialog content to disappear
    await expect(page.getByTestId('all-businesses-dialog-content')).toBeHidden({
      timeout: 20000,
    })

    // 5. Navigate to Business Management
    // Wait for "Мои бизнесы" section to appear
    await expect(page.getByText('Мои бизнесы')).toBeVisible({ timeout: 15000 })

    // Find the business card in the list
    const ownedBusinessCard = page.getByTestId(`business-card-${businessId}`)
    await expect(ownedBusinessCard).toBeVisible({ timeout: 15000 })

    // Open InfoCard modal
    await ownedBusinessCard.getByRole('button', { name: /Подробнее/i }).click()

    // Open BusinessManagementDialog
    const managementButton = page.getByRole('button', { name: /Управление персоналом/i })
    await expect(managementButton).toBeVisible()
    await managementButton.click()

    // 6. Verify Business Goals are visible in the management dialog
    await expect(page.getByText('Бизнес-цели')).toBeVisible()
    await expect(page.getByText('Ценовая стратегия')).toBeVisible()
    await expect(page.getByText('Масштабирование')).toBeVisible()

    // 7. Change Price to complete Price Goal
    // Price goal target is 8. Default is 7 for Vape Shop.
    const priceSlider = page.locator('input[type="range"]').first()
    await priceSlider.fill('8')

    // 8. Change Quantity to complete Quantity Goal
    // Quantity goal target is 500. Default is 900 for Vape Shop.
    // Set it to 400 and then to 600 to trigger completion logic
    const quantitySlider = page.locator('input[type="range"]').last()
    await quantitySlider.fill('400')
    await quantitySlider.fill('600')

    // 9. Advance Turn to trigger goal update
    // Close the management dialog first
    await page.keyboard.press('Escape')
    // Wait for management dialog to close by checking if business goals are gone
    await expect(page.getByText('Бизнес-цели')).toBeHidden()

    // Close the InfoCard modal
    await page.keyboard.press('Escape')
    // Wait for InfoCard to close
    await expect(managementButton).toBeHidden()

    const turnButton = page.getByRole('button', { name: /ЗАВЕРШИТЬ ХОД/i })
    await turnButton.click()

    // Wait for turn processing
    await expect(turnButton).toBeEnabled({ timeout: 30000 })

    // 10. Verify Goals are Completed
    // Open management again
    await ownedBusinessCard.getByRole('button', { name: /Подробнее/i }).click()
    await page.getByRole('button', { name: /Управление персоналом/i }).click()

    // Check for emerald color (completed state)
    // The goals use text-emerald-400 for completed titles
    const completedGoal = page.locator('.text-emerald-400').first()
    await expect(completedGoal).toBeVisible({ timeout: 10000 })
  })
})
