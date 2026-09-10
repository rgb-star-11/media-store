import React from 'react';
import Spline from '@splinetool/react-spline';
import { Play, Sparkles, ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden border-b border-zinc-900 bg-zinc-950">
      
      {/* صحنه ۳ بعدی در پس‌زمینه */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
      </div>

      {/* گرادینت تاریک برای خوانایی عالی متن روی صحنه ۳ بعدی */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10 pointer-events-none" />

      {/* محتوای متنی و شعار اصلی */}
      <div className="relative z-20 max-w-4xl mx-auto text-center px-6 py-12" dir="rtl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-amber-400 text-xs font-medium mb-6 backdrop-blur-md">
          <Sparkles size={14} />
          <span>آرشیو تصاویر هوایی، عکاسی پرتره و فوتیج‌های سینمایی 4K</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-zinc-100 tracking-tight leading-tight mb-6">
          روایت بصری لحظه‌ها؛ <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500">
            کیفیت بی‌پایان برای پروژه‌های شما
          </span>
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8">
          مجموعه‌ای از قاب‌های بکر، پلان‌های هوایی کویری و شهری و عکس‌های با رزولوشن بالا برای تدوین‌گران، طراحان و استودیوهای خلاق.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#gallery"
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-xl transition text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <span>مشاهده گالری آثار</span>
            <ArrowDown size={16} />
          </a>
          <a
            href="#about"
            className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-6 py-3 rounded-xl transition text-xs sm:text-sm backdrop-blur-sm"
          >
            درباره سبک و تجهیزات
          </a>
        </div>
      </div>
    </section>
  );
}