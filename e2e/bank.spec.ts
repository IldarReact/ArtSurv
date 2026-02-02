import { test, expect } from '@playwright/test'

test.describe('Bank E2E', () => {
  test('should be able to borrow and repay money', async ({ page }) => {
    // 1. Start the game
    await page.goto('/')
    await page.getByRole('button', { name: /Одиночная игра/i }).click()

    // 2. Select Country (USA)
    const usaHeading = page.getByRole('heading', { name: /США/i })
    while (!(await usaHeading.isVisible())) {
      await page.getByLabel(/Next country|Следующая страна/i).click()
    }
    await page.getByRole('button', { name: /Выбрать и продолжить/i }).click()

    // 3. Select Archetype
    await page
      .getByRole('button', { name: /Выбрать/i })
      .first()
      .click()

    // 4. Navigate to Bank
    await page.getByRole('button', { exact: true, name: 'БАНКИ' }).click()
    await expect(page.getByText('Кредитование')).toBeVisible()

    // 5. Check initial credit limit
    const limitLocator = page.locator('h3:has-text("Доступный лимит") + p')
    await expect(limitLocator).toBeVisible()
    const availableLimitText = await limitLocator.innerText()
    const initialLimit = parseInt(availableLimitText.replace(/[^0-9]/g, ''))
    expect(initialLimit).toBeGreaterThan(0)

    // 6. Borrow money
    await page.getByPlaceholder('0').first().fill('1000')
    await page.getByRole('button', { name: /Взять кредит/i }).click()

    // 7. Verify debt appeared
    const debtCard = page
      .locator('div:has-text("Кредитная линия")')
      .filter({ has: page.locator('p:has-text("$1,000")') })
      .first()
    await expect(debtCard).toBeVisible()

    // 8. Repay money
    await page.getByPlaceholder('0').last().fill('500')
    await page.getByRole('button', { name: /Погасить/i }).click()

    // 9. Verify debt decreased
    await expect(
      page.locator('div:has-text("Кредитная линия")').locator('p:has-text("$500")').first(),
    ).toBeVisible()
  })

  test('should be able to open and close deposits', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Одиночная игра/i }).click()

    // Select USA to ensure enough starting money
    const usaHeading = page.getByRole('heading', { name: /США/i })
    while (!(await usaHeading.isVisible())) {
      await page.getByLabel(/Next country|Следующая страна/i).click()
    }
    await page.getByRole('button', { name: /Выбрать и продолжить/i }).click()

    await page
      .getByRole('button', { name: /Выбрать/i })
      .first()
      .click()

    await page.getByRole('button', { exact: true, name: 'БАНКИ' }).click()
    await expect(page.getByRole('heading', { name: 'Вклады' })).toBeVisible()

    // 1. Open deposit
    await page.getByRole('button', { exact: true, name: 'Открыть вклад' }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('spinbutton').fill('10000')
    await dialog.getByRole('button', { exact: true, name: 'Открыть вклад' }).click()

    // Wait for dialog to close to ensure aria-hidden is removed
    await expect(dialog).toBeHidden()

    // 2. Verify deposit appeared
    const depositCard = page
      .locator('[data-slot="card"]')
      .filter({ hasText: 'Сберегательный счет' })
      .first()

    await expect(depositCard).toBeVisible()
    await expect(depositCard.getByText(/10[.,]?000/)).toBeVisible()

    // 3. Close deposit
    await depositCard.getByRole('button', { name: /Закрыть/i }).click()

    // 4. Verify deposit closed
    await expect(depositCard).toBeHidden()
  })
})
