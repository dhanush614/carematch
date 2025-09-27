"use client"

import { useEffect } from 'react'
import { useAuth } from '../context/auth'
import { useRouter } from 'next/navigation'
import { USER_TYPES } from '../utils/authUtils'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ChooseRole() {
  const { user, userType } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()

  useEffect(() => {
    // Redirect to dashboard if user already has a role
    if (userType) {
      router.push('/dashboard')
    }
    // Redirect to home if not authenticated
    else if (!user) {
      router.push('/')
    }
  }, [user, userType, router])

  if (!user || userType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Choose your role
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Select how you want to use CareSphere
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 space-y-6">
          <button
            onClick={async () => {
              try {
                // Check if user already has a caregiver profile
                const { data: existingCaregiver } = await supabase
                  .from('caregiver_profiles')
                  .select('id')
                  .eq('user_id', user.id)
                  .single()

                if (existingCaregiver) {
                  showToast('You already have a caregiver profile', 'error')
                  return
                }

                // Create parent profile
                const { data: profileData, error } = await supabase
                  .from('parent_profiles')
                  .insert({
                    user_id: user.id,
                    email: user.email,
                    name: user.user_metadata?.full_name || '',
                    avatar_url: user.user_metadata?.avatar_url || ''
                  })
                  .select()
                  .single()

                if (error) {
                  console.error('Error creating parent profile:', error)
                  throw error
                }

                if (!profileData) {
                  throw new Error('Failed to create parent profile')
                }
                
                showToast('Parent profile created successfully', 'success')
                router.push('/post-parent')
              } catch (error) {
                console.error('Error creating parent profile:', error)
                showToast('Error creating profile. Please try again.', 'error')
              }
            }}
            className="w-full flex items-center justify-center px-8 py-6 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-200 relative group"
          >
            <div className="text-left">
              <div className="text-lg font-semibold">I'm a Parent</div>
              <div className="text-sm opacity-90">Looking for childcare services</div>
            </div>
          </button>

          <button
            onClick={async () => {
              try {
                // Check if user already has a parent profile
                const { data: existingParent } = await supabase
                  .from('parent_profiles')
                  .select('id')
                  .eq('user_id', user.id)
                  .single()

                if (existingParent) {
                  showToast('You already have a parent profile', 'error')
                  return
                }

                // Create caregiver profile
                const { error } = await supabase
                  .from('caregiver_profiles')
                  .insert({
                    user_id: user.id,
                    email: user.email,
                    name: user.user_metadata.full_name || '',
                    avatar_url: user.user_metadata.avatar_url || ''
                  })

                if (error) throw error
                
                showToast('Caregiver profile created successfully', 'success')
                router.push('/post-caregiver')
              } catch (error) {
                console.error('Error creating caregiver profile:', error)
                showToast('Error creating profile. Please try again.', 'error')
              }
            }}
            className="w-full flex items-center justify-center px-8 py-6 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 relative group"
          >
            <div className="text-left">
              <div className="text-lg font-semibold">I'm a Caregiver</div>
              <div className="text-sm opacity-90">Looking to provide childcare services</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
