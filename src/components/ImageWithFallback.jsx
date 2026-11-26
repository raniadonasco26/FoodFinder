import { useState } from 'react';
import { Utensils } from 'lucide-react';

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  loading = 'lazy',
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`img-fallback-surface ${className}`} role="img" aria-label={alt}>
        <Utensils size={28} strokeWidth={1.8} />
        <span>{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setHasError(true)}
    />
  );
}
