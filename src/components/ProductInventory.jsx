import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { catalogCategories, categoryImages } from '../data/catalog';
import Pagination from './Pagination';
import { downloadCsv } from '../utils/csv';

export default function ProductInventory() {

  const { products, addProduct, updateProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Local Form Input Parameters
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');

  // Live Catalog Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      return (
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (categoryFilter === 'All' || product.category === categoryFilter)
      );
    });
  }, [products, searchTerm, categoryFilter]);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  // Convert File Input to Base64 Image String Vectors
  const handleImageFile = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(files[0]);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price);
    setStock(product.stock);
    setImage(product.image || '');
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Electronics');
    setPrice('');
    setStock('');
    setImage('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setName('');
    setPrice('');
    setStock('');
    setImage('');
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !stock) return;
    
    const productPic = image || categoryImages[category]?.[0] || '';
    
    if (editingProduct) {
      updateProduct({
        id: editingProduct.id,
        name: name,
        category: category,
        price: Number(price),
        stock: Number(stock),
        image: productPic,
        salesCount: editingProduct.salesCount
      });
    } else {
      addProduct({
        name: name,
        category: category,
        price: Number(price),
        stock: Number(stock),
        image: productPic
      });
    }

    handleCloseModal();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Upper Action Ribbon Banner */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
          <p className="text-sm text-slate-500">Manage product details, pricing, and stock levels.</p>
        </div>
        <div className="page-heading__actions">
          <button type="button" className="secondary-action" onClick={() => downloadCsv('shopmetrics-inventory.csv', [['Product ID', 'Name', 'Category', 'Price', 'Stock', 'Sales', 'Reviews'], ...filteredProducts.map(product => [product.id, product.name, product.category, product.price, product.stock, product.salesCount, product.reviews?.length || 0])])} disabled={!filteredProducts.length}>Export {filteredProducts.length} products</button>
          <button type="button" onClick={openCreateModal} className="primary-action">+ Add product</button>
        </div>
      </div>

      {/* Keyword Search Input Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <input 
          type="text" 
          placeholder="Filter catalog by product title or product category..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
        />
        <div className="inventory-category-toggle">
          {['All', ...catalogCategories].map(option => <button type="button" key={option} onClick={() => { setCategoryFilter(option); setPage(1); }} className={categoryFilter === option ? 'is-active' : ''}>{option}</button>)}
        </div>
      </div>

      {/* Main Data Directory Layout Table */}
      <div className="inventory-table-shell responsive-data-table bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-4">Display Graphic</th>
              <th className="px-6 py-4">ID Reference</th>
              <th className="px-6 py-4">Item Catalog Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Unit Price</th>
              <th className="px-6 py-4 text-right">Stock Count</th>
              <th className="px-6 py-4 text-right">Aggregate Sales</th>
              <th className="px-6 py-4 text-center">Reviews</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {visibleProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                <td data-label="Display graphic" className="px-6 py-3">
                  <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-slate-50" />
                </td>
                <td data-label="ID reference" className="px-6 py-4 font-mono font-bold text-indigo-600 text-xs">{product.id}</td>
                <td data-label="Product" className="px-6 py-4 font-semibold text-slate-800">{product.name}</td>
                <td data-label="Category" className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-200">{product.category}</span>
                </td>
                <td data-label="Unit price" className="px-6 py-4 text-right font-medium text-slate-800">${product.price}</td>
                <td data-label="Stock" className="px-6 py-4 text-right font-medium">
                  <span className={product.stock < 15 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                    {product.stock} units
                  </span>
                </td>
                <td data-label="Sales" className="px-6 py-4 text-right text-slate-500">{product.salesCount} sold</td>
                <td data-label="Reviews" className="px-6 py-4 text-center text-slate-500">{product.reviews?.length || 0}</td>
                <td data-label="Action" className="px-6 py-4 text-center">
                  <button 
                    type="button"
                    onClick={() => openEditModal(product)}
                    className="text-xs bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 font-bold py-1 px-3 rounded-md transition-all shadow-sm"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pageCount} totalItems={filteredProducts.length} pageSize={pageSize} onPageChange={setPage} />

      {/* Unified Management Drawer Configuration Popover Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{editingProduct ? 'Edit product' : 'New product'}</p>
                <h3 className="mt-1 text-xl font-bold text-slate-800">
                  {editingProduct ? editingProduct.name : 'Add inventory product'}
                </h3>
              </div>
              <button type="button" onClick={handleCloseModal} aria-label="Close" className="text-slate-400 hover:text-slate-700 text-xl leading-none focus:outline-none">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Product image</label>
                <div className="flex items-center gap-4 rounded-lg border border-dashed border-slate-300 p-3">
                  {image && <img src={image} alt="Preview" className="w-14 h-14 object-cover rounded-lg border border-slate-200 bg-slate-50" />}
                  <input type="file" accept="image/*" onChange={handleImageFile} className="min-w-0 text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Product name</label>
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white">
                    {catalogCategories.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Unit price ($)</label>
                    <input required min="0" step="0.01" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Stock count</label>
                    <input required min="0" step="1" type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-colors">
                  {editingProduct ? 'Save changes' : 'Add product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
