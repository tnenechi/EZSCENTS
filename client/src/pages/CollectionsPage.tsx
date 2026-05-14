import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getProducts, getFilters } from "../services/productService";
import MainLayout from "../components/layout/MainLayout";
import ProductCard from "../features/products/components/ProductCard";
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
            <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">Our Collection</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-medium">
              Explore our curated selection of fine fragrances
            </p>
          </div>
          
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
              className="w-full bg-premium-gray/30 border border-white/5 py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-premium-gold transition-colors"
            />
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center gap-4 mb-12 pb-8 border-b border-white/5">
          <div className="flex items-center gap-2 text-premium-gold mr-4">
            <Filter size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Filters</span>
          </div>

          <select 
            value={category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="bg-premium-black border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-premium-gold cursor-pointer"
          >
            <option value="">All Categories</option>
            {filtersData?.categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select 
            value={brand}
            onChange={(e) => handleFilterChange("brand", e.target.value)}
            className="bg-premium-black border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-premium-gold cursor-pointer"
          >
            <option value="">All Brands</option>
            {filtersData?.brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select 
            value={sort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
            className="bg-premium-black border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-premium-gold cursor-pointer ml-auto"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          {(keyword || category || brand) && (
            <button 
              onClick={clearFilters}
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
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
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-premium-gray mb-4" />
                <div className="h-2 w-20 bg-premium-gray mb-2" />
                <div className="h-4 w-40 bg-premium-gray" />
              </div>
            ))}
          </div>
        ) : productsData?.products.length === 0 ? (
          <div className="text-center py-40 border border-dashed border-white/10">
            <p className="text-gray-500 uppercase tracking-widest text-xs">No products found matching your criteria.</p>
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
                    ? "bg-premium-gold border-premium-gold text-black" 
                    : "border-white/10 text-gray-400 hover:border-white hover:text-white"
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
