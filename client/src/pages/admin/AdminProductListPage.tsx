import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Search, ExternalLink } from "lucide-react";
import { getProducts, deleteProduct } from "../../services/productService";
import AdminLayout from "../../components/layout/AdminLayout";
import TableSkeleton from "../../components/common/TableSkeleton";
import CloudinaryImage from "../../components/common/CloudinaryImage";
import type { Product } from "../../types";

const AdminProductListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{
    products: Product[];
    page: number;
    pages: number;
  }>({
    queryKey: ["admin-products", searchTerm],
    queryFn: () => getProducts(searchTerm),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-12 pb-6 border-b border-premium-border/30">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-premium-gold mb-2 font-bold">
            Inventory Control
          </h2>
          <h1 className="text-4xl font-bold tracking-tight uppercase">
            Products
          </h1>
        </div>
        <Link
          to="/admin/products/create"
          className="bg-premium-black text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-premium-gold hover:text-premium-black transition-all"
        >
          <Plus size={16} /> New Product
        </Link>
      </div>

      <div className="relative mb-8">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-premium-muted-light"
          size={18}
        />
        <input
          type="text"
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-premium-gray border border-premium-border/30 pl-12 pr-4 py-4 text-sm focus:border-premium-gold outline-none transition-colors text-foreground"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-premium-border/30 text-[10px] uppercase tracking-widest text-premium-muted-light font-bold">
                <th className="py-4 pr-4">Image</th>
                <th className="py-4 px-4">Brand & Name</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Variants</th>
                <th className="py-4 px-4">Price Range</th>
                <th className="py-4 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-premium-border/10">
              {data?.products.map((product) => {
                const prices = product.variants.map((v) => v.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);

                return (
                  <tr
                    key={product._id}
                    className="group hover:bg-premium-gray transition-colors"
                  >
                    <td className="py-5 pr-4">
                      <div className="w-12 h-16 bg-premium-gray overflow-hidden rounded-sm border border-premium-border/20">
                        <CloudinaryImage
                          image={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-[10px] uppercase tracking-widest text-premium-gold font-bold mb-1">
                        {product.brand}
                      </p>
                      <p className="text-xs font-bold uppercase tracking-tight text-foreground">
                        {product.name}
                      </p>
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-[10px] uppercase text-premium-muted bg-premium-gray px-2 py-1 font-bold tracking-widest">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-[10px] text-premium-muted-light uppercase tracking-widest font-bold">
                        {product.variants.length} Sizes
                      </p>
                    </td>
                    <td className="py-5 px-4 font-bold text-xs text-foreground">
                      ₦{minPrice.toLocaleString()}{" "}
                      {maxPrice > minPrice && `- ₦${maxPrice.toLocaleString()}`}
                    </td>
                    <td className="py-5 pl-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/product/${product._id}`}
                          target="_blank"
                          className="p-2 text-premium-muted-light hover:text-foreground transition-colors"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="p-2 text-premium-muted-light hover:text-premium-gold transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-premium-muted-light hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {data?.products.length === 0 && (
            <div className="py-20 text-center border border-dashed border-premium-border/30 mt-4">
              <p className="text-premium-muted-light uppercase tracking-widest text-[10px] font-bold">
                No products found in inventory.
              </p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProductListPage;
