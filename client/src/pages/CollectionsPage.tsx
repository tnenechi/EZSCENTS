import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts, getFilters } from "../services/productService";
import MainLayout from "../components/layout/MainLayout";
import ProductCard from "../features/products/components/ProductCard";
import ProductCardSkeleton from "../features/products/components/ProductCardSkeleton";
import CloudinaryImage from "../components/common/CloudinaryImage";
import { Search, Filter, X, List, LayoutGrid } from "lucide-react";

const CollectionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const promotionId = searchParams.get("promotionId") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("pageNumber")) || 1;

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products", keyword, category, brand, sort, page, promotionId],
    queryFn: () =>
      getProducts(keyword, category, false, brand, sort, page, promotionId),
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("productsViewMode");
      if (saved === "grid" || saved === "list") return saved as "grid" | "list";
      return window.innerWidth < 768 ? "list" : "grid";
    }

    return "grid";
  });

  useEffect(() => {
    localStorage.setItem("productsViewMode", viewMode);
  }, [viewMode]);

  const { data: filtersData } = useQuery({
    queryKey: ["filters"],
    queryFn: getFilters,
  });

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    if (key !== "pageNumber") {
      newParams.set("pageNumber", "1"); // Reset to page 1 on filter change
    }

    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <MainLayout>
      <div className="px-6 lg:px-12 pt-32 pb-24">
        {/* Header & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2 text-foreground">
              Our Collection
            </h1>
            <p className="text-premium-muted text-xs uppercase tracking-widest font-bold">
              Explore our curated selection of fine fragrances
            </p>
          </div>

          <div className="relative w-full lg:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-premium-muted"
              size={18}
            />
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
              className="w-full bg-background border border-premium-border/10 py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-premium-gold transition-colors text-foreground placeholder:text-premium-muted/50"
            />
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center gap-4 mb-12 pb-8 border-b border-premium-border/10">
          <div className="flex items-center gap-2 text-premium-gold mr-4">
            <Filter size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Filters
            </span>
          </div>

          <select
            value={category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="bg-background border border-premium-border/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-premium-gold cursor-pointer text-foreground"
          >
            <option value="">All Categories</option>
            {filtersData?.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={brand}
            onChange={(e) => handleFilterChange("brand", e.target.value)}
            className="bg-background border border-premium-border/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-premium-gold cursor-pointer text-foreground"
          >
            <option value="">All Brands</option>
            {filtersData?.brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
            className="bg-background border border-premium-border/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-premium-gold cursor-pointer ml-auto text-foreground"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center gap-2 ml-2">
            <button
              aria-label="List view"
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-sm ${
                viewMode === "list"
                  ? "bg-premium-gold text-premium-black"
                  : "bg-background"
              }`}
            >
              <List size={16} />
            </button>
            <button
              aria-label="Grid view"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-sm ${
                viewMode === "grid"
                  ? "bg-premium-gold text-premium-black"
                  : "bg-background"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {(keyword || category || brand) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-premium-muted hover:text-foreground transition-colors text-[10px] font-bold uppercase tracking-widest"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {/* Product Grid / List */}
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : productsData?.products.length === 0 ? (
          <div className="text-center py-40 border border-dashed border-premium-border/20">
            <p className="text-premium-muted uppercase tracking-widest text-xs font-bold">
              No products found matching your criteria.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {productsData?.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {productsData?.products.map((product) => {
              const lowestPrice = Math.min(
                ...product.variants.map((v) => v.price),
              );
              return (
                <a
                  key={product._id}
                  href={`/product/${product._id}`}
                  className="flex items-center gap-4 p-4 bg-background border border-premium-border/10 rounded-sm hover:shadow-md transition-all"
                >
                  <div className="w-28 h-28 bg-premium-gray overflow-hidden rounded-sm">
                    <CloudinaryImage
                      image={product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-premium-muted mb-1 font-bold">
                      {product.brand}
                    </h4>
                    <h5 className="text-base font-bold mb-2 tracking-tight text-foreground">
                      {product.name}
                    </h5>
                    <p className="text-foreground font-medium">
                      ₦{lowestPrice.toLocaleString()}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {productsData && productsData.pages > 1 && (
          <div className="mt-20 flex justify-center gap-4">
            {[...Array(productsData.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() =>
                  handleFilterChange("pageNumber", (i + 1).toString())
                }
                className={`w-10 h-10 text-[10px] font-bold border transition-all ${
                  page === i + 1
                    ? "bg-premium-gold border-premium-gold text-premium-black"
                    : "border-premium-border/20 text-premium-muted hover:border-foreground hover:text-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CollectionsPage;
