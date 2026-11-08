import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Heart, Star, Phone, MessageSquare, Video } from 'lucide-react';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import { getProducts } from '../services/productService';
import { CATEGORIES } from '../data/demoProducts';
import { SHOP_CONFIG, isSupabaseConfigured } from '../lib/supabase';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeProducts() {
      try {
        setLoading(true);
        const { products, isLive: liveStatus } = await getProducts();
        if (isMounted) {
          setIsLive(liveStatus);
          setFeaturedProducts(products.filter(p => p.is_featured).slice(0, 4));
          setNewArrivals(products.filter(p => p.is_new_arrival).slice(0, 4));
          setBestSellers(products.filter(p => p.is_best_seller).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load homepage products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHomeProducts();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <Hero />

      {/* Demo Catalogue Notice if Supabase not configured */}
      {!isLive && (
        <div className="demo-banner-box">
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <strong>📌 Notice:</strong> Displaying Sree Collections <strong>Demo Saree Inventory</strong>. Connect your Supabase credentials in <code>.env</code> or access the <Link to="/admin">Admin Portal</Link> to manage live showroom stock.
            </div>
            <Link to="/admin" style={{ fontWeight: 'bold' }}>
              Showroom Admin &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Featured Categories Quick Navigation */}
      <section className="section-categories">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Exquisite Categories</span>
            <h2 className="section-title">Shop by Tradition &amp; Weave</h2>
            <div className="gold-divider"><span>◆</span></div>
          </div>

          <div className="category-scroll-wrapper">
            <div className="category-pills-list">
              {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="category-pill-btn"
                >
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sarees Section */}
      <section className="section-featured-sarees" style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Handpicked Showcase</span>
            <h2 className="section-title">Featured Pure Silk Sarees</h2>
            <div className="gold-divider"><span>◆</span></div>
          </div>

          <ProductGrid products={featuredProducts} loading={loading} />

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/collections" className="btn-primary-gold">
              <span>View All Collections</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Royal Bridal Pattu Showcase Banner */}
      <section className="section-bridal-showcase">
        <div className="container">
          <div className="bridal-banner-grid">
            <div className="bridal-content-col">
              <span className="bridal-badge">Auspicious Bridal Muhurtham Collection</span>
              <h2 className="bridal-title">
                Draped in <span>Sacred Gold &amp; Pure Silk</span>
              </h2>
              <p className="bridal-desc">
                A traditional South Indian wedding is incomplete without the resplendent aura of authentic Kanchipuram and Dharmavaram bridal pattu. Handcrafted with certified 100% pure silk and tested gold zari, each bridal drape is an heirloom to be cherished for generations.
              </p>

              <div className="bridal-features-list">
                <div className="bridal-feat-item">
                  <ShieldCheck size={18} className="text-gold" />
                  <span>Certified Silk Mark Guarantee</span>
                </div>
                <div className="bridal-feat-item">
                  <ShieldCheck size={18} className="text-gold" />
                  <span>Heavy Korvai Borders &amp; Grand Pallu</span>
                </div>
                <div className="bridal-feat-item">
                  <Video size={18} className="text-gold" />
                  <span>Exclusive Video Call Viewing</span>
                </div>
                <div className="bridal-feat-item">
                  <Heart size={18} className="text-gold" />
                  <span>Custom Blouse Sizing Assistance</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/category/wedding-sarees" className="btn-primary-gold">
                  <span>Explore Bridal Sarees</span>
                  <ArrowRight size={18} />
                </Link>

                <a
                  href={`https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=Namaste%20Sree%20Collections,%20I%20am%20looking%20for%20Bridal%20Wedding%20Pattu%20Sarees.%20Please%20schedule%20a%20video%20call.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-outline"
                >
                  <MessageSquare size={18} />
                  <span>Book Video Call Appointment</span>
                </a>
              </div>
            </div>

            <div className="bridal-gallery-preview">
              <div className="bridal-img-card">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80"
                  alt="Muhurtham Red Bridal Saree"
                />
              </div>
              <div className="bridal-img-card">
                <img
                  src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&q=80"
                  alt="Emerald Green Dharmavaram Pattu"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--color-ivory-light)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Fresh From Looms</span>
            <h2 className="section-title">New Arrivals</h2>
            <div className="gold-divider"><span>◆</span></div>
          </div>

          <ProductGrid products={newArrivals} loading={loading} />
        </div>
      </section>

      {/* Why Choose Sree Collections (4 Pillars of Trust) */}
      <section className="section-why-us">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Heritage &amp; Trust</span>
            <h2 className="section-title">The Sree Collections Promise</h2>
            <div className="gold-divider"><span>◆</span></div>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon-box">⚜️</div>
              <h3 className="pillar-title">100% Pure Silk</h3>
              <p className="pillar-desc">
                Directly certified natural silk fibers, rigorous loom inspections, and authentic zari weaves with zero synthetics.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box">🧵</div>
              <h3 className="pillar-title">Weaver-Direct Prices</h3>
              <p className="pillar-desc">
                By eliminating intermediaries, we bring heirloom artisan sarees directly from traditional weaving hubs at honest prices.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box">📱</div>
              <h3 className="pillar-title">WhatsApp Live Video</h3>
              <p className="pillar-desc">
                Experience our showroom from the comfort of home. Inspect real pallu drape, borders, and colors on 1-on-1 video call.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box">📦</div>
              <h3 className="pillar-title">Insured Doorstep Delivery</h3>
              <p className="pillar-desc">
                Free shipping on orders above ₹3,000 across India. Safe, tamper-proof luxury packaging with instant tracking updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section style={{ padding: '4rem 0', background: '#ffffff' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Customer Love</span>
            <h2 className="section-title">What Our Patrons Say</h2>
            <div className="gold-divider"><span>◆</span></div>
          </div>

          <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="pillar-card" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', color: '#d4af37', marginBottom: '0.5rem' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#d4af37" />)}
              </div>
              <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#555', marginBottom: '1rem' }}>
                "Ordered my muhurtham Kanchipuram silk over WhatsApp video call. The zari weight and drape quality exceeded my expectations. Delivered within 48 hours to Hyderabad!"
              </p>
              <strong>— Smt. Ananya Rao</strong>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>Verified Buyer &bull; Hyderabad</div>
            </div>

            <div className="pillar-card" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', color: '#d4af37', marginBottom: '0.5rem' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#d4af37" />)}
              </div>
              <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#555', marginBottom: '1rem' }}>
                "The Mangalagiri pure cotton sarees are exceptionally breathable and graceful. The Nizam border shine is authentic and retains stiffness even after multiple wears."
              </p>
              <strong>— Dr. Padmavathi Reddy</strong>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>Verified Buyer &bull; Bangalore</div>
            </div>

            <div className="pillar-card" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', color: '#d4af37', marginBottom: '0.5rem' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#d4af37" />)}
              </div>
              <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#555', marginBottom: '1rem' }}>
                "Seamless WhatsApp ordering experience. The staff was polite, showed multiple color combinations on video, and shared tracking right away. Highly recommended!"
              </p>
              <strong>— Smt. Sravani K.</strong>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>Verified Buyer &bull; Vijayawada</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

