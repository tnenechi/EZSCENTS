import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag,
  ChevronLeft,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { getProductById } from "../services/productService";
import { useCartStore } from "../store/cartStore";
import MainLayout from "../components/layout/MainLayout";
import CloudinaryImage from "../components/common/CloudinaryImage";

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
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (isLoading)
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="skeleton h-4 w-24 bg-premium-gray" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="skeleton aspect-[4/5] w-full bg-premium-gray" />
            <div className="flex flex-col gap-6">
              <div className="space-y-4">
                <div className="skeleton h-4 w-20 bg-premium-gray" />
                <div className="skeleton h-12 w-3/4 bg-premium-gray" />
                <div className="skeleton h-8 w-1/4 bg-premium-gray" />
              </div>
              <div className="skeleton h-40 w-full bg-premium-gray" />
              <div className="skeleton h-12 w-1/2 bg-premium-gray" />
              <div className="skeleton h-16 w-full bg-premium-gray" />
            </div>
          </div>
        </div>
      </MainLayout>
    );

  if (error || !product)
    return (
      <MainLayout>
        <div className="text-center py-20">
          <p className="text-premium-muted uppercase tracking-widest text-xs font-bold">
            Product not found.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="mt-4 text-premium-gold uppercase text-[10px] font-bold tracking-widest"
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
    }
  };

  const DESCRIPTION_THRESHOLD = 200;
  const isDescriptionLong = product.description.length > DESCRIPTION_THRESHOLD;
  const displayDescription =
    isDescriptionLong && !showFullDescription
      ? `${product.description.slice(0, DESCRIPTION_THRESHOLD)}...`
      : product.description;

  return (
    <MainLayout showSidebar={false}>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-premium-muted hover:text-foreground transition-colors mb-8 uppercase text-[10px] font-bold tracking-widest"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-premium-gray/30 overflow-hidden rounded-sm border border-premium-border/10">
              <CloudinaryImage
                image={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                width={800}
                height={1000}
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square border-2 transition-all rounded-sm ${activeImage === idx ? "border-premium-gold" : "border-premium-border/10"}`}
                  >
                    <CloudinaryImage
                      image={img}
                      alt=""
                      className="w-full h-full object-cover"
                      width={240}
                      height={240}
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
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight uppercase text-foreground">
                {product.name}
              </h1>
              <p className="text-2xl font-light text-foreground">
                ₦{selectedVariant.price.toLocaleString()}
              </p>
            </div>

            <div className="mb-8 border-y border-premium-border/10 py-8">
              <h3 className="text-[10px] uppercase tracking-widest text-premium-muted mb-4 font-bold">
                The Fragrance
              </h3>
              <div className="relative">
                <motion.div
                  initial={false}
                  animate={{ height: "auto" }}
                  className="overflow-hidden"
                >
                  <p className="text-foreground/80 leading-relaxed text-sm lg:text-base whitespace-pre-line font-medium">
                    {displayDescription}
                  </p>
                </motion.div>

                {isDescriptionLong && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-4 flex items-center gap-1 text-premium-gold text-[10px] font-bold uppercase tracking-widest hover:text-foreground transition-colors"
                  >
                    {showFullDescription ? (
                      <>
                        Read Less <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        Read More <ChevronDown size={14} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Variant Selection */}
            <div className="mb-8">
              <h3 className="text-[10px] uppercase tracking-widest text-premium-muted mb-4 font-bold">
                Select Size
              </h3>
              <div className="flex flex-wrap gap-4">
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariantId(variant._id)}
                    className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border ${
                      (selectedVariantId ?? product.variants[0]._id) ===
                      variant._id
                        ? "border-premium-gold text-premium-gold bg-premium-gold/5"
                        : "border-premium-border/20 text-premium-muted hover:border-premium-border/60 hover:text-foreground"
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
                <div className="flex items-center border border-premium-border/20 px-4 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-premium-muted hover:text-foreground p-1"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold text-sm text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-premium-muted hover:text-foreground p-1"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="text-[10px] uppercase tracking-widest font-bold">
                  {selectedVariant.stock > 0 ? (
                    <span className="text-green-600">In Stock</span>
                  ) : (
                    <span className="text-red-500">Out of Stock</span>
                  )}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={selectedVariant.stock === 0}
                className="w-full bg-foreground text-background py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-premium-gold hover:text-premium-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <ShoppingBag
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                Add to Shopping Bag
              </button>
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-premium-border/10 pt-8">
              <div className="flex items-start gap-4">
                <Truck className="text-premium-gold" size={20} />
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1 text-foreground">
                    Premium Delivery
                  </h4>
                  <p className="text-premium-muted text-[10px] leading-normal font-bold">
                    Fast, secure shipping across Nigeria.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <ShieldCheck className="text-premium-gold" size={20} />
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1 text-foreground">
                    100% Authentic
                  </h4>
                  <p className="text-premium-muted text-[10px] leading-normal font-bold">
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
