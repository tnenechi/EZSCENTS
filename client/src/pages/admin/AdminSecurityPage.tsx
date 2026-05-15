import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { changePassword } from '../../services/authService';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminSecurityPage = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const changePasswordMutation = useMutation({
    mutationFn: () => changePassword(passwordData.currentPassword, passwordData.newPassword),
    onSuccess: () => {
      setPasswordStatus({ type: 'success', message: 'Password updated successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      setPasswordStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to update password' 
      });
    }
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    changePasswordMutation.mutate();
  };

  return (
    <AdminLayout>
      <div className="mb-12">
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-premium-gold mb-2 font-bold">Protection</h2>
        <h1 className="text-4xl font-bold tracking-tight uppercase">Security Settings</h1>
      </div>

      <div className="max-w-xl">
        <form onSubmit={handlePasswordChange} className="bg-premium-gray/20 border border-white/5 p-8 rounded-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-premium-gold/10 text-premium-gold rounded-sm">
              <Lock size={20} />
            </div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-300">Change Administrator Password</h4>
          </div>
          
          {passwordStatus && (
            <div className={`p-4 flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold ${
              passwordStatus.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {passwordStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {passwordStatus.message}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Current Password</label>
            <input 
              required
              type="password" 
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm focus:border-premium-gold outline-none text-white transition-colors" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">New Password</label>
            <input 
              required
              type="password" 
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm focus:border-premium-gold outline-none text-white transition-colors" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Confirm New Password</label>
            <input 
              required
              type="password" 
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm focus:border-premium-gold outline-none text-white transition-colors" 
            />
          </div>

          <button 
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="w-full bg-white text-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-premium-gold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {changePasswordMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
          </button>
        </form>

        <div className="mt-8 p-6 border border-white/5 bg-white/[0.02]">
          <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">Security Note</p>
          <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-tight font-bold">
            Changing your password will not affect your current session, but you will need to use the new password for future logins. Ensure your new password is secure and contains a mix of characters.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSecurityPage;
