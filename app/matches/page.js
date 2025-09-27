"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { findMatches } from "../services/matchingService"
import { useAuth } from "../context/auth"
import { useRouter } from "next/navigation"
import LoadingSpinner from "../components/LoadingSpinner"
import { useToast } from "../components/Toast"

export default function Matches() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])
  const [parents, setParents] = useState([])
  const [caregivers, setCaregivers] = useState([])
  const [matches, setMatches] = useState([])
  const [originalMatches, setOriginalMatches] = useState([])
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('score') // 'score', 'rate', 'rating'
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    minRating: 4.0,
    verifiedOnly: false,
    maxRate: null,
    overnight: false,
    petCare: false,
    minScore: 50,
    availability: 'all' // 'all', 'available', 'busy'
  })
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState([])

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }))
    
    // Update active filters for visual feedback
    setActiveFilters(prev => {
      if (type === 'checkbox' && checked) {
        return [...prev, name]
      }
      return prev.filter(f => f !== name)
    })
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    const sorted = [...matches].sort((a, b) => {
      switch (value) {
        case 'rate':
          return a.caregiver.rate - b.caregiver.rate
        case 'rating':
          return b.caregiver.rating - a.caregiver.rating
        default:
          return b.score - a.score
      }
    })
    setMatches(sorted)
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    if (!e.target.value.trim()) {
      setMatches(originalMatches)
      return
    }
    
    const query = e.target.value.toLowerCase().trim()
    const filtered = originalMatches.filter(match => 
      match.caregiver.name.toLowerCase().includes(query) ||
      (match.caregiver.skills && match.caregiver.skills.toLowerCase().includes(query))
    )
    setMatches(filtered)
  }

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parentsResult, caregiversResult] = await Promise.all([
          supabase.from("parents").select("*"),
          supabase.from("caregivers").select("*")
        ])

        if (parentsResult.error) console.error("Parent fetch error:", parentsResult.error)
        if (caregiversResult.error) console.error("Caregiver fetch error:", caregiversResult.error)

        const parentData = parentsResult.data || []
        const caregiverData = caregiversResult.data || []
        setParents(parentData)
        setCaregivers(caregiverData)
        
        const initialMatches = findMatches(parentData, caregiverData, filters)
        setMatches(initialMatches)
        setOriginalMatches(initialMatches)
      } catch (error) {
        console.error("Data fetch error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filters])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 max-w-md">
          <input
            type="search"
            placeholder="Search by name or skills..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
          />
          <span className="absolute left-3 top-3 text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-lg border border-gray-200 py-2.5 pl-3 pr-10 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all bg-white text-gray-700 text-sm font-medium"
          >
            <option value="score">Best Match</option>
            <option value="rate">Lowest Rate</option>
            <option value="rating">Highest Rating</option>
          </select>
          
          <button
            onClick={toggleViewMode}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {viewMode === 'grid' ? (
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {activeFilters.map(filter => (
          <span key={filter} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
            {filter.charAt(0).toUpperCase() + filter.slice(1).replace(/([A-Z])/g, ' $1')}
            <button
              onClick={() => handleFilterChange({ target: { name: filter, type: 'checkbox', checked: false } })}
              className="ml-2 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </span>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Filter Matches</h2>
          <button 
            onClick={() => setFilters({
              minRating: 4.0,
              verifiedOnly: false,
              maxRate: null,
              overnight: false,
              petCare: false,
              minScore: 50,
              availability: 'all'
            })}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                name="minRating"
                min="1"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={handleFilterChange}
                className="w-full flex-1"
            />
            <span className="text-sm text-gray-500">{filters.minRating}</span>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Maximum Rate ($/hr)</label>
            <input
              type="number"
              name="maxRate"
              value={filters.maxRate || ''}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              placeholder="Any"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="verifiedOnly"
                checked={filters.verifiedOnly}
                onChange={handleFilterChange}
                className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">Verified Only</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="overnight"
                checked={filters.overnight}
                onChange={handleFilterChange}
                className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">Overnight Care</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="petCare"
                checked={filters.petCare}
                onChange={handleFilterChange}
                className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">Pet Care</span>
            </label>
          </div>
        </div>
      </div>

      {/* Matches Display */}
      <div className={`${viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'}`}
      >
        {matches.map((match, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] border border-gray-100
              ${viewMode === 'list' ? 'flex' : ''}`}
          >
            <div className={`${viewMode === 'list' ? 'flex-1' : ''} p-6`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
                      {match.caregiver.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      match.caregiver.availability === 'available' ? 'bg-green-500' :
                      match.caregiver.availability === 'busy' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{match.caregiver.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full text-gray-800">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ${match.caregiver.rate}/{match.caregiver.rate_type}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {match.score}% Match
                  </span>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex flex-wrap gap-2">
                  {match.caregiver.skills.split(',').map((skill, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  {match.caregiver.verified && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                      <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                  {match.caregiver.overnight_ok && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Overnight Care
                    </span>
                  )}
                  {match.caregiver.pets_ok && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      Pet Friendly
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <button className="w-full bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center font-medium">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contact Caregiver
                </button>
              </div>
            </div>
          </div>
        ))}

        {matches.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No matches found</h3>
            <p className="mt-2 text-sm text-gray-500">Try adjusting your filters to see more results</p>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
