'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/shared/utils/utils'

interface FeedbackAnimationProps {
  message: string
  onComplete?: () => void
  show: boolean
  success: boolean
}

export function FeedbackAnimation({ message, onComplete, show, success }: FeedbackAnimationProps) {
  const [isVisible, setIsVisible] = useState(show)
  const [prevShow, setPrevShow] = useState(show)

  if (show !== prevShow) {
    setPrevShow(show)
    setIsVisible(show)
  }

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 2000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div
            className={`
              flex items-center gap-4 px-8 py-6 rounded-2xl shadow-2xl backdrop-blur-xl
              ${
                success
                  ? 'bg-green-500/90 border-2 border-green-300'
                  : 'bg-red-500/90 border-2 border-red-300'
              }
            `}
          >
            <motion.div
              animate={{ rotate: 360, scale: 1 }}
              initial={{ rotate: 0, scale: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {success ? (
                <CheckCircle2 className="w-12 h-12 text-white" />
              ) : (
                <XCircle className="w-12 h-12 text-white" />
              )}
            </motion.div>
            <div className="text-white">
              <h3 className="text-xl font-bold mb-1">{success ? 'Успешно!' : 'Ошибка'}</h3>
              <p className="text-white/90">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface ClickFeedbackProps {
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
}

export function ClickFeedback({ children, className, disabled, onClick }: ClickFeedbackProps) {
  return (
    <motion.div
      className={cn(disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', className)}
      onClick={!disabled ? onClick : undefined}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.div>
  )
}
