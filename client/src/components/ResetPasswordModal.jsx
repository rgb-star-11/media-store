import React, { useState } from 'react';
import axios from 'axios';
import { X, Lock, CheckCircle } from 'lucide-react';

export default function ResetPasswordModal({ isOpen, resetToken, onClose, onSuccess }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword.length < 8) {
      return setErrorMessage('رمز عبور باید حداقل ۸ کاراکتر باشد.');
    }
    if (newPassword !== confirmPassword) {
      return setErrorMessage('رمز عبور و تکرار آن یکسان نیستند.');
    }

    setLoading(true);
    try {
      const res = await axios.post('/wp-json/studio/v1/auth/reset-password', {
        token: resetToken,
        newPassword
      });

      if (res.data.success) {
        setSuccessMessage(res.data.message || 'رمز عبور با موفقیت تغییر یافت.');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'خطا در بازنشانی رمز عبور. ممکن است لینک منقضی شده باشد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" dir="rtl">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl overflow-hidden">
        
        <button 
          onClick={onClose} 
          className="absolute top-5 left-5 text-zinc-500 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 p-2 rounded-full transition"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-white">تعیین رمز عبور جدید</h3>
          <p className="text-xs text-zinc-500 mt-2">لطفاً رمز عبور جدید خود را وارد نمایید.</p>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-4 text-center">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl mb-4 text-center flex items-center justify-center gap-2">
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">رمز عبور جدید (حداقل ۸ کاراکتر)</label>
            <div className="relative">
              <input
                type="password"
                dir="ltr"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 pl-10 text-sm text-white font-mono outline-none focus:border-amber-500 transition text-left"
                required
                autoFocus
              />
              <Lock size={18} className="absolute left-3 top-3.5 text-zinc-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">تکرار رمز عبور جدید</label>
            <div className="relative">
              <input
                type="password"
                dir="ltr"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 pl-10 text-sm text-white font-mono outline-none focus:border-amber-500 transition text-left"
                required
              />
              <Lock size={18} className="absolute left-3 top-3.5 text-zinc-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? 'در حال ثبت...' : 'ذخیره رمز عبور جدید'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
