import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreditCard,
  Landmark,
  Truck,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { createOrder } from "../services/orderService";
import MainLayout from "../components/layout/MainLayout";

const shippingSchema = z.object({
  address: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  guestName: z.string().optional(),
  guestEmail: z.string().email("Invalid email").optional().or(z.literal("")),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

interface BankTransferInstructionsProps {
  handleCopy: (text: string) => void;
  copied: boolean;
}

const BankTransferInstructions = ({ handleCopy, copied }: BankTransferInstructionsProps) => (
  <div className="bg-premium-gold/5 border border-premium-gold/20 p-6 space-y-4 animate-fade-in">
    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-premium-gold">
      Payment Instructions
    </h3>
    <div className="space-y-4 text-xs">
      <div className="space-y-1">
        <p className="text-premium-muted-light uppercase text-[9px] font-bold tracking-widest">
          Bank Details
        </p>
        <p className="font-bold text-foreground">{import.meta.env.VITE_BANK_NAME}</p>
        <div className="flex items-center gap-2">
          <p className="font-bold text-foreground">{import.meta.env.VITE_BANK_ACCOUNT}</p>
          <button
            onClick={() => handleCopy(import.meta.env.VITE_BANK_ACCOUNT)}
            className="text-premium-gold hover:text-foreground transition-colors p-1"
            title="Copy account number"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          {copied && (
            <span className="text-[8px] uppercase tracking-widest text-premium-gold animate-pulse">
              Copied!
            </span>
          )}
        </div>
        <p className="font-bold text-premium-gold">
          {import.meta.env.VITE_BRAND_NAME.toUpperCase()} INTERNATIONAL
          LIMITED
        </p>
      </div>

      <div className="space-y-2 text-premium-muted leading-relaxed">
        <p>
          Your order will only be processed when payment has been received.
        </p>
        <p className="text-red-500/80 italic">
          Please note: Orders not paid for within 24 hours of purchase will be
          canceled and invalid.
        </p>
      </div>

      <div className="pt-4 border-t border-premium-border/50 space-y-2">
        <p className="text-premium-muted-light uppercase text-[9px] font-bold tracking-widest">
          After Payment
        </p>
        <p className="text-premium-muted">Send proof of payment (screenshot) to customer care via:</p>
        <p className="font-bold text-premium-gold">
          {import.meta.env.VITE_WHATSAPP_NUMBER} (WhatsApp)
        </p>
        <p className="text-[9px] uppercase tracking-widest text-premium-muted-light mt-2">
          Include your full name and order ID
        </p>
      </div>
    </div>
  </div>
);

const CheckoutPage = () => {
  const [step, setStep] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [formData, setFormData] = useState<ShippingFormValues | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      guestName: userInfo?.name || "",
      guestEmail: userInfo?.email || "",
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmitShipping = (data: ShippingFormValues) => {
    setFormData(data);
    setStep(2);
  };

  const onPlaceOrder = async (data: ShippingFormValues) => {
    setIsPlacingOrder(true);
    try {
      const orderData = {
        orderItems: items.map((item) => ({
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
        paymentMethod: "Bank Transfer",
        totalPrice: getTotal(),
        guestInfo: !userInfo
          ? {
              name: data.guestName || "",
              email: data.guestEmail || "",
            }
          : undefined,
      };

      const createdOrder = await createOrder(orderData);

      clearCart();
      setCreatedOrderId(createdOrder._id);
      setStep(4);
    } catch (error) {
      console.error("Order creation failed", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0 && step < 4) {
    navigate("/cart");
    return null;
  }

  return (
    <MainLayout showSidebar={false}>
      <div className="max-w-4xl mx-auto py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-premium-border/30 -z-10" />
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex flex-col items-center gap-2 bg-background px-4 transition-all duration-500 ${step >= s ? "text-premium-gold" : "text-premium-muted-light"}`}
            >
              <div
                className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs ${step >= s ? "border-premium-gold bg-premium-gold/5" : "border-premium-border bg-background"}`}
              >
                {step > s ? <CheckCircle2 size={20} /> : s}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold">
                {s === 1
                  ? "Shipping"
                  : s === 2
                    ? "Payment"
                    : s === 3
                      ? "Review"
                      : "Success"}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className={step === 4 ? "lg:col-span-3" : "lg:col-span-2"}>
            <div className="space-y-8 animate-fade-in">
              {step === 1 && (
                <form
                  onSubmit={handleSubmit(onSubmitShipping)}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                    <Truck size={24} className="text-premium-gold" />
                    Shipping Details
                  </h2>

                  {!userInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-premium-muted font-bold">
                          Full Name
                        </label>
                        <input
                          {...register("guestName")}
                          className="w-full bg-premium-gray border border-premium-border/50 px-4 py-3 text-sm text-foreground focus:border-premium-gold outline-none"
                          placeholder="For guest delivery"
                        />
                        {errors.guestName && (
                          <p className="text-red-500 text-[10px] uppercase tracking-widest">
                            {errors.guestName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-premium-muted font-bold">
                          Email Address
                        </label>
                        <input
                          {...register("guestEmail")}
                          className="w-full bg-premium-gray border border-premium-border/50 px-4 py-3 text-sm text-foreground focus:border-premium-gold outline-none"
                          placeholder="Order updates"
                        />
                        {errors.guestEmail && (
                          <p className="text-red-500 text-[10px] uppercase tracking-widest">
                            {errors.guestEmail.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-premium-muted font-bold">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("address")}
                        className="w-full bg-premium-gray border border-premium-border/50 px-4 py-3 text-sm text-foreground focus:border-premium-gold outline-none"
                        placeholder="123 Luxury Ave"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-[10px] uppercase tracking-widest">
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-premium-muted font-bold">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("city")}
                          className="w-full bg-premium-gray border border-premium-border/50 px-4 py-3 text-sm text-foreground focus:border-premium-gold outline-none"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-[10px] uppercase tracking-widest">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-premium-muted font-bold">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("state")}
                          className="w-full bg-premium-gray border border-premium-border/50 px-4 py-3 text-sm text-foreground focus:border-premium-gold outline-none"
                        />
                        {errors.state && (
                          <p className="text-red-500 text-[10px] uppercase tracking-widest">
                            {errors.state.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-premium-muted font-bold">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("phone")}
                          className="w-full bg-premium-gray border border-premium-border/50 px-4 py-3 text-sm text-foreground focus:border-premium-gold outline-none"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-[10px] uppercase tracking-widest">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-foreground text-background py-4 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-premium-gold hover:text-black transition-all"
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

                  <div className="space-y-6">
                    <div className="w-full flex items-center justify-between p-6 border border-premium-gold bg-premium-gold/5 transition-all">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center border-premium-gold">
                          <div className="w-2 h-2 bg-premium-gold rounded-full" />
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase tracking-widest text-foreground">
                            Manual Bank Transfer
                          </p>
                          <p className="text-[10px] text-premium-muted uppercase tracking-widest">
                            Verified by Admin
                          </p>
                        </div>
                      </div>
                      <Landmark size={24} className="text-premium-muted" />
                    </div>

                    <BankTransferInstructions handleCopy={handleCopy} copied={copied} />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 border border-premium-border/50 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-premium-border/10 transition-all text-premium-muted"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-[2] bg-foreground text-background py-4 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-premium-gold hover:text-black transition-all"
                    >
                      Review Order <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-2xl font-bold uppercase tracking-tight">
                    Review & Place Order
                  </h2>

                  <div className="bg-premium-gray/30 p-6 space-y-4 border border-premium-border/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-premium-muted mb-1 font-bold">
                          Shipping to
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {formData?.address}, {formData?.city}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-[10px] text-premium-gold uppercase font-bold tracking-widest"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="flex justify-between items-start pt-4 border-t border-premium-border/30">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-premium-muted mb-1 font-bold">
                          Payment Method
                        </p>
                        <p className="text-sm font-medium text-foreground">Bank Transfer</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-[10px] text-premium-gold uppercase font-bold tracking-widest"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <BankTransferInstructions handleCopy={handleCopy} copied={copied} />

                  <button
                    onClick={handleSubmit(onPlaceOrder)}
                    disabled={isPlacingOrder}
                    className="w-full bg-premium-gold text-black py-5 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isPlacingOrder ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Complete Purchase"
                    )}
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="text-center py-12 space-y-8 animate-fade-in">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-premium-gold/10 border border-premium-gold flex items-center justify-center text-premium-gold">
                      <CheckCircle2 size={40} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold uppercase tracking-tighter text-foreground">
                      Order Placed Successfully!
                    </h2>
                    <p className="text-premium-muted text-[10px] uppercase tracking-[0.3em] font-bold">
                      Order ID: #{createdOrderId?.slice(-6).toUpperCase()}
                    </p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <BankTransferInstructions handleCopy={handleCopy} copied={copied} />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-8">
                    <button
                      onClick={() => navigate(`/order/${createdOrderId}`)}
                      className="flex-1 bg-foreground text-background py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-premium-gold hover:text-black transition-all"
                    >
                      Track My Order
                    </button>
                    <button
                      onClick={() => navigate("/shop")}
                      className="flex-1 border border-premium-border/50 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-premium-border/10 transition-all text-premium-muted"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mini Summary */}
          {step < 4 && (
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-premium-gray/20 p-6 border border-premium-border/30 rounded-sm">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-premium-muted mb-6 border-b border-premium-border/30 pb-4">
                  Order Review
                </h3>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div
                      key={`${item.product._id}-${item.variant._id}`}
                      className="flex gap-4"
                    >
                      <div className="w-12 h-12 bg-premium-gray overflow-hidden">
                        <img
                          src={item.product.images[0]}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase truncate text-foreground">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-premium-muted uppercase">
                          {item.quantity} x {item.variant.size}
                        </p>
                      </div>
                      <p className="text-[10px] font-bold text-foreground">
                        ₦{item.variant.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-premium-border/30 pt-4 flex justify-between items-end">
                  <p className="text-[10px] uppercase tracking-widest text-premium-muted">
                    Total Amount
                  </p>
                  <p className="text-xl font-bold text-premium-gold">
                    ₦{getTotal().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
