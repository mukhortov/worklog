import styles from './App.sass'
import { StrictMode, useCallback, useEffect, useState } from 'react'
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom'
import { ipcRenderer } from 'electron'
import { SessionContextProvider, useSessionContext } from './hooks/SessionContext'
import { ModalContextProvider, useModalContext } from './hooks/ModalContext'
import type { Issue, WorklogsPayload } from 'model/Issue'
import type { Worklog } from 'model/Worklog'
import { WeekChart } from 'renderer/ui/WeekChart/WeekChart'
import { LoadingIndicator } from 'renderer/ui/LoadingIndicator/LoadingIndicator'
import { formatDate, getWeekRange } from 'service/date'
import { DateRange } from 'model/DateRange'
import { Header } from 'renderer/ui/Header/Header'
import { useDebounce } from 'renderer/hooks/debounce'

const getIssues = async (startDate: string, endDate: string) => {
  return (await ipcRenderer.invoke('get-issues', { startDate, endDate })) as Issue[]
}

const getIssueWorklogs = async (issueKey: string, startDate: string, endDate: string) => {
  return (await ipcRenderer.invoke('get-issue-worklogs', { issueKey, startDate, endDate })) as WorklogsPayload
}

export const Main = () => {
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine)
  const { currentUser, week } = useSessionContext()
  const { toggleLoginModal, toggleOnlineStatusModal } = useModalContext()

  const [issues, setIssues] = useState<Issue[]>()
  const [dateRange, setDateRange] = useState<DateRange>(getWeekRange(week))
  const debouncedDateRange = useDebounce(dateRange, 300)

  const updateIssues = useCallback(() => {
    setIssues(undefined)
    getIssues(debouncedDateRange.start, debouncedDateRange.end).then(data => {
      const issueKeys = data.map(i => (i.worklog.total > i.worklog.maxResults ? i.key : undefined)).filter(Boolean)

      Promise.all<WorklogsPayload>(
        // TODO: A dirty hack with issueKey
        issueKeys.map(issueKey => getIssueWorklogs(issueKey ?? '', debouncedDateRange.start, debouncedDateRange.end)),
      ).then(worklogs => {
        const issueWorklogs = worklogs.reduce(
          (acc: { [key: string]: Worklog[] }, cur, i) => ({
            ...acc,
            [issueKeys[i] ?? '']: cur.worklogs.filter(w => w.author.accountId === currentUser?.accountId),
          }),
          {},
        )

        const issuesWithCurrentWorklogs = data.map(i => ({
          ...i,
          worklog: {
            ...i.worklog,
            worklogs: [...i.worklog.worklogs, ...(issueWorklogs[i.key] ? issueWorklogs[i.key] : [])]
              .filter(w => w.author.accountId === currentUser?.accountId)
              .filter(w => w.started >= debouncedDateRange.start && w.started <= debouncedDateRange.end)
              .filter((value, index, array) => array.findIndex(v => v.id === value.id) === index),
          },
        }))
        setIssues(issuesWithCurrentWorklogs)
      })
    })
  }, [currentUser, debouncedDateRange])

  useEffect(() => {
    const handleOnlineStatusChange = () => setOnlineStatus(navigator.onLine)
    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange)
      window.removeEventListener('offline', handleOnlineStatusChange)
    }
  }, [])

  useEffect(() => {
    setDateRange(getWeekRange(week))
  }, [week])

  useEffect(() => {
    ipcRenderer.invoke('set-title', {
      title: `${formatDate(dateRange.start)} → ${formatDate(dateRange.end)}`,
    })

    return () => {
      ipcRenderer.removeAllListeners('set-title')
    }
  }, [dateRange])

  useEffect(() => {
    ipcRenderer.on('request-log-in', () => toggleLoginModal(true))

    return () => {
      ipcRenderer.removeAllListeners('request-log-in')
    }
  }, [toggleLoginModal, updateIssues])

  useEffect(() => {
    toggleOnlineStatusModal(!onlineStatus)

    if (!onlineStatus) {
      return undefined
    }

    if (currentUser) {
      updateIssues()
    }

    ipcRenderer.on('update-issues', updateIssues)

    return () => {
      ipcRenderer.removeAllListeners('update-issues')
    }
  }, [currentUser, debouncedDateRange, updateIssues, onlineStatus, toggleOnlineStatusModal])

  return (
    <div className={styles.app}>
      {currentUser && <Header />}
      <div className={styles.main}>
        {!issues && <LoadingIndicator />}
        {issues && <WeekChart issues={issues} dateRange={debouncedDateRange} />}
      </div>
    </div>
  )
}

export const App = () => {
  return (
    <StrictMode>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <SessionContextProvider>
                <ModalContextProvider>
                  <Main />
                </ModalContextProvider>
              </SessionContextProvider>
            }
          />
        </Routes>
      </Router>
    </StrictMode>
  )
}
