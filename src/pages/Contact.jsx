import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, Check, Instagram } from 'lucide-react';
import { SHOP_CONFIG } from '../lib/supabase';

const Contact = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    // Send as preformatted WhatsApp message directly
    const msg = `*NEW SHOWROOM ENQUIRY:*\n• Name: ${name}\n• Phone: ${phone}\n• Message: ${message || 'I would like to enquire about your saree collections.'}`;
    const cleanNum = SHOP_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');

    setSubmitted(true);
    setName('');
    setPhone('');
    setMessage('');
  };

  return (
    <div className="contact-page" style={{ padding: '3rem 0 6rem 0' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-subtitle">Showroom Location &amp; Support</span>
          <h1 className="section-title">Get in Touch with Sree Collections</h1>
          <div className="gold-divider"><span>◆</span></div>
        </div>

        <div className="contact-grid">
          {/* Left Column: Showroom Info */}
          <div className="contact-card">
            <h3 style={{ fontFamily: 'var(--font-royal)', color: 'var(--color-maroon-primary)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              Showroom Visit &amp; Enquiries
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Visit our physical showroom in RR Layout, Madanapalle or connect with our saree styling consultants via WhatsApp or phone.
            </p>

            <div className="contact-info-list">
              <div className="contact-item">
                <div className="contact-icon-box">
                  <MapPin size={20} />
                </div>
                <div className="contact-detail">
                  <strong>Showroom Address:</strong>
                  <p>{SHOP_CONFIG.address}</p>
                  <a
                    href={SHOP_CONFIG.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginTop: '0.45rem',
                      color: 'var(--color-maroon-primary)',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      textDecoration: 'underline'
                    }}
                  >
                    <MapPin size={14} />
                    <span>Open in Google Maps &rarr;</span>
                  </a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-box">
                  <MessageSquare size={20} />
                </div>
                <div className="contact-detail">
                  <strong>WhatsApp Orders &amp; Video Calls:</strong>
                  <a
                    href={`https://wa.me/${SHOP_CONFIG.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-whatsapp-dark)', fontWeight: 'bold' }}
                  >
                    {SHOP_CONFIG.phoneNumber}
                  </a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-box">
                  <Phone size={20} />
                </div>
                <div className="contact-detail">
                  <strong>Phone Customer Support:</strong>
                  <a href={`tel:${SHOP_CONFIG.whatsappNumber}`}>{SHOP_CONFIG.phoneNumber}</a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-box">
                  <Mail size={20} />
                </div>
                <div className="contact-detail">
                  <strong>Email Inquiries:</strong>
                  <a href={`mailto:${SHOP_CONFIG.email}`}>{SHOP_CONFIG.email}</a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-box">
                  <Clock size={20} />
                </div>
                <div className="contact-detail">
                  <strong>Showroom Timings:</strong>
                  <p>{SHOP_CONFIG.workingHours}</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-box">
                  <Instagram size={20} />
                </div>
                <div className="contact-detail">
                  <strong>Official Instagram Page:</strong>
                  <a
                    href={SHOP_CONFIG.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#E1306C', fontWeight: 'bold' }}
                  >
                    {SHOP_CONFIG.instagramHandle}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Instant Message Form */}
          <div className="contact-card" style={{ background: '#ffffff' }}>
            <h3 style={{ fontFamily: 'var(--font-royal)', color: 'var(--color-maroon-primary)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              Send an Instant Message
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Fill in your details below to connect directly with our head saree stylist:
            </p>

            {submitted && (
              <div style={{ background: '#eaf7ee', border: '1px solid #a3e635', color: '#15803d', padding: '0.85rem', borderRadius: '6px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                <Check size={18} />
                <span>Thank you! Your message was sent via WhatsApp.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Your Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Smt. Lakshmi Rao"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp / Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message / Saree Query</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about the occasion (Muhurtham, Reception, Puja, Gift) or preferred colors..."
                  className="form-textarea"
                  rows={4}
                />
              </div>

              <button type="submit" className="btn-primary-gold" style={{ width: '100%', marginTop: '0.5rem' }}>
                <Send size={16} />
                <span>Send via WhatsApp</span>
              </button>
            </form>
          </div>
        </div>

        {/* Showroom Map & Directions Section */}
        <div style={{ marginTop: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <span className="section-eyebrow">Visit Our Showroom</span>
            <h3 style={{ fontFamily: 'var(--font-royal)', color: 'var(--color-maroon-primary)', fontSize: '1.6rem', marginTop: '0.25rem' }}>
              Find Us on Google Maps
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Located in RR Layout, Madanapalle. Walk in to explore authentic handlooms and bridal silk sarees.
            </p>
          </div>

          <div style={{
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--color-gold-border)',
            boxShadow: 'var(--shadow-md)',
            background: '#ffffff'
          }}>
            <iframe
              title="Sree Collections Showroom Location on Google Maps"
              src="https://maps.google.com/maps?q=RR+Layout,+Madanapalle,+Andhra+Pradesh&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="360"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div style={{
              background: '#ffffff',
              padding: '1rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              borderTop: '1px solid var(--color-gold-border)'
            }}>
              <div>
                <strong style={{ color: 'var(--color-maroon-primary)', fontSize: '1.05rem', display: 'block' }}>
                  Sree Collections Showroom
                </strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {SHOP_CONFIG.address} &bull; Open All 7 Days ({SHOP_CONFIG.workingHours})
                </p>
              </div>
              <a
                href={SHOP_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-gold btn-gold"
                style={{
                  fontSize: '0.88rem',
                  padding: '0.65rem 1.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none'
                }}
              >
                <MapPin size={16} />
                <span>Get Directions on Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

