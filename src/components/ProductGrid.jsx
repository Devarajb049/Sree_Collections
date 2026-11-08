import React from 'react';
import ProductCard from './ProductCard';
import { SearchX } from 'lucide-react';

const ProductGrid = ({ products = [], loading = false, onResetFilters }) => {
  if (loading) {
    return (
      <div className="products-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="product-skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-line" style={{ width: '40%' }}></div>
              <div className="skeleton-line" style={{ width: '80%', height: '1.2rem' }}></div>
              <div className="skeleton-line" style={{ width: '60%' }}></div>
              <div className="skeleton-line" style={{ width: '35%', height: '1.4rem', marginTop: '0.5rem' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="catalogue-empty-state">
        <SearchX size={52} className="empty-icon text-gold" />
        <h3>No Sarees Found</h3>
        <p>We couldn't find any sarees matching your search criteria or filters. Try adjusting your selections.</p>
        {onResetFilters && (
          <button type="button" onClick={onResetFilters} className="btn-primary-gold" style={{ marginTop: '1.25rem' }}>
            View All Sarees
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard key={product.id || product.sku} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;

