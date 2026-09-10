import React from 'react';
import { X, ShoppingCart, Camera, MapPin, Play, Image as ImageIcon } from 'lucide-react';

const getValidUrl = (item) => {
  if (!item) return '';
  return item.previewUrl || 'https://placehold.co/600x400/18181b/f59e0b?text=No+Media';
};

export default function CheckoutModal({ isOpen, item, currency, onClose }) {
  if (!isOpen || !item) return null;

  const mediaSrc = getValidUrl(item);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg" dir="rtl">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-5xl h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative">
        
        <button onClick={onClose} className="absolute top-4 left-4 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-amber-500 hover:text-black transition backdrop-blur-md">
          <X size={20} />
        </button>

        <div className="w-full md:w-3/5 h-1/2 md:h-full bg-black relative flex items-center justify-center overflow-hidden">
          {item.mediaType === 'video' ? (
            <video 
              src={mediaSrc}
              className="w-full h-full object-contain"
              controls
              autoPlay
            />
          ) : (
            <img 
              src={mediaSrc}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/18181b/f59e0b?text=Image+Lost'; }}
              alt={item.title}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        <div className="w-full md:w-2/5 h-1/2 md:h-full bg-zinc-950 p-6 md:p-10 flex flex-col overflow-y-auto">
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-bold uppercase">
              {item.mediaType === 'video' ? <Play size={12}/> : <ImageIcon size={12}/>}
              {item.mediaType}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-black text-white mb-6">{item.title}</h2>
          
          <div className="space-y-4 mb-8">
            {item.metadata?.cameraModel && (
              <div className="flex items-center gap-3 text-zinc-400 text-sm">
                <Camera size={16} className="text-zinc-500"/>
                <span className="font-mono">{item.metadata.cameraModel}</span>
              </div>
            )}
            {item.metadata?.location && (
              <div className="flex items-center gap-3 text-zinc-400 text-sm">
                <MapPin size={16} className="text-zinc-500"/>
                <span>{item.metadata.location}</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-zinc-800">
            <div className="flex justify-between items-end mb-6">
              <span className="text-zinc-500 text-sm">مبلغ قابل پرداخت</span>
              <div className="text-3xl font-black text-white font-mono">
                {Number(item.price?.irr || 0).toLocaleString('fa-IR')} <span className="text-sm font-sans text-zinc-500 font-normal">تومان</span>
              </div>
            </div>
            
            {item.mediaType === 'video' && item.metadata?.pond5StoreLink ? (
              <a href={item.metadata.pond5StoreLink} target="_blank" rel="noopener noreferrer" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-xl transition flex items-center justify-center gap-2">
                <ShoppingCart size={18} />
                خرید مستقیم از Pond5
              </a>
            ) : (
              <button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-xl transition flex items-center justify-center gap-2">
                <ShoppingCart size={18} />
                افزودن به سبد خرید
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
