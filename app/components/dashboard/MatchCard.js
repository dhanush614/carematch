"use client"

export default function MatchCard({ match, onViewProfile, onMessage }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
              <span className="text-lg font-medium text-red-600">
                {match.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                {match.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-gray-500">
                {match.type === 'caregiver' ? 'Caregiver' : 'Parent'}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            {match.rating && (
              <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 text-sm font-medium text-gray-700">{match.rating}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center text-sm text-gray-500">
            <div className="p-2 bg-gray-50 rounded-lg mr-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-medium text-gray-600">{match.location}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {match.skills?.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-600 border border-red-100"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center space-x-4">
          <button
            onClick={() => onViewProfile(match.id)}
            className="flex-1 bg-white text-red-600 border-2 border-red-200 px-6 py-2.5 rounded-xl text-sm font-medium 
            hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
            transition-all duration-200"
          >
            View Profile
          </button>
          <button
            onClick={() => onMessage(match.id)}
            className="flex-1 bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium 
            hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
            shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>Message</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
