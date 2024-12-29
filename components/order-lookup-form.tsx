'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'

const validateEmail = (email: string): boolean => {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return pattern.test(email.trim())
}

interface OrderLookupFormProps {
  onSubmit: (orderId: string, email: string) => void;
}

export function OrderLookupForm({ onSubmit }: OrderLookupFormProps) {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      alert('Please enter a valid email address')
      return
    }
    onSubmit(orderId, email)
    setOrderId('')
    setEmail('')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 my-2">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Input
            type="text"
            placeholder="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full"
            required
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Look Up Order
        </Button>
      </form>
    </div>
  )
}
