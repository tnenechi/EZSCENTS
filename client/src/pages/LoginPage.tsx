import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { login } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import MainLayout from '../components/layout/MainLayout';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await login(data.email, data.password);
      setUserInfo(user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="max-w-md mx-auto py-12">
        <div className="text-center mb-10">
          <h2 className="text-sm uppercase tracking-[0.4em] text-premium-gold mb-4">Welcome Back</h2>
          <h1 className="text-4xl font-bold tracking-tight uppercase">Login</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs py-3 px-4 mb-6 uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              placeholder="Enter your password"
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

          <div className="flex items-center justify-between">
            <Link to="/forgot-password" size={18} className="text-[10px] uppercase tracking-widest text-premium-gold hover:text-white transition-colors font-bold">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-premium-gold hover:text-black transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-white/5 text-center">
          <p className="text-gray-500 text-xs mb-4 uppercase tracking-widest">New to EzScents?</p>
          <Link
            to={`/register?redirect=${redirect}`}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:text-premium-gold transition-colors"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
