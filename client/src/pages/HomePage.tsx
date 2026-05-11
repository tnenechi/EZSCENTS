import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../services/productService";
import MainLayout from "../components/layout/MainLayout";
import ProductCard from "../features/products/components/ProductCard";

const HomePage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  return (
    <MainLayout>
      <div className="space-y-16">
        <section className="relative h-[65vh] flex items-center justify-center overflow-hidden rounded-sm">
          <img
            src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80"
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="relative text-center z-10 px-4">
            <h2 className="text-sm uppercase tracking-[0.4em] text-premium-gold mb-4 animate-fade-in">
              Signature Scents
            </h2>
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 tracking-tighter uppercase">
              Define Your Presence
            </h1>
            <button className="bg-white text-black px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-premium-gold hover:text-black transition-all duration-500 transform hover:scale-105">
              Explore Collection
            </button>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-6">
            <div>
              <h2 className="text-xs uppercase tracking-[0.3em] text-premium-gold mb-2">
                Editor's Choice
              </h2>
              <h3 className="text-3xl font-bold tracking-tight">
                Our Collection
              </h3>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-premium-gold transition-colors pb-1">
              View All Products
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-premium-gray mb-4" />
                  <div className="h-2 w-20 bg-premium-gray mb-2" />
                  <div className="h-4 w-40 bg-premium-gray" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 border border-white/5 bg-premium-gray/30">
              <p className="text-gray-400 uppercase tracking-widest text-xs">
                Failed to load products. Please try again later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {data?.products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default HomePage;
