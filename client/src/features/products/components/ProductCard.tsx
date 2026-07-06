import { Link } from "react-router-dom";
import type { Product } from "../../../types";
import CloudinaryImage from "../../../components/common/CloudinaryImage";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const lowestPrice = Math.min(...product.variants.map((v) => v.price));

  return (
    <Link to={`/product/${product._id}`} className="group cursor-pointer">
      <div className="aspect-[4/5] bg-premium-gray/50 relative overflow-hidden mb-4">
        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
        {product.images && product.images.length > 0 ? (
          <CloudinaryImage
            image={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            width={400}
            height={500}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-premium-muted uppercase text-[10px] tracking-widest">
            No Image
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute top-4 left-4 bg-premium-gold text-premium-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest z-20">
            Featured
          </span>
        )}
      </div>
      <h4 className="text-[10px] uppercase tracking-[0.2em] text-premium-muted mb-1 font-bold">
        {product.brand}
      </h4>
      <h5 className="text-base font-bold mb-2 tracking-tight group-hover:text-premium-gold transition-colors text-foreground">
        {product.name}
      </h5>
      <p className="text-foreground font-medium">
        <span className="text-premium-muted text-xs mr-2 font-normal uppercase tracking-widest">
          From
        </span>
        ₦{lowestPrice.toLocaleString()}
      </p>
    </Link>
  );
};

export default ProductCard;
