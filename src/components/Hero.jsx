import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, MessageSquare, ShieldCheck, Tag, Video } from 'lucide-react';
import { SHOP_CONFIG } from '../lib/supabase';

const Hero = () => {
  return (
    <section className="hero-section" id="hero">
      <div className="container">
        <div className="hero-grid">
          {/* Hero Left Content */}
          <div className="hero-content">
            <div className="hero-subtitle-badge">
              <Sparkles size={14} />
              <span>Certified Silk Mark Showroom</span>
            </div>

            <h1 className="hero-title">
              Traditional Splendor, <br />
              <span className="highlight">Woven into Pure Silk</span>
            </h1>

            <p className="hero-desc">
              Welcome to Sree Collections. From auspicious bridal Kanchipuram and royal Banarasi brocades to feather-light handloom cottons, we bring authentic master weaves directly from traditional Indian looms to your doorstep.
            </p>

            <div className="hero-cta-group">
              <Link to="/collections" className="btn-primary-gold">
                <span>Shop Collections</span>
                <ArrowRight size={18} />
              </Link>

              <a
                href={`https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=Hello%20Sree%20Collections,%20I%20would%20like%20to%20browse%20your%20saree%20catalogue.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-outline"
              >
                <MessageSquare size={18} />
                <span>WhatsApp Enquiry</span>
              </a>
            </div>

            {/* Trust Highlights */}
            <div className="hero-trust-badges">
              <div className="trust-item">
                <ShieldCheck size={18} className="trust-icon" />
                <span>100% Tested Pure Zari</span>
              </div>
              <div className="trust-item">
                <Tag size={18} className="trust-icon" />
                <span>Direct Weaver Pricing</span>
              </div>
              <div className="trust-item">
                <Video size={18} className="trust-icon" />
                <span>Video Call Shopping</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Showcase */}
          <div className="hero-visual">
            <div className="hero-image-frame">
              <div className="hero-image-inner">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80"
                  alt="Bridal Kanchipuram Saree Drape"
                />
              </div>

              <div className="hero-floating-card">
                <div className="floating-icon">₹</div>
                <div className="floating-text">
                  <strong>Bridal Heritage Edition</strong>
                  <span>Kanchipuram &bull; Pure Gold Brocade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

