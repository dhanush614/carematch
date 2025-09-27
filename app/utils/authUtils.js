"use client"

import { supabase } from '../../lib/supabaseClient'

export const USER_TYPES = {
  PARENT: 'parent',
  CAREGIVER: 'caregiver'
}

export async function getUserType(userId) {
  try {
    // Check if user is a parent
    const { data: parentData } = await supabase
      .from('parent_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    if (parentData) return USER_TYPES.PARENT

    // Check if user is a caregiver
    const { data: caregiverData } = await supabase
      .from('caregiver_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    if (caregiverData) return USER_TYPES.CAREGIVER

    return null
  } catch (error) {
    console.error('Error getting user type:', error)
    return null
  }
}

// Protected routes configuration
export const protectedRoutes = {
  common: ['/settings'],
  [USER_TYPES.PARENT]: [
    '/matches',
    '/post-parent',
    '/dashboard'
  ],
  [USER_TYPES.CAREGIVER]: [
    '/matches',
    '/post-caregiver',
    '/dashboard'
  ]
}

export function isRouteAllowed(pathname, userType) {
  if (!userType) return false
  
  const allowedRoutes = [
    ...protectedRoutes.common,
    ...protectedRoutes[userType]
  ]
  
  return allowedRoutes.includes(pathname)
}
