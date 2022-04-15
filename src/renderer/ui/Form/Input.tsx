import styles from './Input.sass'
import React from 'react'
import { cn } from 'renderer/ui/className'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  valid?: boolean
  processing?: boolean
}

export const Input = ({ valid, processing, ...rest }: InputProps) => {
  return (
    <div
      className={cn([
        styles.container,
        valid !== undefined ? (valid ? styles.valid : styles.invalid) : undefined,
        processing && styles.processing,
      ])}
    >
      <input {...rest} />
    </div>
  )
}
