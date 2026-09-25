import { useState, useMemo } from 'react';
import { useStore } from '../context/useStore';
import { catalogCategories, categoryImages } from '../data/catalog';
import Pagination from './Pagination';
import { downloadCsv } from '../utils/csv';

const parseCsv = (source) => {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const text = source.replace(/^\uFEFF/, '');
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some(value => value.trim())) rows.push(row);
      row = []; cell = '';
    } else cell += character;
  }
  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);
  return rows;
};

export default function ProductInventory({ lowStockOnly = false, onClearLowStockFilter }) {

  const { products, addProduct, updateProduct, archiveProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [selectedIds, setSelectedIds] = useState([]);
  const [restockAmount, setRestockAmount] = useState(10);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Local Form Input Parameters
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(15);
  const [formError, setFormError] = useState('');
  const [importMessage, setImportMessage] = useState('');

  // Live Catalog Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      return (
        Boolean(product.isArchived) === showArchived &&
        (!lowStockOnly || product.stock <= 0 || product.stock < (product.lowStockThreshold ?? 15)) &&
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (categoryFilter === 'All' || product.category === categoryFilter)
      );
    }).sort((a, b) => {
      if (sortBy === 'stock-low') return a.stock - b.stock;
      if (sortBy === 'stock-high') return b.stock - a.stock;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
  }, [products, searchTerm, categoryFilter, lowStockOnly, showArchived, sortBy]);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Convert File Input to Base64 Image String Vectors
  const handleImageFile = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files[0].size > 5_000_000) {
      setFormError('Choose an image smaller than 5 MB.');
      e.target.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onerror = () => setFormError('The selected image could not be read.');
    reader.onload = () => {
      const source = new Image();
      source.onerror = () => setFormError('Choose a valid image file.');
      source.onload = () => {
        const scale = Math.min(1, 800 / Math.max(source.width, source.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(source.width * scale));
        canvas.height = Math.max(1, Math.round(source.height * scale));
        const context = canvas.getContext('2d');
        if (!context) { setFormError('Image processing is unavailable in this browser.'); return; }
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        const compressedImage = canvas.toDataURL('image/jpeg', 0.75);
        if (compressedImage.length > 350_000) { setFormError('This image is still too large after compression. Choose a smaller image.'); return; }
        setImage(compressedImage);
        setFormError('');
      };
      source.src = String(reader.result);
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
    setLowStockThreshold(product.lowStockThreshold ?? 15);
    setFormError('');
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Electronics');
    setPrice('');
    setStock('');
    setImage('');
    setLowStockThreshold(15);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setName('');
    setPrice('');
    setStock('');
    setImage('');
    setLowStockThreshold(15);
    setFormError('');
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || price === '' || stock === '' || !Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isInteger(Number(stock)) || Number(stock) < 0 || !Number.isInteger(Number(lowStockThreshold)) || Number(lowStockThreshold) < 0) {
      setFormError('Enter a product name, a valid non-negative price, whole stock units, and a whole-number restock threshold.');
      return;
    }
    
    const productPic = image || categoryImages[category]?.[0] || '';
    
    if (editingProduct) {
      updateProduct({
        id: editingProduct.id,
        name: name,
        category: category,
        price: Number(price),
        stock: Number(stock),
        lowStockThreshold: Number(lowStockThreshold),
        isArchived: editingProduct.isArchived || false,
        image: productPic,
        salesCount: editingProduct.salesCount
      });
    } else {
      addProduct({
        name: name,
        category: category,
        price: Number(price),
        stock: Number(stock),
        lowStockThreshold: Number(lowStockThreshold),
        image: productPic
      });
    }

    handleCloseModal();
  };

  const toggleSelected = (productId) => setSelectedIds(previous => previous.includes(productId) ? previous.filter(id => id !== productId) : [...previous, productId]);
  const selectVisible = () => {
    const visibleIds = visibleProducts.map(product => product.id);
    setSelectedIds(previous => visibleIds.every(id => previous.includes(id)) ? previous.filter(id => !visibleIds.includes(id)) : [...new Set([...previous, ...visibleIds])]);
  };
  const bulkRestock = () => {
    const quantity = Math.max(1, Number(restockAmount) || 1);
    products.filter(product => selectedIds.includes(product.id) && !product.isArchived).forEach(product => updateProduct({ ...product, stock: Number(product.stock) + quantity }));
    setSelectedIds([]);
  };
  const bulkArchive = () => {
    products.filter(product => selectedIds.includes(product.id)).forEach(product => archiveProduct(product.id, !showArchived));
    setSelectedIds([]);
  };
  const importCsv = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result || ''));
      if (rows.length < 2) { setImportMessage('The CSV has no product rows to import.'); return; }
      const headers = rows[0].map(value => value.trim().toLowerCase());
      const required = ['name', 'category', 'price', 'stock'];
      const missing = required.filter(header => !headers.includes(header));
      if (missing.length) { setImportMessage(`Missing required columns: ${missing.join(', ')}.`); return; }
      const indexOf = key => headers.indexOf(key);
      let imported = 0;
      let skipped = 0;
      const knownCategories = new Set(catalogCategories);
      const existingProducts = new Set(products.map(product => `${product.name.trim().toLowerCase()}|${product.category.toLowerCase()}`));
      rows.slice(1, 501).forEach(values => {
        const field = key => indexOf(key) < 0 ? '' : (values[indexOf(key)] || '').trim();
        const itemName = field('name');
        const itemCategory = field('category');
        const itemPrice = Number(field('price'));
        const itemStock = Number(field('stock'));
        const thresholdCell = field('lowstockthreshold');
        const itemThreshold = thresholdCell === '' ? 15 : Number(thresholdCell);
        const description = field('description');
        const identity = `${itemName.toLowerCase()}|${itemCategory.toLowerCase()}`;
        if (!itemName || !knownCategories.has(itemCategory) || !Number.isFinite(itemPrice) || itemPrice < 0 || !Number.isInteger(itemStock) || itemStock < 0 || !Number.isInteger(itemThreshold) || itemThreshold < 0 || description.length > 5000 || existingProducts.has(identity)) { skipped += 1; return; }
        addProduct({ name: itemName, category: itemCategory, price: itemPrice, stock: itemStock, image: field('image'), description, lowStockThreshold: itemThreshold });
        existingProducts.add(identity);
        imported += 1;
      });
      const truncated = rows.length > 501 ? ' Only the first 500 product rows were processed.' : '';
      setImportMessage(`${imported} product${imported === 1 ? '' : 's'} imported; ${skipped} row${skipped === 1 ? '' : 's'} skipped (invalid, duplicate, or unsupported category).${truncated}`);
    };
    reader.onerror = () => setImportMessage('The selected file could not be read.');
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Upper Action Ribbon Banner */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
          <p className="text-sm text-slate-500">Manage your live catalog, inventory health, and product lifecycle.</p>
          {lowStockOnly && <p className="mt-2 text-sm font-semibold text-amber-600">Showing products below their custom restock threshold.</p>}
        </div>
        <div className="page-heading__actions">
          {lowStockOnly && <button type="button" className="secondary-action" onClick={onClearLowStockFilter}>Show all products</button>}
          <button type="button" className="secondary-action" onClick={() => downloadCsv('shopmetrics-inventory.csv', [['Product ID', 'Name', 'Category', 'Price', 'Stock', 'Restock threshold', 'Sales', 'Reviews', 'Archived', 'Description'], ...filteredProducts.map(product => [product.id, product.name, product.category, product.price, product.stock, product.lowStockThreshold ?? 15, product.salesCount, product.reviews?.length || 0, product.isArchived ? 'Yes' : 'No', product.description || ''])])} disabled={!filteredProducts.length}>Export {filteredProducts.length} products</button>
          <button type="button" className="secondary-action" onClick={() => downloadCsv('shopmetrics-product-import-template.csv', [['name', 'category', 'price', 'stock', 'lowStockThreshold', 'image', 'description'], ['Sample Desk Lamp', 'Home & Kitchen', '49.99', '25', '8', '', 'An adjustable desk lamp with warm dimmable lighting.']])}>CSV template</button>
          <button type="button" onClick={openCreateModal} className="primary-action">+ Add product</button>
        </div>
      </div>

      <div className="inventory-import-panel"><div><strong>Import products from CSV</strong><span>Required: name, category, price, stock. Optional: threshold, image URL, description. Up to 500 rows.</span></div><label className="inventory-import-button">Choose CSV<input type="file" accept=".csv,text/csv" onChange={importCsv} /></label>{importMessage && <p role="status">{importMessage}</p>}</div>

      <div className="inventory-health-strip">
        <div><span>Active products</span><strong>{products.filter(product => !product.isArchived).length}</strong></div>
        <div><span>Low stock</span><strong>{products.filter(product => !product.isArchived && (product.stock <= 0 || product.stock < (product.lowStockThreshold ?? 15))).length}</strong></div>
        <div><span>Out of stock</span><strong>{products.filter(product => !product.isArchived && product.stock <= 0).length}</strong></div>
        <div><span>Archived</span><strong>{products.filter(product => product.isArchived).length}</strong></div>
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
        <div className="inventory-control-row">
          <label className="inventory-archived-toggle"><input type="checkbox" checked={showArchived} onChange={event => { setShowArchived(event.target.checked); setPage(1); setSelectedIds([]); }} /> Show archived products</label>
          <label className="inventory-sort">Sort by<select value={sortBy} onChange={event => { setSortBy(event.target.value); setPage(1); }}><option value="name">Product name</option><option value="stock-low">Stock: low to high</option><option value="stock-high">Stock: high to low</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
        </div>
      </div>

      {selectedIds.length > 0 && <div className="inventory-bulk-toolbar"><strong>{selectedIds.length} selected</strong>{!showArchived && <><label>Restock by<input type="number" min="1" value={restockAmount} onChange={event => setRestockAmount(event.target.value)} /></label><button type="button" className="secondary-action" onClick={bulkRestock}>Apply restock</button></>}<button type="button" className="secondary-action inventory-bulk-archive" onClick={bulkArchive}>{showArchived ? 'Restore selected' : 'Archive selected'}</button><button type="button" className="inventory-clear-selection" onClick={() => setSelectedIds([])}>Clear selection</button></div>}

      {/* Main Data Directory Layout Table */}
      <div className="inventory-table-shell bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="inventory-select-cell"><input type="checkbox" aria-label="Select visible products" checked={visibleProducts.length > 0 && visibleProducts.every(product => selectedIds.includes(product.id))} onChange={selectVisible} /></th>
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
                <td data-label="Select" className="inventory-select-cell"><input type="checkbox" aria-label={`Select ${product.name}`} checked={selectedIds.includes(product.id)} onChange={() => toggleSelected(product.id)} /></td>
                <td data-label="Display graphic" className="px-6 py-3">
                  <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-slate-50" />
                </td>
                <td data-label="ID reference" className="px-6 py-4 font-mono font-bold text-indigo-600 text-xs">{product.id}</td>
                <td data-label="Product" className="px-6 py-4 font-semibold text-slate-800">{product.name}{product.isArchived && <span className="inventory-archived-badge">Archived</span>}</td>
                <td data-label="Category" className="px-6 py-4">
                  <span className="inventory-category-badge bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-200">{product.category}</span>
                </td>
                <td data-label="Unit price" className="px-6 py-4 text-right font-medium text-slate-800">${product.price}</td>
                <td data-label="Stock" className="px-6 py-4 text-right font-medium">
                  <span className={product.stock <= 0 ? 'text-rose-600 font-bold' : product.stock < (product.lowStockThreshold ?? 15) ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                    {product.stock} units <small className="inventory-threshold">/ alert at {product.lowStockThreshold ?? 15}</small>
                  </span>
                </td>
                <td data-label="Sales" className="px-6 py-4 text-right text-slate-500">{product.salesCount} sold</td>
                <td data-label="Reviews" className="px-6 py-4 text-center text-slate-500">{product.reviews?.length || 0}</td>
                <td data-label="Action" className="px-6 py-4 text-center">
                  <button 
                    type="button"
                    onClick={() => openEditModal(product)}
                    className="inventory-edit-button text-xs bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 font-bold py-1 px-3 rounded-md transition-all shadow-sm"
                  >
                    Edit
                  </button>
                  <button type="button" className="inventory-archive-button" onClick={() => archiveProduct(product.id, !product.isArchived)}>{product.isArchived ? 'Restore' : 'Archive'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredProducts.length > 0 ? <Pagination page={currentPage} pageCount={pageCount} totalItems={filteredProducts.length} pageSize={pageSize} onPageChange={setPage} /> : <div className="inventory-no-results">No products match these filters.</div>}

      {/* Unified Management Drawer Configuration Popover Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="inventory-product-modal bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
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
                <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">Low stock alert threshold</label><input required min="0" step="1" type="number" value={lowStockThreshold} onChange={event => setLowStockThreshold(event.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" /><p className="inventory-field-hint">You will see an alert when stock falls below this amount.</p></div>
              </div>

              {formError && <p className="inventory-form-error" role="alert">{formError}</p>}
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
