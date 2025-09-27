"use client"

import { createContext, useContext, useState } from 'react'

const ToastContext = createContext({})

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
          <div
            className={`rounded-lg px-4 py-3 shadow-lg ${
              toast.type === 'error'
                ? 'bg-red-100 text-red-800'
                : toast.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}
            role="alert"
          >
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
