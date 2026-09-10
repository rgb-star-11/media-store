import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Navbar from './components/Navbar';
import Hero3D from './components/Hero3D';
import GallerySection from './components/GallerySection';
import FooterSection from './components/FooterSection';
import AdminDashboard from './components/AdminDashboard';
import CheckoutModal from './components/CheckoutModal';
import LoginModal from './components/LoginModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import UserDashboard from './components/UserDashboard';
import AnimatedRays from './components/AnimatedRays'; 
import AnimatedGradient from './components/AnimatedGradient'; 
import TubesCursor from './components/TubesCursor';

function App() {
  const [mediaList, setMediaList] = useState([]);
  const [siteSettings, setSiteSettings] = useState({ backgroundEffect: 'rays-hero' });
  
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false); 
  const [resetToken, setResetToken] = useState('');
  
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');

  // بررسی لینک بازنشانی رمز عبور در آدرس بار
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    if (token) {
      setResetToken(token);
    }
  }, []);

  const fetchData = async () => {
    try {
      const resSettings = await axios.get('/wp-json/studio/v1/settings');
      if (resSettings.data) {
        // ensure default navLinks include #about if empty
        if (!resSettings.data.navLinks || resSettings.data.navLinks.length === 0) {
          resSettings.data.navLinks = [
            { title: 'گالری آثار', path: '#gallery' },
            { title: 'درباره ما', path: '#about' },
            { title: 'تماس با ما', path: '#contact' }
          ];
        }
        setSiteSettings(resSettings.data);
      }
      const resMedia = await axios.get('/wp-json/studio/v1/media');
      setMediaList(resMedia.data);
    } catch (error) {
      console.error('خطا در دریافت اطلاعات:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    document.title = siteSettings.tabTitle || siteSettings.siteName || 'استودیو من';
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon && siteSettings.faviconUrl) favicon.href = siteSettings.faviconUrl;
  }, [siteSettings]);

  const handleAuthClick = () => {
    const role = localStorage.getItem('user_role');
    const token = localStorage.getItem('auth_token');
    
    if (token && role === 'admin') setIsAdminOpen(true);
    else if (token && role === 'user') setIsUserPanelOpen(true);
    else setIsLoginOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    setIsAdminOpen(false);
    setIsUserPanelOpen(false);
    window.location.reload(); 
  };

  // تشخیص افکت فعال برای کل سایت
  const bgEffect = siteSettings?.backgroundEffect || 'rays-hero';
  const isGlobalRays = bgEffect === 'rays-all';
  const isGlobalGradient = bgEffect === 'gradient-all';
  const isGlobalTubes = bgEffect === 'tubes-all';

  return (
    <div className="bg-black min-h-screen text-white font-sans overflow-x-hidden relative flex flex-col">
      
      {/* 🌟 لایه‌های افکت برای کل سایت 🌟 */}
      {isGlobalRays && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
           <AnimatedRays />
        </div>
      )}
      {isGlobalGradient && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
           <AnimatedGradient />
        </div>
      )}
      {isGlobalTubes && <TubesCursor isGlobal={true} configStr={siteSettings?.tubesConfig} />}
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onOpenAuth={handleAuthClick} settings={siteSettings} onSearch={setSearchQuery} />
        
        <main className="flex-1">
          {/* ارسال نوع افکت به هدر */}
          <Hero3D mediaList={mediaList} onSelectMedia={setSelectedMedia} bgEffect={bgEffect} settings={siteSettings} />
          
          <div className="max-w-7xl mx-auto px-6 mt-12 flex justify-center gap-4" dir="rtl">
            <button onClick={() => setActiveFilter('all')} className={`px-5 py-2 rounded-full text-sm font-bold transition ${activeFilter === 'all' ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>همه آثار</button>
            <button onClick={() => setActiveFilter('video')} className={`px-5 py-2 rounded-full text-sm font-bold transition ${activeFilter === 'video' ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>فوتیج‌ها</button>
            <button onClick={() => setActiveFilter('image')} className={`px-5 py-2 rounded-full text-sm font-bold transition ${activeFilter === 'image' ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>تصاویر</button>
          </div>

          <GallerySection mediaList={mediaList} currency="IRR" activeFilter={activeFilter} onSelectMedia={setSelectedMedia} settings={siteSettings} searchQuery={searchQuery} />
        </main>

        <FooterSection settings={siteSettings} />
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={(role) => { setIsLoginOpen(false); if (role === 'admin') setIsAdminOpen(true); else setIsUserPanelOpen(true); window.location.reload(); }} />
      <ResetPasswordModal isOpen={!!resetToken} resetToken={resetToken} onClose={() => setResetToken('')} onSuccess={() => { setResetToken(''); window.history.replaceState({}, document.title, window.location.pathname); setIsLoginOpen(true); }} />
      <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} onLogout={handleLogout} mediaList={mediaList} onRefreshMedia={fetchData} />
      <UserDashboard isOpen={isUserPanelOpen} onClose={() => setIsUserPanelOpen(false)} onLogout={handleLogout} />
      <CheckoutModal isOpen={!!selectedMedia} item={selectedMedia} currency="IRR" onClose={() => setSelectedMedia(null)} />
    </div>
  );
}

export default App;
