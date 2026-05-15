import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Save, Loader2, Plus, Trash2, Image as ImageIcon, Search } from 'lucide-react';
import { createPromotion, updatePromotion, getActivePromotions } from '../../services/promotionService';
import { getProducts } from '../../services/productService';
import { uploadImage } from '../../services/uploadService';
import AdminLayout from '../../components/layout/AdminLayout';
import { useQuery } from '@tanstack/react-query';

const promotionSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  image: z.string().min(1, 'Image is required'),
  products: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

type PromotionFormValues = z.infer<typeof promotionSchema>;

const AdminPromotionEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isUploading, setIsUploading] = useState(false);
  const [productSearch, setProductSearch] = useState('');

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
    }
  });

  const currentImage = watch('image');
  const selectedProductIds = watch('products') || [];

  const { data: productsData } = useQuery({
    queryKey: ['admin-products-all'],
    queryFn: () => getProducts('', '', false, '', '', 1), // Get first page to start, or adjust if needed
  });

  // For promotion product selection, we might want all products or a searchable list
  // Given the current getProducts signature, we'll use a simple search if needed
  const { data: searchResults } = useQuery({
    queryKey: ['product-search-promo', productSearch],
    queryFn: () => getProducts(productSearch),
    enabled: productSearch.length > 0
  });

  const displayProducts = productSearch ? searchResults?.products : productsData?.products;

  useEffect(() => {
    if (isEditMode) {
      const fetchPromo = async () => {
        try {
          const promos = await getActivePromotions();
          const promo = promos.find((p: any) => p._id === id);
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
          console.error('Failed to fetch promotion', error);
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
      setValue('image', url);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload banner image.');
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
    setValue('products', current);
  };

  const onSubmit = async (data: PromotionFormValues) => {
    setIsSaving(true);
    try {
      if (isEditMode) {
        await updatePromotion(id as string, data);
      } else {
        await createPromotion(data);
      }
      navigate('/admin/promotions');
    } catch (error) {
      console.error('Save failed', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <AdminLayout><div className="animate-pulse py-20 text-center text-gray-400 uppercase tracking-widest font-bold">Loading Promotion...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-12">
        <button 
          onClick={() => navigate('/admin/promotions')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase text-[10px] font-bold tracking-widest"
        >
          <ChevronLeft size={16} /> Back to List
        </button>
        <h1 className="text-2xl font-bold tracking-tight uppercase">
          {isEditMode ? 'Edit Banner' : 'Create New Banner'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-premium-gray/10 p-8 border border-white/5 space-y-6">
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold border-l-2 border-premium-gold pl-4">Banner Content</h2>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Campaign Title</label>
              <input {...register('title')} className="w-full bg-premium-black border border-white/10 px-4 py-4 text-sm focus:border-premium-gold outline-none transition-all text-white" placeholder="e.g. Summer Scent Sale" />
              {errors.title && <p className="text-red-500 text-[9px] uppercase font-bold">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Short Description</label>
              <textarea {...register('description')} rows={3} className="w-full bg-premium-black border border-white/10 px-4 py-4 text-sm focus:border-premium-gold outline-none transition-all text-white" placeholder="Tell customers about the offer..." />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input type="checkbox" {...register('isActive')} id="isActive" className="w-4 h-4 accent-premium-gold" />
              <label htmlFor="isActive" className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">Active & Visible</label>
            </div>
          </section>

          <section className="bg-premium-gray/10 p-8 border border-white/5 space-y-6">
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold border-l-2 border-premium-gold pl-4">Banner Image</h2>
            
            <div className="space-y-6">
              <div className="aspect-[21/9] bg-premium-black border border-white/5 relative overflow-hidden flex items-center justify-center group">
                {currentImage ? (
                  <>
                    <img src={currentImage} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <ImageIcon size={32} className="text-premium-gold mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Change Banner</span>
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-4 cursor-pointer hover:text-premium-gold transition-colors">
                    {isUploading ? <Loader2 className="animate-spin text-premium-gold" size={32} /> : <Plus size={32} className="text-gray-400" />}
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Upload Banner (21:9 recommended)</span>
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                )}
              </div>
              <input type="hidden" {...register('image')} />
              {errors.image && <p className="text-red-500 text-[9px] uppercase font-bold text-center">{errors.image.message}</p>}
            </div>
          </section>

          <section className="bg-premium-gray/10 p-8 border border-white/5 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold border-l-2 border-premium-gold pl-4">Include Products</h2>
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                {selectedProductIds.length} Products Selected
              </span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="SEARCH TO ADD PRODUCTS..." 
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-premium-black border border-white/10 pl-12 pr-4 py-3 text-xs focus:border-premium-gold outline-none text-white font-bold"
              />
            </div>

            <div className="max-h-96 overflow-y-auto border border-white/5 bg-premium-black/40 divide-y divide-white/5">
              {displayProducts?.map((product: any) => (
                <div 
                  key={product._id} 
                  onClick={() => toggleProduct(product._id)}
                  className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors ${
                    selectedProductIds.includes(product._id) ? 'bg-white/[0.05]' : ''
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedProductIds.includes(product._id)}
                    onChange={() => {}} // Handled by div click
                    className="w-4 h-4 accent-premium-gold"
                  />
                  <img src={product.images[0]} className="w-10 h-14 object-cover rounded-sm" />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-premium-gold font-bold">{product.brand}</p>
                    <p className="text-xs font-bold uppercase tracking-tight text-white">{product.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{product.category}</p>
                    <p className="text-xs font-bold text-white">₦{Math.min(...product.variants.map((v: any) => v.price)).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {(!displayProducts || displayProducts.length === 0) && (
                <div className="p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  No products found
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="sticky top-8 bg-premium-gray/20 p-8 border border-white/5 rounded-sm space-y-6">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-300 pb-4 border-b border-white/5">Actions</h3>
            <button 
              type="submit"
              disabled={isSaving || isUploading}
              className="w-full bg-white text-black py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-premium-gold hover:text-black transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isEditMode ? 'Update Banner' : 'Publish Banner'}
            </button>
            <button 
              type="button"
              onClick={() => navigate('/admin/promotions')}
              className="w-full bg-transparent border border-white/10 text-gray-400 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all font-bold"
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
