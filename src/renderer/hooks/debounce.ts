import { useState, useEffect, useCallback, DependencyList, EffectCallback } from 'react'

export const useDebounce = <T>(value: T, delay = 300) => {
  const [state, setState] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      if (JSON.stringify(value) !== JSON.stringify(state)) {
        setState(value)
      }
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay, state])

  return state
}

export const useDebouncedEffect = (effect: EffectCallback, deps: DependencyList, delay = 300) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(effect, deps)

  useEffect(() => {
    const handler = setTimeout(() => {
      callback()
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [callback, delay])
}
