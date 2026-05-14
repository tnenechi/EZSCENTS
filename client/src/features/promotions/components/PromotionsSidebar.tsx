import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getActivePromotions } from "../../../services/promotionService";

const PromotionsSidebar = () => {
  const { data: promos, isLoading } = useQuery({
    queryKey: ["promotions"],
    queryFn: getActivePromotions,
  });

  if (isLoading) {
    return (
      <aside className="w-full lg:w-80 space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-premium-gray" />
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-premium-gray rounded-sm" />
          <div className="aspect-[4/5] bg-premium-gray rounded-sm" />
        </div>
      </aside>
    );
  }

  // Fallback to empty or null if no promos
  if (!promos || promos.length === 0) return null;

  return (
    <aside className="w-full lg:w-80 space-y-6">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-premium-gold border-l-2 border-premium-gold pl-4">
        Special Offers
      </h3>
      <div className="space-y-4">
        {promos.map((promo) => (
          <div
            key={promo._id}
            className="group relative overflow-hidden bg-premium-gray aspect-[4/5] rounded-sm"
          >
            <img
              src={promo.image}
              alt={promo.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end">
              <h4 className="text-xl font-bold text-white mb-2 tracking-tight">
                {promo.title}
              </h4>
              {promo.description && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {promo.description}
                </p>
              )}
              <Link
                to={`/shop?promotionId=${promo._id}`}
                className="flex items-center gap-2 text-premium-gold text-[10px] font-bold uppercase tracking-widest group/link"
              >
                Discover Now
                <ArrowRight
                  size={14}
                  className="group-hover/link:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default PromotionsSidebar;
