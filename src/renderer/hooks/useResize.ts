import { useState, useCallback, useEffect } from 'react'

export const useResize = (referenceElement?: HTMLElement) => {
  const [width, setWidth] = useState<number>()
  const [height, setHeight] = useState<number>()

  const updateSize = useCallback(() => {
    if (referenceElement) {
      const { width, height } = referenceElement.getBoundingClientRect()
      setWidth(width)
      setHeight(height)
    } else {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }
  }, [referenceElement])

  useEffect(() => {
    updateSize()
    window.addEventListener('resize', updateSize)

    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [updateSize])

  return { height, width }
}
