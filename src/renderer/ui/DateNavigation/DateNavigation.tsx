import styles from './DateNavigation.sass'
import { DateTime } from 'luxon'
import { ISOWeek } from 'model/ISOWeek'
import { formatISOWeekDate, getISOWeek } from 'service/date'
import { Button } from 'renderer/ui/Button/Button'

interface DateNavigationProps {
  updateWeek: (week: ISOWeek) => void
  week: ISOWeek
}

export const DateNavigation = ({ updateWeek, week }: DateNavigationProps) => {
  const toNextWeek = () => {
    const { weekYear, weekNumber } = DateTime.fromObject(week).plus({ week: 1 })
    updateWeek({ weekYear, weekNumber })
  }

  const toPrevWeek = () => {
    const { weekYear, weekNumber } = DateTime.fromObject(week).minus({ week: 1 })
    updateWeek({ weekYear, weekNumber })
  }

  return (
    <div className={styles.dateNavigation}>
      <Button onClick={toPrevWeek} variant="secondary">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Button>
      <input
        type="week"
        onChange={event => updateWeek(getISOWeek(event.target.value))}
        value={formatISOWeekDate(week)}
        className={styles.weekInput}
      />
      <Button onClick={toNextWeek} variant="secondary">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Button>
    </div>
  )
}
