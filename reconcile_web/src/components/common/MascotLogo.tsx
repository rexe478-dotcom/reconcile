import React, { useState } from 'react';

export type MascotPose = 'standing' | 'holding-phone' | 'working' | 'excited' | 'thinking' | 'peek';

interface MascotLogoProps {
  pose?: MascotPose;
  size?: number;
  className?: string;
  interactive?: boolean;
  alt?: string;
  variant?: string; // Backward compatibility
}

const POSE_IMAGES: Record<MascotPose, string> = {
  standing: './assets/mascot/mascot-standing.png',
  'holding-phone': './assets/mascot/mascot-holding-phone.png',
  working: './assets/mascot/mascot-working.png',
  excited: './assets/mascot/mascot-excited.png',
  thinking: './assets/mascot/mascot-thinking.png',
  peek: './assets/mascot/mascot-standing.png',
};

/**
 * Reconcile Official Mascot Component
 * Source of truth: 02_mascot and 05_reference_boards
 * The official character is a friendly boy with curly black hair, cream hoodie
 * featuring the Reconcile logo on the chest, black trousers, and green sneakers.
 */
export const MascotLogo: React.FC<MascotLogoProps> = ({
  pose = 'standing',
  size = 48,
  className = '',
  interactive = true,
  alt = 'Reconcile Mascot',
}) => {
  const [imageError, setImageError] = useState(false);
  const imageSrc = POSE_IMAGES[pose] || POSE_IMAGES.standing;

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 rounded-2xl overflow-hidden bg-[#F5F3ED] border border-[#E5E0D5] flex items-center justify-center ${
        interactive
          ? 'hover:scale-108 active:scale-95 transition-transform duration-200 ease-spring cursor-pointer will-change-transform'
          : ''
      } ${className}`}
      title="Reconcile Mascot"
    >
      {!imageError ? (
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-cover object-top select-none pointer-events-none"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Vector Fallback Emblem (Reconcile R Mark) */
        <svg
          viewBox="0 0 204 204"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M52 40h70c42 0 68 25 68 63 0 37-26 62-68 62H98v-43h22c13 0 21-7 21-19s-8-19-21-19H98v96H52z"
            fill="#1A1A1A"
          />
          <path
            d="M79 99l25 25 57-62"
            stroke="#A5C96B"
            strokeWidth="19"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
};
