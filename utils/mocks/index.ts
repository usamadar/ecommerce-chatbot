interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  description: string;
  specifications: {
    dimensions: string;
    material: string;
    colors: string[];
  };
  availability: string;
  deliveryTime: string;
}

export const mockData = {
  products: {
    "modern-coffee-table": {
      id: "123",
      title: "Modern Coffee Table",
      price: "299.99",
      image: "https://images.unsplash.com/photo-1542372147193-a7aca54189cd",
      description: "Sleek design meets functionality...",
      specifications: {
        dimensions: "120x60x45cm",
        material: "Oak wood, Steel",
        colors: ["Natural", "Black"]
      },
      availability: "In Stock",
      deliveryTime: "3-5 business days"
    },
    // Add more products...
  } as Record<string, Product>,
  
  shipping: {
    policies: {
      standard: {
        time: "3-5 business days",
        cost: "Free over €75",
      },
      express: {
        time: "1-2 business days",
        cost: "€14.99",
      }
    },
    restrictions: ["Furniture may have longer delivery times", "Some remote areas excluded"]
  },

  returns: {
    policy: "30-day return window",
    conditions: [
      "Items must be unused and in original packaging",
      "Free returns on all orders",
      "Print return label from your account"
    ],
    process: "1. Login to your account\n2. Find your order\n3. Select items to return\n4. Print label"
  }
}; 