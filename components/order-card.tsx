/**
 * OrderCard Component
 * 
 * This component displays the details of a customer's order, including
 * the order name, email, fulfillment status, creation date, total price,
 * shipping address, tracking information, and a list of items in the order.
 * 
 * Props:
 * - name: The name or identifier of the order (e.g., order number).
 * - email: The email address associated with the order.
 * - displayFulfillmentStatus: The current fulfillment status of the order.
 * - createdAt: The date and time when the order was created.
 * - totalPrice: An object containing the total amount and currency code.
 * - shippingAddress: An optional object containing the shipping address details.
 * - lineItems: An array of items included in the order, each with a title,
 *   quantity, original price, and optional image.
 * - fulfillments: An array of fulfillment details, including tracking information.
 * - className: An optional string for additional CSS classes to apply to the component.
 * 
 * Usage:
 * <OrderCard 
 *   name="#1234"
 *   email="customer@example.com"
 *   displayFulfillmentStatus="FULFILLED"
 *   createdAt="2023-10-01T12:00:00Z"
 *   totalPrice={{ amount: "100.00", currencyCode: "USD" }}
 *   shippingAddress={{ address1: "123 Main St", city: "Anytown", country: "USA", zip: "12345" }}
 *   lineItems={[{ title: "Product 1", quantity: 1, originalPrice: { amount: "50.00", currencyCode: "USD" }, image: { url: "image_url", altText: "Product 1" } }]}
 *   fulfillments={[{ trackingInfo: { number: "TRACK123", url: "tracking_url" }, deliveredAt: null, estimatedDeliveryAt: "2023-10-05T12:00:00Z" }]}
 * />
 */

import { cn } from "@/lib/utils";
import Image from 'next/image';

type FulfillmentStatus = 
  | 'FULFILLED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'OPEN'
  | 'PARTIALLY_FULFILLED'
  | 'PENDING_FULFILLMENT'
  | 'REQUEST_DECLINED'
  | 'RESTOCKED'
  | 'SCHEDULED'
  | 'UNFULFILLED';

interface Price {
  amount: string;
  currencyCode: string;
}

interface Address {
  address1: string;
  city: string;
  country: string;
  zip: string;
}

interface LineItem {
  title: string;
  quantity: number;
  originalPrice: Price;
  image?: {
    url: string;
    altText: string;
  };
}

interface Fulfillment {
  trackingInfo: {
    number: string;
    url: string;
  };
  deliveredAt: string | null;
  estimatedDeliveryAt: string | null;
}

interface OrderCardProps {
  name: string;
  email: string;
  displayFulfillmentStatus: FulfillmentStatus;
  createdAt: string;
  totalPrice: Price;
  shippingAddress?: Address;
  lineItems: LineItem[];
  fulfillments: Fulfillment[];
  displayName?: string;
  className?: string;
}

const statusConfig: Record<FulfillmentStatus, { emoji: string; label: string }> = {
  FULFILLED: { emoji: '✅', label: 'Fulfilled' },
  IN_PROGRESS: { emoji: '🚚', label: 'In Progress' },
  ON_HOLD: { emoji: '⏸️', label: 'On Hold' },
  OPEN: { emoji: '📦', label: 'Open' },
  PARTIALLY_FULFILLED: { emoji: '⚡', label: 'Partially Fulfilled' },
  PENDING_FULFILLMENT: { emoji: '⏳', label: 'Pending' },
  REQUEST_DECLINED: { emoji: '❌', label: 'Declined' },
  RESTOCKED: { emoji: '🔄', label: 'Restocked' },
  SCHEDULED: { emoji: '📅', label: 'Scheduled' },
  UNFULFILLED: { emoji: '📦', label: 'Unfulfilled' }
};

export function OrderCard({ 
  name, 
  email,
  displayFulfillmentStatus,
  createdAt, 
  totalPrice,
  shippingAddress,
  lineItems, 
  fulfillments,
  displayName,
  className 
}: OrderCardProps) {
  // Validate required props
  if (!name || !displayFulfillmentStatus || !lineItems) {
    console.error('OrderCard: Missing required props');
    return (
      <div className={cn("bg-white border border-gray-100 rounded-xl p-4", className)}>
        <p className="text-red-500">Error: Missing order information</p>
      </div>
    );
  }

  // Validate line items
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    console.error('OrderCard: Invalid line items');
    return (
      <div className={cn("bg-white border border-gray-100 rounded-xl p-4", className)}>
        <p className="text-red-500">Error: Invalid order items</p>
      </div>
    );
  }

  const { emoji, label } = statusConfig[displayFulfillmentStatus] || { emoji: '📦', label: 'Unknown' };
  const orderDate = new Date(createdAt).toLocaleDateString();
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
          <span 
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm bg-gray-100"
            aria-label={`Order status: ${label}`}
          >
            {emoji} {label}
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
          {displayName && <p className="text-sm text-gray-900 font-medium">{displayName}</p>}
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
                        alt={item.image.altText || `Image of ${item.title}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                        priority={index < 3}
                        loading={index < 3 ? 'eager' : 'lazy'}
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
