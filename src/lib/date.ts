export function formatMoscow(dateInput: string | number | Date): string {
  try {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput)
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: undefined,
      hour12: false,
      timeZone: 'Europe/Moscow',
    }).format(d)
  } catch {
    try {
      return new Date(dateInput as any).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
    } catch {
      return String(dateInput)
    }
  }
} 