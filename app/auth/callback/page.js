"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (session) {
          const { user } = session

          // Check if user already has a profile
          const [{ data: parentProfile }, { data: caregiverProfile }] = await Promise.all([
            supabase.from('parent_profiles').select('id').eq('user_id', user.id).single(),
            supabase.from('caregiver_profiles').select('id').eq('user_id', user.id).single()
          ])

          if (parentProfile) {
            router.push('/dashboard')
          } else if (caregiverProfile) {
            router.push('/dashboard')
          } else {
            // No profile exists, redirect to choose-role
            router.push('/choose-role')
          }
        } else {
          throw new Error('No session found')
        }
      } catch (err) {
        console.error('Error during auth callback:', err)
        setError(err.message)
        // Wait a bit before redirecting to show the error
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    }

    handleAuth()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg max-w-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-600 font-medium">Authentication error</p>
          </div>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-4">Redirecting to home page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
