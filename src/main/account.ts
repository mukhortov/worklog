import keytar from 'keytar'
import { build } from '../../package.json'

export interface Account {
  baseUrl: string
  encodedKey: string
}

let account: Account | undefined

export const getAccount = async (): Promise<Account | undefined> => {
  if (account) {
    return account
  }

  const accounts = await keytar.findCredentials(build.appId)

  if (accounts.length === 0) {
    return undefined
  }

  account = {
    baseUrl: accounts[0].account,
    encodedKey: accounts[0].password,
  }

  return account
}

interface KeytarAccount {
  account: string
  password: string
}

export const removeAccount = () => {
  return keytar.findCredentials(build.appId).then((accounts: KeytarAccount[]) => {
    accounts.map(({ account }) => keytar.deletePassword(build.appId, account))
    account = undefined
  })
}

export const saveAccount = (baseUrl: string, encodedKey: string) => {
  return keytar.setPassword(build.appId, baseUrl, encodedKey).then(() => {
    account = { baseUrl, encodedKey }
  })
}
