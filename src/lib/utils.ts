import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateHoursDifference(start: string, end: string): number {
  if (!start || !end) return 0
  const d1 = new Date(start)
  const d2 = new Date(end)
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0
  const diffMs = d2.getTime() - d1.getTime()
  return diffMs > 0 ? diffMs / (1000 * 60 * 60) : 0
}

export function parseSemicolonList(text: string): string[] {
  if (!text) return []
  return text
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
