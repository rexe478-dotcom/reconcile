import React from 'react';

interface ReconcileLogoProps {
  variant?: 'full' | 'mark' | 'horizontal';
  size?: number; // Height or primary dimension
  className?: string;
  showTagline?: boolean;
}

/**
 * Official Reconcile Logo Component
 * Source of truth: 01_brand/reconcile_logo_editable.svg
 * Features the signature 'R' shape, fresh green checkmark (#A5C96B), and notification bell (#1A1A1A).
 */
export const ReconcileLogo: React.FC<ReconcileLogoProps> = ({
  variant = 'horizontal',
  size = 36,
  className = '',
  showTagline = false,
}) => {
  // Standalone Icon Mark (204x204 aspect ratio)
  if (variant === 'mark') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 204 204"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-label="Reconcile Mark"
      >
        <rect width="204" height="204" rx="42" fill="#F5F3ED" />
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
        <path
          d="M178 151c0-13 8-23 19-26v-6a7 7 0 0 1 14 0v6c11 3 19 13 19 26v13h-52z"
          fill="#1A1A1A"
          transform="translate(-5 -5) scale(.86)"
        />
        <circle cx="191" cy="169" r="7" fill="#1A1A1A" />
      </svg>
    );
  }

  // Full Lockup with Tagline (980x260 aspect ratio)
  if (showTagline) {
    const calculatedWidth = Math.round((size * 980) / 260);
    return (
      <svg
        width={calculatedWidth}
        height={size}
        viewBox="0 0 980 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-label="Reconcile Logo"
      >
        <g transform="translate(28 28)">
          <rect width="204" height="204" rx="42" fill="#F5F3ED" />
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
          <path
            d="M178 151c0-13 8-23 19-26v-6a7 7 0 0 1 14 0v6c11 3 19 13 19 26v13h-52z"
            fill="#1A1A1A"
            transform="translate(-5 -5) scale(.86)"
          />
          <circle cx="191" cy="169" r="7" fill="#1A1A1A" />
        </g>
        <text
          x="270"
          y="133"
          fontFamily="Inter, -apple-system, sans-serif"
          fontSize="92"
          fontWeight="700"
          fill="#1A1A1A"
          letterSpacing="-0.03em"
        >
          Reconcile
        </text>
        <text
          x="276"
          y="184"
          fontFamily="Inter, -apple-system, sans-serif"
          fontSize="30"
          fontWeight="500"
          fill="#858477"
        >
          Never miss a subscription again.
        </text>
      </svg>
    );
  }

  // Standard Compact Horizontal Lockup (Responsive flex with SVG mark and crisp typography)
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 204 204"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect width="204" height="204" rx="42" fill="#F5F3ED" />
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
        <path
          d="M178 151c0-13 8-23 19-26v-6a7 7 0 0 1 14 0v6c11 3 19 13 19 26v13h-52z"
          fill="#1A1A1A"
          transform="translate(-5 -5) scale(.86)"
        />
        <circle cx="191" cy="169" r="7" fill="#1A1A1A" />
      </svg>
      <span
        style={{ fontSize: `${Math.round(size * 0.58)}px` }}
        className="font-bold text-[#1A1A1A] tracking-tight leading-none"
      >
        Reconcile
      </span>
    </div>
  );
};
