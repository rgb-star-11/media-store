import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X, Upload, Trash2, Edit2, CheckCircle, Mail, Image as ImageIcon,
  Check, Reply, Settings as SettingsIcon, Plus, LogOut, Users, KeyRound,
  Layout, Layers, AlignLeft, Hash
} from 'lucide-react';

const inp = "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500";
const lbl = "block text-xs text-zinc-400 mb-2";
const card = "bg-zinc-900/40 p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-xl";

export default function AdminDashboard({ isOpen, onClose, onLogout, mediaList, onRefreshMedia }) {
  const [activeTab, setActiveTab] = useState('media');
  const [settingsSubTab, setSettingsSubTab] = useState('general');
  const [messages, setMessages] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [passwordValues, setPasswordValues] = useState({});
  const [siteSettings, setSiteSettings] = useState({
    siteName: '', logoUrl: '', tabTitle: '', faviconUrl: '',
    navLinks: [], backgroundEffect: 'rays-hero',
    heroBadgeText: '', heroTitle: '', heroTitleAccent: '', heroSubtitle: '',
    heroPrimaryBtnText: '', heroPrimaryBtnLink: '',
    heroSecondaryBtnText: '', heroSecondaryBtnLink: '',
    gallerySectionId: 'gallery', galleryTitle: '', gallerySubtitle: '',
    aboutTitle: '', aboutText: '',
    feature1Title: '', feature1Text: '', feature2Title: '', feature2Text: '',
    instagram: '', youtube: '', pond5: '',
    footerCopyright: '', footerContactEmail: '', footerContactPhone: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [priceIrr, setPriceIrr] = useState('');
  const [pond5Link, setPond5Link] = useState('');
  const [pond5Preview, setPond5Preview] = useState('');
  const [cameraModel, setCameraModel] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'messages') fetchMessages();
      if (activeTab === 'settings') fetchSettings();
      if (activeTab === 'users') fetchUsers();
    }
  }, [isOpen, activeTab]);

  const fetchMessages = async () => {
    try { const res = await axios.get('/wp-json/studio/v1/messages'); setMessages(res.data); } catch (err) {}
  };
  const markAsRead = async (id) => {
    try { await axios.put(`/wp-json/studio/v1/messages/${id}/read`); fetchMessages(); } catch (err) {}
  };
  const handleDeleteMessage = async (id) => {
    if (!window.confirm('این پیام حذف شود؟')) return;
    try { await axios.delete(`/wp-json/studio/v1/messages/${id}`); fetchMessages(); } catch (err) {}
  };
  const fetchUsers = async () => {
    try { const res = await axios.get('/wp-json/studio/v1/users'); setUsersList(res.data); } catch (err) {}
  };
  const handlePasswordChange = async (userId) => {
    const newPass = passwordValues[userId];
    if (!newPass || newPass.length < 6) return alert('رمز عبور باید حداقل 6 کاراکتر باشد');
    try {
      await axios.put(`/wp-json/studio/v1/users/${userId}/password`, { newPassword: newPass });
      alert('رمز عبور تغییر کرد');
      setPasswordValues({ ...passwordValues, [userId]: '' });
    } catch (err) { alert('خطا در تغییر رمز'); }
  };
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('این کاربر حذف شود؟')) return;
    try { await axios.delete(`/wp-json/studio/v1/users/${userId}`); alert('کاربر حذف شد'); fetchUsers(); }
    catch (err) { alert(err.response?.data?.error || 'خطا در حذف کاربر'); }
  };
  const fetchSettings = async () => {
    try { const res = await axios.get('/wp-json/studio/v1/settings'); if (res.data) setSiteSettings(res.data); } catch (err) {}
  };
  const set = (key, val) => setSiteSettings(prev => ({ ...prev, [key]: val }));

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    const fd = new FormData();
    [
      'siteName','tabTitle','backgroundEffect','tubesConfig','instagram','youtube','pond5',
      'aboutTitle','aboutText','feature1Title','feature1Text','feature2Title','feature2Text',
      'heroBadgeText','heroTitle','heroTitleAccent','heroSubtitle',
      'heroPrimaryBtnText','heroPrimaryBtnLink','heroSecondaryBtnText','heroSecondaryBtnLink',
      'gallerySectionId','galleryTitle','gallerySubtitle',
      'footerCopyright','footerContactEmail','footerContactPhone'
    ].forEach(f => fd.append(f, siteSettings[f] || ''));
    fd.append('navLinks', JSON.stringify(siteSettings.navLinks || []));
    if (logoFile) fd.append('logoFile', logoFile);
    if (faviconFile) fd.append('faviconFile', faviconFile);
    try {
      await axios.put('/wp-json/studio/v1/settings', fd);
      alert('تنظیمات با موفقیت ذخیره شد!');
      setLogoFile(null); setFaviconFile(null); fetchSettings(); onRefreshMedia();
    } catch (err) { alert('خطا در ذخیره تنظیمات'); }
    finally { setIsUploading(false); }
  };

  const handleAddNavLink = () => setSiteSettings(p => ({ ...p, navLinks: [...(p.navLinks || []), { title: '', path: '' }] }));
  const handleUpdateNavLink = (i, f, v) => { const nl = [...siteSettings.navLinks]; nl[i][f] = v; setSiteSettings(p => ({ ...p, navLinks: nl })); };
  const handleRemoveNavLink = (i) => { const nl = [...siteSettings.navLinks]; nl.splice(i, 1); setSiteSettings(p => ({ ...p, navLinks: nl })); };
  const resetForm = () => { setEditingId(null); setFile(null); setTitle(''); setMediaType('image'); setPriceIrr(''); setPond5Link(''); setPond5Preview(''); setCameraModel(''); setLocation(''); setTags(''); };
  const handleEditClick = (item) => {
    setEditingId(item._id); setTitle(item.title || ''); setMediaType(item.mediaType);
    setPriceIrr(item.price?.irr || ''); setCameraModel(item.metadata?.cameraModel || '');
    setLocation(item.metadata?.location || ''); setPond5Link(item.metadata?.pond5StoreLink || '');
    setPond5Preview('');
    setTags(item.tags ? item.tags.map(t => '#' + t).join(' ') : '');
  };

  const handleMediaSubmit = async (e) => {
    e.preventDefault(); setIsUploading(true);
    try {
      if (editingId) {
        const fd = new FormData();
        fd.append('title', title); fd.append('priceIrr', priceIrr);
        fd.append('cameraModel', cameraModel); fd.append('location', location);
        fd.append('tags', tags);
        if (mediaType === 'video') fd.append('pond5Link', pond5Link);
        await axios.put(`/wp-json/studio/v1/media/${editingId}`, fd);
        alert('تغییرات ذخیره شد');
      } else {
        if (!file) return alert('فایل اصلی انتخاب نشده');
        const fd = new FormData();
        fd.append('mediaFile', file); fd.append('title', title);
        fd.append('mediaType', mediaType); fd.append('priceIrr', priceIrr);
        fd.append('cameraModel', cameraModel); fd.append('location', location);
        fd.append('tags', tags);
        if (mediaType === 'video') { fd.append('pond5Link', pond5Link); fd.append('pond5Preview', pond5Preview); }
        await axios.post('/wp-json/studio/v1/media/upload', fd);
        alert('اثر با موفقیت منتشر شد');
      }
      resetForm(); onRefreshMedia();
    } catch (err) { alert('خطا در پردازش اطلاعات'); }
    finally { setIsUploading(false); }
  };

  const handleDeleteMedia = async (id) => {
    if (!window.confirm('این اثر حذف شود؟')) return;
    try { await axios.delete(`/wp-json/studio/v1/media/${id}`); onRefreshMedia(); } catch (err) {}
  };

  if (!isOpen) return null;

  const subTabs = [
    { id: 'general', label: 'عمومی', icon: <SettingsIcon size={15}/> },
    { id: 'hero', label: 'هیرو', icon: <Layout size={15}/> },
    { id: 'gallery', label: 'گالری', icon: <Layers size={15}/> },
    { id: 'footer', label: 'درباره استودیو و فوتر', icon: <AlignLeft size={15}/> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">

        {/* Header / Main Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-zinc-800 gap-4">
          <div className="flex items-center gap-6 w-full md:w-auto overflow-x-auto">
            <h2 className="text-xl font-black text-amber-500 hidden sm:block">مدیریت استودیو</h2>
            <div className="flex bg-zinc-900 rounded-lg p-1 flex-nowrap whitespace-nowrap gap-1">
              {[
                { id:'media',    label:'مدیریت آثار',  icon:<ImageIcon size={16}/> },
                { id:'messages', label:'پیام‌ها',       icon:<Mail size={16}/> },
                { id:'users',    label:'اعضا',          icon:<Users size={16}/> },
                { id:'settings', label:'تنظیمات سایت', icon:<SettingsIcon size={16}/> },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === t.id ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}>
                  {t.icon} {t.label}
                  {t.id === 'messages' && messages.filter(m => !m.isRead).length > 0 && (
                    <span className="bg-amber-500 text-black text-[10px] px-1.5 py-0.5 rounded-full">{messages.filter(m => !m.isRead).length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 absolute top-6 left-6 md:relative md:top-auto md:left-auto">
            <button onClick={onClose} className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition"><X size={18}/></button>
            <button onClick={onLogout} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition border border-red-500/20"><LogOut size={14}/> خروج</button>
          </div>
        </div>

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            <div className="w-full md:w-1/3 border-l border-zinc-800 p-6 bg-zinc-900/30 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold">{editingId ? 'ویرایش اثر' : 'آپلود جدید'}</h3>
                {editingId && <button onClick={resetForm} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded">انصراف</button>}
              </div>
              <form onSubmit={handleMediaSubmit} className="space-y-4">
                {!editingId && (
                  <div>
                    <label className={lbl}>نوع اثر</label>
                    <select value={mediaType} onChange={e => setMediaType(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500">
                      <option value="image">عکس / پرتره / منظره</option>
                      <option value="video">فوتیج ویدیویی (لینک Pond5)</option>
                    </select>
                  </div>
                )}
                <div><label className={lbl}>عنوان اثر</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inp} required/></div>
                <div>
                  <label className={lbl}>هشتگ‌ها / کلیدواژه‌ها (با # یا فاصله)</label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)} className={inp} placeholder="#طبیعت #پرتره #شمال"/>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1"><label className={lbl}>مدل دوربین</label><input type="text" value={cameraModel} onChange={e => setCameraModel(e.target.value)} className={inp}/></div>
                  <div className="flex-1"><label className={lbl}>مکان ضبط</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} className={inp}/></div>
                </div>
                {mediaType === 'video' && (
                  <>
                    <div><label className={lbl}>لینک صفحه Pond5</label><input type="url" value={pond5Link} onChange={e => setPond5Link(e.target.value)} className={inp + " font-mono"} required dir="ltr"/></div>
                    {!editingId && <div><label className={lbl}>لینک مستقیم پیش‌نمایش mp4</label><input type="url" value={pond5Preview} onChange={e => setPond5Preview(e.target.value)} className={inp + " font-mono border-amber-500/50"} required dir="ltr"/></div>}
                  </>
                )}
                <div><label className={lbl}>قیمت فروش (تومان)</label><input type="number" value={priceIrr} onChange={e => setPriceIrr(e.target.value)} className={inp + " font-mono"} required/></div>
                {!editingId && (
                  <div>
                    <label className="block text-xs text-amber-500 mb-1.5 font-bold">فایل اصلی با کیفیت بالا</label>
                    <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:bg-zinc-800 file:text-amber-400" accept={mediaType === 'image' ? 'image/*' : 'video/*'} required/>
                  </div>
                )}
                <button type="submit" disabled={isUploading} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3.5 rounded-xl mt-4 flex items-center justify-center gap-2">
                  {editingId ? <CheckCircle size={18}/> : <Upload size={18}/>}
                  <span>{isUploading ? 'در حال پردازش...' : (editingId ? 'ثبت تغییرات' : 'آپلود و انتشار')}</span>
                </button>
              </form>
            </div>
            <div className="w-full md:w-2/3 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {mediaList.map(item => (
                  <div key={item._id} className={`bg-zinc-900/50 border ${editingId === item._id ? 'border-amber-500' : 'border-zinc-800'} rounded-xl p-3 flex gap-4 items-center`}>
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0">
                      {item.mediaType === 'video'
                        ? <video src={`${item.previewUrl}#t=2`} className="w-full h-full object-cover" preload="metadata"/>
                        : <img src={item.previewUrl} alt={item.title} className="w-full h-full object-cover"/>}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-sm text-white font-bold truncate mb-1">{item.title}</h4>
                      <span className="text-xs text-zinc-400 font-mono">{Number(item.price?.irr).toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleEditClick(item)} className="p-1.5 text-blue-400 bg-blue-500/10 hover:bg-blue-500 hover:text-white rounded-md transition"><Edit2 size={14}/></button>
                      <button onClick={() => handleDeleteMedia(item._id)} className="p-1.5 text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-md transition"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
            {messages.length === 0
              ? <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3"><Mail size={40} className="opacity-20"/><p className="text-sm">هیچ پیامی دریافت نشده.</p></div>
              : <div className="grid gap-4 max-w-4xl mx-auto">
                  {messages.map(msg => (
                    <div key={msg._id} className={`p-6 rounded-2xl border transition ${msg.isRead ? 'bg-zinc-900/30 border-zinc-800' : 'bg-zinc-900 border-amber-500/30 shadow-lg shadow-amber-500/5'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div><h4 className="text-white font-bold text-lg">{msg.name}</h4><p className="text-xs font-mono text-zinc-400 mt-1" dir="ltr">{msg.email}</p></div>
                        <div className="text-[11px] text-zinc-500 font-mono bg-black/30 px-3 py-1.5 rounded-full border border-white/5">{new Date(msg.createdAt).toLocaleDateString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div className="bg-black/40 p-5 rounded-xl border border-white/5 mb-5 max-h-52 overflow-y-auto"><p className="text-sm text-zinc-300 leading-loose whitespace-pre-wrap break-words">{msg.message}</p></div>
                      <div className="flex items-center justify-end gap-3">
                        {!msg.isRead && <button onClick={() => markAsRead(msg._id)} className="flex items-center gap-1.5 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2.5 rounded-lg transition"><Check size={14}/> خوانده شد</button>}
                        <a href={`mailto:${msg.email}?subject=پاسخ استودیو`} className="flex items-center gap-1.5 text-xs font-bold bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2.5 rounded-lg transition"><Reply size={14}/> پاسخ دادن</a>
                        <button onClick={() => handleDeleteMessage(msg._id)} className="flex items-center gap-1.5 text-xs font-bold bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2.5 rounded-lg transition"><Trash2 size={14}/> حذف</button>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-zinc-950">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-xl font-black text-white mb-6">مدیریت اعضای سایت</h3>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right text-zinc-300">
                    <thead className="text-xs text-zinc-500 bg-zinc-900 border-b border-zinc-800">
                      <tr>
                        <th className="px-6 py-4 font-bold">نام کاربر</th>
                        <th className="px-6 py-4 font-bold">موبایل / ایمیل</th>
                        <th className="px-6 py-4 font-bold">نقش</th>
                        <th className="px-6 py-4 font-bold text-center">مدیریت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map(user => (
                        <tr key={user._id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition">
                          <td className="px-6 py-4 font-bold text-white">{user.firstName} {user.lastName}<br/><span className="text-[10px] text-zinc-500 font-normal">عضویت: {new Date(user.createdAt).toLocaleDateString('fa-IR')}</span></td>
                          <td className="px-6 py-4"><div className="font-mono text-sm mb-1" dir="ltr">{user.mobile || '---'}</div><div className="text-zinc-500 font-mono text-xs">{user.email}</div></td>
                          <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{user.role === 'admin' ? 'مدیر کل' : 'کاربر عادی'}</span></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <input type="text" placeholder="رمز جدید..." value={passwordValues[user._id] || ''} onChange={e => setPasswordValues({...passwordValues, [user._id]: e.target.value})} className="w-28 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-amber-500 font-mono text-center"/>
                              <button onClick={() => handlePasswordChange(user._id)} className="p-1.5 bg-zinc-800 hover:bg-amber-500 text-zinc-400 hover:text-black rounded-lg transition"><KeyRound size={16}/></button>
                              {user.role !== 'admin' && <button onClick={() => handleDeleteUser(user._id)} className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition"><Trash2 size={16}/></button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && siteSettings && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex gap-1 p-4 border-b border-zinc-800 bg-zinc-900/50 overflow-x-auto shrink-0">
              {subTabs.map(t => (
                <button key={t.id} onClick={() => setSettingsSubTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${settingsSubTab === t.id ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-zinc-950">
              <form onSubmit={handleSettingsSave} className="max-w-4xl mx-auto space-y-8">

                {settingsSubTab === 'general' && <>
                  <div className={card}>
                    <h3 className="text-white font-black mb-6 flex items-center gap-2 text-lg"><SettingsIcon size={20} className="text-amber-500"/> هویت و لوگوی سایت</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className={lbl}>نام سایت (نمایش در هدر)</label><input type="text" value={siteSettings.siteName||''} onChange={e=>set('siteName',e.target.value)} className={inp} placeholder="استودیو من"/></div>
                      <div><label className={lbl}>عنوان تب مرورگر</label><input type="text" maxLength="100" value={siteSettings.tabTitle||''} onChange={e=>set('tabTitle',e.target.value)} className={inp} placeholder="استودیو من | فوتیج"/></div>
                      <div>
                        <label className={lbl}>آپلود لوگوی سایت (PNG/SVG)</label>
                        <div className="flex gap-2 items-center">
                          <input type="file" onChange={e=>setLogoFile(e.target.files[0])} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-zinc-800 file:text-amber-400" accept="image/*"/>
                          {siteSettings.logoUrl && <button type="button" onClick={()=>set('logoUrl','')} className="px-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-xs font-bold transition whitespace-nowrap">حذف لوگو</button>}
                        </div>
                      </div>
                      <div><label className={lbl}>آیکون تب (PNG/ICO/SVG)</label><input type="file" onChange={e=>setFaviconFile(e.target.files[0])} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-zinc-800 file:text-amber-400" accept="image/png,image/x-icon,image/svg+xml"/></div>
                    </div>
                  </div>

                  <div className={card}>
                    <h3 className="text-white font-black mb-6 text-lg">افکت متحرک پس‌زمینه</h3>
                    <div className="flex flex-col gap-4 bg-zinc-950 p-5 rounded-xl border border-zinc-800">
                      {[
                        ['none','غیرفعال (بدون افکت)','text-zinc-300'],
                        ['rays-hero','افکت نوری Aurora - فقط هدر (پیش‌فرض)','text-blue-300'],
                        ['rays-all','افکت نوری Aurora - کل سایت','text-blue-300'],
                        ['gradient-hero','گرادیانت متحرک - فقط هدر','text-purple-300'],
                        ['gradient-all','گرادیانت متحرک - کل سایت','text-purple-300'],
                        ['tubes-hero','افکت سه‌بعدی تیوب متحرک (Tubes Cursor) - فقط هدر','text-amber-300'],
                        ['tubes-all','افکت سه‌بعدی تیوب متحرک (Tubes Cursor) - کل سایت','text-amber-300']
                      ].map(([val,label,cls],i)=>(
                        <React.Fragment key={val}>
                          {(i===1||i===3||i===5)&&<hr className="border-zinc-800"/>}
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="radio" name="backgroundEffect" value={val} checked={(siteSettings.backgroundEffect||'rays-hero')===val} onChange={e=>set('backgroundEffect',e.target.value)} className="w-4 h-4 accent-amber-500"/>
                            <span className={`text-sm font-bold ${cls}`}>{label}</span>
                          </label>
                        </React.Fragment>
                      ))}
                    </div>

                    {(siteSettings.backgroundEffect === 'tubes-hero' || siteSettings.backgroundEffect === 'tubes-all') && (
                      <div className="mt-6 space-y-3 bg-zinc-950 p-5 rounded-2xl border border-amber-500/30">
                        <label className="block text-xs font-bold text-amber-400">
                          تنظیمات کد Tubes Cursor (فرمت JSON / پیکربندی رنگ‌ها و نور)
                        </label>
                        <textarea
                          rows="8"
                          dir="ltr"
                          value={siteSettings.tubesConfig || JSON.stringify({
                            tubes: {
                              colors: ["#5e72e4", "#8965e0", "#f5365c"],
                              lights: {
                                intensity: 200,
                                colors: ["#21d4fd", "#b721ff", "#f4d03f", "#11cdef"]
                              }
                            }
                          }, null, 2)}
                          onChange={e => set('tubesConfig', e.target.value)}
                          className={inp + " font-mono text-xs text-amber-200 leading-relaxed"}
                          placeholder="کد تنظیمات را وارد کنید..."
                        />
                        <p className="text-[11px] text-zinc-500">
                          می‌توانید رنگ‌های تیوب‌ها، شدت نور و رنگ‌های نوری را ویرایش کنید. پس از ذخیره، کد جدید اعمال می‌شود.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={card}>
                    <h3 className="text-white font-black mb-6 text-lg">منوی بالای سایت (Navigation)</h3>
                    <div className="space-y-4">
                      {siteSettings.navLinks?.map((link,index)=>(
                        <div key={index} className="flex gap-4 items-center bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                          <div className="flex-1"><label className="block text-[10px] text-zinc-500 mb-1">عنوان منو</label><input type="text" value={link.title} onChange={e=>handleUpdateNavLink(index,'title',e.target.value)} className="w-full bg-transparent text-sm text-white outline-none border-b border-zinc-700 pb-1 focus:border-amber-500"/></div>
                          <div className="flex-1"><label className="block text-[10px] text-zinc-500 mb-1">لینک (مثل #gallery یا #about)</label><input type="text" dir="ltr" value={link.path} onChange={e=>handleUpdateNavLink(index,'path',e.target.value)} className="w-full bg-transparent text-sm text-white outline-none border-b border-zinc-700 pb-1 focus:border-amber-500 text-left font-mono"/></div>
                          <button type="button" onClick={()=>handleRemoveNavLink(index)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white mt-4 transition"><Trash2 size={16}/></button>
                        </div>
                      ))}
                      <button type="button" onClick={handleAddNavLink} className="flex items-center gap-2 text-sm text-amber-500 font-bold bg-amber-500/10 hover:bg-amber-500/20 px-4 py-3 rounded-xl transition w-full justify-center"><Plus size={16}/> افزودن منوی جدید</button>
                    </div>
                  </div>

                  <div className={card}>
                    <h3 className="text-white font-black mb-6 text-lg">شبکه‌های اجتماعی</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div><label className={lbl}>اینستاگرام</label><input type="url" dir="ltr" value={siteSettings.instagram||''} onChange={e=>set('instagram',e.target.value)} className={inp+" font-mono"} placeholder="https://instagram.com/..."/></div>
                      <div><label className={lbl}>یوتیوب</label><input type="url" dir="ltr" value={siteSettings.youtube||''} onChange={e=>set('youtube',e.target.value)} className={inp+" font-mono"} placeholder="https://youtube.com/..."/></div>
                      <div><label className={lbl}>Pond5</label><input type="url" dir="ltr" value={siteSettings.pond5||''} onChange={e=>set('pond5',e.target.value)} className={inp+" font-mono"} placeholder="https://pond5.com/..."/></div>
                    </div>
                  </div>
                </>}

                {settingsSubTab === 'hero' && <>
                  <div className={card}>
                    <h3 className="text-white font-black mb-6 flex items-center gap-2 text-lg"><Layout size={20} className="text-amber-500"/> متن بخش هیرو</h3>
                    <div className="space-y-5">
                      <div><label className={lbl}>متن بج (نوار کوچک بالای عنوان)</label><input type="text" value={siteSettings.heroBadgeText||''} onChange={e=>set('heroBadgeText',e.target.value)} className={inp} placeholder="بانک تصویری حرفه‌ای"/></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div><label className={lbl}>عنوان هیرو — خط اول</label><input type="text" value={siteSettings.heroTitle||''} onChange={e=>set('heroTitle',e.target.value)} className={inp} placeholder="خلق قاب‌هایی که"/></div>
                        <div><label className={lbl}>عنوان هیرو — خط دوم (طلایی)</label><input type="text" value={siteSettings.heroTitleAccent||''} onChange={e=>set('heroTitleAccent',e.target.value)} className={inp} placeholder="داستان می‌گویند"/></div>
                      </div>
                      <div><label className={lbl}>توضیح زیر عنوان</label><textarea rows="3" value={siteSettings.heroSubtitle||''} onChange={e=>set('heroSubtitle',e.target.value)} className={inp+" resize-none leading-loose"} placeholder="توضیح کوتاه..."/></div>
                    </div>
                  </div>
                  <div className={card}>
                    <h3 className="text-white font-black mb-6 text-lg">دکمه‌های هیرو</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
                        <h4 className="text-amber-400 font-bold text-sm">دکمه اول (اصلی)</h4>
                        <div><label className={lbl}>متن دکمه</label><input type="text" value={siteSettings.heroPrimaryBtnText||''} onChange={e=>set('heroPrimaryBtnText',e.target.value)} className={inp} placeholder="مشاهده گالری"/></div>
                        <div><label className={lbl}>لینک دکمه</label><input type="text" dir="ltr" value={siteSettings.heroPrimaryBtnLink||''} onChange={e=>set('heroPrimaryBtnLink',e.target.value)} className={inp+" font-mono"} placeholder="#gallery"/></div>
                      </div>
                      <div className="space-y-4 bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
                        <h4 className="text-zinc-400 font-bold text-sm">دکمه دوم (ثانویه)</h4>
                        <div><label className={lbl}>متن دکمه</label><input type="text" value={siteSettings.heroSecondaryBtnText||''} onChange={e=>set('heroSecondaryBtnText',e.target.value)} className={inp} placeholder="درباره ما"/></div>
                        <div><label className={lbl}>لینک دکمه</label><input type="text" dir="ltr" value={siteSettings.heroSecondaryBtnLink||''} onChange={e=>set('heroSecondaryBtnLink',e.target.value)} className={inp+" font-mono"} placeholder="#about"/></div>
                      </div>
                    </div>
                  </div>
                  <div className={card}>
                    <h3 className="text-white font-black mb-6 text-lg flex items-center gap-2">
                      <Layout size={20} className="text-amber-500"/> ویرایش کد و پیکربندی اختصاصی هیرو
                    </h3>
                    <div className="space-y-4 bg-zinc-950 p-5 rounded-2xl border border-amber-500/30">
                      <label className={lbl}>کد / اسکریپت / پیکربندی سفارشی هیرو</label>
                      <textarea
                        rows="6"
                        dir="ltr"
                        value={siteSettings.heroConfig || ''}
                        onChange={e => set('heroConfig', e.target.value)}
                        className={inp + " font-mono text-xs text-amber-200 leading-relaxed"}
                        placeholder="// وارد کردن کد یا تنظیمات اختصاصی هیرو..."
                      />
                      <p className="text-[11px] text-zinc-500">
                        از این بخش می‌توانید کدها یا تنظیمات سفارشی بخش هیرو را تغییر دهید و ذخیره کنید.
                      </p>
                    </div>
                  </div>
                </>}

                {settingsSubTab === 'gallery' && <>
                  <div className={card}>
                    <h3 className="text-white font-black mb-6 flex items-center gap-2 text-lg"><Layers size={20} className="text-amber-500"/> تنظیمات بخش گالری</h3>
                    <div className="space-y-5">
                      <div>
                        <label className={lbl}>آی‌دی anchor بخش گالری</label>
                        <input type="text" dir="ltr" value={siteSettings.gallerySectionId||'gallery'} onChange={e=>set('gallerySectionId',e.target.value)} className={inp+" font-mono"} placeholder="gallery"/>
                        <p className="text-xs text-zinc-500 mt-1">لینک‌های navbar مثل <code className="text-amber-500">#gallery</code> به این بخش اسکرول می‌کنند</p>
                      </div>
                      <div><label className={lbl}>عنوان بخش گالری</label><input type="text" value={siteSettings.galleryTitle||''} onChange={e=>set('galleryTitle',e.target.value)} className={inp} placeholder="آرشیو آثار و تولیدات"/></div>
                      <div><label className={lbl}>توضیح بخش گالری</label><input type="text" value={siteSettings.gallerySubtitle||''} onChange={e=>set('gallerySubtitle',e.target.value)} className={inp} placeholder="جهت مشاهده پیش‌نمایش روی هر اثر کلیک کنید"/></div>
                    </div>
                  </div>
                </>}

                {settingsSubTab === 'footer' && <>
                  <div className={card}>
                    <h3 className="text-white font-black mb-6 flex items-center gap-2 text-lg"><AlignLeft size={20} className="text-amber-500"/> اطلاعات تماس و کپی‌رایت</h3>
                    <div className="space-y-5">
                      <div><label className={lbl}>ایمیل تماس</label><input type="email" dir="ltr" value={siteSettings.footerContactEmail||''} onChange={e=>set('footerContactEmail',e.target.value)} className={inp+" font-mono"} placeholder="info@example.com"/></div>
                      <div><label className={lbl}>شماره تلفن</label><input type="text" value={siteSettings.footerContactPhone||''} onChange={e=>set('footerContactPhone',e.target.value)} className={inp} placeholder="021-12345678"/></div>
                      <div><label className={lbl}>متن کپی‌رایت</label><input type="text" value={siteSettings.footerCopyright||''} onChange={e=>set('footerCopyright',e.target.value)} className={inp} placeholder={`© ${new Date().getFullYear()} استودیو من`}/></div>
                    </div>
                  </div>
                  <div className={card}>
                    <h3 className="text-white font-black mb-6 text-lg">متن درباره استودیو</h3>
                    <div className="space-y-5">
                      <div><label className={lbl}>عنوان</label><input type="text" value={siteSettings.aboutTitle||''} onChange={e=>set('aboutTitle',e.target.value)} className={inp} placeholder="عنوان بخش درباره"/></div>
                      <div><label className={lbl}>توضیحات</label><textarea rows="5" value={siteSettings.aboutText||''} onChange={e=>set('aboutText',e.target.value)} className={inp+" resize-none leading-loose"} placeholder="درباره استودیو..."/></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                          <h4 className="text-zinc-300 font-bold text-sm">ویژگی اول</h4>
                          <input type="text" value={siteSettings.feature1Title||''} onChange={e=>set('feature1Title',e.target.value)} className={inp} placeholder="4K UHD"/>
                          <input type="text" value={siteSettings.feature1Text||''} onChange={e=>set('feature1Text',e.target.value)} className={inp} placeholder="توضیح کوتاه"/>
                        </div>
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                          <h4 className="text-zinc-300 font-bold text-sm">ویژگی دوم</h4>
                          <input type="text" value={siteSettings.feature2Title||''} onChange={e=>set('feature2Title',e.target.value)} className={inp} placeholder="Hi-Res RAW"/>
                          <input type="text" value={siteSettings.feature2Text||''} onChange={e=>set('feature2Text',e.target.value)} className={inp} placeholder="توضیح کوتاه"/>
                        </div>
                      </div>
                    </div>
                  </div>
                </>}

                <button type="submit" disabled={isUploading} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                  {isUploading ? <><CheckCircle size={20} className="animate-spin"/> در حال ذخیره...</> : <><CheckCircle size={20}/> ذخیره و اعمال تنظیمات</>}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
