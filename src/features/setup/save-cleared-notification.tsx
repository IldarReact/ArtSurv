/**
 * Компонент для отображения уведомления о необходимости обновления страницы
 * после очистки несовместимого сохранения
 */

'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/shared/components/button'

export function SaveClearedNotification() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Проверяем, было ли сохранение очищено
    const checkCleared = () => {
      const logs = (window as Window & { __saveClearedFlag?: boolean }).__saveClearedFlag
      if (logs) {
        setShow(true)
      }
    }

    checkCleared()
    // Проверяем каждую секунду на случай, если очистка произошла после монтирования
    const interval = setInterval(checkCleared, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-9999">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">🔄 Обновление требуется</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Ваше сохранение было несовместимо с новой версией игры и было автоматически очищено.
          Пожалуйста, обновите страницу, чтобы начать новую игру.
        </p>
        <Button
          className="w-full"
          onClick={() => {
            window.location.reload()
          }}
          size="lg"
        >
          Обновить страницу
        </Button>
      </div>
    </div>
  )
}
