"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { useAuth } from "../../context/auth"
import StatsCard from "./StatsCard"
import AvailabilityCalendar from "./AvailabilityCalendar"
import ReviewCard from "./ReviewCard"


export default function CaregiverDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    activeBookings: 0,
    totalHours: 0,
    rating: 0,
    reviews: 0,
  })
  const [recentReviews, setRecentReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch caregiver profile
        const { data: caregiverProfile } = await supabase
          .from('caregiver_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        // Fetch active bookings
        const { data: bookings, count: bookingsCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact' })
          .eq('caregiver_id', caregiverProfile.id)
          .eq('status', 'active')

        // Fetch reviews
        const { data: reviews } = await supabase
          .from('reviews')
          .select(`
            *,
            parent:parent_profiles(name, avatar_url)
          `)
          .eq('caregiver_id', caregiverProfile.id)
          .order('created_at', { ascending: false })
          .limit(3)

        // Calculate average rating
        const avgRating = reviews?.reduce((acc, review) => acc + review.rating, 0) / (reviews?.length || 1)



        setStats({
          activeBookings: bookingsCount || 0,
          totalHours: bookings?.reduce((acc, booking) => acc + booking.hours, 0) || 0,
          rating: avgRating || 0,
          reviews: reviews?.length || 0,
        })


        setRecentReviews(reviews || [])
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Active Bookings"
          value={stats.activeBookings}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatsCard
          title="Total Hours"
          value={stats.totalHours}
          suffix="hrs"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Rating"
          value={stats.rating.toFixed(1)}
          suffix="★"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />
        <StatsCard
          title="Reviews"
          value={stats.reviews}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          }
        />
      </div>

      {/* Availability Calendar */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Availability</h2>
        <AvailabilityCalendar />
      </div>

      {/* Recent Reviews */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {recentReviews.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-8">
              No reviews yet. Keep up the great work!
            </p>
          )}
        </div>
      </div>


      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Messages</h2>
        <MessageList messages={recentMessages} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => router.push('/requests')}
          className="flex items-center justify-center px-6 py-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View Care Requests
        </button>
        <button
          onClick={() => router.push('/availability')}
          className="flex items-center justify-center px-6 py-4 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Update Availability
        </button>
      </div>
    </div>
  )
}
