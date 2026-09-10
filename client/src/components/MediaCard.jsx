import React from 'react';
import { ShoppingCart, Eye, Video, Image as ImageIcon } from 'lucide-react';

export default function MediaCard({ item, currency, onSelect }) {
  const isVideo = item.mediaType === 'video';

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition duration-300">
      {/* مدیا پیش‌نمایش */}
      <div className="aspect-4/3 w-full overflow-hidden bg-zinc-950 relative">
        <img 
          src={item.previewUrl || 'https://placehold.co/400x300/18181b/f59e0b?text=No+Media'}
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/18181b/f59e0b?text=No+Media'; }} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        
        {/* نشانگر نوع مدیا */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 text-zinc-200">
          {isVideo ? <Video size={13} /> : <ImageIcon size={13} />}
          <span>{item.metadata?.resolution || (isVideo ? 'Video' : 'Photo')}</span>
        </div>
      </div>

      {/* اطلاعات و دکمه خرید */}
      <div className="p-4 flex items-center justify-between text-right" dir="rtl">
        <div>
          <h3 className="font-semibold text-zinc-100 text-sm truncate max-w-[180px]">{item.title}</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {currency === 'IRR' ? `${item.price.irr.toLocaleString('fa-IR')} تومان` : `$${item.price.usd} USD`}
          </p>
        </div>

        <button 
          onClick={() => onSelect(item)}
          className="p-2.5 bg-zinc-800 hover:bg-amber-500 hover:text-black rounded-xl text-zinc-200 transition duration-200"
          title="خرید و دریافت لایسنس"
        >
          <ShoppingCart size={18} />
        </button>
      </div>
    </div>
  );
}
