"use client"

import { useState } from 'react'
import { useAuth } from '../context/auth'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'
import MessageList from '../components/dashboard/MessageList'

export default function MessagesPage() {
  const { user } = useAuth()
  const [selectedChat, setSelectedChat] = useState(null)
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const { showToast } = useToast()

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChat.id,
          user_id: user.id,
          content: newMessage.trim()
        })

      if (error) throw error
      setNewMessage('')
    } catch (error) {
      console.error('Error:', error)
      showToast('Error sending message', 'error')
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
      <div className="flex h-[calc(100vh-12rem)] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r border-gray-100 bg-gray-50">
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full px-6 py-4 text-left transition-all duration-200 ${
                    selectedChat?.id === chat.id
                      ? 'bg-red-50 border-l-4 border-red-500'
                      : 'hover:bg-gray-100 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-red-600">
                        {chat.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chat.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {chat.last_message}
                      </p>
                    </div>
                    {chat.unread_count > 0 && (
                      <div className="ml-3 bg-red-500 text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center">
                        {chat.unread_count}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-white">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-base font-medium text-red-600">
                      {selectedChat.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedChat.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedChat.status === 'online' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <MessageList selectedChat={selectedChat} />

              {/* Message Input */}
              <div className="p-6 border-t border-gray-100 bg-white">
                <form onSubmit={sendMessage} className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full pl-4 pr-12 py-3 rounded-full border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 hover:border-gray-300 transition-colors duration-200"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => {/* Add emoji picker */}}
                    >
                      <span role="img" aria-label="emoji" className="text-xl">😊</span>
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                  >
                    <span>Send</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
