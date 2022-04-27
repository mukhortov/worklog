import React from 'react'
import styles from './Modal.sass'

interface ActionsProps {
  onClose?: () => void
}

const Actions = ({ onClose }: ActionsProps) => (
  <div className={styles.action}>
    <div className={onClose ? styles.close : styles.disabled} onClick={onClose}>
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        stroke="#8C1B10"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </div>
    <div className={styles.disabled} />
    <div className={styles.disabled} />
  </div>
)

interface ModalProps {
  open: boolean
  title?: string
  children: React.ReactNode
  width?: number
  onClose?: () => void
}

export const Modal = ({ open, title, children, width, onClose }: ModalProps) => {
  return open ? (
    <article className={styles.container}>
      <section className={styles.window} style={width ? { width } : undefined}>
        {title && (
          <header className={styles.header}>
            <Actions onClose={onClose} />
            <span className={styles.title}>{title}</span>
          </header>
        )}
        <div className={styles.content}>{children}</div>
      </section>
    </article>
  ) : null
}
