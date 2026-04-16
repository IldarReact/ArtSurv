'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Briefcase,
  XCircle,
  TrendingUp,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { useGameStore } from '@/core/model/store'
import type { Notification } from '@/core/types'

export function NotificationsToast() {
  const { dismissNotification, notifications } = useGameStore()
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null)

  // Use the first unread notification if nothing is active
  const firstUnread = notifications.find((n) => !n.isRead)

  // Only update state if the actual notification data changed
  if (firstUnread && (!activeNotification || activeNotification.id !== firstUnread.id)) {
    setActiveNotification(firstUnread)
  }

  useEffect(() => {
    if (activeNotification) {
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        dismissNotification(activeNotification.id)
        setActiveNotification((prev) => (prev?.id === activeNotification.id ? null : prev))
      }, 5000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [activeNotification, dismissNotification])

  if (!activeNotification) return null

  const icons: Record<Notification['type'], React.ReactNode> = {
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    job_offer: <Briefcase className="w-5 h-5 text-blue-400" />,
    job_rejection: <XCircle className="w-5 h-5 text-red-400" />,
    promotion: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  }

  const bgColors: Record<Notification['type'], string> = {
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
    job_offer: 'bg-blue-500/10 border-blue-500/20',
    job_rejection: 'bg-red-500/10 border-red-500/20',
    promotion: 'bg-emerald-500/10 border-emerald-500/20',
    success: 'bg-green-500/10 border-green-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
  }

  const type = activeNotification.type

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 w-full max-w-md px-4 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`pointer-events-auto flex items-start gap-4 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${bgColors[type]}`}
          data-testid="notification-toast"
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          key={activeNotification.id}
          transition={{ duration: 0.2 }}
        >
          <div className="mt-0.5">{icons[type]}</div>
          <div className="flex-1">
            {activeNotification.title && (
              <h5 className="text-sm font-bold text-white mb-1">{activeNotification.title}</h5>
            )}
            <p className="text-sm text-white/80 leading-relaxed">{activeNotification.message}</p>
          </div>
          <button
            className="text-white/40 hover:text-white transition-colors"
            onClick={() => {
              setActiveNotification(null)
              dismissNotification(activeNotification.id)
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
