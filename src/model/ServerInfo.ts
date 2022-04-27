export interface ServerInfo {
  baseUrl: string
  version: string
  versionNumbers: number[]
  deploymentType: string // This is always returned as Cloud
  buildNumber: number
  buildDate: string
  serverTime?: string
  scmInfo: string
  serverTitle: string
  defaultLocale: {
    locale: string
  }
}
