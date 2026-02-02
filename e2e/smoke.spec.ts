import { test, expect } from '@playwright/test'

test.describe('Smoke Test - Main Menu', () => {
  test.describe.configure({ mode: 'parallel' })

  test('should load the main menu with correct title', async ({ page }) => {
    // Переходим на главную страницу
    await page.goto('/')

    // Проверяем заголовок игры
    const title = page.locator('h1')
    await expect(title).toBeVisible()
    await expect(title).toHaveText('ArtSurv')

    // Проверяем наличие кнопок меню
    const singlePlayerButton = page.getByRole('button', { name: /Одиночная игра/i })
    const multiplayerButton = page.getByRole('button', { name: /Мультиплеер/i })

    await expect(singlePlayerButton).toBeVisible()
    await expect(multiplayerButton).toBeVisible()
  })

  test('should navigate to setup when clicking Single Player', async ({ page }) => {
    await page.goto('/')

    // Кликаем по кнопке одиночной игры
    await page.getByRole('button', { name: /Одиночная игра/i }).click()

    // Проверяем, что перешли к выбору мира (WorldSelect)
    // В WorldSelect обычно есть заголовок страны (h1)
    await expect(page.locator('h1').filter({ hasText: /Бразилия|Германия|США/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Выбрать и продолжить/i })).toBeVisible()
  })
})
