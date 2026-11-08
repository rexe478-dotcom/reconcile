import React from 'react';

interface ReconcileLogoProps {
  variant?: 'full' | 'mark' | 'horizontal';
  size?: number;
  className?: string;
  showTagline?: boolean;
}

/**
 * Official Reconcile Logo Component
 * Source of truth: 01_brand/app_icon_reference.png & 01_brand/wordmark_reference.png
 * Features the signature 'R' shape with verified green checkmark (#A5C96B) and notification bell.
 */
export const ReconcileLogo: React.FC<ReconcileLogoProps> = ({
  variant = 'horizontal',
  size = 36,
  className = '',
  showTagline = false,
}) => {
  // Standalone Icon Mark
  if (variant === 'mark') {
    return (
      <img
        src="./assets/brand/app-icon.png"
        alt="Reconcile"
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-2xl object-contain shadow-2xs select-none pointer-events-none ${className}`}
      />
    );
  }

  // Full Lockup with Tagline
  if (showTagline || variant === 'full') {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        <img
          src="./assets/brand/logo-mark-transparent.png"
          alt="Reconcile"
          style={{ width: size, height: size }}
          className="shrink-0 object-contain select-none pointer-events-none drop-shadow-2xs"
        />
        <div>
          <span
            style={{ fontSize: `${Math.round(size * 0.54)}px` }}
            className="font-black text-[#1A1A1A] tracking-tight leading-none block font-sans"
          >
            Reconcile
          </span>
          <span className="text-xs font-semibold text-[#858477] block mt-1 font-sans">
            Never miss a subscription again.
          </span>
        </div>
      </div>
    );
  }

  // Standard Horizontal Lockup
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src="./assets/brand/logo-mark-transparent.png"
        alt="Reconcile"
        style={{ width: size, height: size }}
        className="shrink-0 object-contain select-none pointer-events-none drop-shadow-2xs"
      />
      <span
        style={{ fontSize: `${Math.round(size * 0.58)}px` }}
        className="font-black text-[#1A1A1A] tracking-tight leading-none font-sans"
      >
        Reconcile
      </span>
    </div>
  );
};
