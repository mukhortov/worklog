import React, { useEffect, useState, createContext, useContext, useMemo } from 'react'
import type { CurrentUser } from 'model/CurrentUser'
import type { ISOWeek } from 'model/ISOWeek'
import type { JiraSettings } from 'model/JiraSettings'
import { ipcRenderer } from 'electron'
import { getISOWeek } from 'service/date'

export interface UserSession {
  currentUser?: CurrentUser
  jiraSettings?: JiraSettings
  week: ISOWeek
  updateWeek: (week: ISOWeek) => void
}

export const SessionContext = createContext<UserSession | null>(null)

export const useSessionContext = () => {
  const session = useContext(SessionContext)

  if (session === null) {
    throw new Error('useSessionContext has to be used inside of SessionContextProvider')
  }

  return session
}

interface SessionContextProviderProps {
  children: React.ReactNode
}

export const SessionContextProvider = ({ children }: SessionContextProviderProps) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>()
  const [jiraSettings, setJiraSettings] = useState<JiraSettings>()
  const [week, setWeek] = useState<ISOWeek>(getISOWeek())

  useEffect(() => {
    ipcRenderer.invoke('get-current-user').then(currentUser => {
      console.log('currentUser', currentUser)
      setCurrentUser(currentUser)
      if (currentUser) {
        ipcRenderer.invoke('get-jira-settings').then(setJiraSettings)
      }
    })

    return () => {
      ipcRenderer.removeAllListeners('get-current-user')
      ipcRenderer.removeAllListeners('get-jira-settings')
    }
  }, [])

  const memoizedValue = useMemo(
    () => ({ currentUser, jiraSettings, week, updateWeek: setWeek }),
    [currentUser, jiraSettings, week, setWeek],
  )

  return <SessionContext.Provider value={memoizedValue}>{children}</SessionContext.Provider>
}
