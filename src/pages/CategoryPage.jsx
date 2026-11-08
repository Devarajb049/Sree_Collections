import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import SearchBar from '../components/SearchBar';
import { getProducts } from '../services/productService';
import { CATEGORIES } from '../data/demoProducts';
import { ArrowLeft } from 'lucide-react';

const CategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');

  const currentCategory = CATEGORIES.find(c => c.slug === slug || c.id === slug) || {
    name: 'Saree Collection',
    category: slug
  };

  useEffect(() => {
    let isMounted = true;

    async function loadCategoryProducts() {
      try {
        setLoading(true);
        const { products: fetched } = await getProducts({
          category: currentCategory.category || slug,
          search,
          sort
        });
        if (isMounted) {
          setProducts(fetched);
        }
      } catch (err) {
        console.error('Failed to load category products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCategoryProducts();
    return () => { isMounted = false; };
  }, [slug, search, sort, currentCategory.category]);

  return (
    <div className="category-page" style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Breadcrumb Back */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link to="/collections" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--color-maroon-primary)', fontWeight: '600' }}>
            <ArrowLeft size={16} />
            <span>Back to All Collections</span>
          </Link>
        </div>

        {/* Section Header */}
        <div className="section-header">
          <span className="section-subtitle">Curated Weaves</span>
          <h1 className="section-title">{currentCategory.name}</h1>
          <div className="gold-divider"><span>◆</span></div>
        </div>

        {/* Toolbar */}
        <div className="catalogue-toolbar">
          <div className="toolbar-row-top">
            <SearchBar value={search} onChange={setSearch} placeholder={`Search within ${currentCategory.name}...`} />
            <div className="catalogue-results-meta">
              Showing <strong>{products.length}</strong> {products.length === 1 ? 'saree' : 'sarees'}
            </div>
          </div>

          <div className="toolbar-row-filters">
            <div className="filter-controls-group">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="select-filter"
                aria-label="Sort sarees"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">New Arrivals</option>
                <option value="discount">Biggest Discounts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={products}
          loading={loading}
          onResetFilters={() => setSearch('')}
        />
      </div>
    </div>
  );
};

export default CategoryPage;

