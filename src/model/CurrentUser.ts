export interface CurrentUser {
  accountId: string
  active: boolean
  avatarUrls: {
    '16x16': string
    '24x24': string
    '32x32': string
    '48x48': string
  }
  displayName: string
  emailAddress: string
  locale: string
  timeZone: string
}
