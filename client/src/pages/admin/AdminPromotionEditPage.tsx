import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ChevronLeft,
  Save,
  Loader2,
  Plus,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import {
  createPromotion,
  updatePromotion,
  getActivePromotions,
} from "../../services/promotionService";
import { getProducts } from "../../services/productService";
import { uploadImage } from "../../services/uploadService";
import AdminLayout from "../../components/layout/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import CloudinaryImage from "../../components/common/CloudinaryImage";
import type { Product, Promotion, ImageRef } from "../../types";

const promotionSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  image: z.union([
    z.string().min(1, "Image is required"),
    z.object({ url: z.string().url(), publicId: z.string().min(1) }),
  ]),
  products: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

type PromotionFormValues = z.input<typeof promotionSchema>;

const AdminPromotionEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isUploading, setIsUploading] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      isActive: true,
      products: [],
    },
  });

  const currentImage = watch("image") as ImageRef | string;
  const selectedProductIds = watch("products") || [];

  const { data: productsData } = useQuery<{
    products: Product[];
    page: number;
    pages: number;
  }>({
    queryKey: ["admin-products-all"],
    queryFn: () => getProducts("", "", false, "", "", 1),
  });

  const { data: searchResults } = useQuery<{
    products: Product[];
    page: number;
    pages: number;
  }>({
    queryKey: ["product-search-promo", productSearch],
    queryFn: () => getProducts(productSearch),
    enabled: productSearch.length > 0,
  });

  const displayProducts = productSearch
    ? searchResults?.products
    : productsData?.products;

  useEffect(() => {
    if (isEditMode) {
      const fetchPromo = async () => {
        try {
          const promosResponse = await getActivePromotions();
          const promo = promosResponse.promotions.find(
            (p: Promotion) => p._id === id,
          );
          if (promo) {
            reset({
              title: promo.title,
              description: promo.description,
              image: promo.image,
              products: promo.products || [],
              isActive: promo.isActive,
            });
          }
        } catch (error) {
          console.error("Failed to fetch promotion", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPromo();
    }
  }, [id, isEditMode, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      const uploadPromise = new Promise<ImageRef>((resolve, reject) => {
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          try {
            const base64data = reader.result as string;
            const uploadedImage = await uploadImage(base64data);
            resolve(uploadedImage);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
      });

      const uploadedImage = await uploadPromise;
      setValue("image", uploadedImage);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload banner image.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    const current = [...selectedProductIds];
    const index = current.indexOf(productId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(productId);
    }
    setValue("products", current);
  };

  const onSubmit = async (data: PromotionFormValues) => {
    setIsSaving(true);
    try {
      if (isEditMode) {
        await updatePromotion(id as string, data);
      } else {
        await createPromotion(data);
      }
      navigate("/admin/promotions");
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <AdminLayout>
        <div className="animate-pulse py-20 text-center text-premium-muted uppercase tracking-widest font-bold">
          Loading Promotion...
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-12">
        <button
          onClick={() => navigate("/admin/promotions")}
          className="flex items-center gap-2 text-premium-muted-light hover:text-foreground transition-colors uppercase text-[10px] font-bold tracking-widest"
        >
          <ChevronLeft size={16} /> Back to List
        </button>
        <h1 className="text-2xl font-bold tracking-tight uppercase">
          {isEditMode ? "Edit Banner" : "Create New Banner"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-12"
      >
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-premium-gray p-8 border border-premium-border/30 space-y-6">
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold border-l-2 border-premium-gold pl-4">
              Banner Content
            </h2>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-premium-muted font-bold">
                Campaign Title
              </label>
              <input
                {...register("title")}
                className="w-full bg-background border border-premium-border/40 px-4 py-4 text-sm focus:border-premium-gold outline-none transition-all text-foreground"
                placeholder="e.g. Summer Scent Sale"
              />
              {errors.title && (
                <p className="text-red-500 text-[9px] uppercase font-bold">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-premium-muted font-bold">
                Short Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full bg-background border border-premium-border/40 px-4 py-4 text-sm focus:border-premium-gold outline-none transition-all text-foreground"
                placeholder="Tell customers about the offer..."
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                {...register("isActive")}
                id="isActive"
                className="w-4 h-4 accent-premium-gold"
              />
              <label
                htmlFor="isActive"
                className="text-[10px] uppercase tracking-widest text-premium-muted font-bold"
              >
                Active & Visible
              </label>
            </div>
          </section>

          <section className="bg-premium-gray p-8 border border-premium-border/30 space-y-6">
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold border-l-2 border-premium-gold pl-4">
              Banner Image
            </h2>

            <div className="space-y-6">
              <div className="aspect-[21/9] bg-background border border-premium-border/20 relative overflow-hidden flex items-center justify-center group">
                {currentImage ? (
                  <>
                    <CloudinaryImage
                      image={currentImage}
                      alt={
                        currentImage && typeof currentImage !== "string"
                          ? currentImage.publicId
                          : "Promotion banner"
                      }
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <ImageIcon size={32} className="text-premium-gold mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                        Change Banner
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                    </label>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-4 cursor-pointer hover:text-premium-gold transition-colors">
                    {isUploading ? (
                      <Loader2
                        className="animate-spin text-premium-gold"
                        size={32}
                      />
                    ) : (
                      <Plus size={32} className="text-premium-muted-light" />
                    )}
                    <span className="text-[10px] uppercase tracking-widest font-bold text-premium-muted-light">
                      Upload Banner (21:9 recommended)
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
              {errors.image && (
                <p className="text-red-500 text-[9px] uppercase font-bold text-center">
                  {errors.image.message}
                </p>
              )}
            </div>
          </section>

          <section className="bg-premium-gray p-8 border border-premium-border/30 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold border-l-2 border-premium-gold pl-4">
                Include Products
              </h2>
              <span className="text-[10px] text-premium-muted font-bold uppercase tracking-widest">
                {selectedProductIds.length} Products Selected
              </span>
            </div>

            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-premium-muted-light"
                size={16}
              />
              <input
                type="text"
                placeholder="SEARCH TO ADD PRODUCTS..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-background border border-premium-border/40 pl-12 pr-4 py-3 text-xs focus:border-premium-gold outline-none text-foreground font-bold"
              />
            </div>

            <div className="max-h-96 overflow-y-auto border border-premium-border/20 bg-background divide-y divide-premium-border/10">
              {displayProducts?.map((product: Product) => (
                <div
                  key={product._id}
                  onClick={() => toggleProduct(product._id)}
                  className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-premium-gray transition-colors ${
                    selectedProductIds.includes(product._id)
                      ? "bg-premium-gray/50"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(product._id)}
                    onChange={() => {}}
                    className="w-4 h-4 accent-premium-gold"
                  />
                  <CloudinaryImage
                    image={product.images[0]}
                    alt={product.name}
                    className="w-10 h-14 object-cover rounded-sm"
                  />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-premium-gold font-bold">
                      {product.brand}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-tight text-foreground">
                      {product.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-premium-muted-light uppercase font-bold">
                      {product.category}
                    </p>
                    <p className="text-xs font-bold text-foreground">
                      ₦
                      {Math.min(
                        ...product.variants.map((v) => v.price),
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!displayProducts || displayProducts.length === 0) && (
                <div className="p-8 text-center text-premium-muted-light text-[10px] font-bold uppercase tracking-widest">
                  No products found
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="sticky top-8 bg-premium-gray p-8 border border-premium-border/30 rounded-sm space-y-6">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-premium-muted pb-4 border-b border-premium-border/10">
              Actions
            </h3>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="w-full bg-premium-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-premium-gold hover:text-premium-black transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {isEditMode ? "Save Changes" : "Publish Banner"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/promotions")}
              className="w-full bg-transparent border border-premium-border/30 text-premium-muted py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-background transition-all font-bold"
            >
              Discard Changes
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminPromotionEditPage;
