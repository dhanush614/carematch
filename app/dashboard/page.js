"use client"

import { useAuth } from '../context/auth'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../components/LoadingSpinner'
import ParentDashboard from '../components/dashboard/ParentDashboard'
import CaregiverDashboard from '../components/dashboard/CaregiverDashboard'
import { useToast } from '../components/Toast'
import { USER_TYPES } from '../utils/authUtils'

export default function Dashboard() {
  const { user, userType } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()

  if (!user || !userType) {
    router.push('/')
    return null
  }

  if (userType === USER_TYPES.PARENT) {
    return <ParentDashboard />
  }

  if (userType === USER_TYPES.CAREGIVER) {
    return <CaregiverDashboard />
  }

  return <LoadingSpinner />
}
