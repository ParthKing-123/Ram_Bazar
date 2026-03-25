import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    image: '',
    category: 'Grocery',
    unit: '1 Piece'
  });

  const [inputType, setInputType] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        image: product.image,
        category: product.category || 'Grocery',
        unit: product.unit || '1 Piece'
      });
      setInputType('url');
      setSelectedFile(null);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', stock: '', image: '', category: 'Grocery', unit: '1 Piece' });
      setInputType('url');
      setSelectedFile(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = formData.image;
      
      if (inputType === 'file' && selectedFile) {
        const uploadData = new FormData();
        uploadData.append('image', selectedFile);
        
        // Use regular fetch or axios to upload
        const uploadRes = await api.post('/upload', uploadData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        // The backend returns the image path as a plain string, e.g. "/uploads/image-123.jpg"
        finalImageUrl = `http://localhost:5000${uploadRes.data}`;
      }

      const productPayload = { ...formData, image: finalImageUrl };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, productPayload);
      } else {
        await api.post('/products', productPayload);
      }
      fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-500 animate-pulse">Loading products...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Inventory ({products.length})</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-lg object-cover border border-gray-100" src={product.image} alt="" onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {product.category || 'Grocery'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  ₹{product.price} <span className="text-gray-500 font-normal">/ {product.unit || '1 Piece'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock} in stock
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                      <button onClick={() => handleOpenModal(product)} className="text-brand-600 hover:text-brand-900 p-1 rounded-md hover:bg-brand-50 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {products.length === 0 && (
                <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        No products found. Add one to get started.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Backdrop & Content */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={handleCloseModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500 p-1">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm bg-gray-50 focus:bg-white transition-colors" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                        <input type="number" required min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                        <input type="number" required min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category & Quantity List</label>
                    <div className="grid grid-cols-2 gap-4 mt-1">
                        <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm bg-gray-50 focus:bg-white transition-colors">
                          <option value="Grocery">Grocery</option>
                          <option value="Provision">Provision</option>
                          <option value="Household">Household</option>
                          <option value="Loose Grocery">Loose Grocery</option>
                          <option value="Travel Accessories">Travel Accessories</option>
                        </select>
                        <select required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm bg-gray-50 focus:bg-white transition-colors">
                          <option value="1 kg">1 kg</option>
                          <option value="500 g">500 g</option>
                          <option value="250 g">250 g</option>
                          <option value="1 L">1 L</option>
                          <option value="500 ml">500 ml</option>
                          <option value="1 Dozen">1 Dozen</option>
                          <option value="1 Piece">1 Piece</option>
                          <option value="1 Pack">1 Pack</option>
                        </select>
                    </div>
                  </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Image Source</label>
                        <div className="mt-2 flex items-center space-x-4">
                            <label className="flex items-center">
                            <input type="radio" className="form-radio text-gray-900 focus:ring-gray-900" name="inputType" value="url" checked={inputType === 'url'} onChange={() => setInputType('url')} />
                            <span className="ml-2 text-sm text-gray-700">Web URL</span>
                            </label>
                            <label className="flex items-center">
                            <input type="radio" className="form-radio text-gray-900 focus:ring-gray-900" name="inputType" value="file" checked={inputType === 'file'} onChange={() => setInputType('file')} />
                            <span className="ml-2 text-sm text-gray-700">Upload File</span>
                            </label>
                        </div>
                    </div>

                  <div>
                    {inputType === 'url' ? (
                        <div className="mt-1 flex rounded-xl shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm">
                            <ImageIcon className="h-4 w-4" />
                        </span>
                        <input type="url" required={!editingProduct} value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="flex-1 block w-full border border-gray-200 rounded-none rounded-r-xl py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://example.com/image.jpg" />
                        </div>
                    ) : (
                        <div className="mt-1">
                            <input type="file" required={!editingProduct && inputType === 'file'} accept="image/*" onChange={e => setSelectedFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 transition-colors cursor-pointer" />
                        </div>
                    )}
                  </div>

                  <div className="pt-4 flex gap-3 sm:flex-row-reverse">
                    <button type="submit" className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-gray-900 text-base font-medium text-white hover:bg-black focus:outline-none sm:w-auto sm:text-sm transition-colors">
                      {editingProduct ? 'Save Changes' : 'Add Product'}
                    </button>
                    <button type="button" onClick={handleCloseModal} className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-200 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
