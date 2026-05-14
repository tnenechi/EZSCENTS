import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreditCard, Landmark, Truck, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { createOrder } from '../services/orderService';
import MainLayout from '../components/layout/MainLayout';

const shippingSchema = z.object({
  address: z.string().min(5, 'Address is too short'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  guestName: z.string().optional(),
  guestEmail: z.string().email('Invalid email').optional(),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

const CheckoutPage = () => {
  const [step, setStep] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [formData, setFormData] = useState<ShippingFormValues | null>(null);
  
  const { items, getTotal, clearCart } = useCartStore();
  const { userInfo } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      guestName: userInfo?.name || '',
      guestEmail: userInfo?.email || '',
    }
  });

  const onSubmitShipping = (data: ShippingFormValues) => {
    setFormData(data);
    setStep(2);
  };

  const onPlaceOrder = async (data: ShippingFormValues) => {
    setIsPlacingOrder(true);
    try {
      const orderData = {
        orderItems: items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          image: item.product.images[0],
          price: item.variant.price,
          product: item.product._id,
          variantId: item.variant._id,
          size: item.variant.size,
        })),
        shippingAddress: {
          address: data.address,
          city: data.city,
          state: data.state,
          phone: data.phone,
        },
        paymentMethod: 'Bank Transfer',
        totalPrice: getTotal(),
        guestInfo: !userInfo ? {
          name: data.guestName || '',
          email: data.guestEmail || '',
        } : undefined,
      };

      const createdOrder = await createOrder(orderData);
      
      clearCart();
      navigate(`/order/${createdOrder._id}`);
    } catch (error) {
      console.error('Order creation failed', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <MainLayout showSidebar={false}>
      <div className="max-w-4xl mx-auto py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-10" />
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`flex flex-col items-center gap-2 bg-premium-black px-4 transition-all duration-500 ${step >= s ? 'text-premium-gold' : 'text-gray-600'}`}
            >
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs ${step >= s ? 'border-premium-gold bg-premium-gold/5' : 'border-white/10'}`}>
                {step > s ? <CheckCircle2 size={20} /> : s}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold">
                {s === 1 ? 'Shipping' : s === 2 ? 'Payment' : 'Review'}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="space-y-8 animate-fade-in">
              {step === 1 && (
                <form onSubmit={handleSubmit(onSubmitShipping)} className="space-y-8">
                  <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                    <Truck size={24} className="text-premium-gold" />
                    Shipping Details
                  </h2>
                  
                  {!userInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Full Name</label>
                        <input {...register('guestName')} className="w-full bg-premium-gray border border-white/10 px-4 py-3 text-sm focus:border-premium-gold outline-none" placeholder="For guest delivery" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Email Address</label>
                        <input {...register('guestEmail')} className="w-full bg-premium-gray border border-white/10 px-4 py-3 text-sm focus:border-premium-gold outline-none" placeholder="Order updates" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Street Address</label>
                      <input {...register('address')} className="w-full bg-premium-gray border border-white/10 px-4 py-3 text-sm focus:border-premium-gold outline-none" placeholder="123 Luxury Ave" />
                      {errors.address && <p className="text-red-500 text-[10px] uppercase tracking-widest">{errors.address.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">City</label>
                        <input {...register('city')} className="w-full bg-premium-gray border border-white/10 px-4 py-3 text-sm focus:border-premium-gold outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">State</label>
                        <input {...register('state')} className="w-full bg-premium-gray border border-white/10 px-4 py-3 text-sm focus:border-premium-gold outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Phone</label>
                        <input {...register('phone')} className="w-full bg-premium-gray border border-white/10 px-4 py-3 text-sm focus:border-premium-gold outline-none" />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-white text-black py-4 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-premium-gold transition-all"
                  >
                    Continue to Payment <ChevronRight size={16} />
                  </button>
                </form>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                    <CreditCard size={24} className="text-premium-gold" />
                    Payment Method
                  </h2>

                  <div className="space-y-4">
                    <div 
                      className="w-full flex items-center justify-between p-6 border border-premium-gold bg-premium-gold/5 transition-all"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center border-premium-gold">
                          <div className="w-2 h-2 bg-premium-gold rounded-full" />
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase tracking-widest">Manual Bank Transfer</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Verified by Admin</p>
                        </div>
                      </div>
                      <Landmark size={24} className="text-gray-600" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 border border-white/10 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">Back</button>
                    <button 
                      type="button" 
                      onClick={() => setStep(3)}
                      className="flex-[2] bg-white text-black py-4 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-premium-gold transition-all"
                    >
                      Review Order <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-2xl font-bold uppercase tracking-tight">Review & Place Order</h2>
                  
                  <div className="bg-premium-gray/30 p-6 space-y-4 border border-white/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold">Shipping to</p>
                        <p className="text-sm font-medium">{formData?.address}, {formData?.city}</p>
                      </div>
                      <button type="button" onClick={() => setStep(1)} className="text-[10px] text-premium-gold uppercase font-bold tracking-widest">Edit</button>
                    </div>
                    <div className="flex justify-between items-start pt-4 border-t border-white/5">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold">Payment Method</p>
                        <p className="text-sm font-medium">Bank Transfer</p>
                      </div>
                      <button type="button" onClick={() => setStep(2)} className="text-[10px] text-premium-gold uppercase font-bold tracking-widest">Edit</button>
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmit(onPlaceOrder)}
                    disabled={isPlacingOrder}
                    className="w-full bg-premium-gold text-black py-5 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isPlacingOrder ? <Loader2 className="animate-spin" size={20} /> : 'Complete Purchase'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mini Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-premium-gray/20 p-6 border border-white/5 rounded-sm">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-6 border-b border-white/5 pb-4">Order Review</h3>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.product._id}-${item.variant._id}`} className="flex gap-4">
                    <div className="w-12 h-12 bg-premium-gray overflow-hidden">
                      <img src={item.product.images[0]} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase truncate">{item.product.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase">{item.quantity} x {item.variant.size}</p>
                    </div>
                    <p className="text-[10px] font-bold">₦{item.variant.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 pt-4 flex justify-between items-end">
                <p className="text-[10px] uppercase tracking-widest text-gray-500">Total Amount</p>
                <p className="text-xl font-bold text-premium-gold">₦{getTotal().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
