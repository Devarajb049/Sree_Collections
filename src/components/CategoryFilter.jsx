import React from 'react';
import { CATEGORIES } from '../data/demoProducts';

const CategoryFilter = ({ activeCategory = 'all', onSelectCategory }) => {
  return (
    <div className="category-scroll-wrapper">
      <div className="category-pills-list">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id || activeCategory === cat.category || activeCategory === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.category || cat.slug)}
              className={`category-pill-btn ${isActive ? 'active' : ''}`}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
