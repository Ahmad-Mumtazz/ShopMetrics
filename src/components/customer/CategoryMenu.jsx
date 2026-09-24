export default function CategoryMenu({ categories, selectedCategory, isOpen, onToggle, onSelect }) {
  const activeCategory = selectedCategory || 'All';

  return (
    <div className={`category-menu ${isOpen ? 'is-open' : ''}`}>
      <button type="button" className="category-menu__toggle" aria-expanded={isOpen} onClick={onToggle}>
        <span className="category-menu__icon">☰</span>
        <span>Categories</span>
        <strong>{activeCategory}</strong>
      </button>
      {isOpen && (
        <div className="category-menu__popover" role="menu">
          <div className="category-menu__popover-heading"><span>Browse categories</span><button type="button" onClick={onToggle} aria-label="Close categories">Close</button></div>
          <div className="category-menu__list">
            {categories.map(category => <button type="button" role="menuitem" key={category} onClick={() => onSelect(category)} className={category === activeCategory ? 'is-active' : ''}>{category}</button>)}
          </div>
        </div>
      )}
    </div>
  );
}
