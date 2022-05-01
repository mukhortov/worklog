import styles from './AddWorklog.sass'
import { DateTime } from 'luxon'
import { useCallback, useEffect, useState } from 'react'
import { ipcRenderer } from 'electron'
import { Button } from 'renderer/ui/Button/Button'
import { getISODateTime, getISOWeek } from 'service/date'
import { SearchIssue } from 'model/Issue'
import { Popover } from 'renderer/ui/Popover/Popover'
import { useSessionContext } from 'renderer/hooks/SessionContext'
import { useDebounce } from 'renderer/hooks/debounce'
import { WorklogCreate } from 'model/Worklog'
import { FormFieldInput } from 'renderer/ui/Form/FormField'
import { FormValidation } from 'model/FormValidation'

const formatTimeSpent = (time: string) => time.match(/\d*\.?\d+[m|h|d|w]/g)?.join(' ') ?? ''

interface AddWorklogProps {
  onClose: () => void
  worklog?: WorklogCreate
}

export const AddWorklog = ({ onClose, worklog }: AddWorklogProps) => {
  const { jiraSettings, week, updateWeek } = useSessionContext()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const searchQueryDebounced = useDebounce(searchQuery)
  const [issueKey, setIssueKey] = useState<string>('')
  const [issues, setIssues] = useState<SearchIssue[]>()
  const [started, setStarted] = useState<string>(getISODateTime())
  const [timeSpent, setTimeSpent] = useState<string>('')

  const [issueKeyStatus, setIssueKeyStatus] = useState<FormValidation>()
  const [timeSpentStatus, setTimeSpentStatus] = useState<FormValidation>()
  const [formStatus, setFormStatus] = useState<FormValidation>({ valid: false })

  const editMode = worklog?.id !== undefined

  const minSearchQuery = 3

  const testIssueKey = useCallback(
    (testKey: string) => {
      if (worklog || testKey === undefined || testKey.length <= minSearchQuery || issueKeyStatus?.valid) {
        return
      }
      setIssues(undefined) // Hide menu
      setIssueKeyStatus({ processing: true })
      ipcRenderer
        .invoke('test-issue-key', testKey)
        .then(() => setIssueKeyStatus({ processing: false, valid: true }))
        .catch(() => setIssueKeyStatus({ error: 'Invalid issue key', processing: false }))
    },
    [issueKeyStatus, worklog],
  )

  const testTimeSpent = useCallback(() => {
    if (timeSpent.length === 0) return

    const formattedTime = formatTimeSpent(timeSpent)
    setTimeSpent(formattedTime)
    setTimeSpentStatus({ error: formattedTime.length > 0 ? undefined : 'Use 30m 8h 1d 1w format' })
  }, [timeSpent])

  const onSuccessAction = () => {
    ipcRenderer.emit('update-issues')
    updateWeek(getISOWeek(started))
    onClose()
  }

  const addWorklog = () => {
    setFormStatus({ processing: true })
    ipcRenderer
      .invoke('add-worklog', { issueKey, started, timeSpent })
      .then(onSuccessAction)
      .catch(() => setFormStatus({ processing: false, error: 'Invalid parameters' }))
  }

  const editWorklog = () => {
    setFormStatus({ processing: true })
    ipcRenderer
      .invoke('edit-worklog', { worklogId: worklog?.id, issueKey, started, timeSpent })
      .then(onSuccessAction)
      .catch(() => setFormStatus({ processing: false, error: 'Invalid parameters' }))
  }

  const deleteWorklog = () => {
    setFormStatus({ processing: true })
    ipcRenderer
      .invoke('delete-worklog', { worklogId: worklog?.id, issueKey })
      .then(onSuccessAction)
      .catch(() => setFormStatus({ processing: false, error: 'Something went wrong' }))
  }

  const selectIssue = (key: string, test = false) => {
    if (test) {
      testIssueKey(key)
    } else {
      setIssueKeyStatus({ processing: false, valid: true })
      setSearchQuery('')
    }
    setIssues(undefined)
    setIssueKey(key)
  }

  const onTypeSearch = (query: string) => {
    setIssueKey('')
    setSearchQuery(query)
    setIssueKeyStatus({})
    if (query.length <= minSearchQuery) {
      setIssues(undefined)
    }
  }

  const getResentIssues = () => {
    if (!issues && !searchQuery && !issueKey) {
      setIssueKeyStatus({ processing: true })
      ipcRenderer.invoke('get-resent-issues').then((resentIssues: SearchIssue[]) => {
        setIssues(resentIssues)
        setIssueKeyStatus({ processing: false })
      })
    }
  }

  useEffect(() => {
    setTimeSpent(`${jiraSettings?.workingHoursPerDay ?? 8}h`)
  }, [jiraSettings])

  useEffect(() => {
    setIssues(undefined)
  }, [searchQuery])

  useEffect(() => {
    if (searchQueryDebounced.trim().length >= minSearchQuery) {
      const escapedSearchQuery = searchQueryDebounced.replace(/\[/g, '\\[').replace(/\]/g, '\\]').trim()
      setIssueKeyStatus(prev => ({ ...prev, processing: true }))
      ipcRenderer.invoke('search-issues', escapedSearchQuery).then((result: SearchIssue[]) => {
        const uniqueIssues = result.filter((value, index, array) => array.findIndex(v => v.id === value.id) === index)
        setIssues(uniqueIssues)
        setIssueKeyStatus(prev => ({ ...prev, processing: false }))
      })
    }
  }, [searchQueryDebounced])

  useEffect(() => {
    const thisWeek = getISOWeek()

    if (thisWeek.weekNumber !== week.weekNumber) {
      const startOfSelectedWeekDate = DateTime.fromObject({ ...week })
        .startOf('week')
        .plus({ hour: 9, minute: 30 })
        .toISO({ suppressSeconds: true, includeOffset: false })

      setStarted(startOfSelectedWeekDate)
    }
  }, [week])

  useEffect(() => {
    if (worklog) {
      // Prefill form with worklog data
      setIssueKey(worklog?.key ?? '')
      setStarted(getISODateTime(worklog.started))
      setTimeSpent(worklog.timeSpent)
    }
  }, [worklog])

  useEffect(() => {
    if (timeSpent) {
      setTimeSpentStatus(undefined)
    }
  }, [timeSpent])

  useEffect(() => {
    const noErrors = !issueKeyStatus?.error && !timeSpentStatus?.error
    const notEmpty = issueKey.length > 3 && formatTimeSpent(timeSpent).length > 0
    setFormStatus({ valid: noErrors && notEmpty })
  }, [issueKey, timeSpent, issueKeyStatus, timeSpentStatus])

  return (
    <section className={styles.container}>
      <FormFieldInput
        label="Issue key:"
        type="text"
        placeholder="Enter issue key"
        value={searchQuery.length > 0 ? searchQuery : issueKey}
        onChange={event => onTypeSearch(event.target.value)}
        onFocus={getResentIssues}
        disabled={editMode}
        onKeyDown={event => {
          if (event.key === 'Tab') {
            selectIssue(searchQuery, true)
          }
        }}
        {...issueKeyStatus}
        menu={
          issues && (
            <Popover onClose={() => setIssues(undefined)}>
              <div className={styles.menu}>
                {issues.length === 0 && <div className={styles.option}>No matches found</div>}
                {issues.map(issue => (
                  <div
                    className={styles.option}
                    onClick={() => selectIssue(issue.key)}
                    key={issue.id}
                    title={issue.summaryText}
                  >
                    {/* TODO: Fetch image with base auth */}
                    <img src={`${jiraSettings?.baseUrl}${issue.img}`} />
                    <strong>{issue.key}</strong>
                    {issue.summaryText}
                  </div>
                ))}
              </div>
            </Popover>
          )
        }
      />
      <FormFieldInput
        label="Start time:"
        type="datetime-local"
        placeholder="Enter start date and time"
        value={started}
        onChange={event => setStarted(event.target.value)}
      />
      <FormFieldInput
        label="Time spent:"
        type="text"
        placeholder="30m 8h 1d 1w"
        value={timeSpent}
        onChange={event => setTimeSpent(event.target.value)}
        title={`m = minutes\n h = hours\n d = days\n w = weeks`}
        onBlur={testTimeSpent}
        {...timeSpentStatus}
      />

      <div className={styles.actions}>
        {editMode && (
          <div className={styles.deleteButton}>
            <Button onClick={deleteWorklog} variant="danger">
              Delete
            </Button>
          </div>
        )}
        {formStatus && formStatus.error && <div className={styles.errorMessage}>{formStatus.error}</div>}
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button
          onClick={editMode ? editWorklog : addWorklog}
          disabled={formStatus?.valid === false}
          processing={formStatus?.processing}
        >
          Save
        </Button>
      </div>
    </section>
  )
}
