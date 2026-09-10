import React from 'react';
import { LogOut, User, ShoppingBag, X } from 'lucide-react';

export default function UserDashboard({ isOpen, onClose, onLogout }) {
  if (!isOpen) return null;

  const userName = localStorage.getItem('user_name') || 'کاربر گرامی';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4" dir="rtl">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
        
        {/* دکمه ضربدر برای بستن پنل بدون خروج از اکانت */}
        <button onClick={onClose} className="absolute top-6 left-6 text-zinc-500 hover:text-white transition bg-zinc-900 p-2 rounded-full z-10">
          <X size={20} />
        </button>

        {/* هدر پنل کاربر */}
        <div className="bg-gradient-to-r from-amber-500/20 to-transparent p-8 border-b border-zinc-800 flex justify-between items-center relative">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-zinc-900 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-500 shadow-lg">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">سلام، {userName}</h2>
              <p className="text-sm text-zinc-400 mt-1">به پنل کاربری استودیو خوش آمدید</p>
            </div>
          </div>
        </div>

        {/* محتوای پنل کاربر */}
        <div className="p-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[200px]">
            <ShoppingBag size={48} className="text-zinc-700 mb-4" />
            <h3 className="text-lg font-bold text-zinc-300">لیست خریدهای شما</h3>
            <p className="text-sm text-zinc-500 mt-2">شما هنوز هیچ فایلی از استودیو خریداری نکرده‌اید.</p>
          </div>

          <button onClick={onLogout} className="mt-8 flex items-center gap-2 text-red-500 font-bold bg-red-500/10 hover:bg-red-500 hover:text-white px-6 py-3 rounded-xl transition w-full justify-center">
            <LogOut size={18} /> خروج کامل از حساب کاربری
          </button>
        </div>

      </div>
    </div>
  );
}