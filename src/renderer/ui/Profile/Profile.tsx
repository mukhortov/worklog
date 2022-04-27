import { User } from 'renderer/ui/User/User'
import { ipcRenderer } from 'electron'
import { Button } from 'renderer/ui/Button/Button'
import styles from './Profile.sass'
import { useSessionContext } from 'renderer/hooks/SessionContext'

const remove = () => {
  ipcRenderer.invoke('remove-account').then(() => {
    // TODO: remove account info from the session context
    window.location.reload()
  })
}

export const Profile = () => {
  const { jiraSettings, currentUser } = useSessionContext()

  return (
    <>
      <section className={styles.profile}>
        {currentUser && <User currentUser={currentUser} />}
        <Button onClick={remove} variant="secondary">
          Log out
        </Button>
      </section>
      <section className={styles.settings}>
        <strong>Jira settings</strong>
        <div>
          {/* TODO: fix the default value in the context provider */}
          <span className={styles.label}>Time zone:</span> {currentUser?.timeZone}
        </div>
        <div>
          {/* TODO: fix the default value in the context provider */}
          <span className={styles.label}>Workday:</span> {jiraSettings?.workingHoursPerDay} hours per day
        </div>
        <div>
          {/* TODO: fix the default value in the context provider */}
          <span className={styles.label}>Workweek:</span> {jiraSettings?.workingDaysPerWeek} days per week
        </div>
      </section>
    </>
  )
}
