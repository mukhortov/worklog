import type { CurrentUser } from './CurrentUser'
import type { IssueType, Project } from './Issue'

export interface Worklog {
  id: string
  issueId: string
  author: CurrentUser
  comment: string
  created: string
  updated: string
  started: string
  timeSpent: string
  timeSpentSeconds: number
}

export interface WorklogEnriched extends Worklog {
  key: string
  self: string
  summary: string
  project: Project
  issuetype: IssueType
}
