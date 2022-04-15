import styles from './FormField.sass'
import React from 'react'
import { cn } from 'renderer/ui/className'
import { Input } from './Input'

interface FormFieldProps {
  label: string
  children: React.ReactNode
}

export const FormField = ({ label, children }: FormFieldProps) => {
  return (
    <div className={styles.row}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  )
}

interface FormFieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  rightContent?: React.ReactNode
  info?: React.ReactNode
  error?: React.ReactNode
  menu?: React.ReactNode
  valid?: boolean
  processing?: boolean
}

export const FormFieldInput = ({ label, rightContent, info, error, menu, valid, ...rest }: FormFieldInputProps) => (
  <div className={styles.row}>
    <label className={styles.label}>{label}</label>
    <div className={styles.field}>
      <Input {...rest} className={cn([valid && styles.valid])} valid={error !== undefined ? false : valid} />
      {rightContent && <div className={styles.rightContent}>{rightContent}</div>}
      {menu && menu}
    </div>
    {error && <div className={styles.error}>{error}</div>}
    {info && <div className={styles.info}>{info}</div>}
  </div>
)
