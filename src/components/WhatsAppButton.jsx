import React from 'react';
import { MessageSquare } from 'lucide-react';
import { SHOP_CONFIG } from '../lib/supabase';

const WhatsAppButton = () => {
  const cleanNumber = SHOP_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleanNumber}?text=Namaste%20Sree%20Collections,%20I%20would%20like%20to%20enquire%20about%20your%20saree%20collections.`;

  return (
    <div className="floating-whatsapp-widget">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-btn"
        title="Chat with Sree Collections on WhatsApp"
        aria-label="Direct WhatsApp Contact"
      >
        <MessageSquare size={28} />
      </a>
    </div>
  );
};

export default WhatsAppButton;

