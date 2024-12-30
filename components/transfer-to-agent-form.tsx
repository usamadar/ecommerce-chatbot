/**
 * TransferToAgentForm Component
 * 
 * A form component that allows customers to request transfer to a human agent by providing
 * their email address and reason for transfer. Validates the email format before submission
 * and clears the form fields after successful submission.
 * 
 * @component
 * @example
 * <TransferToAgentForm onSubmit={(email, reason) => {
 *   // Handle transfer request logic
 * }} />
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

/**
 * Validates an email address using a regular expression pattern
 * 
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email is valid, false otherwise
 */
const validateEmail = (email: string): boolean => {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return pattern.test(email.trim())
}

/**
 * Props for the TransferToAgentForm component
 * 
 * @interface TransferToAgentFormProps
 * @property {function} onSubmit - Callback function that receives the email and reason when form is submitted
 */
interface TransferToAgentFormProps {
  onSubmit: (email: string, reason: string) => void;
}

/**
 * TransferToAgentForm Component Implementation
 * 
 * @param {TransferToAgentFormProps} props - Component props
 * @returns {JSX.Element} The transfer to agent form UI
 */
export function TransferToAgentForm({ onSubmit }: TransferToAgentFormProps) {
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!reason.trim()) {
      setError('Please provide a reason for transfer')
      return
    }

    try {
      setIsLoading(true)
      await onSubmit(email, reason)
      setEmail('')
      setReason('')
    } catch {
      setError('Failed to submit transfer request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Transfer to Agent</h2>
        <p className="text-sm text-gray-600">Please provide your email and reason to speak with a human agent</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-6">
          <div className="relative">
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10"
              required
            />
          </div>

          <div className="relative">
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <Textarea
              placeholder="Reason for transfer"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full pl-10 min-h-[120px]"
              required
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </div>
          ) : (
            'Request Transfer'
          )}
        </Button>
      </form>
    </div>
  )
}
