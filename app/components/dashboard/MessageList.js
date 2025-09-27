"use client"

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/auth'
import { supabase } from '../../../lib/supabaseClient'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useToast } from '../../components/Toast'

export default function MessageList({ selectedChat }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const { showToast } = useToast()

  useEffect(() => {
    if (selectedChat) {
      fetchMessages()
      subscribeToMessages()
    }
  }, [selectedChat])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', selectedChat.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data)
    } catch (error) {
      console.error('Error:', error)
      showToast('Error loading messages', 'error')
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${selectedChat.id}`
      }, payload => {
        setMessages(current => [...current, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`flex ${message.user_id === user.id ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`relative max-w-xs lg:max-w-md ${
              message.user_id === user.id
                ? 'bg-red-600 text-white rounded-2xl rounded-tr-none shadow-md'
                : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-none shadow-sm'
            } px-4 py-3 transition-all duration-200 hover:shadow-lg`}
          >
            <p className="text-sm font-normal leading-relaxed">{message.content}</p>
            <p className={`text-xs mt-1.5 ${
              message.user_id === user.id
                ? 'text-red-100'
                : 'text-gray-500'
            }`}>
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  )
}
