import React from 'react'
import styles from './Button.sass'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
  title?: string
  processing?: boolean
}

export const Button = ({ variant = 'primary', onClick, children, processing, ...rest }: Props) => {
  const cn = [
    styles.button,
    variant === 'secondary' && styles.secondary,
    variant === 'danger' && styles.danger,
    processing && styles.processing,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" onClick={onClick} className={cn} {...rest}>
      {children}
    </button>
  )
}
