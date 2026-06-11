interface TableSkeletonProps {
  rows?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5 }) => {
  return (
    <div className="space-y-4 w-full">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 w-full p-4 bg-premium-gray/10 border border-premium-border/10">
          <div className="skeleton h-12 w-12 shrink-0"></div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="skeleton h-3 w-1/4"></div>
            <div className="skeleton h-4 w-1/2"></div>
          </div>
          <div className="skeleton h-4 w-20 hidden md:block"></div>
          <div className="skeleton h-4 w-24 hidden lg:block"></div>
          <div className="skeleton h-8 w-20 ml-auto"></div>
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
