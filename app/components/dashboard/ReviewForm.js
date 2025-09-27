"use client"

import { useState } from 'react'
import { useToast } from '../Toast'

export default function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [tags, setTags] = useState([])
  const { showToast } = useToast()

  const availableTags = [
    'Punctual',
    'Great with kids',
    'Professional',
    'Reliable',
    'Engaging',
    'Patient',
    'Creative',
    'Organized',
    'Flexible'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      showToast('Please select a rating', 'error')
      return
    }

    if (!title.trim() || !comment.trim()) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    await onSubmit({
      rating,
      title: title.trim(),
      comment: comment.trim(),
      tags
    })

    // Reset form
    setRating(0)
    setTitle('')
    setComment('')
    setTags([])
  }

  const toggleTag = (tag) => {
    setTags(current => 
      current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating Stars */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex gap-1">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1
            return (
              <button
                type="button"
                key={ratingValue}
                className={`text-3xl focus:outline-none ${
                  ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                onClick={() => setRating(ratingValue)}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
              >
                ★
              </button>
            )
          })}
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          required
        />
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          required
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Qualities
        </label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                tags.includes(tag)
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Submit Review
        </button>
      </div>
    </form>
  )
}
