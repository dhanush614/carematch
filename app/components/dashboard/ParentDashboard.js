"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../../../lib/supabaseClient"
import StatsCard from "./StatsCard"
import MatchCard from "./MatchCard"


export default function ParentDashboard() {
  const [stats, setStats] = useState({
    activeRequests: 0,
    totalMatches: 0
  })
  const [recentMatches, setRecentMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMounted = useRef(true)
  const maxRetries = 3
  const retryDelay = 1000 // 1 second

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  const fetchWithRetry = async (fetchFn, retries = maxRetries) => {
    try {
      return await fetchFn()
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return fetchWithRetry(fetchFn, retries - 1)
      }
      throw error
    }
  }

  useEffect(() => {
    if (!isMounted.current) return

    const fetchDashboardData = async () => {
      try {
        setError(null)

        // Fetch parent profile - using only basic fields
        const { data: parentProfile, error: profileError } = await fetchWithRetry(() =>
          supabase
            .from('parents')
            .select('id, name')
            .limit(1)
        )
        
        // Convert single() to limit(1) and handle the array result
        const profile = parentProfile?.[0]

        if (!isMounted.current) return

        if (profileError) {
          console.error('Error fetching parent profile:', profileError)
          if (isMounted.current) {
            setError('Unable to load profile data. Please try again later.')
          }
          return
        }

        if (!profile) {
          console.log('No parent profile found')
          setStats({
            activeRequests: 0,
            totalMatches: 0
          })
          setRecentMatches([])
          return
        }

        // Fetch recent matches
        const { data: matches } = await supabase
          .from('matches')
          .select('*')
          .eq('parent_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(3)

        // Update stats
        const { count: requestCount } = await supabase
          .from('care_requests')
          .select('*', { count: 'exact' })
          .eq('parent_id', profile.id)
          .eq('status', 'active')

        setStats({
          activeRequests: requestCount || 0,
          totalMatches: matches?.length || 0
        })

        setRecentMatches(matches || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, []) // Removed user dependency since we're not using it

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          title="Active Requests"
          value={stats.activeRequests}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatsCard
          title="Total Matches"
          value={stats.totalMatches}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />

      </div>

      {/* Recent Matches */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Recent Matches</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {recentMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
          {recentMatches.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-8">
              No matches yet. Start by browsing caregivers!
            </p>
          )}
        </div>
      </div>



      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => router.push('/matches')}
          className="flex items-center justify-center px-6 py-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Find Caregivers
        </button>
        <button
          onClick={() => router.push('/post-request')}
          className="flex items-center justify-center px-6 py-4 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Post New Request
        </button>
      </div>
    </div>
  )
}
