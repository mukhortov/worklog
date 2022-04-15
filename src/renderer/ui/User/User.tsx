import type { CurrentUser } from 'model/CurrentUser'

import styles from './User.sass'

interface UserProps {
  currentUser: CurrentUser
  onClick?: () => void
  minimal?: boolean
}

export const User = ({ currentUser, onClick, minimal = false }: UserProps) => {
  const cn = [styles.user, onClick && styles.clickable].filter(Boolean).join(' ')

  const title = minimal ? `${currentUser.displayName}\n${currentUser.emailAddress}` : undefined

  return (
    <div className={cn} onClick={onClick}>
      <img src={currentUser.avatarUrls['48x48']} className={styles.avatar} alt="" title={title} />
      {!minimal && (
        <div>
          {currentUser.displayName}
          <div className={styles.email}>{currentUser.emailAddress}</div>
        </div>
      )}
    </div>
  )
}
