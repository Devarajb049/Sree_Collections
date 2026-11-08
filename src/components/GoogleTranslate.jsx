import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Languages, Globe } from 'lucide-react';

/**
 * GoogleTranslate Component
 * -------------------------------------------------------------
 * Seamlessly integrates Google Website Translator for Sree Collections.
 * Supports toggling between English (default) and Telugu (te).
 * Hides default clumsy Google banners while offering a luxury
 * royal maroon/gold button matching Sree Collections branding.
 */
const GoogleTranslate = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const location = useLocation();
  const scriptInjected = useRef(false);

  // Initialize or check existing cookie state on mount
  useEffect(() => {
    const getGoogleTransCookie = () => {
      const match = document.cookie.match(/(^|;\s*)googtrans=([^;]+)/);
      if (match && match[2]) {
        return match[2].endsWith('/te') ? 'te' : 'en';
      }
      return 'en';
    };

    const savedLang = getGoogleTransCookie();
    setCurrentLang(savedLang);

    // If already set to Telugu, auto-inject Google script
    if (savedLang === 'te') {
      loadGoogleTranslateScript();
    }
  }, []);

  // Re-trigger translation on React Router route change if Telugu is active
  useEffect(() => {
    if (currentLang === 'te' && isLoaded) {
      const timer = setTimeout(() => {
        applyLanguageToDOM('te');
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, currentLang, isLoaded]);

  // Load the external Google Translate script only once
  const loadGoogleTranslateScript = () => {
    if (scriptInjected.current || window.google?.translate) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    scriptInjected.current = true;

    // Define global callback expected by Google Translate
    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,te',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );
        setIsLoaded(true);
        setIsLoading(false);
      } catch (err) {
        console.warn('Google Translate initialization notice:', err);
        setIsLoaded(true);
        setIsLoading(false);
      }
    };

    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = () => {
      console.warn('Google Website Translator script could not be loaded. Preserving English interface.');
      setLoadError(true);
      setIsLoading(false);
      setCurrentLang('en');
    };

    document.head.appendChild(script);
  };

  // Helper to trigger translation in DOM
  const applyLanguageToDOM = (targetLang) => {
    // 1. Set Google Translate cookies
    const hostname = window.location.hostname;
    const cookieVal = targetLang === 'te' ? '/en/te' : '/en/en';
    
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    if (hostname) {
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname};`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostname};`;
    }

    // 2. Trigger Google Translate combo select if present in DOM
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = targetLang;
      combo.dispatchEvent(new Event('change'));
    } else {
      // If combo is not ready yet, re-check in short intervals
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const c = document.querySelector('.goog-te-combo');
        if (c) {
          c.value = targetLang;
          c.dispatchEvent(new Event('change'));
          clearInterval(interval);
        } else if (attempts >= 10) {
          clearInterval(interval);
        }
      }, 200);
    }
  };

  // Toggle button click handler
  const handleToggleLanguage = () => {
    if (loadError) {
      alert('Google Translation service is temporarily unavailable. The website will remain in English.');
      return;
    }

    if (currentLang === 'en') {
      // Switching to Telugu
      setCurrentLang('te');
      if (!isLoaded) {
        loadGoogleTranslateScript();
        // Wait briefly for script to initialize and apply
        setTimeout(() => {
          applyLanguageToDOM('te');
        }, 800);
      } else {
        applyLanguageToDOM('te');
      }
    } else {
      // Switching back to English
      setCurrentLang('en');
      applyLanguageToDOM('en');

      // Clear translation iframe artifacts if any
      const iframe = document.querySelector('iframe.goog-te-banner-frame');
      if (iframe) {
        iframe.style.display = 'none';
      }
      document.body.style.top = '0px';

      // Reload window if needed to clean up DOM text nodes safely
      setTimeout(() => {
        const combo = document.querySelector('.goog-te-combo');
        if (combo && combo.value !== 'en') {
          combo.value = 'en';
          combo.dispatchEvent(new Event('change'));
        }
      }, 100);
    }
  };

  return (
    <div className="google-translate-container">
      {/* Hidden container for Google Translate widget */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      {/* Luxury Sree Collections Translator Button */}
      <button
        type="button"
        onClick={handleToggleLanguage}
        className={`btn-google-translate ${currentLang === 'te' ? 'active-telugu' : ''}`}
        title={currentLang === 'en' ? 'Click to translate entire website to Telugu' : 'Switch back to English'}
        aria-label="Translate Website Language"
        disabled={isLoading}
      >
        <Globe size={16} className={`translate-icon ${isLoading ? 'animate-spin' : ''}`} />
        <span className="translate-btn-text">
          {isLoading
            ? 'Loading...'
            : currentLang === 'en'
            ? 'Translate to Telugu'
            : 'English (Original)'}
        </span>
        <span className="translate-lang-tag">
          {currentLang === 'en' ? 'తెలుగు' : 'EN'}
        </span>
      </button>
    </div>
  );
};

export default GoogleTranslate;
