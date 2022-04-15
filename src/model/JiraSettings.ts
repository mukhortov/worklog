export interface JiraSettingsResponse {
  timeTrackingEnabled: boolean
  timeTrackingConfiguration: {
    workingHoursPerDay: number
    workingDaysPerWeek: number
    timeFormat: 'pretty' | 'days' | 'hours'
    defaultUnit: 'minute' | 'hour' | 'day' | 'week'
  }
}

export interface JiraSettings {
  baseUrl: string
  timeTrackingEnabled: boolean
  workingHoursPerDay: number
  workingDaysPerWeek: number
  timeFormat: 'pretty' | 'days' | 'hours'
  defaultUnit: 'minute' | 'hour' | 'day' | 'week'
}
