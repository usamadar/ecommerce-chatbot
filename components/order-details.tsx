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