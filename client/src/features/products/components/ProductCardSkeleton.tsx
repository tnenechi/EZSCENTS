const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="skeleton aspect-[4/5] w-full"></div>
      <div className="skeleton h-2 w-20"></div>
      <div className="skeleton h-4 w-full"></div>
      <div className="skeleton h-4 w-28"></div>
    </div>
  );
};

export default ProductCardSkeleton;
