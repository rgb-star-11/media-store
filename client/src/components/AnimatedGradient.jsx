import React from "react";

export default function AnimatedGradient({ children, className = "" }) {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* 🌟 تزریق مستقیم انیمیشن به مرورگر (۱۰۰٪ تضمینی) 🌟 */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes smooth-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-bg-gradient {
          /* ترکیب رنگ‌های تاریک، طلایی و سرمه‌ای که مدام در هم حرکت می‌کنند */
          background: linear-gradient(-45deg, #09090b, #1e1b4b, #0f172a, #451a03, #09090b);
          background-size: 400% 400%;
          animation: smooth-gradient 15s ease infinite;
        }
        `
      }} />
      
      {/* لایه متحرک پس‌زمینه */}
      <div className="absolute inset-0 animate-bg-gradient z-0 opacity-70"></div>
      
      {/* محتوای اصلی که روی بک‌گراند قرار می‌گیرد */}
      <div className="relative z-10 flex flex-col w-full h-full">
        {children}
      </div>
    </div>
  );
}