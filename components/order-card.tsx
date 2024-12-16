import { cn } from "@/lib/utils"

interface OrderCardProps {
  name: string;
  fulfillmentStatus: string;
  lineItems: Array<{
    title: string;
    quantity: number;
  }>;
  className?: string;
}

export function OrderCard({ name, fulfillmentStatus, lineItems, className }: OrderCardProps) {
  // Guard clause for invalid data
  if (!name || !fulfillmentStatus || !lineItems) {
    return null;
  }

  const statusEmoji = fulfillmentStatus === 'FULFILLED' ? '✅' : 
                     fulfillmentStatus === 'IN_TRANSIT' ? '🚚' :
                     fulfillmentStatus === 'PENDING' ? '⏳' : '📦';

  return (
    <div className={cn(
      "bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow",
      className
    )}>
      {/* Header */}
      <div className="border-b bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            📦 Order {name}
          </h3>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm bg-gray-100">
            {statusEmoji} {fulfillmentStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="px-4 py-3">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Items in your order</h4>
        <ul className="space-y-2">
          {lineItems.map((item, index) => (
            <li key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-900">{item.title}</span>
              <span className="text-gray-500 tabular-nums">
                × {item.quantity}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 px-4 py-3">
        <p className="text-xs text-gray-500">
          Order details as of {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  )
} 