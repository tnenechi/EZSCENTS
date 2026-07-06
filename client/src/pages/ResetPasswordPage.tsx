import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { resetPassword } from "../services/authService";
import MainLayout from "../components/layout/MainLayout";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password confirmation must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setError("Reset token is missing");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await resetPassword(token, data.password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. The link may have expired.");
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
          <h1 className="text-4xl font-bold tracking-tight uppercase">Reset Password</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs py-3 px-4 mb-6 uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-xs py-3 px-4 mb-6 uppercase tracking-widest text-center">
            Password reset successful! Redirecting to login...
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest text-premium-muted mb-2 font-bold">
                New Password
              </label>
              <input
                {...registerField("password")}
                type={showPassword ? "text" : "password"}
                className={`w-full bg-premium-gray border ${errors.password ? "border-red-500" : "border-premium-border/50"} px-4 py-4 text-foreground text-sm focus:border-premium-gold outline-none transition-colors`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-premium-muted hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-[10px] mt-1 uppercase tracking-widest">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest text-premium-muted mb-2 font-bold">
                Confirm Password
              </label>
              <input
                {...registerField("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full bg-premium-gray border ${errors.confirmPassword ? "border-red-500" : "border-premium-border/50"} px-4 py-4 text-foreground text-sm focus:border-premium-gold outline-none transition-colors`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-[38px] text-premium-muted hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-[10px] mt-1 uppercase tracking-widest">
                  {errors.confirmPassword.message}
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
                "Update Password"
              )}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        <div className="mt-10 pt-10 border-t border-premium-border/50 text-center">
          <Link
            to="/login"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:text-premium-gold transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResetPasswordPage;
