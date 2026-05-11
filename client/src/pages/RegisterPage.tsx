import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { register } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import MainLayout from '../components/layout/MainLayout';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, setUserInfo } = useAuthStore();

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, navigate, redirect]);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await register(data.name, data.email, data.password);
      setUserInfo(user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="max-w-md mx-auto py-12">
        <div className="text-center mb-10">
          <h2 className="text-sm uppercase tracking-[0.4em] text-premium-gold mb-4">Join the Collective</h2>
          <h1 className="text-4xl font-bold tracking-tight uppercase">Create Account</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs py-3 px-4 mb-6 uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Full Name</label>
            <input
              {...registerField('name')}
              type="text"
              className={`w-full bg-premium-gray border ${errors.name ? 'border-red-500' : 'border-white/10'} px-4 py-4 text-white text-sm focus:border-premium-gold outline-none transition-colors`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-red-500 text-[10px] mt-1 uppercase tracking-widest">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Email Address</label>
            <input
              {...registerField('email')}
              type="email"
              className={`w-full bg-premium-gray border ${errors.email ? 'border-red-500' : 'border-white/10'} px-4 py-4 text-white text-sm focus:border-premium-gold outline-none transition-colors`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-[10px] mt-1 uppercase tracking-widest">{errors.email.message}</p>}
          </div>

          <div className="relative">
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Password</label>
            <input
              {...registerField('password')}
              type={showPassword ? 'text' : 'password'}
              className={`w-full bg-premium-gray border ${errors.password ? 'border-red-500' : 'border-white/10'} px-4 py-4 text-white text-sm focus:border-premium-gold outline-none transition-colors`}
              placeholder="Min. 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && <p className="text-red-500 text-[10px] mt-1 uppercase tracking-widest">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Confirm Password</label>
            <input
              {...registerField('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              className={`w-full bg-premium-gray border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'} px-4 py-4 text-white text-sm focus:border-premium-gold outline-none transition-colors`}
              placeholder="Repeat your password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 uppercase tracking-widest">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-premium-gold hover:text-black transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-white/5 text-center">
          <p className="text-gray-500 text-xs mb-4 uppercase tracking-widest">Already have an account?</p>
          <Link
            to={`/login?redirect=${redirect}`}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:text-premium-gold transition-colors"
          >
            Sign In Instead
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;
