import React, { useState, useEffect } from 'react';
import { Play, Image as ImageIcon, ChevronRight, ChevronLeft } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

const getValidUrl = (item) => {
  if (!item) return '';
  return item.previewUrl || 'https://placehold.co/600x400/18181b/f59e0b?text=No+Media';
};

export default function GallerySection({ mediaList, currency, activeFilter, onSelectMedia, settings, searchQuery }) {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMedia = (mediaList || []).filter(item => {
    const matchesFilter = activeFilter === 'all' || item.mediaType === activeFilter;
    if (!searchQuery) return matchesFilter;
    const q = searchQuery.replace(/^#/, '').toLowerCase();
    const matchesTags = (item.tags || []).some(tag => tag.toLowerCase().includes(q));
    const matchesTitle = item.title?.toLowerCase().includes(q);
    return matchesFilter && (matchesTags || matchesTitle);
  });

  const totalPages = Math.ceil(filteredMedia.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filteredMedia.slice(start, start + ITEMS_PER_PAGE);

  // Reset to page 1 when filter or search changes
  useEffect(() => { setCurrentPage(1); }, [activeFilter, searchQuery]);

  return (
    <section id={settings?.gallerySectionId || 'gallery'} className="py-12 px-6 max-w-7xl mx-auto" dir="rtl">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">{settings?.galleryTitle || 'آرشیو آثار و تولیدات'}</h2>
          <p className="text-zinc-500 mt-2">{settings?.gallerySubtitle || 'جهت مشاهده پیش‌نمایش و جزئیات، روی هر اثر کلیک کنید.'}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-400 font-mono">
          {filteredMedia.length} اثر موجود
        </div>
      </div>

      {filteredMedia.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-3xl">
          {searchQuery ? `نتیجه‌ای برای "${searchQuery}" یافت نشد.` : 'موردی برای نمایش یافت نشد.'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginated.map((item) => {
              const mediaSrc = getValidUrl(item);
              return (
                <div
                  key={item._id}
                  onClick={() => onSelectMedia(item)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectMedia(item); }}}
                  role="button"
                  tabIndex={0}
                  aria-label={`مشاهده جزئیات ${item.title}`}
                  className="group cursor-pointer bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-[4/5] relative overflow-hidden bg-black/50">
                    {item.mediaType === 'video' ? (
                      <>
                        <video
                          src={`${mediaSrc}#t=2`}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                          preload="metadata"
                          muted
                          loop
                          onMouseEnter={(e) => e.target.play()}
                          onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 2; }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 transition-all">
                            <Play size={20} className="ml-1" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={mediaSrc}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x500/18181b/f59e0b?text=Image+Lost'; }}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                    )}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                      {item.mediaType === 'video' ? <Play size={12} className="text-amber-500"/> : <ImageIcon size={12} className="text-amber-500"/>}
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">{item.mediaType}</span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 group-hover:text-amber-500 transition-colors">{item.title}</h3>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">#{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-end mt-2">
                      <div className="text-xs text-zinc-500 font-mono">
                        {item.metadata?.cameraModel && <span>{item.metadata.cameraModel}</span>}
                      </div>
                      <div className="text-amber-500 font-bold font-mono">
                        {Number(item.price?.irr || 0).toLocaleString('fa-IR')} <span className="text-xs text-zinc-500 font-sans font-normal">تومان</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16}/> قبلی
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition ${currentPage === page ? 'bg-amber-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                بعدی <ChevronLeft size={16}/>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
