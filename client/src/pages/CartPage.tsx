import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ChevronLeft } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import MainLayout from '../components/layout/MainLayout';

const CartPage = () => {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <MainLayout showSidebar={false}>
        <div className="max-w-4xl mx-auto py-20 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-premium-gray rounded-full flex items-center justify-center text-gray-500">
              <ShoppingBag size={40} />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4 uppercase tracking-tight">Your Shopping Bag is Empty</h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Discover our collection of premium fragrances and find the scent that defines you.
          </p>
          <Link 
            to="/shop" 
            className="inline-block bg-white text-black px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-premium-gold hover:text-black transition-all"
          >
            Start Shopping
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showSidebar={false}>
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12 uppercase text-[10px] font-bold tracking-widest"
        >
          <ChevronLeft size={16} /> Continue Shopping
        </button>

        <h1 className="text-4xl font-bold mb-12 uppercase tracking-tight">Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-8">
            {items.map((item) => (
              <div 
                key={`${item.product._id}-${item.variant._id}`}
                className="flex flex-col sm:flex-row gap-6 pb-8 border-b border-white/5"
              >
                <div className="w-full sm:w-32 aspect-[4/5] bg-premium-gray overflow-hidden rounded-sm">
                  <img 
                    src={item.product.images[0]} 
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-premium-gold text-[10px] uppercase tracking-widest mb-1 font-bold">{item.product.brand}</p>
                      <h3 className="text-lg font-bold uppercase tracking-tight mb-1">{item.product.name}</h3>
                      <p className="text-gray-500 text-xs uppercase tracking-widest">{item.variant.size}</p>
                    </div>
                    <p className="text-lg font-bold">₦{(item.variant.price * item.quantity).toLocaleString()}</p>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center border border-white/10 px-3 py-1">
                      <button 
                        onClick={() => updateQuantity(item.product._id, item.variant._id, Math.max(1, item.quantity - 1))}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-xs font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product._id, item.variant._id, item.quantity + 1)}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.product._id, item.variant._id)}
                      className="text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-premium-gray/30 p-8 border border-white/5">
              <h2 className="text-xl font-bold mb-6 uppercase tracking-tight">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm text-gray-400">
                  <span className="uppercase tracking-widest">Subtotal</span>
                  <span className="text-white font-bold">₦{getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span className="uppercase tracking-widest">Delivery</span>
                  <span className="text-white font-bold">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 mb-8">
                <div className="flex justify-between">
                  <span className="text-lg font-bold uppercase tracking-tight">Total</span>
                  <span className="text-2xl font-bold text-premium-gold">₦{getTotal().toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-white text-black py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-premium-gold hover:text-black transition-all"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-[10px] text-gray-500 uppercase tracking-widest">
                  <div className="w-1 h-1 bg-premium-gold rounded-full" />
                  Free Delivery on orders over ₦50,000
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 uppercase tracking-widest">
                  <div className="w-1 h-1 bg-premium-gold rounded-full" />
                  Secure payment via Paystack
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
