import React, { useState, useEffect } from 'react';
import AnimatedRays from './AnimatedRays';
import AnimatedGradient from './AnimatedGradient';
import TubesCursor from './TubesCursor';

const getCleanHeroImageUrl = (item) => {
  if (!item) return '';
  if (item._id) return `/wp-json/studio/v1/media/hero/${item._id}?v=hq`;
  return item.previewUrl || '';
};

export default function Hero3D({ mediaList, onSelectMedia, bgEffect, settings }) {
  const [landscapeIds, setLandscapeIds] = useState(new Set());

  // Filter images: must be image mediaType, and metadata indicates horizontal (width > height)
  const imageItems = (mediaList || []).filter(item => {
    if (item.mediaType !== 'image') return false;
    if (item.metadata?.resolution) {
      const [w, h] = item.metadata.resolution.split('x').map(Number);
      if (w && h) return w > h;
    }
    if (item.metadata?.aspectRatio) {
      const parts = item.metadata.aspectRatio.split(':');
      if (parts.length === 2) return parseFloat(parts[0]) > parseFloat(parts[1]);
    }
    // If dynamic image check completed, enforce horizontal orientation
    if (landscapeIds.size > 0) return landscapeIds.has(item._id);
    return true;
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Preload images into browser cache & verify horizontal orientation
  useEffect(() => {
    (mediaList || []).filter(item => item.mediaType === 'image').forEach(item => {
      const img = new Image();
      const url = getCleanHeroImageUrl(item);
      img.src = url;
      img.onload = () => {
        if (img.naturalWidth > img.naturalHeight) {
          setLandscapeIds(prev => new Set(prev).add(item._id));
        }
      };
    });
  }, [mediaList]);

  useEffect(() => {
    if (imageItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [imageItems.length]);

  const isHeroRays = bgEffect === 'rays-hero';
  const isHeroGradient = bgEffect === 'gradient-hero';
  const isHeroTubes = bgEffect === 'tubes-hero';

  const currentItem = imageItems[currentIndex];

  const heroTitle        = settings?.heroTitle        || 'گالری عکس‌های اختصاصی';
  const heroTitleAccent  = settings?.heroTitleAccent  || 'ویدیو فوتیج‌های اختصاصی';
  const heroSubtitle     = settings?.heroSubtitle     || 'مجموعه‌ای از تصاویر و ویدیوهای باکیفیت برای استفاده تجاری و شخصی';
  const heroBadgeText    = settings?.heroBadgeText    || 'نمونه‌کارها';
  const primaryBtnText   = settings?.heroPrimaryBtnText   || 'مشاهده گالری';
  const primaryBtnLink   = settings?.heroPrimaryBtnLink   || '#gallery';
  const secondaryBtnText = settings?.heroSecondaryBtnText || 'درباره من';
  const secondaryBtnLink = settings?.heroSecondaryBtnLink || '#about';

  const handleNavClick = (e, path) => {
    if (path && path.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(path);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="w-full flex flex-col bg-transparent pt-24 select-none relative">

      <style>{`
        @keyframes fadeInSlideRight {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-right {
          animation: fadeInSlideRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Background Interactive Effects (Tubes, Aurora, Gradient) */}
      {isHeroRays && <div className="absolute inset-0 z-0 opacity-50 pointer-events-none"><AnimatedRays /></div>}
      {isHeroGradient && <div className="absolute inset-0 z-0 opacity-60 pointer-events-none"><AnimatedGradient /></div>}
      {isHeroTubes && <TubesCursor isGlobal={false} configStr={settings?.tubesConfig} />}

      {/* 1. TOP TEXT & ACTION SECTION */}
      <div className="w-full bg-transparent pt-2 pb-2 px-6 relative z-20" dir="rtl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex-1 text-center md:text-right space-y-1.5">
            {heroBadgeText && (
              <span className="inline-block text-[11px] text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {heroBadgeText}
              </span>
            )}
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {heroTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-500">{heroTitleAccent}</span>
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              {heroSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-center shrink-0">
            <a
              href={primaryBtnLink}
              onClick={(e) => handleNavClick(e, primaryBtnLink)}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
            >
              {primaryBtnText}
            </a>
            <a
              href={secondaryBtnLink}
              onClick={(e) => handleNavClick(e, secondaryBtnLink)}
              className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 px-6 py-2.5 rounded-xl text-xs transition backdrop-blur-md"
            >
              {secondaryBtnText}
            </a>
          </div>

        </div>
      </div>

      {/* 2. HERO IMAGE SHOWCASE CONTAINER (Full Screen Width, Landscape Only) */}
      <div className="relative w-full pt-1 pb-4 md:pb-6 bg-transparent flex flex-col items-center justify-center px-2 sm:px-4 md:px-6 z-10">

        {/* MAIN HERO CONTENT */}
        {imageItems.length === 0 ? (
          <div className="relative z-20 text-zinc-500 font-bold py-12">تصویر افقی یافت نشد</div>
        ) : (
          <div className="relative z-20 w-full mx-auto flex flex-col items-center justify-center gap-3" dir="rtl">

            {/* FULL WIDTH HORIZONTAL IMAGE CONTAINER */}
            <div className="w-full h-[52vh] sm:h-[62vh] md:h-[72vh] min-h-[340px] sm:min-h-[440px] flex items-center justify-center relative select-none rounded-3xl overflow-hidden shadow-2xl">
              <div
                onClick={() => onSelectMedia && currentItem && onSelectMedia(currentItem)}
                onContextMenu={(e) => e.preventDefault()}
                className="relative h-full w-full flex items-center justify-center cursor-pointer group select-none rounded-3xl overflow-hidden"
              >
                {imageItems.map((item, index) => {
                  const isCurrent = index === currentIndex;
                  return (
                    <img
                      key={item._id || index}
                      src={getCleanHeroImageUrl(item)}
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                      alt={item.title}
                      className={`absolute h-full w-full object-cover rounded-3xl drop-shadow-2xl transition-opacity duration-1000 ease-in-out select-none ${
                        isCurrent ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-95 pointer-events-none'
                      }`}
                    />
                  );
                })}

                {/* Transparent overlay preventing right click / save image */}
                <div
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  className="absolute inset-0 z-20 bg-transparent select-none rounded-3xl"
                />
              </div>
            </div>

            {/* TITLE CENTERED UNDERNEATH THE IMAGE (No Border, No Background) */}
            {currentItem && (
              <div
                key={currentItem._id || currentIndex}
                onClick={() => onSelectMedia && onSelectMedia(currentItem)}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full text-center pt-2 pb-1 animate-fade-slide-right cursor-pointer group select-none z-20"
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-snug group-hover:text-amber-400 transition-colors drop-shadow-lg">
                  {currentItem.title}
                </h2>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
