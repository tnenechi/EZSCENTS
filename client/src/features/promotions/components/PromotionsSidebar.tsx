import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getActivePromotions } from "../../../services/promotionService";
import CloudinaryImage from "../../../components/common/CloudinaryImage";
import type { Promotion } from "../../../types";

const PromotionsSidebar = () => {
  const { data: promos, isLoading } = useQuery<Promotion[]>({
    queryKey: ["promotions"],
    queryFn: async () => {
      const res = await getActivePromotions();
      return res.promotions;
    },
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoRotation = () => {
    if (!promos || promos.length <= 1) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoRotation();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [promos]);

  if (isLoading) {
    return (
      <aside className="w-full lg:w-80 space-y-6">
        <div className="skeleton h-4 w-32 bg-premium-gray" />
        <div className="space-y-4">
          <div className="skeleton aspect-[4/5] w-full bg-premium-gray rounded-sm" />
        </div>
      </aside>
    );
  }

  if (!promos || promos.length === 0) return null;

  const nextPromo = () => {
    setCurrentIndex((prev) => (prev + 1) % promos.length);
    startAutoRotation();
  };

  const prevPromo = () => {
    setCurrentIndex((prev) => (prev - 1 + promos.length) % promos.length);
    startAutoRotation();
  };

  const currentPromo = promos ? promos[currentIndex] : undefined;

  if (!currentPromo) return null;

  return (
    <aside className="w-full lg:w-80 space-y-6">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-premium-gold border-l-2 border-premium-gold pl-4">
        Special Offers
      </h3>

      <div className="relative group overflow-hidden bg-premium-gray/50 aspect-[4/5] rounded-sm">
        {promos.length > 1 && (
          <>
            <button
              onClick={prevPromo}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-black/60 transition"
              aria-label="Previous promotion"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={nextPromo}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-black/60 transition"
              aria-label="Next promotion"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <AnimatePresence mode="wait">
          <Link
            key={currentPromo._id}
            to={`/shop?promotionId=${currentPromo._id}`}
            className="absolute inset-0 z-10"
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <CloudinaryImage
                image={currentPromo.image}
                alt={currentPromo.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                width={320}
                height={400}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end">
                <h4 className="text-xl font-bold text-white mb-2 tracking-tight">
                  {currentPromo.title}
                </h4>
                {currentPromo.description && (
                  <p className="text-gray-200 text-sm mb-4 line-clamp-2">
                    {currentPromo.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-premium-gold text-[10px] font-bold uppercase tracking-widest group/link">
                  Discover Now
                </div>
              </div>
            </motion.div>
          </Link>
        </AnimatePresence>

        {promos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {promos.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                  startAutoRotation();
                }}
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
