import styles from './Login.sass'
import { useCallback, useEffect, useState } from 'react'
import { ipcRenderer, shell } from 'electron'
import { Button } from 'renderer/ui/Button/Button'
import { encodeBase64 } from 'service/base64'
import { FormFieldInput } from 'renderer/ui/Form/FormField'
import { FormValidation } from 'model/FormValidation'

interface LoginInfo {
  baseUrl: string
  email: string
  apiToken: string
}

const apiTokenLength = 24

export const Login = () => {
  const [baseUrl, setBaseUrl] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [apiToken, setApiToken] = useState<string>('')

  const [urlStatus, setUrlStatus] = useState<FormValidation>()
  const [emailStatus, setEmailStatus] = useState<FormValidation>()
  const [apiTokenStatus, setApiTokenStatus] = useState<FormValidation>()
  const [formStatus, setFormStatus] = useState<FormValidation>({ valid: false })

  const testBaseUrl = useCallback(() => {
    // TODO: Format URL. Add https// if missing. Remove trailing slash and query string.
    if (baseUrl.length === 0) return

    const strippedUrl = baseUrl.replace('https://', '').replace('http://', '').split('/').shift()
    const url = `https://${strippedUrl}`

    setUrlStatus({ processing: true })
    ipcRenderer
      .invoke('get-server-settings', url)
      .then(() => {
        setUrlStatus({ valid: true })
        setBaseUrl(url)
      })
      .catch(() => setUrlStatus({ error: 'Invalid Jira Cloud URL', processing: false }))
  }, [baseUrl])

  const testEmail = useCallback(() => {
    if (email.length === 0) return

    const regexp = /^[a-zA-Z0-9+._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/

    if (regexp.test(email)) {
      setEmailStatus(undefined)
    } else {
      setEmailStatus({ error: 'Invalid email address' })
    }
  }, [email])

  const testApiToken = useCallback(() => {
    if (apiToken.length === 0) return
    setApiTokenStatus({ error: apiToken && apiToken.length >= apiTokenLength ? undefined : 'Invalid Jira API token' })
  }, [apiToken])

  const save = useCallback(({ baseUrl, email, apiToken }: LoginInfo) => {
    setFormStatus({ processing: true })
    const encodedKey = encodeBase64(`${email}:${apiToken}`)
    ipcRenderer
      .invoke('save-account', { baseUrl, encodedKey })
      .then(() => window.location.reload())
      .catch(() => setFormStatus({ processing: false, error: 'Invalid credentials' }))
  }, [])

  useEffect(() => {
    const noErrors = !urlStatus?.error && !emailStatus?.error && !apiTokenStatus?.error
    const notEmpty = baseUrl.length > 0 && email.length > 0 && apiToken.length >= apiTokenLength
    setFormStatus({ valid: noErrors && notEmpty })
  }, [email, apiToken, baseUrl, apiTokenStatus, emailStatus, urlStatus])

  useEffect(() => {
    setApiTokenStatus(undefined)
  }, [apiToken])

  return (
    <section className={styles.container}>
      <FormFieldInput
        label="Jira Cloud URL:"
        type="text"
        placeholder="https://your-company.atlassian.net"
        value={baseUrl}
        onChange={event => setBaseUrl(event.target.value)}
        onBlur={testBaseUrl}
        {...urlStatus}
      />
      <FormFieldInput
        label="Email address:"
        type="email"
        placeholder="your.jira@email.com"
        value={email}
        onChange={event => setEmail(event.target.value)}
        onBlur={testEmail}
        {...emailStatus}
      />
      <FormFieldInput
        label="Jira API token:"
        type="password"
        placeholder="Paste your Jira API token here"
        value={apiToken}
        onChange={event => setApiToken(event.target.value)}
        onBlur={testApiToken}
        info={
          <>
            You can generate your personal{' '}
            <a onClick={() => shell.openExternal('https://id.atlassian.com/manage/api-tokens')}>Jira API token here</a>
          </>
        }
        {...apiTokenStatus}
      />

      <div className={styles.actions}>
        {formStatus && formStatus.error && <div className={styles.errorMessage}>{formStatus.error}</div>}
        <Button
          onClick={() => save({ baseUrl, email, apiToken })}
          disabled={formStatus.valid === false}
          processing={formStatus?.processing}
        >
          Log in
        </Button>
      </div>
    </section>
  )
}
