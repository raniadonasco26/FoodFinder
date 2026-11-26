import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X, Navigation, MapPin, Clock, ExternalLink, Copy, Check } from 'lucide-react';
import { gsap, prefersReducedMotion } from '../hooks/useGsapSetup';

export default function DirectionsModal({ restaurant, onClose }) {
  const backdropRef = useRef(null);
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useLayoutEffect(() => {
    if (!restaurant || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      );
      gsap.fromTo(
        cardRef.current,
        { y: 24, scale: 0.96, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'power3.out' }
      );
    });
    return () => ctx.revert();
  }, [restaurant]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!restaurant) return null;

  const walkMins = Math.max(4, Math.round(restaurant.distanceKm * 12));
  const driveMins = Math.max(3, Math.round(restaurant.distanceKm * 4));
  const mapsQuery = encodeURIComponent(`${restaurant.location}, Metro Manila, Philippines`);
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(restaurant.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="directions-modal-title"
    >
      <div
        ref={cardRef}
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close directions preview"
        >
          <X size={18} />
        </button>

        <span className="eyebrow">
          <Navigation size={13} />
          <span>Directions Demonstration</span>
        </span>
        <h2 id="directions-modal-title" className="editorial-serif" style={{ fontSize: '1.6rem' }}>
          {restaurant.name}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
          Simulated route summary based on mock neighborhood distance.
        </p>

        <div className="route-preview-box">
          <div className="meta-row" style={{ color: 'var(--color-text-dark)', fontWeight: 600 }}>
            <MapPin size={17} />
            <span>{restaurant.address}</span>
          </div>
          <div className="meta-row">
            <Navigation size={16} />
            <span>Landmark: {restaurant.landmark}</span>
          </div>
          <div className="meta-row">
            <Clock size={16} />
            <span>
              Est. {restaurant.distanceKm} km · ~{driveMins} mins drive / ~{walkMins} mins walk
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleCopyAddress}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Address Copied' : 'Copy Sample Address'}</span>
          </button>
          <a
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            <span>Open Area in Maps</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
