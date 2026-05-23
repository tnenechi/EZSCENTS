import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getActivePromotions } from "../../../services/promotionService";
import { optimizeImage } from "../../../utils/imageUtils";

const PromotionsSidebar = () => {
  const { data: promos, isLoading } = useQuery({
    queryKey: ["promotions"],
    queryFn: getActivePromotions,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!promos || promos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [promos]);

  if (isLoading) {
    return (
      <aside className="w-full lg:w-80 space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-premium-gray" />
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-premium-gray rounded-sm" />
        </div>
      </aside>
    );
  }

  // Fallback to empty or null if no promos
  if (!promos || promos.length === 0) return null;

  const currentPromo = promos[currentIndex];

  return (
    <aside className="w-full lg:w-80 space-y-6">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-premium-gold border-l-2 border-premium-gold pl-4">
        Special Offers
      </h3>
      <div className="relative group overflow-hidden bg-premium-gray aspect-[4/5] rounded-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPromo._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={optimizeImage(currentPromo.image)}
              alt={currentPromo.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end">
              <h4 className="text-xl font-bold text-white mb-2 tracking-tight">
                {currentPromo.title}
              </h4>
              {currentPromo.description && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {currentPromo.description}
                </p>
              )}
              <Link
                to={`/shop?promotionId=${currentPromo._id}`}
                className="flex items-center gap-2 text-premium-gold text-[10px] font-bold uppercase tracking-widest group/link"
              >
                Discover Now
                <ArrowRight
                  size={14}
                  className="group-hover/link:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        {promos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {promos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "bg-premium-gold w-4"
                    : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default PromotionsSidebar;
