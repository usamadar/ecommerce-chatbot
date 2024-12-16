import axios from 'axios';

interface OrderResponse {
  name: string;
  fulfillmentStatus: string;
  lineItems: Array<{
    title: string;
    quantity: number;
  }>;
  error?: boolean;
  message?: string;
}

export async function lookupOrder(orderId: string): Promise<OrderResponse> {
  console.log('🔍 Looking up order:', orderId);

  // Return mock data for order ID 5678
  if (orderId === '5678') {
    console.log('✅ Mock order found:', orderId);
    return {
      name: '#5678',
      fulfillmentStatus: 'FULFILLED',
      lineItems: [
        {
          title: 'Modern Coffee Table',
          quantity: 1
        },
        {
          title: 'Decorative Throw Pillows',
          quantity: 2
        },
        {
          title: 'Ceramic Vase Set',
          quantity: 1
        }
      ]
    };
  }

  // Only proceed with API call if not a mock order
  try {
    const response = await axios.post(
      `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/graphql.json`,
      {
        query: `
          query getOrder($id: ID!) {
            order(id: $id) {
              name
              fulfillmentStatus
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        `,
        variables: {
          id: `gid://shopify/Order/${orderId}`,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
        },
      }
    );

    if (!response.data.data.order) {
      console.log('❌ Order not found:', orderId);
      throw new Error("I couldn't find an order with that number. Please check the order number and try again.");
    }

    const order = response.data.data.order;
    console.log('✅ Order found:', order.name);
    return {
      name: order.name,
      fulfillmentStatus: order.fulfillmentStatus,
      lineItems: order.lineItems.edges.map((edge: { node: { title: string; quantity: number } }) => ({
        title: edge.node.title,
        quantity: edge.node.quantity,
      })),
    };
  } catch (error) {
    console.error('💥 Shopify API Error:', {
      orderId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}
