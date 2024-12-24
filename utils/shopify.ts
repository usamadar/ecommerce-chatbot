import axios from 'axios';

interface OrderResponse {
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
  error?: boolean;
  message?: string;
}

export async function lookupOrder(orderNumber: string, email: string): Promise<OrderResponse> {
  console.log('🔍 Looking up order:', { orderNumber, email });

  // Return mock data for testing
  if (orderNumber === '5678') {
    console.log('✅ Mock order found:', orderNumber);
    return {
      name: '#5678',
      email: email,
      displayFulfillmentStatus: 'FULFILLED',
      createdAt: new Date().toISOString(),
      totalPrice: {
        amount: '499.99',
        currencyCode: 'EUR'
      },
      lineItems: [
        {
          title: 'Modern Coffee Table',
          quantity: 1,
          originalPrice: {
            amount: '299.99',
            currencyCode: 'EUR'
          },
          image: {
            url: 'https://images.unsplash.com/photo-1542372147193-a7aca54189cd',
            altText: 'Modern Coffee Table'
          }
        }
      ],
      fulfillments: []
    };
  }

  try {
    const response = await axios.post(
      `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/graphql.json`,
      {
        query: `
          query getOrderByNumberAndEmail($query: String!) {
            orders(query: $query, first: 1) {
              edges {
                node {
                  id
                  name
                  email
                  createdAt
                  displayFulfillmentStatus
                  totalPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                  shippingAddress {
                    address1
                    city
                    country
                    zip
                  }
                  lineItems(first: 20) {
                    edges {
                      node {
                        title
                        quantity
                        originalUnitPriceSet {
                          shopMoney {
                            amount
                            currencyCode
                          }
                        }
                        variant {
                          image {
                            url
                            altText
                          }
                        }
                      }
                    }
                  }
                  fulfillments(first: 5) {
                    trackingInfo {
                      number
                      url
                    }
                    deliveredAt
                    estimatedDeliveryAt
                  }
                }
              }
            }
          }
        `,
        variables: {
          query: `name:#${orderNumber} AND email:${email}`
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
        },
      }
    );

    console.log('📦 Shopify API Response:', JSON.stringify(response.data, null, 2));

    // Add error checking for the response structure
    if (!response.data?.data?.orders?.edges) {
      console.log('❌ Invalid response structure:', response.data);
      throw new Error("Failed to fetch order data. Please try again.");
    }

    const orderEdge = response.data.data.orders.edges[0];
    if (!orderEdge) {
      console.log('❌ Order not found:', { orderNumber, email });
      throw new Error("I couldn't find an order with that number and email combination. Please check both the order number and email address and try again.");
    }

    const order = orderEdge.node;
    console.log('✅ Order found:', order.name);

    return {
      name: order.name,
      email: order.email,
      displayFulfillmentStatus: order.displayFulfillmentStatus,
      createdAt: order.createdAt,
      totalPrice: {
        amount: order.totalPriceSet.shopMoney.amount,
        currencyCode: order.totalPriceSet.shopMoney.currencyCode
      },
      shippingAddress: order.shippingAddress ? {
        address1: order.shippingAddress.address1,
        city: order.shippingAddress.city,
        country: order.shippingAddress.country,
        zip: order.shippingAddress.zip
      } : undefined,
      lineItems: order.lineItems.edges.map((edge: any) => ({
        title: edge.node.title,
        quantity: edge.node.quantity,
        originalPrice: {
          amount: edge.node.originalUnitPriceSet.shopMoney.amount,
          currencyCode: edge.node.originalUnitPriceSet.shopMoney.currencyCode
        },
        image: edge.node.variant?.image ? {
          url: edge.node.variant.image.url,
          altText: edge.node.variant.image.altText || edge.node.title
        } : undefined
      })),
      fulfillments: order.fulfillments.map((fulfillment: any) => ({
        trackingInfo: {
          number: fulfillment.trackingInfo[0]?.number || '',
          url: fulfillment.trackingInfo[0]?.url || ''
        },
        deliveredAt: fulfillment.deliveredAt,
        estimatedDeliveryAt: fulfillment.estimatedDeliveryAt
      }))
    };
  } catch (error) {
    console.error('💥 Shopify API Error:', {
      orderNumber,
      email,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}
