"use client"

export default function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <h4 className="font-medium text-gray-900">{review.title}</h4>
          <p className="mt-2 text-gray-600">{review.comment}</p>
          
          {review.response && (
            <div className="mt-4 pl-4 border-l-4 border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Response: </span>
                {review.response}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {review.tags && review.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
