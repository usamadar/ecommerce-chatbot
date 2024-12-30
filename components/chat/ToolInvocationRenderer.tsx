'use client'

import { OrderCard } from '@/components/order-card'
import { ProductCard } from '@/components/product-card'
import { ReturnPolicyCard } from '@/components/return-policy-card'
import type { Message } from 'ai/react'

interface ToolInvocationRendererProps {
  toolInvocations: Message['toolInvocations']
}

export function ToolInvocationRenderer({ toolInvocations }: ToolInvocationRendererProps) {
  if (!toolInvocations) return null

  return (
    <div className="mt-4 space-y-4">
      {toolInvocations.map((toolInvocation) => {
        const { toolName, toolCallId, state, result } = toolInvocation
        const cardClasses = "mt-2 max-w-md"
        
        if (state === 'result' && result) {
          if (toolName === 'lookupOrder' && !('error' in result)) {
            return (
              <div key={toolCallId} className={cardClasses}>
                <OrderCard {...result} />
              </div>
            )
          }
          if (toolName === 'getProductInfo' && result?.component === 'ProductCard') {
            return (
              <div key={toolCallId} className={cardClasses}>
                <ProductCard {...result} />
              </div>
            )
          }
          if (toolName === 'getReturnPolicy' && result?.component === 'ReturnPolicyCard') {
            return (
              <div key={toolCallId} className={cardClasses}>
                <ReturnPolicyCard {...result} />
              </div>
            )
          }
        }
        return null
      })}
    </div>
  )
}
