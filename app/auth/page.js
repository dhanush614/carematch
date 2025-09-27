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
        const { error } = await signIn()
        if (error) throw error
        
        // After successful sign in, set the user type
        localStorage.setItem('userType', userType)
        
        // Redirect to the role confirmation page after sign in
        router.push('/choose-role')
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
