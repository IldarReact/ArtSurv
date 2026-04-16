// Notification types

export interface Notification<TData = unknown> {
  data?: TData
  date?: string
  id: string
  isRead: boolean
  message: string
  title: string
  type: 'job_offer' | 'job_rejection' | 'info' | 'promotion' | 'success' | 'warning' | 'error'
}
