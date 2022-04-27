import { DateTime } from 'luxon'
import type { ISOWeek } from 'model/ISOWeek'

export const formatDate = (date: string) =>
  DateTime.fromISO(date).toLocaleString({
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  })

export const formatLongDateTime = (date: string) =>
  DateTime.fromISO(date).toLocaleString({
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

export const formatISODate = (date: string) => DateTime.fromISO(date).toISODate()

export const addLeadingZeros = (number: number, totalLength: number) => String(number).padStart(totalLength, '0')

export const formatLongISODateTime = (date: Date | string | number) =>
  new Date(date).toISOString().replace('Z', '+0000')

export const getISODateTime = (date?: string) =>
  (date ? DateTime.fromISO(date) : DateTime.now()).toISO().split(':').slice(0, 2).join(':')

export const getISOWeek = (date?: string) => {
  const { weekNumber, weekYear } = date ? DateTime.fromISO(date) : DateTime.now()
  return { weekNumber, weekYear }
}

export const getWeekRange = (week: ISOWeek) => {
  const dt = DateTime.fromObject(week)

  return {
    start: dt.startOf('week').toISODate(),
    end: dt.endOf('week').toISODate(),
  }
}

export const formatISOWeekDate = ({ weekYear, weekNumber }: ISOWeek) => {
  return `${weekYear}-W${addLeadingZeros(weekNumber, 2)}`
}
