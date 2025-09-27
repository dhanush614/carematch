"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '../context/auth'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { signIn, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const userType = searchParams.get('type')

  useEffect(() => {
    if (!userType || !['parent', 'caregiver'].includes(userType)) {
      router.push('/')
      return
    }

    if (user) {
      // If user is already logged in, redirect to dashboard
      router.push('/dashboard')
      return
    }

    const handleAuth = async () => {
      try {
        // Store intended user type before sign in
        sessionStorage.setItem('intendedUserType', userType)
        
        const { error } = await signIn()
        if (error) throw error
        
        // The auth callback will handle the rest of the flow
      } catch (error) {
        console.error('Authentication error:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    handleAuth()
  }, [user, userType, router, signIn])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">
          {loading ? "Connecting to secure sign in..." : "Redirecting..."}
        </p>
      </div>
    </div>
  )
}
