"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter, usePathname } from 'next/navigation'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../components/Toast'

// Define protected routes and access rules
const protectedRoutes = {
  common: ['/dashboard', '/messages', '/settings', '/profile'],
  parent: ['/post-parent', '/browse-caregivers'],
  caregiver: ['/post-caregiver', '/browse-requests', '/availability']
}

// Function to check if a route is allowed for the given user type
const isRouteAllowed = (path, userType) => {
  // Public routes are always allowed
  const publicRoutes = ['/', '/auth', '/auth/callback', '/choose-role']
  if (publicRoutes.includes(path) || path.startsWith('/auth')) return true
  
  // Common protected routes require any valid user type
  if (protectedRoutes.common.includes(path)) return !!userType
  
  // Parent-specific routes
  if (protectedRoutes.parent.includes(path)) return userType === 'PARENT'
  
  // Caregiver-specific routes
  if (protectedRoutes.caregiver.includes(path)) return userType === 'CAREGIVER'
  
  // For any other routes, require authentication
  return !!userType
}

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { showToast } = useToast()

  // Function to check if a route requires authentication
  const requiresAuth = (path) => {
    const publicRoutes = ['/', '/auth', '/auth/callback']
    return !publicRoutes.includes(path) && !path.startsWith('/auth')
  }

  // Function to get user type from database
  const getUserTypeFromDB = async (userId) => {
    // Check parent_profiles
    const { data: parentData } = await supabase
      .from('parent_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (parentData) return 'PARENT'

    // Check caregiver_profiles
    const { data: caregiverData } = await supabase
      .from('caregiver_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (caregiverData) return 'CAREGIVER'

    return null
  }

  const updateUserData = async (sessionUser) => {
    if (!sessionUser) {
      setUser(null)
      setUserType(null)
      
      // If current route requires auth, redirect to home
      if (requiresAuth(pathname)) {
        router.push('/')
      }
      return
    }

    try {
      setUser(sessionUser)
      
      // Get user type from database
      const dbUserType = await getUserTypeFromDB(sessionUser.id)
      
      if (dbUserType) {
        setUserType(dbUserType)
        
        // If on choose-role page but already has a role, redirect to dashboard
        if (pathname === '/choose-role') {
          router.push('/dashboard')
          return
        }
      } else {
        // If no role is set in database and not on choose-role page, redirect there
        if (pathname !== '/choose-role' && pathname !== '/auth/callback') {
          router.push('/choose-role')
          return
        }
      }

      // Check if user has access to current route
      if (!isRouteAllowed(pathname, dbUserType)) {
        showToast('You do not have access to this page', 'error')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error updating user data:', error)
      setUser(sessionUser)
      setUserType(null)
    }
  }

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
        return
      }

      await updateUserData(session?.user ?? null)
      setLoading(false)

      // Redirect if not authenticated
      if (!session?.user && protectedRoutes.common.includes(pathname)) {
        router.push('/')
      }
    }

    getSession()

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await updateUserData(session?.user ?? null)
      setLoading(false)
      
      // Redirect to home when signed out
      if (!session?.user && protectedRoutes.common.includes(pathname)) {
        router.push('/')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    signIn: () => supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    }),
    signOut: () => supabase.auth.signOut(),
    user,
    userType,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
