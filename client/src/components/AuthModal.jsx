import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Smartphone, KeyRound, Loader2, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, user, onLoginSuccess, onLogout }) {
  const [step, setStep] = useState(1); // ۱: دریافت شماره، ۲: دریافت کد
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const [devCode, setDevCode] = useState(null);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  // ارسال شماره و درخواست OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/wp-json/studio/v1/auth/send-otp', { phone });
      setDevCode(res.data.devOtp);
      setStep(2);
      setTimer(120);
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در ارسال کد');
    } finally {
      setLoading(false);
    }
  };

  // تایید کد و دریافت توکن
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // در AuthModal.jsx داخل handleVerifyOtp:
const res = await axios.post('/wp-json/studio/v1/auth/verify-otp', { phone, code });
localStorage.setItem('auth_token', res.data.token);
localStorage.setItem('auth_user', JSON.stringify(res.data.user));
onLoginSuccess(res.data.user); // انتقال کاربر با نقش جدید به App
onClose();
      setStep(1);
      setCode('');
      setPhone('');
    } catch (err) {
      alert(err.response?.data?.error || 'کد تایید نامعتبر است');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-right" dir="rtl">
        <button 
          onClick={onClose} 
          className="absolute left-4 top-4 text-zinc-400 hover:text-white transition p-1"
        >
          <X size={18} />
        </button>

        {user ? (
          /* پروفایل کاربری در صورت لاگین بودن */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Smartphone size={28} />
            </div>
            <h3 className="font-bold text-zinc-100 text-base mb-1">حساب کاربری فعال</h3>
            <p className="text-xs text-zinc-400 mb-6 font-mono">{user.phone}</p>
            
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <LogOut size={15} />
              <span>خروج از حساب</span>
            </button>
          </div>
        ) : step === 1 ? (
          /* مرحله ۱: ورود شماره تماس */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-100 mb-2">
              <Smartphone className="text-amber-400" size={20} />
              <h3 className="font-bold text-base">ورود یا ثبت‌نام</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              شماره موبایل خود را وارد کنید تا کد تایید پیامک شود.
            </p>

            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">شماره موبایل</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-center text-sm font-mono tracking-wider outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'دریافت کد تایید'}
            </button>
          </form>
        ) : (
          /* مرحله ۲: ورود کد تایید */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-zinc-100">
                <KeyRound className="text-amber-400" size={20} />
                <h3 className="font-bold text-base">کد تایید</h3>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>ویرایش شماره</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-2">
              کد ارسال شده به شماره <span className="text-zinc-200 font-mono">{phone}</span> را وارد کنید:
            </p>

            {devCode && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs p-2 rounded-lg text-center font-mono">
                کد آزمایشی: {devCode}
              </div>
            )}

            <div>
              <input
                type="text"
                required
                maxLength={5}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="• • • • •"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-center text-lg font-mono tracking-widest outline-none transition"
                autoFocus
              />
            </div>

            <div className="text-center text-xs text-zinc-500">
              {timer > 0 ? (
                <span>زمان باقیمانده: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  ارسال مجدد کد
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'تایید و ورود'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}