import React, { useState } from 'react';
import axios from 'axios';
import { Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaType: 'image',
    priceIrr: '',
    priceUsd: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('لطفاً یک فایل انتخاب کنید');

    setLoading(true);
    const data = new FormData();
    data.append('mediaFile', file);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('mediaType', formData.mediaType);
    data.append('priceIrr', formData.priceIrr);
    data.append('priceUsd', formData.priceUsd);
    data.append('tags', formData.tags);

    try {
      await axios.post('/wp-json/studio/v1/media/upload', data);
      onUploadSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('خطا در بارگذاری فایل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute left-4 top-4 text-zinc-400 hover:text-white p-2"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6 text-zinc-100 text-right">آپلود اثر جدید</h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
          {/* محفظه انتخاب فایل */}
          <div className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-4 text-center cursor-pointer transition">
            <input 
              type="file" 
              accept="image/*,video/*" 
              onChange={handleFileChange} 
              className="hidden" 
              id="file-upload" 
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
              {preview ? (
                <img src={preview} alt="پیش‌نمایش" className="max-h-48 rounded-lg object-contain" />
              ) : (
                <>
                  <Upload className="text-zinc-400 w-8 h-8" />
                  <span className="text-sm text-zinc-400">برای انتخاب فایل اصلی کلیک کنید</span>
                </>
              )}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">نوع اثر</label>
              <select 
                value={formData.mediaType}
                onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm"
              >
                <option value="image">عکس (Image)</option>
                <option value="video">فوتیج ویدیو (Footage)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">عنوان اثر</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm"
                placeholder="مثال: کویر لوت در غروب"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">قیمت ریالی (تومان)</label>
              <input 
                type="number" 
                required
                value={formData.priceIrr}
                onChange={(e) => setFormData({ ...formData, priceIrr: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm"
                placeholder="150000"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">قیمت بین‌المللی (USD $)</label>
              <input 
                type="number" 
                required
                value={formData.priceUsd}
                onChange={(e) => setFormData({ ...formData, priceUsd: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm"
                placeholder="15"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">برچسب‌ها (با کاما جدا کنید)</label>
            <input 
              type="text" 
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm"
              placeholder="desert, aerial, 4k, sunset"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold p-3 rounded-xl transition flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'شروع پردازش و انتشار'}
          </button>
        </form>
      </div>
    </div>
  );
}