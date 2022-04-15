import type { Worklog } from './Worklog'

export interface IssueType {
  description: string
  iconUrl: string
  name: string
  subtask: boolean
}

export interface Project {
  key: string
  name: string
  avatarUrls: {
    '48x48': string
    '24x24': string
    '16x16': string
    '32x32': string
  }
}

export interface WorklogsPayload {
  startAt: number
  maxResults: number
  total: number
  worklogs: Worklog[]
}

export interface IssueResponse {
  id: string
  key: string
  self: string
  fields: {
    project: Project
    issuetype: IssueType
    summary: string
    worklog: WorklogsPayload
  }
}

export interface IssuesResponse {
  issues: IssueResponse[]
}

export interface IssueKeyTest {
  id: string
  key: string
  self: string
}

export interface Issue {
  id: string
  key: string
  self: string
  summary: string
  project: Project
  issuetype: IssueType
  worklog: {
    startAt: number
    maxResults: number
    total: number
    worklogs: Worklog[]
  }
}

export interface SearchIssue {
  id: number
  img: string
  key: string
  keyHtml: string
  summary: string
  summaryText: string
}

export interface SearchIssueResponse {
  sections: {
    issues: SearchIssue[]
  }[]
}
