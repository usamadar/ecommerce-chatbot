import Image from 'next/image';

/**
 * ProductCard Component
 * 
 * This component displays detailed product information in a card format,
 * including the product image, title, price, description, specifications,
 * availability status, and delivery information.
 * 
 * Props:
 * - id: Unique identifier for the product.
 * - title: The name of the product.
 * - price: The product's price as a formatted string.
 * - image: URL of the product image.
 * - description: Detailed description of the product.
 * - specifications: Object containing product details:
 *   - dimensions: Product dimensions as a string
 *   - material: Material information
 *   - colors: Array of available colors
 * - availability: Current stock status (e.g., "In Stock")
 * - deliveryTime: Estimated delivery time information
 * 
 * Usage:
 * <ProductCard
 *   id="prod_123"
 *   title="Modern Chair"
 *   price="$199.99"
 *   image="/images/chair.jpg"
 *   description="Comfortable modern chair with ergonomic design"
 *   specifications={{
 *     dimensions: "24" × 24" × 36"",
 *     material: "Oak Wood",
 *     colors: ["Black", "White", "Natural"]
 *   }}
 *   availability="In Stock"
 *   deliveryTime="2-3 business days"
 * />
 */
interface ProductCardProps {
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

export function ProductCard(props: ProductCardProps) {
  const { title, price, image, description, specifications, availability, deliveryTime } = props;
  
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Product Image */}
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Header with Title and Price */}
      <div className="border-b bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="text-lg font-bold text-blue-600">{price}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Description */}
        <div>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Specifications */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-500">Specifications</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Dimensions:</span>
              <span className="text-gray-900">{specifications.dimensions}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Material:</span>
              <span className="text-gray-900">{specifications.material}</span>
            </div>
          </div>
          {/* Colors */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Colors:</span>
            <div className="flex gap-1">
              {specifications.colors.map((color) => (
                <span key={color} className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-700">
                  {color}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Availability and Delivery */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              availability === 'In Stock' ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-sm font-medium text-gray-700">{availability}</span>
          </div>
          <span className="text-sm text-gray-500">Delivery: {deliveryTime}</span>
        </div>
      </div>
    </div>
  );
}
