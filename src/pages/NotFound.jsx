import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '480px' }}>
        <Compass size={64} className="text-gold" style={{ margin: '0 auto 1.5rem auto' }} />
        <h1 style={{ fontFamily: 'var(--font-royal)', fontSize: '3rem', color: 'var(--color-maroon-primary)', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontFamily: 'var(--font-royal)', fontSize: '1.4rem', color: 'var(--color-maroon-dark)', margin: '0.75rem 0' }}>
          Saree Page Not Found
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          The weave or page you are searching for might have been draped elsewhere or moved.
        </p>
        <Link to="/" className="btn-primary-gold">
          Return to Showroom Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
