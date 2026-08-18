import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import { forgotPassword } from "../services/authService";
import MainLayout from "../components/layout/MainLayout";
import { getErrorMessage } from "../utils/errors";

const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await forgotPassword(data.email);
      setMessage(res.message);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send reset email"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="max-w-md mx-auto py-12">
        <div className="text-center mb-10">
          <h2 className="text-sm uppercase tracking-[0.4em] text-premium-gold mb-4">
            Security Control
          </h2>
          <h1 className="text-4xl font-bold tracking-tight uppercase">Forgot Password</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs py-3 px-4 mb-6 uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-xs py-3 px-4 mb-6 uppercase tracking-widest text-center">
            {message}
          </div>
        )}

        {!message ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-premium-muted mb-2 font-bold">
                Email Address
              </label>
              <input
                {...registerField("email")}
                type="email"
                className={`w-full bg-premium-gray border ${errors.email ? "border-red-500" : "border-premium-border/50"} px-4 py-4 text-foreground text-sm focus:border-premium-gold outline-none transition-colors`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-[10px] mt-1 uppercase tracking-widest">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-foreground text-background py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-premium-gold hover:text-black transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Send Reset Link"
              )}
              {!isLoading && <Send size={18} />}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-premium-muted text-sm">
              Please check your inbox for instructions to reset your password. The link will be valid for 1 hour.
            </p>
          </div>
        )}

        <div className="mt-10 pt-10 border-t border-premium-border/50 text-center">
          <Link
            to="/login"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:text-premium-gold transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPasswordPage;
