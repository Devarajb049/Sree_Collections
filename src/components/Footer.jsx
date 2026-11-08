import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import { SHOP_CONFIG } from '../lib/supabase';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <Link to="/" className="brand-wrapper" style={{ marginBottom: '0.85rem' }}>
              <img src="/assets/icons/logo.svg" alt="Sree Collections" className="brand-logo-img" style={{ width: '42px', height: '42px' }} />
              <div className="brand-titles">
                <span className="brand-title-en" style={{ fontSize: '1.2rem' }}>SREE COLLECTIONS</span>
                <span className="brand-tagline">Pure Silk &amp; Handlooms</span>
              </div>
            </Link>

            <p className="footer-brand-desc">
              Your trusted destination for certified pure silk, bridal wedding pattu, handlooms, and timeless Indian drapery. Handcrafted with reverence for tradition and delivered directly from master weavers.
            </p>

            <div className="footer-silk-mark-badge">
              <ShieldCheck size={18} />
              <span>100% Pure Tested Silk &amp; Zari Guarantee</span>
            </div>
          </div>

          {/* Saree Categories */}
          <div className="footer-col">
            <h4>Traditional Weaves</h4>
            <ul className="footer-links-list">
              <li><Link to="/category/kanchipuram-silk">Kanchipuram Pure Silk</Link></li>
              <li><Link to="/category/banarasi-silk">Banarasi Brocades</Link></li>
              <li><Link to="/category/wedding-sarees">Bridal Wedding Pattu</Link></li>
              <li><Link to="/category/pattu-sarees">Gadwal &amp; Dharmavaram</Link></li>
              <li><Link to="/category/cotton-sarees">Mangalagiri Handloom Cotton</Link></li>
              <li><Link to="/category/fancy-sarees">Fancy Organza &amp; Georgette</Link></li>
              <li><Link to="/category/daily-wear-sarees">Handblock Mulmul Cotton</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links-list">
              <li><Link to="/">Home Page</Link></li>
              <li><Link to="/collections">All Saree Collections</Link></li>
              <li><Link to="/category/wedding-sarees">Royal Bridal Showcase</Link></li>
              <li><Link to="/about">Our Weaving Heritage</Link></li>
              <li><Link to="/contact">Showroom Location</Link></li>
              <li><Link to="/cart">Your Shopping Cart</Link></li>
              <li><Link to="/admin">Showroom Admin Login</Link></li>
            </ul>
          </div>

          {/* Showroom Contact & WhatsApp */}
          <div className="footer-col">
            <h4>Contact &amp; Orders</h4>
            <div className="footer-contact-items">
              <div className="footer-contact-row">
                <MapPin size={16} className="contact-icon" />
                <span>{SHOP_CONFIG.address}</span>
              </div>
              <div className="footer-contact-row">
                <Phone size={16} className="contact-icon" />
                <a href={`tel:${SHOP_CONFIG.whatsappNumber}`}>{SHOP_CONFIG.phoneNumber}</a>
              </div>
              <div className="footer-contact-row">
                <Mail size={16} className="contact-icon" />
                <a href={`mailto:${SHOP_CONFIG.email}`}>{SHOP_CONFIG.email}</a>
              </div>
              <div className="footer-contact-row">
                <Clock size={16} className="contact-icon" />
                <span>{SHOP_CONFIG.workingHours}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <a
                href={`https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=Hello%20Sree%20Collections,%20I%20would%20like%20to%20enquire%20about%20your%20sarees.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-outline"
                style={{ width: '100%', fontSize: '0.88rem', padding: '0.65rem 1rem' }}
              >
                <MessageSquare size={16} />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} <strong>Sree Collections</strong>. All Rights Reserved. Traditional Heritage Handlooms.
          </div>
          <div>
            Pure Silk Certified &bull; Cloudflare Pages Deployment &bull; <Link to="/admin" style={{ textDecoration: 'underline' }}>Admin Dashboard</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
