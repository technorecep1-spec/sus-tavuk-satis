import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrls: string[];
    category: string;
    stock: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock > 0) {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('Product out of stock');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Live Bird':
        return 'bg-green-100 text-green-800';
      case 'Feed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Equipment':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card group">
      <Link to={`/products/${product._id}`}>
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(product.category)}`}>
              {product.category}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            {product.stock > 0 ? (
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                In Stock
              </span>
            ) : (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Out of Stock
              </span>
            )}
          </div>
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="bg-white text-gray-900 p-3 rounded-full hover:bg-primary-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} />
              </button>
              <Link
                to={`/products/${product._id}`}
                className="bg-white text-gray-900 p-3 rounded-full hover:bg-primary-500 hover:text-white transition-colors"
              >
                <Eye size={20} />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary-600">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              {product.stock} in stock
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
