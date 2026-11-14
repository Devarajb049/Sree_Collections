import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Phone, ShieldCheck, Lock, Instagram } from 'lucide-react';
import GoogleTranslate from './GoogleTranslate';
import { useCart } from '../context/CartContext';
import { SHOP_CONFIG } from '../lib/supabase';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const location = useLocation();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key and lock body scroll when mobile menu is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Top Announcement Bar */}
      <aside className="announcement-bar zari-border-top">
        <div className="container announcement-container" style={{ justifyContent: 'flex-end' }}>
          <div className="announcement-actions">
            <a href={`tel:${SHOP_CONFIG.whatsappNumber}`} className="announcement-phone">
              <Phone size={12} />
              <span>{SHOP_CONFIG.phoneNumber}</span>
            </a>
            <a
              href={SHOP_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="announcement-phone"
              style={{ color: '#E1306C' }}
              title="Follow Sree Collections on Instagram"
            >
              <Instagram size={12} />
              <span>Instagram</span>
            </a>
            <Link to="/admin" className="announcement-admin-link">
              <Lock size={12} />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Sticky Header */}
      <header className="site-header">
        <div className="container">
          <nav className="navbar" aria-label="Main Navigation">
            {/* Brand Logo & Name */}
            <Link to="/" className="brand-wrapper" onClick={closeMobileMenu}>
              <img src="/assets/icons/logo.svg" alt="Sree Collections Logo" className="brand-logo-img" />
              <div className="brand-titles">
                <span className="brand-title-en">SREE COLLECTIONS</span>
                <span className="brand-tagline">Pure Silk &amp; Handlooms</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="nav-menu">
              <li>
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/collections" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  All Collections
                </NavLink>
              </li>
              <li>
                <NavLink to="/category/wedding-sarees" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Bridal Pattu
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Contact
                </NavLink>
              </li>
            </ul>

            {/* Header Actions: Google Translate & Cart */}
            <div className="header-actions">
              {/* Google Translate Integration Button */}
              <GoogleTranslate />

              {/* Shopping Cart Button */}
              <Link to="/cart" className="cart-btn-trigger" aria-label="View Shopping Cart">
                <ShoppingBag size={20} />
                <span className="cart-btn-label">Cart</span>
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </Link>

              {/* Mobile / Tablet Menu Hamburger */}
              <button
                type="button"
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Backdrop Overlay */}
        <div
          className={`mobile-nav-backdrop ${mobileMenuOpen ? 'open' : ''}`}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

        {/* Mobile / Tablet Navigation Drawer */}
        <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`} aria-hidden={!mobileMenuOpen}>
          <div className="mobile-nav-header">
            <span className="brand-title-en" style={{ fontSize: '1.1rem' }}>SREE COLLECTIONS</span>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="mobile-nav-close"
              aria-label="Close navigation menu"
            >
              <X size={22} />
            </button>
          </div>

          <div style={{ padding: '0.8rem 1.25rem', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
            <GoogleTranslate />
          </div>

          <ul className="mobile-nav-links">
            <li>
              <NavLink to="/" onClick={closeMobileMenu} className="mobile-nav-link">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/collections" onClick={closeMobileMenu} className="mobile-nav-link">
                All Collections
              </NavLink>
            </li>
            <li>
              <NavLink to="/category/kanchipuram-silk" onClick={closeMobileMenu} className="mobile-nav-link">
                Kanchipuram Silk Sarees
              </NavLink>
            </li>
            <li>
              <NavLink to="/category/banarasi-silk" onClick={closeMobileMenu} className="mobile-nav-link">
                Banarasi Brocades
              </NavLink>
            </li>
            <li>
              <NavLink to="/category/wedding-sarees" onClick={closeMobileMenu} className="mobile-nav-link">
                Bridal Wedding Pattu
              </NavLink>
            </li>
            <li>
              <NavLink to="/category/cotton-sarees" onClick={closeMobileMenu} className="mobile-nav-link">
                Handloom Cotton
              </NavLink>
            </li>
            <li>
              <NavLink to="/category/fancy-sarees" onClick={closeMobileMenu} className="mobile-nav-link">
                Fancy &amp; Organza
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" onClick={closeMobileMenu} className="mobile-nav-link">
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" onClick={closeMobileMenu} className="mobile-nav-link">
                Contact &amp; Showroom
              </NavLink>
            </li>
            <li>
              <NavLink to="/cart" onClick={closeMobileMenu} className="mobile-nav-link" style={{ color: '#fce082' }}>
                Shopping Cart ({totalItems})
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin" onClick={closeMobileMenu} className="mobile-nav-link" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Admin Dashboard
              </NavLink>
            </li>
          </ul>
        </div>
      </header>
    </>
  );
};

export default Navbar;

