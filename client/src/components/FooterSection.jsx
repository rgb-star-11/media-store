import React, { useState } from 'react';
import axios from 'axios';
import { Send, Loader2, CheckCircle, AlertCircle, Mail, Phone } from 'lucide-react';

export default function FooterSection({ settings }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const MAX_CHARS = 1000;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > MAX_CHARS) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await axios.post('/wp-json/studio/v1/messages/send', formData);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (!settings) return null;

  const year = new Date().getFullYear();
  const copyright = settings.footerCopyright || `© ${year} ${settings.siteName || 'استودیو'} — تمام حقوق محفوظ است.`;

  const aboutTitle = settings.aboutTitle || 'بزرگترین آرشیو تصویری باکیفیت';
  const aboutText = settings.aboutText || 'استودیو ما با سال‌ها تجربه در زمینه فیلم‌برداری، عکاسی و تولید فوتیج‌های باکیفیت 4K، بستر مناسبی برای طراحان، فیلم‌سازان و تولیدکنندگان محتوا فراهم کرده است تا به بهترین دارایی‌های تصویری دسترسی داشته باشند.';

  return (
    <footer id="contact" data-has-about="true" className="w-full bg-black border-t border-zinc-900 py-16 mt-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* بخش درباره استودیو */}
        <div id="about"><h2 className="text-3xl font-black text-white mb-6 leading-tight">
            درباره استودیو <br/>
            <span className="text-amber-500">{aboutTitle}</span>
          </h2>

          <p className="text-zinc-400 text-sm leading-loose mb-8 text-justify">
            {aboutText}
          </p>

          {/* اطلاعات تماس */}
          {(settings.footerContactEmail || settings.footerContactPhone) && (
            <div className="space-y-3 mb-8">
              {settings.footerContactEmail && (
                <a href={`mailto:${settings.footerContactEmail}`} className="flex items-center gap-3 text-sm text-zinc-400 hover:text-amber-400 transition">
                  <Mail size={16} className="text-amber-500 shrink-0" />
                  <span dir="ltr">{settings.footerContactEmail}</span>
                </a>
              )}
              {settings.footerContactPhone && (
                <a href={`tel:${settings.footerContactPhone}`} className="flex items-center gap-3 text-sm text-zinc-400 hover:text-amber-400 transition">
                  <Phone size={16} className="text-amber-500 shrink-0" />
                  <span>{settings.footerContactPhone}</span>
                </a>
              )}
            </div>
          )}

          {/* ویژگی‌ها */}
          {(settings.feature1Title || settings.feature2Title) && (
            <div className="grid grid-cols-2 gap-6 mb-8">
              {settings.feature1Title && (
                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
                  <h4 className="text-white font-black font-mono text-xl mb-1">{settings.feature1Title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{settings.feature1Text}</p>
                </div>
              )}
              {settings.feature2Title && (
                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
                  <h4 className="text-white font-black font-mono text-xl mb-1">{settings.feature2Title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{settings.feature2Text}</p>
                </div>
              )}
            </div>
          )}

          {/* شبکه‌های اجتماعی */}
          {(settings.instagram || settings.youtube || settings.pond5) && (
            <div>
              <p className="text-xs text-zinc-500 mb-4">ما را در شبکه‌های اجتماعی دنبال کنید:</p>
              <div className="flex gap-4">
                {settings.instagram && (
                  <a href={settings.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 bg-zinc-900 hover:bg-amber-500 hover:text-black text-zinc-400 rounded-full flex items-center justify-center transition border border-zinc-800" title="Instagram">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
                {settings.youtube && (
                  <a href={settings.youtube} target="_blank" rel="noreferrer" className="w-12 h-12 bg-zinc-900 hover:bg-amber-500 hover:text-black text-zinc-400 rounded-full flex items-center justify-center transition border border-zinc-800" title="YouTube">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
                {settings.pond5 && (
                  <a href={settings.pond5} target="_blank" rel="noreferrer" className="w-12 h-12 bg-zinc-900 hover:bg-amber-500 hover:text-black text-zinc-400 rounded-full flex items-center justify-center transition border border-zinc-800" title="Pond5">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 3v10h16V7H4zm6 2l6 3-6 3V9z"/></svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* فرم تماس */}
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl h-fit">
          <div className="mb-8">
            <h3 className="text-xl font-black text-white mb-2">ارسال پیام مستقیم</h3>
            <p className="text-xs text-zinc-400">برای سفارش پروژه یا هرگونه سوال، پیام خود را بگذارید.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="نام و نام خانوادگی" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="ایمیل تماس" dir="ltr" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500" />
            </div>

            <div className="relative">
              <textarea name="message" value={formData.message} onChange={handleChange} required maxLength={MAX_CHARS} rows="4" placeholder="متن پیام شما..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pb-8 text-sm text-white outline-none focus:border-amber-500 resize-none"></textarea>
              <div className={`absolute bottom-3 left-4 text-[10px] font-mono ${formData.message.length >= MAX_CHARS ? 'text-amber-500 font-bold' : 'text-zinc-500'}`}>
                {formData.message.length} / {MAX_CHARS}
              </div>
            </div>

            <button type="submit" disabled={status === 'loading' || status === 'success'} className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition ${status === 'success' ? 'bg-green-500 text-black' : status === 'error' ? 'bg-red-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-black'}`}>
              {status === 'loading' && <><Loader2 size={18} className="animate-spin" /><span>در حال ارسال...</span></>}
              {status === 'success' && <><CheckCircle size={18} /><span>پیام ارسال شد!</span></>}
              {status === 'error' && <><AlertCircle size={18} /><span>خطا! دوباره تلاش کنید.</span></>}
              {status === 'idle' && <><Send size={18} /><span>ارسال پیام</span></>}
            </button>
          </form>
        </div>

      </div>

      {/* خط کپی‌رایت */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-zinc-900 text-center">
        <p className="text-xs text-zinc-600">{copyright}</p>
      </div>
    </footer>
  );
}