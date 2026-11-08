import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ProductGrid from '../components/ProductGrid';
import { getProducts } from '../services/productService';
import { Filter } from 'lucide-react';

const Collections = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [fabricFilter, setFabricFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const { products: fetched } = await getProducts({
          category,
          search,
          sort,
          inStockOnly
        });

        if (isMounted) {
          let list = fetched;
          if (fabricFilter !== 'all') {
            list = list.filter(p => p.fabric && p.fabric.toLowerCase().includes(fabricFilter.toLowerCase()));
          }
          setProducts(list);
        }
      } catch (err) {
        console.error('Failed to load collections:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [category, search, sort, inStockOnly, fabricFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setSort('featured');
    setInStockOnly(false);
    setFabricFilter('all');
  };

  return (
    <div className="collections-page" style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Page Title */}
        <div className="section-header">
          <span className="section-subtitle">Exquisite Showroom Catalogue</span>
          <h1 className="section-title">All Saree Collections</h1>
          <div className="gold-divider"><span>◆</span></div>
        </div>

        {/* Category Pills Bar */}
        <CategoryFilter
          activeCategory={category}
          onSelectCategory={(cat) => setCategory(cat)}
        />

        {/* Toolbar: Search, Filters & Sorting */}
        <div className="catalogue-toolbar" style={{ marginTop: '1.5rem' }}>
          <div className="toolbar-row-top">
            <SearchBar value={search} onChange={setSearch} />
            <div className="catalogue-results-meta">
              Showing <strong>{products.length}</strong> {products.length === 1 ? 'saree' : 'sarees'}
            </div>
          </div>

          <div className="toolbar-row-filters">
            <div className="filter-controls-group">
              {/* Sort By */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="select-filter"
                aria-label="Sort sarees"
              >
                <option value="featured">Featured / Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">New Arrivals First</option>
                <option value="discount">Biggest Discount</option>
              </select>

              {/* Stock Filter */}
              <select
                value={inStockOnly ? 'in_stock' : 'all'}
                onChange={(e) => setInStockOnly(e.target.value === 'in_stock')}
                className="select-filter"
                aria-label="Filter availability"
              >
                <option value="all">All Availability</option>
                <option value="in_stock">In Stock Only</option>
              </select>

              {/* Fabric Filter */}
              <select
                value={fabricFilter}
                onChange={(e) => setFabricFilter(e.target.value)}
                className="select-filter"
                aria-label="Filter fabric"
              >
                <option value="all">All Fabrics</option>
                <option value="silk">Pure Silk</option>
                <option value="cotton">Handloom Cotton</option>
                <option value="organza">Organza</option>
                <option value="katan">Katan Silk</option>
                <option value="georgette">Georgette</option>
              </select>
            </div>

            {(search || category !== 'all' || inStockOnly || fabricFilter !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="clear-search-btn"
                style={{ display: 'inline-flex', position: 'static', fontSize: '0.85rem' }}
              >
                Reset Filters ✕
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid
          products={products}
          loading={loading}
          onResetFilters={handleResetFilters}
        />
      </div>
    </div>
  );
};

export default Collections;
