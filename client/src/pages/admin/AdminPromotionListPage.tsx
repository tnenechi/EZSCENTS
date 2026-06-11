import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {  Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { getActivePromotions, deletePromotion } from '../../services/promotionService';
import AdminLayout from '../../components/layout/AdminLayout';
import type { Promotion } from '../../types';

const AdminPromotionListPage = () => {
  const queryClient = useQueryClient();
  const { data: promos, isLoading } = useQuery<Promotion[]>({
    queryKey: ['admin-promos'],
    queryFn: getActivePromotions,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-12 pb-6 border-b border-premium-border/30">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-premium-gold mb-2 font-bold">Marketing & Offers</h2>
          <h1 className="text-4xl font-bold tracking-tight uppercase">Promotions</h1>
        </div>
        <Link 
          to="/admin/promotions/create"
          className="bg-premium-black text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-premium-gold hover:text-premium-black transition-all"
        >
          <Plus size={16} /> New Banner
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-premium-gray rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promos?.map((promo) => (
            <div key={promo._id} className="group relative bg-premium-gray border border-premium-border/10 overflow-hidden rounded-sm flex flex-col hover:border-premium-border/30 transition-all">
              <div className="aspect-[16/9] overflow-hidden relative bg-premium-black">
                <img src={promo.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className={`p-2 rounded-full ${promo.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {promo.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight mb-2 text-foreground">{promo.title}</h3>
                  <p className="text-premium-muted text-xs line-clamp-2 mb-4 uppercase tracking-widest leading-relaxed font-bold">
                    {promo.description || 'No description provided.'}
                  </p>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-premium-border/10">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-premium-muted-light">
                    Display Only
                  </span>
                  <div className="flex gap-2">
                    <Link 
                      to={`/admin/promotions/${promo._id}/edit`}
                      className="p-2 text-premium-muted-light hover:text-premium-gold transition-colors"
                    >
                      <Edit size={16} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(promo._id)}
                      className="p-2 text-premium-muted-light hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {promos?.length === 0 && (
        <div className="py-20 text-center border border-dashed border-premium-border/30 mt-4 rounded-sm bg-premium-gray/5">
          <p className="text-premium-muted-light uppercase tracking-widest text-[10px] font-bold">No active promotions found.</p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPromotionListPage;
