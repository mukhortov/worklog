import styles from './WeekChart.sass'
import { useRef, useState } from 'react'
import type { Issue } from 'model/Issue'
import type { DateRange } from 'model/DateRange'
import { formatISODate, formatLongDateTime } from 'service/date'
import type { WorklogEnriched } from 'model/Worklog'
import { DateTime, Interval, WeekdayNumbers } from 'luxon'
import { cn } from 'renderer/ui/className'
import { useSessionContext } from 'renderer/hooks/SessionContext'
import { Popover } from 'renderer/ui/Popover/Popover'
import { useModalContext } from 'renderer/hooks/ModalContext'

interface IntervalDay {
  date: string
  weekdayNumber: WeekdayNumbers
  weekday: string
  weekdayShort: string
  dayShort: string
  day: string
  worklogs?: WorklogEnriched[]
}

const worklogCreate = (date: string, hoursRemain: number) => ({
  timeSpent: `${hoursRemain}h`,
  started: DateTime.fromISO(date).plus({ hour: 9, minute: 30 }).toISO({ suppressSeconds: true, includeOffset: false }),
})

interface WorklogsProps {
  date: string
  worklogs: WorklogEnriched[]
  referenceElement?: HTMLDivElement | null
  onClose: () => void
}

const Worklogs = ({ worklogs, referenceElement, onClose, date }: WorklogsProps) => {
  const { toggleAddWorklogModal } = useModalContext()

  const editWorklog = (worklog: WorklogEnriched) => {
    onClose()
    toggleAddWorklogModal({ open: true, worklog })
  }

  return (
    <Popover onClose={onClose} referenceElement={referenceElement} width={220}>
      <div className={styles.worklogsMenu}>
        <h3>Time logged on {date}</h3>

        {worklogs.map(worklog => (
          <div className={styles.worklog} onClick={() => editWorklog(worklog)} key={worklog.id} title={worklog.summary}>
            <span className={styles.timeSpent} title={worklog.timeSpent}>
              {Math.floor((worklog.timeSpentSeconds / 3600) * 100) / 100}h
            </span>
            <img src={`${worklog.issuetype.iconUrl}`} />
            <strong>{worklog.key}</strong>
            <span className={styles.summary}>{worklog.summary}</span>
          </div>
        ))}
      </div>
    </Popover>
  )
}

interface DayBarProps {
  day: IntervalDay
}

const DayBar = ({ day }: DayBarProps) => {
  const { jiraSettings } = useSessionContext()

  const hoursSpent = day.worklogs
    ? day.worklogs?.map(w => w.timeSpentSeconds).reduce((acc, cur) => acc + cur, 0) / 3600
    : 0

  const tooltipText = day.worklogs
    ?.map(
      w =>
        `${w.issuetype.name} ${w.key}: ${w.summary}\nAuthor: ${w.author.displayName}\nTime spent: ${
          w.timeSpent
        }\nStarted: ${formatLongDateTime(w.started)}`,
    )
    .join(`\n----------\n`)

  const workingHoursPerDay = jiraSettings?.workingHoursPerDay ?? 8 // TODO: Fix this in the context provider
  const today = DateTime.now().toISODate() === day.date
  const weekend = day.weekdayNumber === 6 || day.weekdayNumber === 7
  const dayPlaceholderHeight = 136
  const height = Math.min(180, hoursSpent * (dayPlaceholderHeight / workingHoursPerDay))
  // TODO: Extract time spent formatting to a reusable method
  const formattedHoursSpent = Math.floor(hoursSpent * 100) / 100
  const hoursRemain = workingHoursPerDay - hoursSpent

  const ref = useRef<HTMLDivElement | null>(null)

  const [showMenu, setShowMenu] = useState(false)
  const { toggleAddWorklogModal } = useModalContext()

  return (
    <>
      <div className={cn([styles.day, weekend && styles.weekend, today && styles.today])} ref={ref}>
        <div
          className={styles.dayPlaceholder}
          style={{ height: dayPlaceholderHeight }}
          onClick={() => toggleAddWorklogModal({ open: true, worklog: worklogCreate(day.date, hoursRemain) })}
          title="Add worklog"
        />

        {hoursSpent > 0 && (
          <div className={styles.hourBar} onClick={() => setShowMenu(true)}>
            <div className={styles.hour}>{formattedHoursSpent}h</div>
            <div className={styles.bar} title={tooltipText} style={{ height }} />
          </div>
        )}

        <div className={styles.date}>
          {day.weekdayShort}
          <br />
          {day.dayShort}
        </div>
      </div>
      {day.worklogs && showMenu && (
        <Worklogs
          worklogs={day.worklogs}
          referenceElement={ref?.current}
          onClose={() => setShowMenu(false)}
          date={day.weekday}
        />
      )}
    </>
  )
}

interface Props {
  issues: Issue[]
  dateRange: DateRange
}

export const WeekChart = ({ issues, dateRange }: Props) => {
  const worklogs = issues
    .flatMap(({ worklog, ...rest }) => worklog.worklogs.map(w => ({ ...rest, ...w } as WorklogEnriched)))
    .sort((a, b) => Date.parse(a.started) - Date.parse(b.started))

  const worklogsByDay = worklogs.reduce((acc: { [key: string]: WorklogEnriched[] }, item) => {
    const date = formatISODate(item.started)
    acc[date] = [...(acc[date] ?? []), item]
    return acc
  }, {})

  const interval =
    Interval.fromDateTimes(DateTime.fromISO(dateRange.start), DateTime.fromISO(dateRange.end)).length('days') + 1

  const intervalDays: IntervalDay[] = [...Array(interval)].map((_, i) => {
    const day = DateTime.fromISO(dateRange.start).plus({ days: i })
    const date = day.toISODate()

    return {
      date,
      weekdayNumber: day.weekday,
      weekday: day.weekdayLong,
      weekdayShort: day.weekdayShort,
      dayShort: `${day.day} ${day.monthShort}`,
      day: `${day.day} ${day.monthLong}`,
      worklogs: worklogsByDay[date],
    }
  })

  return (
    <section className={styles.container}>
      {intervalDays?.map(d => (
        <DayBar day={d} key={d.date} />
      ))}
    </section>
  )
}
