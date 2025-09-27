"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '../../context/auth'
import { supabase } from '../../../lib/supabaseClient'
import { useToast } from '../../components/Toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import ReviewCard from '../../components/dashboard/ReviewCard'
import ReviewForm from '../../components/dashboard/ReviewForm'
import AvailabilityCalendar from '../../components/dashboard/AvailabilityCalendar'

export default function ProfilePage({ params }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [reviews, setReviews] = useState([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    completedJobs: 0,
    responseRate: 0
  })

  useEffect(() => {
    if (params.id) {
      fetchProfile()
      fetchReviews()
    }
  }, [params.id])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data: parentProfile, error: parentError } = await supabase
        .from('parent_profiles')
        .select('*')
        .eq('user_id', params.id)
        .single()

      if (!parentError && parentProfile) {
        setProfile({ ...parentProfile, type: 'parent' })
      } else {
        const { data: caregiverProfile, error: caregiverError } = await supabase
          .from('caregiver_profiles')
          .select('*')
          .eq('user_id', params.id)
          .single()

        if (caregiverError) throw caregiverError
        setProfile({ ...caregiverProfile, type: 'caregiver' })
      }
    } catch (error) {
      console.error('Error:', error)
      showToast('Error loading profile', 'error')
    }
  }

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('profile_id', params.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setReviews(data)
      
      // Calculate stats
      if (data.length > 0) {
        const totalRating = data.reduce((sum, review) => sum + review.rating, 0)
        setStats(prev => ({
          ...prev,
          totalReviews: data.length,
          averageRating: (totalRating / data.length).toFixed(1)
        }))
      }
    } catch (error) {
      console.error('Error:', error)
      showToast('Error loading reviews', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (reviewData) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          profile_id: params.id,
          reviewer_id: user.id,
          ...reviewData
        })

      if (error) throw error

      showToast('Review submitted successfully', 'success')
      setShowReviewForm(false)
      fetchReviews() // Refresh reviews
    } catch (error) {
      console.error('Error:', error)
      showToast('Error submitting review', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {profile.type === 'caregiver' ? 'Caregiver' : 'Parent'}
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="text-yellow-400 text-xl">★</div>
                  <span className="ml-1 text-xl font-semibold">{stats.averageRating}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({stats.totalReviews} reviews)
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="mt-6 grid grid-cols-2 gap-6 border-t border-gray-200 pt-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed Jobs</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {stats.completedJobs}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Response Rate</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {stats.responseRate}%
                  </p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">About</h3>
                <p className="mt-2 text-gray-600">{profile.bio || 'No bio provided'}</p>

                {profile.type === 'caregiver' && (
                  <div className="mt-6 space-y-4">
                    {profile.skills?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Skills</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.certifications?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Certifications</h4>
                        <ul className="mt-2 list-disc list-inside text-gray-600">
                          {profile.certifications.map((cert, index) => (
                            <li key={index}>{cert}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
              {user && user.id !== params.id && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Write a Review
                </button>
              )}
            </div>

            {showReviewForm && (
              <div className="mb-8 bg-white shadow-md rounded-lg p-6">
                <ReviewForm onSubmit={handleSubmitReview} />
              </div>
            )}

            <div className="space-y-6">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Availability Calendar */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Availability</h3>
              <AvailabilityCalendar
                availability={profile.availability}
                readOnly={true}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Experience</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Member since</p>
                  <p className="font-medium text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total hours</p>
                  <p className="font-medium text-gray-900">
                    {profile.total_hours || 0} hours
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Languages</p>
                  <p className="font-medium text-gray-900">
                    {profile.languages?.join(', ') || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
