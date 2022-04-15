import styles from './Header.sass'
import { Button } from 'renderer/ui/Button/Button'
import { useSessionContext } from 'renderer/hooks/SessionContext'
import { User } from 'renderer/ui/User/User'
import { useModalContext } from 'renderer/hooks/ModalContext'
import { DateNavigation } from 'renderer/ui/DateNavigation/DateNavigation'

export const Header = () => {
  const { currentUser, week, updateWeek } = useSessionContext()
  const { toggleAccountModal, toggleAddWorklogModal } = useModalContext()

  return (
    <header className={styles.header}>
      {currentUser && <User minimal currentUser={currentUser} onClick={() => toggleAccountModal(true)} />}

      {currentUser && <DateNavigation updateWeek={updateWeek} week={week} />}

      <div className={styles.actions}>
        <Button onClick={() => toggleAddWorklogModal({ open: true })} variant="secondary" title="Log work">
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Button>
      </div>
    </header>
  )
}
