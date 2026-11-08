import React, { useState, useEffect } from 'react';

interface MascotLogoProps {
  size?: number;
  className?: string;
  interactive?: boolean;
  variant?: '3d' | '2d';
}

export const MascotLogo: React.FC<MascotLogoProps> = ({
  size = 38,
  className = '',
  interactive = true,
  variant,
}) => {
  const [imageError, setImageError] = useState(false);

  // Read preferred style from prop or localStorage
  const activeVariant =
    variant ||
    ((typeof window !== 'undefined' &&
      (localStorage.getItem('reconcile_mascot_variant') as '3d' | '2d')) ||
      '3d');

  // Dynamic image source depending on selected 2D or 3D Duolingo-style variant
  const imageSrc = activeVariant === '2d' ? './mascot-2d.jpg' : './mascot-3d.jpg';

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 rounded-2xl overflow-hidden bg-[#FAF8F5] shadow-xs border border-[#E5E0D8]/80 flex items-center justify-center ${
        interactive
          ? 'hover:scale-108 active:scale-95 transition-transform duration-200 ease-out cursor-pointer'
          : ''
      } ${className}`}
      title="Reconcile Mascot"
    >
      {!imageError ? (
        <img
          src={imageSrc}
          alt="Reconcile Mascot"
          className="w-full h-full object-cover select-none"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Vector SVG Fallback (No brand text, purely the friendly geometric owl emblem) */
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Owl Head & Feathers */}
          <path
            d="M50 14 C30 14 20 28 20 54 C20 74 34 88 50 88 C66 88 80 74 80 54 C80 28 70 14 50 14 Z"
            fill="#3D5438"
          />
          {/* Facial Mask */}
          <circle cx="38" cy="46" r="14" fill="#FAF8F5" />
          <circle cx="62" cy="46" r="14" fill="#FAF8F5" />
          {/* Large Friendly Eyes */}
          <circle cx="39" cy="46" r="7" fill="#171717" />
          <circle cx="41" cy="44" r="2.5" fill="#FAF8F5" />
          <circle cx="61" cy="46" r="7" fill="#171717" />
          <circle cx="63" cy="44" r="2.5" fill="#FAF8F5" />
          {/* Beak */}
          <polygon points="50,52 54,62 46,62" fill="#E9A824" />
          {/* Belly */}
          <path
            d="M36 66 C42 63 58 63 64 66 C66 74 60 84 50 84 C40 84 34 74 36 66 Z"
            fill="#FAF8F5"
          />
        </svg>
      )}
    </div>
  );
};