import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { createPromotion, updatePromotion, getActivePromotions } from '../../services/promotionService';
import AdminLayout from '../../components/layout/AdminLayout';

const promotionSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  image: z.string().min(1, 'Image is required'),
  link: z.string().optional(),
  isActive: z.boolean().default(true),
});

type PromotionFormValues = z.infer<typeof promotionSchema>;

const AdminPromotionEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

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
    }
  });

  const currentImage = watch('image');

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
              link: promo.link,
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

  if (isLoading) return <AdminLayout><div className="animate-pulse py-20 text-center">Loading Promotion...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-12">
        <button 
          onClick={() => navigate('/admin/promotions')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors uppercase text-[10px] font-bold tracking-widest"
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
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Campaign Title</label>
              <input {...register('title')} className="w-full bg-premium-black border border-white/10 px-4 py-4 text-sm focus:border-premium-gold outline-none transition-all" placeholder="e.g. Summer Scent Sale" />
              {errors.title && <p className="text-red-500 text-[9px] uppercase font-bold">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Short Description</label>
              <textarea {...register('description')} rows={3} className="w-full bg-premium-black border border-white/10 px-4 py-4 text-sm focus:border-premium-gold outline-none transition-all" placeholder="Tell customers about the offer..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Redirect Link (URL Path)</label>
                <input {...register('link')} className="w-full bg-premium-black border border-white/10 px-4 py-4 text-sm focus:border-premium-gold outline-none transition-all" placeholder="e.g. /shop?category=niche" />
              </div>
              <div className="flex items-center gap-3 pt-8">
                <input type="checkbox" {...register('isActive')} id="isActive" className="w-4 h-4 accent-premium-gold" />
                <label htmlFor="isActive" className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Active & Visible</label>
              </div>
            </div>
          </section>

          <section className="bg-premium-gray/10 p-8 border border-white/5 space-y-6">
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold border-l-2 border-premium-gold pl-4">Banner Image</h2>
            
            <div className="space-y-4">
              <div className="aspect-[21/9] bg-premium-black border border-white/5 relative overflow-hidden flex items-center justify-center">
                {currentImage ? (
                  <img src={currentImage} className="w-full h-full object-cover" />
                ) : (
                  <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">No Image Selected</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Image URL (from Cloudinary)</label>
                <input 
                  {...register('image')} 
                  className="w-full bg-premium-black border border-white/10 px-4 py-4 text-sm focus:border-premium-gold outline-none transition-all" 
                  placeholder="Paste Cloudinary URL here"
                />
                {errors.image && <p className="text-red-500 text-[9px] uppercase font-bold">{errors.image.message}</p>}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="sticky top-8 bg-premium-gray/20 p-8 border border-white/5 rounded-sm space-y-6">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-500 pb-4 border-b border-white/5">Actions</h3>
            <button 
              type="submit"
              disabled={isSaving}
              className="w-full bg-white text-black py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-premium-gold hover:text-black transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isEditMode ? 'Update Banner' : 'Publish Banner'}
            </button>
            <button 
              type="button"
              onClick={() => navigate('/admin/promotions')}
              className="w-full bg-transparent border border-white/10 text-gray-500 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
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
