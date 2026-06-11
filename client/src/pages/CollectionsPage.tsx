import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getProducts, getFilters } from "../services/productService";
import MainLayout from "../components/layout/MainLayout";
import ProductCard from "../features/products/components/ProductCard";
import ProductCardSkeleton from "../features/products/components/ProductCardSkeleton";
import { Search, Filter, X } from "lucide-react";

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
    queryFn: () => getProducts(keyword, category, false, brand, sort, page, promotionId),
  });

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
    newParams.set("pageNumber", "1"); // Reset to page 1 on filter change
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
            <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2 text-foreground">Our Collection</h1>
            <p className="text-premium-muted text-xs uppercase tracking-widest font-bold">
              Explore our curated selection of fine fragrances
            </p>
          </div>
          
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-premium-muted" size={18} />
            <input 
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
              className="w-full bg-premium-gray/20 border border-premium-border/10 py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-premium-gold transition-colors text-foreground placeholder:text-premium-muted/50"
            />
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center gap-4 mb-12 pb-8 border-b border-premium-border/10">
          <div className="flex items-center gap-2 text-premium-gold mr-4">
            <Filter size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Filters</span>
          </div>

          <select 
            value={category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="bg-background border border-premium-border/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-premium-gold cursor-pointer text-foreground"
          >
            <option value="">All Categories</option>
            {filtersData?.categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select 
            value={brand}
            onChange={(e) => handleFilterChange("brand", e.target.value)}
            className="bg-background border border-premium-border/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-premium-gold cursor-pointer text-foreground"
          >
            <option value="">All Brands</option>
            {filtersData?.brands.map((b) => (
              <option key={b} value={b}>{b}</option>
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

        {/* Product Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : productsData?.products.length === 0 ? (
          <div className="text-center py-40 border border-dashed border-premium-border/20">
            <p className="text-premium-muted uppercase tracking-widest text-xs font-bold">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {productsData?.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {productsData && productsData.pages > 1 && (
          <div className="mt-20 flex justify-center gap-4">
            {[...Array(productsData.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handleFilterChange("pageNumber", (i + 1).toString())}
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
