import { useResize } from 'renderer/hooks/useResize'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from './Popover.sass'

interface PopoverProps {
  onClose: () => void
  children: React.ReactNode
  referenceElement?: HTMLElement | null
  width?: number
}

export const Popover = ({ onClose, children, referenceElement, width = 0 }: PopoverProps) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>()
  const { width: windowWidth = window.innerWidth, height: windowHeight } = useResize()

  useEffect(() => {
    if (!referenceElement) {
      setPopoverStyle({})
      return
    }

    const { offsetTop, offsetLeft, clientWidth } = referenceElement ?? {}
    const toRight = Math.min(windowWidth - width - 8, offsetLeft + clientWidth)
    const toLeft = Math.max(8, offsetLeft - width)
    const isOnLeft = offsetLeft + width > windowWidth

    setPopoverStyle({
      top: offsetTop, // TODO: add adjusting position
      left: isOnLeft ? toLeft : toRight,
      width,
    })

    // TODO: recalculate on window resize
  }, [referenceElement, width, windowWidth, windowHeight])

  const checkIfClickedOutside = useCallback(
    (e: MouseEvent) => {
      const target = e.target as null | HTMLDivElement

      if (target && ref.current && !ref.current.contains(target)) {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('mousedown', checkIfClickedOutside)
    return () => document.removeEventListener('mousedown', checkIfClickedOutside)
  }, [checkIfClickedOutside])

  useEffect(() => {
    const escPressed = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', escPressed)
    return () => document.removeEventListener('keydown', escPressed)
  }, [onClose])

  // Don't render anything if there is no position styles
  if (!popoverStyle) {
    return null
  }

  return (
    <div className={styles.container} ref={ref} style={popoverStyle}>
      {children}
    </div>
  )
}
