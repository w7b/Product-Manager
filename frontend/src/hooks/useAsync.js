import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

export function useAsync(fn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn(...args)
      return result
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro inesperado'
      setError(msg)
      toast.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fn])

  return { execute, loading, error }
}

export function useConfirm() {
  const [state, setState] = useState({ open: false, message: '', resolve: null })

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setState({ open: true, message, resolve })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    state.resolve(true)
    setState({ open: false, message: '', resolve: null })
  }, [state])

  const handleCancel = useCallback(() => {
    state.resolve(false)
    setState({ open: false, message: '', resolve: null })
  }, [state])

  return { confirm, confirmState: state, handleConfirm, handleCancel }
}
