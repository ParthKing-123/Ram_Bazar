import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Power, PowerOff, Upload, PackagePlus } from 'lucide-react';
import api from '../../services/api';

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const EMPTY_PRODUCT = { name: '', price: '', image: '', unit: '1 Piece', quantity: 1 };
const UNITS = ['1 Piece', '1 Kg', '500 g', '250 g', '1 Dozen', '1 L', '500 ml', '1 Packet'];

const DashboardTab = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Background image for event
  const [bgInputType, setBgInputType] = useState('url');
  const [bgFile, setBgFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    deadline: '',
    image: '',
    isActive: true,
    products: []
  });

  // Current product being added
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [productImgType, setProductImgType] = useState('url');
  const [productImgFile, setProductImgFile] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (eventItem = null) => {
    if (eventItem) {
      setEditingEvent(eventItem);
      const dateVal = eventItem.deadline ? new Date(eventItem.deadline).toISOString().slice(0, 16) : '';
      setFormData({
        name: eventItem.name,
        deadline: dateVal,
        image: eventItem.image || '',
        isActive: eventItem.isActive,
        products: eventItem.products || []
      });
    } else {
      setEditingEvent(null);
      setFormData({ name: '', deadline: '', image: '', isActive: true, products: [] });
    }
    setBgInputType('url');
    setBgFile(null);
    setNewProduct(EMPTY_PRODUCT);
    setProductImgType('url');
    setProductImgFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const uploadFile = async (file) => {
    const data = new FormData();
    data.append('image', file);
    const { data: res } = await api.post('/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.imageUrl;
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Please enter product name and price.');
      return;
    }
    let imgUrl = newProduct.image;
    if (productImgType === 'file' && productImgFile) {
      try { imgUrl = await uploadFile(productImgFile); }
      catch { alert('Image upload failed.'); return; }
    }
    const product = { ...newProduct, image: imgUrl, price: Number(newProduct.price), stock: Number(newProduct.quantity) || 100 };
    setFormData(prev => ({ ...prev, products: [...prev.products, product] }));
    setNewProduct(EMPTY_PRODUCT);
    setProductImgType('url');
    setProductImgFile(null);
  };

  const handleRemoveProduct = (index) => {
    setFormData(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!editingEvent) {
        if (bgInputType === 'file' && !bgFile) { alert('Please select a background image.'); setSubmitting(false); return; }
        if (bgInputType === 'url' && !formData.image) { alert('Please enter an image URL.'); setSubmitting(false); return; }
      }
      let finalBg = formData.image;
      if (bgInputType === 'file' && bgFile) {
        finalBg = await uploadFile(bgFile);
      }
      const payload = { ...formData, image: finalBg };
      if (editingEvent) {
        await api.put(`/events/${editingEvent._id}`, payload);
      } else {
        await api.post('/events', payload);
      }
      fetchData();
      handleCloseModal();
      alert(editingEvent ? 'Event updated!' : 'Event published!');
    } catch (err) {
      console.error(err);
      alert('Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    await api.delete(`/events/${id}`);
    fetchData();
  };

  const toggleActive = async (ev) => {
    await api.put(`/events/${ev._id}`, { isActive: !ev.isActive });
    fetchData();
  };

  if (loading) return <div className="py-8 text-center text-gray-500 animate-pulse">Loading Events...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Festival Special Events</h2>
          <p className="text-sm text-gray-500">Create event banners with custom product lists and deadlines.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Add New Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(ev => (
          <div key={ev._id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white flex flex-col">
            <div className="relative h-36 w-full bg-gray-100 overflow-hidden">
              {ev.image && <img src={getImageUrl(ev.image)} alt={ev.name} className="absolute inset-0 w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
                <h3 className="font-bold text-xl text-white drop-shadow-md text-center">{ev.name}</h3>
              </div>
              <div className="absolute top-2 right-2">
                <button onClick={() => toggleActive(ev)} className={`p-1.5 rounded-full backdrop-blur-md shadow-sm transition-colors ${ev.isActive ? 'bg-green-500/80 text-white' : 'bg-white/80 text-gray-500'}`}>
                  {ev.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="p-4 flex-1">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Deadline</div>
              <div className="text-sm text-gray-700 bg-gray-50 rounded-lg px-2 py-1 mb-3 border border-gray-100">{new Date(ev.deadline).toLocaleString()}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Products ({ev.products.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {ev.products.slice(0, 5).map((p, i) => (
                  <span key={i} className="text-[11px] bg-brand-50 text-brand-700 font-medium px-2 py-1 rounded border border-brand-100 line-clamp-1 max-w-[120px]">{p.name}</span>
                ))}
                {ev.products.length > 5 && <span className="text-[11px] bg-gray-50 text-gray-500 px-2 py-1 rounded border border-gray-100">+{ev.products.length - 5}</span>}
                {ev.products.length === 0 && <span className="text-xs text-gray-400 italic">No products yet.</span>}
              </div>
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => handleOpenModal(ev)} className="text-brand-600 p-1.5 rounded-md hover:bg-brand-100 transition-colors bg-white border border-gray-200 shadow-sm"><Edit2 className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(ev._id)} className="text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors bg-white border border-gray-200 shadow-sm"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <h3 className="text-lg font-medium text-gray-900">No Events Yet</h3>
            <p className="mt-1 text-gray-500">Create your first festival event banner.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen pt-6 px-4 pb-20 sm:pt-10">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full sm:max-w-2xl border border-gray-100">
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">{editingEvent ? 'Edit Event' : 'Create Special Event'}</h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:bg-gray-100 rounded-full p-1.5 transition-colors"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                  {/* Name + Deadline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Event Name</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Gudi Padwa Special" className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Event Deadline</label>
                      <input type="datetime-local" required value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  </div>

                  {/* Background Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Background Image</label>
                    <div className="flex gap-4 mb-3">
                      {['url', 'file'].map(t => (
                        <label key={t} className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" className="form-radio text-brand-600" value={t} checked={bgInputType === t} onChange={() => setBgInputType(t)} />
                          <span className="text-sm text-gray-700">{t === 'url' ? 'Image URL' : 'Upload File'}</span>
                        </label>
                      ))}
                    </div>
                    {bgInputType === 'url' ? (
                      <input type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://example.com/festive-bg.jpg" className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-400" />
                    ) : (
                      <div className="flex justify-center px-6 pt-5 pb-5 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50">
                        <div className="text-center">
                          <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                          <label className="cursor-pointer font-medium text-brand-600 hover:text-brand-500 text-sm">
                            <span>{bgFile ? bgFile.name : 'Upload a file'}</span>
                            <input type="file" className="sr-only" accept="image/*" onChange={e => setBgFile(e.target.files[0])} />
                          </label>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Products Section */}
                  <div className="border-t border-gray-200 pt-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Event Product List</h4>

                    {/* Added products */}
                    {formData.products.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {formData.products.map((p, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
                            {p.image && <img src={getImageUrl(p.image)} className="w-10 h-10 object-cover rounded-lg border border-gray-200" alt="" />}
                            {!p.image && <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">📦</div>}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-gray-900 truncate">{p.name}</div>
                              <div className="text-xs text-gray-500">₹{p.price} / {p.unit}</div>
                            </div>
                            <button type="button" onClick={() => handleRemoveProduct(i)} className="text-red-400 hover:text-red-600 p-1 rounded transition-colors shrink-0"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new product form */}
                    <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 space-y-3">
                      <p className="text-xs font-bold text-brand-700 uppercase tracking-wider">Add a Product for this Event</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
                          <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Festive Gift Box" className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-gray-400" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹) *</label>
                          <input type="number" min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="e.g. 299" className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-gray-400" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                          <select value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Quantity (Stock)</label>
                          <input type="number" min="1" value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} placeholder="e.g. 50" className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-gray-400" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
                          <div className="flex gap-2">
                            <label className="inline-flex items-center gap-1 cursor-pointer text-xs text-gray-600">
                              <input type="radio" className="form-radio text-brand-600 w-3 h-3" value="url" checked={productImgType === 'url'} onChange={() => setProductImgType('url')} />URL
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer text-xs text-gray-600">
                              <input type="radio" className="form-radio text-brand-600 w-3 h-3" value="file" checked={productImgType === 'file'} onChange={() => setProductImgType('file')} />Upload
                            </label>
                          </div>
                          {productImgType === 'url' ? (
                            <input type="url" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="Image URL (optional)" className="mt-1 w-full bg-white text-gray-900 border border-gray-300 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-gray-400" />
                          ) : (
                            <label className="mt-1 flex items-center gap-2 cursor-pointer bg-white border border-gray-300 rounded-xl py-1.5 px-3 text-xs text-brand-600 hover:text-brand-700 transition-colors">
                              <Upload className="w-3 h-3" />
                              <span className="truncate">{productImgFile ? productImgFile.name : 'Choose file'}</span>
                              <input type="file" className="sr-only" accept="image/*" onChange={e => setProductImgFile(e.target.files[0])} />
                            </label>
                          )}
                        </div>
                      </div>
                      <button type="button" onClick={handleAddProduct} className="w-full flex items-center justify-center gap-2 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors">
                        <PackagePlus className="w-4 h-4" /> Add to Event List
                      </button>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
                  <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors shadow-sm">Cancel</button>
                  <button type="submit" disabled={submitting} className={`px-6 py-2.5 rounded-xl text-white font-bold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${submitting ? 'bg-brand-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'}`}>
                    {submitting ? 'Processing...' : (editingEvent ? 'Update Event' : 'Publish Event')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTab;
