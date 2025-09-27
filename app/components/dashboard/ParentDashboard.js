"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { useAuth } from "../../context/auth"
import StatsCard from "./StatsCard"
import MatchCard from "./MatchCard"
import MessageList from "./MessageList"

export default function ParentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    activeRequests: 0,
    totalMatches: 0,
    messages: 0,
  })
  const [recentMatches, setRecentMatches] = useState([])
  const [recentMessages, setRecentMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch parent profile
        const { data: parentProfile } = await supabase
          .from('parent_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        // Fetch recent matches
        const { data: matches } = await supabase
          .from('matches')
          .select(`
            *,
            caregiver:caregivers(*)
          `)
          .eq('parent_id', parentProfile.id)
          .order('matched_at', { ascending: false })
          .limit(3)

        // Fetch recent messages
        const { data: messages } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles(name, avatar_url),
            receiver:profiles(name, avatar_url)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(5)

        // Update stats
        const { count: requestCount } = await supabase
          .from('care_requests')
          .select('*', { count: 'exact' })
          .eq('parent_id', parentProfile.id)
          .eq('status', 'active')

        setStats({
          activeRequests: requestCount || 0,
          totalMatches: matches?.length || 0,
          messages: messages?.length || 0,
        })

        setRecentMatches(matches || [])
        setRecentMessages(messages || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <StatsCard
          title="Messages"
          value={stats.messages}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          }
        />
      </div>

      {/* Recent Matches */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Recent Messages */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Messages</h2>
        <MessageList messages={recentMessages} />
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
