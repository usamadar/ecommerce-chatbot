/**
 * OrderDetails Component
 * 
 * This component displays a simplified view of order details, including
 * the order name, fulfillment status, and a list of items in the order.
 * 
 * Props:
 * - name: The name or identifier of the order (e.g., order number).
 * - fulfillmentStatus: The current fulfillment status of the order.
 * - lineItems: An array of items included in the order, each containing:
 *   - title: The name of the item
 *   - quantity: The number of items ordered
 * 
 * Usage:
 * <OrderDetails 
 *   name="#1234"
 *   fulfillmentStatus="FULFILLED"
 *   lineItems={[
 *     { title: "Product 1", quantity: 2 },
 *     { title: "Product 2", quantity: 1 }
 *   ]}
 * />
 */
type OrderDetailsProps = {
  name: string;
  fulfillmentStatus: string;
  lineItems: Array<{
    title: string;
    quantity: number;
  }>;
};

export const OrderDetails = ({ name, fulfillmentStatus, lineItems }: OrderDetailsProps) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">📦 Order {name}</h2>
      <p className="mb-2">Status: {fulfillmentStatus === 'FULFILLED' ? '✅' : '🚚'} {fulfillmentStatus}</p>
      <div>
        <h3 className="font-medium mb-1">Items:</h3>
        <ul className="list-disc pl-5">
          {lineItems.map((item, index) => (
            <li key={index}>
              {item.title} × {item.quantity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
