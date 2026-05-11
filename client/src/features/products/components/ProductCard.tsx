import { Link } from 'react-router-dom';
import type { Product } from '../../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const lowestPrice = Math.min(...product.variants.map(v => v.price));

  return (
    <Link to={`/product/${product._id}`} className="group cursor-pointer">
      <div className="aspect-[4/5] bg-premium-gray relative overflow-hidden mb-4">
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 uppercase text-[10px] tracking-widest">
            No Image
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute top-4 left-4 bg-premium-gold text-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest z-20">
            Featured
          </span>
        )}
      </div>
      <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">{product.brand}</h4>
      <h5 className="text-base font-bold mb-2 tracking-tight group-hover:text-premium-gold transition-colors">{product.name}</h5>
      <p className="text-white font-medium">
        <span className="text-gray-500 text-xs mr-2 font-normal uppercase tracking-widest">From</span>
        ₦{lowestPrice.toLocaleString()}
      </p>
    </Link>
  );
};

export default ProductCard;
