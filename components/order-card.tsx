import { cn } from "@/lib/utils"
import Image from 'next/image';

interface OrderCardProps {
  name: string;
  email: string;
  displayFulfillmentStatus: string;
  createdAt: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  shippingAddress?: {
    address1: string;
    city: string;
    country: string;
    zip: string;
  };
  lineItems: Array<{
    title: string;
    quantity: number;
    originalPrice: {
      amount: string;
      currencyCode: string;
    };
    image?: {
      url: string;
      altText: string;
    };
  }>;
  fulfillments: Array<{
    trackingInfo: {
      number: string;
      url: string;
    };
    deliveredAt: string | null;
    estimatedDeliveryAt: string | null;
  }>;
  className?: string;
}

export function OrderCard({ 
  name, 
  email,
  displayFulfillmentStatus,
  createdAt, 
  totalPrice,
  shippingAddress,
  lineItems, 
  fulfillments,
  className 
}: OrderCardProps) {
  // Guard clause for invalid data
  if (!name || !displayFulfillmentStatus || !lineItems) {
    return null;
  }

  const statusEmoji = {
    'FULFILLED': '✅',
    'IN_PROGRESS': '🚚',
    'ON_HOLD': '⏸️',
    'OPEN': '📦',
    'PARTIALLY_FULFILLED': '⚡',
    'PENDING_FULFILLMENT': '⏳',
    'REQUEST_DECLINED': '❌',
    'RESTOCKED': '🔄',
    'SCHEDULED': '📅',
    'UNFULFILLED': '📦'
  }[displayFulfillmentStatus] || '📦';

  const orderDate = new Date(createdAt).toLocaleDateString();
  
  // Get tracking info from the most recent fulfillment
  const latestFulfillment = fulfillments[0];
  const hasTracking = latestFulfillment?.trackingInfo.number;

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
            {statusEmoji} {displayFulfillmentStatus.replace('_', ' ')}
          </span>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          Ordered on {orderDate}
        </div>
      </div>

      {/* Order Details */}
      <div className="px-4 py-3 space-y-4">
        {/* Customer Info */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Customer</h4>
          <p className="text-sm text-gray-900">{email}</p>
        </div>

        {/* Shipping Address */}
        {shippingAddress && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Shipping Address</h4>
            <p className="text-sm text-gray-900">
              {shippingAddress.address1}<br />
              {shippingAddress.city}, {shippingAddress.zip}<br />
              {shippingAddress.country}
            </p>
          </div>
        )}

        {/* Tracking Info */}
        {hasTracking && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Tracking</h4>
            <div className="text-sm">
              {latestFulfillment.trackingInfo.url ? (
                <a 
                  href={latestFulfillment.trackingInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  📍 Track Package ({latestFulfillment.trackingInfo.number})
                </a>
              ) : (
                <span className="text-gray-900">
                  📍 Tracking: {latestFulfillment.trackingInfo.number}
                </span>
              )}
              {latestFulfillment.estimatedDeliveryAt && (
                <p className="text-gray-500 mt-1">
                  Estimated delivery: {new Date(latestFulfillment.estimatedDeliveryAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Items List */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Items</h4>
          <ul className="divide-y">
            {lineItems.map((item, index) => (
              <li key={index} className="py-2 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  {/* Item Image */}
                  <div className="flex-shrink-0 w-16 h-16 relative rounded-md overflow-hidden bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image.url}
                        alt={item.image.altText}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span>No image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  
                  {/* Price */}
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {item.originalPrice.amount} {item.originalPrice.currencyCode}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Total */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between font-medium">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">
              {totalPrice.amount} {totalPrice.currencyCode}
            </span>
          </div>
        </div>
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