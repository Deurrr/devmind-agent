'use client'

import { useState, useEffect } from 'react'
import { Toaster as HotToaster } from 'react-hot-toast'

export function Toaster() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#18181b',
          color: '#f4f4f5',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      }}
    />
  )
}
