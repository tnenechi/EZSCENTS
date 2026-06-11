import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Trash2,
  Loader2,
  ChevronLeft,
  Save,
} from "lucide-react";
import {
  getProductById,
  createProduct,
  updateProduct,
} from "../../services/productService";
import { uploadImage } from "../../services/uploadService";
import AdminLayout from "../../components/layout/AdminLayout";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  brand: z.string().min(2, "Brand is required"),
  description: z.string().min(10, "Description is too short"),
  category: z.string().min(2, "Category is required"),
  isFeatured: z.boolean(),
  variants: z
    .array(
      z.object({
        size: z.string().min(1, "Size is required"),
        price: z.number().min(0, "Price must be positive"),
        stock: z.number().min(0, "Stock must be positive"),
      }),
    )
    .min(1, "At least one variant is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

const AdminProductEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      variants: [{ size: "", price: 0, stock: 0 }],
      isFeatured: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const product = await getProductById(id as string);
          reset({
            name: product.name,
            brand: product.brand,
            description: product.description,
            category: product.category,
            isFeatured: product.isFeatured,
            variants: product.variants.map((v) => ({
              size: v.size,
              price: v.price,
              stock: v.stock,
            })),
          });
          setImages(product.images);
        } catch (error) {
          console.error("Failed to fetch product", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        const uploadPromise = new Promise<string>((resolve, reject) => {
          reader.readAsDataURL(file);
          reader.onloadend = async () => {
            try {
              const base64data = reader.result as string;
              const imageUrl = await uploadImage(base64data);
              resolve(imageUrl);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = reject;
        });

        const url = await uploadPromise;
        setImages((prev) => [...prev, url]);
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert(
        "Failed to upload image. Please check your connection and Cloudinary settings.",
      );
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSaving(true);
    try {
      const productData = { ...data, images } as any;
      if (isEditMode) {
        await updateProduct(id as string, productData);
      } else {
        await createProduct(productData);
      }
      navigate("/admin/products");
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save product. Please check all fields.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <AdminLayout>
        <div className="animate-pulse py-20 text-center text-premium-muted uppercase tracking-widest font-bold">
          Loading Product...
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-12">
        <button
          onClick={() => navigate("/admin/products")}
          className="flex items-center gap-2 text-premium-muted-light hover:text-foreground transition-colors uppercase text-[10px] font-bold tracking-widest"
        >
          <ChevronLeft size={16} /> Back to Inventory
        </button>
        <h1 className="text-2xl font-bold tracking-tight uppercase">
          {isEditMode ? "Edit Product" : "Create New Product"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-12"
      >
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <section className="bg-premium-gray p-8 border border-premium-border/30 space-y-6">
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold border-l-2 border-premium-gold pl-4">
              General Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-premium-muted font-bold">
                  Product Name
                </label>
                <input
                  {...register("name")}
                  className="w-full bg-background border border-premium-border/40 px-4 py-3 text-sm focus:border-premium-gold outline-none transition-all text-foreground"
                  placeholder="e.g. Royal Oud"
                />
                {errors.name && (
                  <p className="text-red-500 text-[9px] uppercase font-bold">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-premium-muted font-bold">
                  Brand
                </label>
                <input
                  {...register("brand")}
                  className="w-full bg-background border border-premium-border/40 px-4 py-3 text-sm focus:border-premium-gold outline-none transition-all text-foreground"
                  placeholder="e.g. Creed"
                />
                {errors.brand && (
                  <p className="text-red-500 text-[9px] uppercase font-bold">
                    {errors.brand.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-premium-muted font-bold">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={5}
                className="w-full bg-background border border-premium-border/40 px-4 py-3 text-sm focus:border-premium-gold outline-none transition-all text-foreground"
                placeholder="Tell the story of this scent..."
              />
              {errors.description && (
                <p className="text-red-500 text-[9px] uppercase font-bold">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-premium-muted font-bold">
                  Category
                </label>
                <select
                  {...register("category")}
                  className="w-full bg-background border border-premium-border/40 px-4 py-3 text-sm focus:border-premium-gold outline-none transition-all appearance-none text-foreground"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Niche">Niche</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  {...register("isFeatured")}
                  id="isFeatured"
                  className="w-4 h-4 accent-premium-gold"
                />
                <label
                  htmlFor="isFeatured"
                  className="text-[10px] uppercase tracking-widest text-premium-muted font-bold"
                >
                  Featured in Home Page
                </label>
              </div>
            </div>
          </section>

          {/* Variants */}
          <section className="bg-premium-gray p-8 border border-premium-border/30 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold border-l-2 border-premium-gold pl-4">
                Sizes & Pricing
              </h2>
              <button
                type="button"
                onClick={() => append({ size: "", price: 0, stock: 0 })}
                className="text-[9px] uppercase font-bold tracking-widest flex items-center gap-1 hover:text-foreground transition-colors text-premium-gold"
              >
                <Plus size={14} /> Add Size
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-background p-4 rounded-sm border border-premium-border/20"
                >
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-premium-muted font-bold">
                      Size (e.g. 100ml)
                    </label>
                    <input
                      {...register(`variants.${index}.size`)}
                      className="w-full bg-background border border-premium-border/40 px-3 py-2 text-xs focus:border-premium-gold outline-none text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-premium-muted font-bold">
                      Price (₦)
                    </label>
                    <input
                      type="number"
                      {...register(`variants.${index}.price`, {
                        valueAsNumber: true,
                      })}
                      className="w-full bg-background border border-premium-border/40 px-3 py-2 text-xs focus:border-premium-gold outline-none text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-premium-muted font-bold">
                      Stock
                    </label>
                    <input
                      type="number"
                      {...register(`variants.${index}.stock`, {
                        valueAsNumber: true,
                      })}
                      className="w-full bg-background border border-premium-border/40 px-3 py-2 text-xs focus:border-premium-gold outline-none text-foreground"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="p-2.5 text-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {errors.variants && (
                <p className="text-red-500 text-[9px] uppercase font-bold">
                  {errors.variants.message}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar: Images & Save */}
        <div className="space-y-8">
          <section className="bg-premium-gray p-8 border border-premium-border/30 space-y-6">
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold border-l-2 border-premium-gold pl-4">
              Media
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square bg-background border border-premium-border/20 overflow-hidden group"
                >
                  <img src={img} className="w-full h-full object-cover" />
                  <button
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== idx))
                    }
                    className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={20} className="text-white" />
                  </button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-premium-border/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-premium-gold hover:bg-background transition-all">
                {isUploading ? (
                  <Loader2
                    className="animate-spin text-premium-gold"
                    size={20}
                  />
                ) : (
                  <Plus size={24} className="text-premium-muted-light" />
                )}
                <span className="text-[9px] uppercase font-bold tracking-widest text-premium-muted-light">
                  Add Image
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </label>
            </div>
            {images.length === 0 && (
              <p className="text-[9px] uppercase text-premium-muted-light font-bold text-center">
                No images uploaded yet
              </p>
            )}
          </section>

          <div className="sticky top-8 space-y-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-premium-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-premium-gold hover:text-premium-black transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {isEditMode ? "Update Product" : "Publish Product"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="w-full bg-transparent border border-premium-border/30 text-premium-muted py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-background transition-all font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminProductEditPage;
