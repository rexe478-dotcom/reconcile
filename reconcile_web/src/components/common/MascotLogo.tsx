import React, { useState } from 'react';

interface MascotLogoProps {
  size?: number;
  className?: string;
  interactive?: boolean;
}

export const MascotLogo: React.FC<MascotLogoProps> = ({
  size = 36,
  className = '',
  interactive = true,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 rounded-2xl overflow-hidden bg-white shadow-2xs border border-[#E5E0D8]/60 flex items-center justify-center ${
        interactive ? 'hover:scale-105 active:scale-95 transition-transform duration-200 ease-out cursor-pointer' : ''
      } ${className}`}
      title="Reconcile Vigilant Owl Mascot"
    >
      {!imageError ? (
        <img
          src="./mascot.jpg"
          alt="Reconcile Mascot"
          className="w-full h-full object-cover select-none"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Crisp Vector SVG Fallback (No brand text, purely the vigilant geometric owl emblem) */
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Owl Head & Feathers Silhouette */}
          <path
            d="M50 15 L68 28 L82 22 L75 42 L80 62 L66 82 L50 88 L34 82 L20 62 L25 42 L18 22 L32 28 Z"
            fill="#3D5438"
          />
          {/* Facial Disk in Warm Cream */}
          <path
            d="M50 32 L62 42 L58 60 L50 68 L42 60 L38 42 Z"
            fill="#FAF8F5"
          />
          {/* Vigilant Eyes */}
          <circle cx="43" cy="48" r="6" fill="#171717" />
          <circle cx="44.5" cy="46.5" r="2" fill="#FAF8F5" />
          <circle cx="57" cy="48" r="6" fill="#171717" />
          <circle cx="58.5" cy="46.5" r="2" fill="#FAF8F5" />
          {/* Beak */}
          <polygon points="50,54 53,62 47,62" fill="#D4A373" />
          {/* Chest Feathers Accent */}
          <path
            d="M50 68 L56 78 L44 78 Z"
            fill="#E2EBD8"
            opacity="0.8"
          />
        </svg>
      )}
    </div>
  );
};
