import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag,
  ChevronLeft,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getProductById } from "../services/productService";
import { useCartStore } from "../store/cartStore";
import MainLayout from "../components/layout/MainLayout";
import { optimizeImage } from "../utils/imageUtils";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id as string),
    enabled: !!id,
  });

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Set initial variant once data is loaded
  useEffect(() => {
    if (product && product.variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(product.variants[0]._id);
    }
  }, [product, selectedVariantId]);

  if (isLoading)
    return (
      <MainLayout>
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-24 bg-premium-gray" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-premium-gray" />
            <div className="space-y-4">
              <div className="h-10 w-3/4 bg-premium-gray" />
              <div className="h-6 w-1/2 bg-premium-gray" />
              <div className="h-32 w-full bg-premium-gray" />
            </div>
          </div>
        </div>
      </MainLayout>
    );

  if (error || !product)
    return (
      <MainLayout>
        <div className="text-center py-20">
          <p className="text-gray-400 uppercase tracking-widest text-xs">
            Product not found.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="mt-4 text-premium-gold uppercase text-[10px] font-bold"
          >
            Back to Shop
          </button>
        </div>
      </MainLayout>
    );

  const selectedVariant =
    product.variants.find((v) => v._id === selectedVariantId) ||
    product.variants[0];

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem(product, selectedVariant, quantity);
      // Optional: Add a toast or redirect to cart
    }
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 uppercase text-[10px] font-bold tracking-widest"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-premium-gray overflow-hidden">
              <img
                src={optimizeImage(product.images[activeImage])}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square border-2 transition-all ${activeImage === idx ? "border-premium-gold" : "border-transparent"}`}
                  >
                    <img
                      src={optimizeImage(img)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <p className="text-premium-gold text-xs uppercase tracking-[0.3em] mb-2 font-bold">
                {product.brand}
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight uppercase">
                {product.name}
              </h1>
              <p className="text-2xl font-light text-white">
                ₦{selectedVariant.price.toLocaleString()}
              </p>
            </div>

            <div className="mb-8 border-y border-white/5 py-8">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-500 mb-4 font-bold">
                The Fragrance
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
                {product.description}
              </p>
            </div>

            {/* Variant Selection */}
            <div className="mb-8">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-500 mb-4 font-bold">
                Select Size
              </h3>
              <div className="flex flex-wrap gap-4">
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariantId(variant._id)}
                    className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border ${
                      selectedVariantId === variant._id
                        ? "border-premium-gold text-premium-gold bg-premium-gold/5"
                        : "border-white/10 text-gray-400 hover:border-white/30"
                    }`}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-6">
              <div className="flex items-center gap-8">
                <div className="flex items-center border border-white/10 px-4 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500">
                  {selectedVariant.stock > 0 ? (
                    <span className="text-green-500">In Stock</span>
                  ) : (
                    <span className="text-red-500">Out of Stock</span>
                  )}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={selectedVariant.stock === 0}
                className="w-full bg-white text-black py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-premium-gold hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <ShoppingBag
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                Add to Shopping Bag
              </button>
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
              <div className="flex items-start gap-4">
                <Truck className="text-premium-gold" size={20} />
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1">
                    Premium Delivery
                  </h4>
                  <p className="text-gray-500 text-[10px] leading-normal">
                    Fast, secure shipping across Nigeria.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <ShieldCheck className="text-premium-gold" size={20} />
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1">
                    100% Authentic
                  </h4>
                  <p className="text-gray-500 text-[10px] leading-normal">
                    Guaranteed genuine designer fragrances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetailPage;
