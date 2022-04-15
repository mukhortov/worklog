import type { CurrentUser } from 'model/CurrentUser'
import type { Issue, IssueKeyTest, IssuesResponse, SearchIssueResponse, WorklogsPayload } from 'model/Issue'
import fetch from 'electron-fetch'
import { JiraSettings, JiraSettingsResponse } from 'model/JiraSettings'
import { getAccount } from './account'
import { ServerInfo } from 'model/ServerInfo'

enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

const api = async <T>(url: string, method: Method = Method.GET, body?: { [key: string]: unknown }): Promise<T> => {
  const account = await getAccount()

  if (!account) {
    // No account saved. Don't do anything.
    throw new Error('No saved account')
  }

  const requestUrl = account.baseUrl + `/rest/api/3/${url}`.replace('//', '/')

  const response = await fetch(requestUrl, {
    method,
    headers: {
      authorization: `Basic ${account.encodedKey}`,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) {
    throw { status: response.status, message: response.statusText }
  }

  console.log('Response status:', response.status, response.statusText)

  if (response.status === 204) {
    return {} as T
  }

  const data = await response.json()

  return data as Promise<T>
}

// Get Jira instance info
// GET /rest/api/3/serverInfo
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-server-info/#api-group-server-info
export const serverInfo = (serverUrl: string) =>
  fetch(`${serverUrl}/rest/api/3/serverInfo`).then(response => {
    if (!response.ok) {
      throw { status: response.status, message: response.statusText }
    } else {
      return response.json() as Promise<ServerInfo>
    }
  })

// Get current user
// GET /rest/api/3/myself
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-myself/#api-rest-api-3-myself-get
export const getCurrentUser = () => api<CurrentUser>('myself')

// Get global settings
// GET /rest/api/3/configuration
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-jira-settings/#api-rest-api-3-configuration-get
export const getJiraSettings = async () => {
  const account = await getAccount()

  return api<JiraSettingsResponse>('configuration').then(
    ({ timeTrackingEnabled, timeTrackingConfiguration }) =>
      ({
        timeTrackingEnabled,
        ...timeTrackingConfiguration,
        baseUrl: account?.baseUrl,
      } as JiraSettings),
  )
}

// Test Issue Key
// GET /rest/api/3/issue/{issueIdOrKey}
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-get
// Use `?fields=*-,issuetype` to get the issue type to restrict logging time to certain issue types, eg Initiatives
export const testIssuesKey = (issueKey: string) => api<IssueKeyTest>(`/issue/${issueKey}?fields=*-`)

// Search for issues using JQL
// GET /rest/api/3/search
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/#api-rest-api-3-search-get
export const getIssues = (startDate: string, endDate: string) => {
  const jql = encodeURI(
    `worklogAuthor in (currentUser()) and worklogDate >= '${startDate}' and worklogDate < '${endDate}'&fields=worklog,summary,project,issuetype&maxResults=1000`,
  )

  return api<IssuesResponse>(`search?jql=${jql}`).then(data =>
    data.issues.map(({ id, self, key, fields }) => ({ id, self, key, ...fields } as Issue)),
  )
}

// Get issue worklogs
// GET /rest/api/3/issue/{issueIdOrKey}/worklog
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-worklogs/#api-rest-api-3-issue-issueidorkey-worklog-get
export const getIssueWorklogs = (issueKey: string, startDate: string, endDate: string) =>
  api<WorklogsPayload>(
    `issue/${issueKey}/worklog?startedAfter=${Date.parse(startDate)}&startedBefore=${Date.parse(endDate)}`,
  )

// Add worklog
// POST /rest/api/3/issue/{issueIdOrKey}/worklog
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-worklogs/#api-rest-api-3-issue-issueidorkey-worklog-post
export const addWorklog = (issueKey: string, started: string, timeSpent: string) =>
  api(`issue/${issueKey}/worklog`, Method.POST, { started, timeSpent })

// Update worklog
// PUT /rest/api/3/issue/{issueIdOrKey}/worklog/{id}
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-worklogs/#api-rest-api-3-issue-issueidorkey-worklog-id-put
export const editWorklog = (worklogId: string, issueKey: string, started: string, timeSpent: string) =>
  api(`issue/${issueKey}/worklog/${worklogId}`, Method.PUT, { started, timeSpent })

// Delete worklog
// DELETE /rest/api/3/issue/{issueIdOrKey}/worklog/{id}
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-worklogs/#api-rest-api-3-issue-issueidorkey-worklog-id-delete
export const deleteWorklog = (worklogId: string, issueKey: string) => {
  api(`issue/${issueKey}/worklog/${worklogId}`, Method.DELETE)
}

// Search issues
// GET /rest/api/3/issue/picker
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/#api-rest-api-3-issue-picker-get
export const searchIssue = (query: string) => {
  const queryString = encodeURI(
    `${query}&showSubTasks=true&showSubTaskParent=true&currentJQL=project in projectsWhereUserHasPermission("Work on issues") order by key`,
  )

  return api<SearchIssueResponse>(`issue/picker?query=${queryString}`).then(result =>
    result.sections?.flatMap(section => section?.issues),
  )
}

// TODO: Another way of getting resent issue. Used on Jira website
// Get Recent with search issue
// `search?jql=issuekey in issueHistory() ORDER BY lastViewed DESC&maxResults=10`

export const getRecentIssues = () =>
  api<SearchIssueResponse>('issue/picker?showSubTasks=true&showSubTaskParent=true').then(result =>
    result.sections?.flatMap(section => section?.issues),
  )
