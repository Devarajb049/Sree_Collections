import React from 'react';
import { ShieldCheck, Award, Heart, Sparkles, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page" style={{ padding: '3rem 0 6rem 0' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-subtitle">Our Heritage &amp; Craft</span>
          <h1 className="section-title">The Story of Sree Collections</h1>
          <div className="gold-divider"><span>◆</span></div>
        </div>

        {/* Story Intro Grid */}
        <div className="about-grid" style={{ marginBottom: '4rem' }}>
          <div className="about-text">
            <h3 style={{ fontFamily: 'var(--font-royal)', color: 'var(--color-maroon-primary)', fontSize: '1.8rem', marginBottom: '1rem' }}>
              Preserving the Sacred Art of Indian Weaves
            </h3>
            <p>
              Established with an enduring reverence for Indian handlooms, <strong>Sree Collections</strong> is dedicated to celebrating the glorious textile traditions of South India and Varanasi.
            </p>
            <p>
              Each saree in our collection represents weeks of disciplined craftsmanship. From the rhythmic clack of wooden pit looms in Kanchipuram to the intricate jacquard cards of Banarasi brocades and the airy comfort of Mangalagiri cottons, we bridge ancient artisan heritage with modern bridal elegance.
            </p>
            <p>
              By partnering directly with master weaving clusters across Andhra Pradesh, Telangana, Tamil Nadu, and Uttar Pradesh, we ensure fair compensation for our artisans while offering showroom patrons direct weaver prices with certified Silk Mark authenticity.
            </p>

            <div className="about-stats">
              <div>
                <span className="stat-num">15+</span>
                <span className="stat-label">Years of Heritage</span>
              </div>
              <div>
                <span className="stat-num">25,000+</span>
                <span className="stat-label">Happy Patrons</span>
              </div>
              <div>
                <span className="stat-num">100%</span>
                <span className="stat-label">Pure Tested Silk</span>
              </div>
            </div>
          </div>

          <div className="about-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80"
              alt="Traditional Loom Craftsmanship"
            />
          </div>
        </div>

        {/* Our Guiding Principles */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid var(--color-ivory-border)', padding: '3rem 2rem', boxShadow: 'var(--shadow-sm)' }}>
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <span className="section-subtitle">Values</span>
            <h2 className="section-title">Our Guiding Principles</h2>
            <div className="gold-divider"><span>◆</span></div>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon-box">
                <ShieldCheck size={28} />
              </div>
              <h3 className="pillar-title">Silk Mark Certified</h3>
              <p className="pillar-desc">
                We guarantee 100% pure mulberry and katan silks with genuine tested gold and silver zari. Zero compromise on natural fiber integrity.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box">
                <Users size={28} />
              </div>
              <h3 className="pillar-title">Weaver Empowerment</h3>
              <p className="pillar-desc">
                We work directly with traditional weaver cooperatives, eliminating middlemen and passing maximum value to artisan families.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box">
                <Heart size={28} />
              </div>
              <h3 className="pillar-title">Personalized Care</h3>
              <p className="pillar-desc">
                Whether you visit our physical showroom or shop over WhatsApp video call, our dedicated saree consultants guide every bridal drape.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

