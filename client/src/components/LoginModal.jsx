import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, Smartphone, KeyRound, Mail, Lock, User, 
  ArrowRight, ArrowLeft, CheckCircle, HelpCircle
} from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  // روش ورود: 'phone' (شماره موبایل) یا 'email' (ایمیل و رمز)
  const [loginMethod, setLoginMethod] = useState('phone');

  // مراحل ورود موبایلی:
  // 'phone' -> وارد کردن شماره موبایل
  // 'existing-password' -> کاربر قبلاً ثبت‌نام کرده، ورود رمز عبور
  // 'otp-code' -> کاربر جدید است، ورود کد ۵ رقمی پیامک شده
  // 'register-setup' -> بعد از تایید پیامک بار اول، تعیین ایمیل و رمز عبور
  const [step, setStep] = useState('phone');

  // مقادیر فیلدها
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  
  // فیلدهای تکمیل ثبت‌نام کاربر جدید
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    province: '',
    city: '',
    addressDetail: ''
  });

  // فیلدهای ورود مستقیم با ایمیل
  const [emailLogin, setEmailLogin] = useState({ email: '', password: '' });

  // تایمر ارسال مجدد کد پیامکی
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // مدیریت تایمر معکوس
  useEffect(() => {
    let interval;
    if (step === 'otp-code' && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // ریست کردن فرم هنگام باز/بسته شدن
  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setMobile('');
      setPassword('');
      setCode('');
      setVerificationToken('');
      setErrorMessage('');
      setInfoMessage('');
      setTimer(120);
      setCanResend(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ۱. بررسی شماره موبایل کاربر (بررسی وجود حساب)
  const handleCheckMobile = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const cleanMobile = mobile.trim();
    if (!cleanMobile.startsWith('09') || cleanMobile.length !== 11) {
      return setErrorMessage('شماره موبایل باید ۱۱ رقم بوده و با ۰۹ شروع شود.');
    }

    setLoading(true);
    try {
      const res = await axios.post('/wp-json/studio/v1/auth/check-mobile', { mobile: cleanMobile });
      if (res.data.success) {
        if (res.data.exists) {
          // کاربر قبلاً ثبت‌نام کرده -> درخواست رمز عبور (بدون ارسال پیامک)
          setStep('existing-password');
        } else {
          // کاربر جدید است -> ارسال پیامک کد ۲ مرحله‌ای
          const otpRes = await axios.post('/wp-json/studio/v1/auth/send-otp', { mobile: cleanMobile });
          if (otpRes.data.success) {
            setStep('otp-code');
            setTimer(120);
            setCanResend(false);
          }
        }
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'خطا در بررسی شماره موبایل');
    } finally {
      setLoading(false);
    }
  };

  // ۲. ورود کاربر موجود با رمز عبور
  const handleLoginWithPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!password) {
      return setErrorMessage('لطفاً رمز عبور خود را وارد کنید.');
    }

    setLoading(true);
    try {
      const res = await axios.post('/wp-json/studio/v1/auth/login-mobile-password', {
        mobile: mobile.trim(),
        password
      });

      if (res.data.success) {
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('user_role', res.data.role);
        localStorage.setItem('user_name', res.data.name);
        onSuccess(res.data.role);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'رمز عبور وارد شده اشتباه است.');
    } finally {
      setLoading(false);
    }
  };

  // ۳. درخواست فراموشی رمز عبور (ارسال لینک اتوماتیک به ایمیل)
  const handleForgotPassword = async () => {
    setErrorMessage('');
    setInfoMessage('');
    setLoading(true);

    try {
      const res = await axios.post('/wp-json/studio/v1/auth/forgot-password', { mobile: mobile.trim() });
      if (res.data.success) {
        setInfoMessage(res.data.message || 'لینک بازنشانی رمز عبور به ایمیل شما ارسال شد.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'خطا در ارسال لینک بازنشانی رمز عبور.');
    } finally {
      setLoading(false);
    }
  };

  // ۴. اعتبارسنجی کد پیامکی ۲ مرحله‌ای (بار اول ثبت‌نام)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (code.trim().length !== 5) {
      return setErrorMessage('کد تایید باید ۵ رقم باشد.');
    }

    setLoading(true);
    try {
      const res = await axios.post('/wp-json/studio/v1/auth/verify-otp', {
        mobile: mobile.trim(),
        code: code.trim()
      });

      if (res.data.success) {
        setVerificationToken(res.data.verificationToken);
        setStep('register-setup');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'کد وارد شده اشتباه است یا منقضی شده.');
    } finally {
      setLoading(false);
    }
  };

  // ۵. ارسال مجدد کد پیامکی
  const handleResendOtp = async () => {
    setErrorMessage('');
    setInfoMessage('');
    setLoading(true);
    try {
      const res = await axios.post('/wp-json/studio/v1/auth/send-otp', { mobile: mobile.trim() });
      if (res.data.success) {
        setTimer(120);
        setCanResend(false);
        setInfoMessage('کد تایید جدید ارسال شد.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'خطا در ارسال مجدد کد.');
    } finally {
      setLoading(false);
    }
  };

  // ۶. تکمیل ثبت‌نام بار اول (تعیین ایمیل و رمز عبور)
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!formData.email || !formData.password || formData.password.length < 8) {
      return setErrorMessage('رمز عبور باید حداقل ۸ کاراکتر باشد.');
    }

    setLoading(true);
    try {
      const res = await axios.post('/wp-json/studio/v1/auth/register', {
        ...formData,
        mobile: mobile.trim(),
        verificationToken
      });

      if (res.data.success) {
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('user_role', res.data.role);
        localStorage.setItem('user_name', res.data.name);
        onSuccess(res.data.role);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'خطا در تکمیل ثبت‌نام');
    } finally {
      setLoading(false);
    }
  };

  // ۷. ورود مستقیم با ایمیل و رمز
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setLoading(true);

    try {
      const res = await axios.post('/wp-json/studio/v1/auth/login', emailLogin);
      if (res.data.success) {
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('user_role', res.data.role);
        localStorage.setItem('user_name', res.data.name);
        onSuccess(res.data.role);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'ایمیل یا رمز عبور اشتباه است.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" dir="rtl">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl overflow-hidden">
        
        {/* دکمه بستن */}
        <button 
          onClick={onClose} 
          className="absolute top-5 left-5 text-zinc-500 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 p-2 rounded-full transition"
        >
          <X size={18} />
        </button>

        {/* سوییچ بین ورود موبایلی و ایمیلی */}
        {step !== 'register-setup' && (
          <div className="flex bg-zinc-900 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); setStep('phone'); setErrorMessage(''); setInfoMessage(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${loginMethod === 'phone' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              ورود با شماره موبایل
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setErrorMessage(''); setInfoMessage(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${loginMethod === 'email' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              ورود با ایمیل و رمز
            </button>
          </div>
        )}

        {/* پیام‌های اطلاع‌رسانی و خطا */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-4 text-center">
            {errorMessage}
          </div>
        )}

        {infoMessage && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs p-3 rounded-xl mb-4 text-center leading-relaxed">
            {infoMessage}
          </div>
        )}

        {/* ----------------- روش ۱: ورود بر اساس شماره موبایل ----------------- */}
        {loginMethod === 'phone' && (
          <>
            {/* گام ۱: دریافت شماره موبایل */}
            {step === 'phone' && (
              <form onSubmit={handleCheckMobile} className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-black text-white">ورود یا ثبت‌نام</h3>
                  <p className="text-xs text-zinc-500 mt-2">برای ورود یا ایجاد حساب، شماره همراه خود را وارد کنید.</p>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">شماره موبایل</label>
                  <div className="relative">
                    <input
                      type="tel"
                      dir="ltr"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="09123456789"
                      maxLength={11}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 pl-10 text-sm text-white font-mono outline-none focus:border-amber-500 transition text-left"
                      required
                      autoFocus
                    />
                    <Smartphone size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-4"
                >
                  <span>{loading ? 'در حال بررسی...' : 'ادامه'}</span>
                  <ArrowLeft size={16} />
                </button>
              </form>
            )}

            {/* گام ۲-الف: ورود رمز عبور برای کاربران قبلی (بدون ارسال پیامک) */}
            {step === 'existing-password' && (
              <form onSubmit={handleLoginWithPassword} className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-black text-white">ورود به حساب کاربری</h3>
                  <p className="text-xs text-zinc-500 mt-2">
                    رمز عبور حساب مربوط به شماره <span className="font-mono text-amber-500">{mobile}</span> را وارد کنید.
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">رمز عبور</label>
                  <div className="relative">
                    <input
                      type="password"
                      dir="ltr"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 pl-10 text-sm text-white font-mono outline-none focus:border-amber-500 transition text-left"
                      required
                      autoFocus
                    />
                    <Lock size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'در حال بررسی رمز...' : 'ورود به حساب'}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setPassword(''); setErrorMessage(''); setInfoMessage(''); }}
                    className="text-zinc-500 hover:text-zinc-300 transition"
                  >
                    تغییر شماره موبایل
                  </button>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-amber-500 font-bold hover:underline transition flex items-center gap-1"
                  >
                    <HelpCircle size={14} />
                    <span>فراموشی رمز عبور</span>
                  </button>
                </div>
              </form>
            )}

            {/* گام ۲-ب: ورود کد تایید پیامکی (فقط برای بار اول ورود/ثبت‌نام) */}
            {step === 'otp-code' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-black text-white">کد تایید پیامکی</h3>
                  <p className="text-xs text-zinc-500 mt-2">
                    کد ۵ رقمی ارسال شده به شماره <span className="font-mono text-amber-500">{mobile}</span> را وارد کنید.
                  </p>
                </div>

                <div>
                  <div className="relative">
                    <input
                      type="text"
                      dir="ltr"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="• • • • •"
                      maxLength={5}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-center text-lg tracking-widest text-white font-mono outline-none focus:border-amber-500 transition"
                      required
                      autoFocus
                    />
                    <KeyRound size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  <span>{loading ? 'در حال اعتبارسنجی...' : 'تایید کد'}</span>
                </button>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-3">
                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setCode(''); setErrorMessage(''); setInfoMessage(''); }}
                    className="hover:text-amber-500 transition"
                  >
                    تغییر شماره موبایل
                  </button>

                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-amber-500 font-bold hover:underline"
                    >
                      ارسال مجدد کد
                    </button>
                  ) : (
                    <span>ارسال مجدد تا ({timer} ثانیه)</span>
                  )}
                </div>
              </form>
            )}

            {/* گام ۳: تعیین ایمیل و رمز عبور پس از تایید کد پیامکی (بار اول) */}
            {step === 'register-setup' && (
              <form onSubmit={handleCompleteRegistration} className="space-y-3 max-h-[75vh] overflow-y-auto px-1">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-black text-white">تعیین ایمیل و رمز عبور</h3>
                  <p className="text-xs text-zinc-500 mt-1">شماره شما تایید شد. لطفاً ایمیل و رمز عبور حساب خود را وارد نمایید.</p>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] text-zinc-400 mb-1">نام</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] text-zinc-400 mb-1">نام خانوادگی</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">ایمیل (جهت بازیابی رمز عبور)</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="example@email.com"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500 text-left font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">رمز عبور دلخواه (برای ورودهای بعدی)</label>
                  <input
                    type="password"
                    dir="ltr"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="حداقل ۸ کاراکتر"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500 text-left font-mono"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] text-zinc-400 mb-1">استان (اختیاری)</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({...formData, province: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] text-zinc-400 mb-1">شهر (اختیاری)</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">آدرس کامل (اختیاری)</label>
                  <textarea
                    rows="2"
                    value={formData.addressDetail}
                    onChange={(e) => setFormData({...formData, addressDetail: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl transition mt-2"
                >
                  {loading ? 'در حال ثبت اطلاعات...' : 'تکمیل ساخت حساب و ورود'}
                </button>
              </form>
            )}
          </>
        )}

        {/* ----------------- روش ۲: ورود مستقیم با ایمیل ----------------- */}
        {loginMethod === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-white">ورود با ایمیل</h3>
              <p className="text-xs text-zinc-500 mt-2">ایمیل و رمز عبور خود را وارد کنید.</p>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">ایمیل</label>
              <div className="relative">
                <input
                  type="email"
                  dir="ltr"
                  value={emailLogin.email}
                  onChange={(e) => setEmailLogin({...emailLogin, email: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 pl-10 text-sm text-white font-mono outline-none focus:border-amber-500 transition text-left"
                  required
                />
                <Mail size={18} className="absolute left-3 top-3.5 text-zinc-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">رمز عبور</label>
              <div className="relative">
                <input
                  type="password"
                  dir="ltr"
                  value={emailLogin.password}
                  onChange={(e) => setEmailLogin({...emailLogin, password: e.target.value})}
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
              <span>{loading ? 'در حال ورود...' : 'ورود به حساب'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
