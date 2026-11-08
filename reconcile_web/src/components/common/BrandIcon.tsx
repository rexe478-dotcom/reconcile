import React, { useState } from 'react';

interface BrandIconProps {
  providerName: string;
  size?: number;
  className?: string;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ providerName, size = 40, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const name = (providerName || '').trim().toLowerCase();

  // 1. SPOTIFY - Official Green Circle with Audio Waves
  if (name.includes('spotify')) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-full bg-[#1ED760] flex items-center justify-center text-black shrink-0 shadow-xs ${className}`}
        title="Spotify"
      >
        <svg style={{ width: size * 0.6, height: size * 0.6 }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      </div>
    );
  }

  // 2. NETFLIX - Official Red Ribbon "N" on Black
  if (name.includes('netflix')) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-[#000000] flex items-center justify-center shrink-0 shadow-xs p-1.5 ${className}`}
        title="Netflix"
      >
        <svg style={{ width: size * 0.65, height: size * 0.65 }} viewBox="0 0 24 24">
          {/* Left upright */}
          <path d="M4 2h4.5v20H4z" fill="#E50914" />
          {/* Right upright */}
          <path d="M15.5 2H20v20h-4.5z" fill="#E50914" />
          {/* Shadow behind diagonal */}
          <path d="M4 2l11.5 20H20L8.5 2z" fill="#000000" opacity="0.25" />
          {/* Diagonal ribbon */}
          <path d="M4 2h4.6l11.4 20h-4.6L4 2z" fill="#B81D24" />
        </svg>
      </div>
    );
  }

  // 3. APPLE / ICLOUD - Official Bitten Apple Silhouette
  if (name.includes('apple') || name.includes('icloud')) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-[#000000] flex items-center justify-center text-white shrink-0 shadow-xs ${className}`}
        title="Apple"
      >
        <svg style={{ width: size * 0.55, height: size * 0.55 }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8.92-2.85-.9.04-1.99.6-2.63 1.35-.57.66-.99 1.73-.86 2.76 1.01.08 2.04-.51 2.57-1.26z" />
        </svg>
      </div>
    );
  }

  // 4. ADOBE - Official Adobe "A" Stylized Logo
  if (name.includes('adobe')) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-[#FA0F00] flex items-center justify-center text-white shrink-0 shadow-xs ${className}`}
        title="Adobe"
      >
        <svg style={{ width: size * 0.58, height: size * 0.58 }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.96 4h4.48L24 20h-4.48l-2.78-7.05h-3.48L13.96 4zM10.04 4H5.56L0 20h4.48l2.78-7.05h3.48L10.04 4zM12 9.07l2.25 5.73h-4.5L12 9.07z" />
        </svg>
      </div>
    );
  }

  // 5. YOUTUBE - Official Red TV Screen with White Play Triangle
  if (name.includes('youtube')) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-[#FF0000] flex items-center justify-center text-white shrink-0 shadow-xs ${className}`}
        title="YouTube"
      >
        <svg style={{ width: size * 0.6, height: size * 0.6 }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 22c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 2c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
        </svg>
      </div>
    );
  }

  // 6. CHATGPT / OPENAI - Official Spiraling Flower/Knot Emblem
  if (name.includes('chatgpt') || name.includes('openai')) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-[#10A37F] flex items-center justify-center text-white shrink-0 shadow-xs p-1.5 ${className}`}
        title="ChatGPT"
      >
        <svg style={{ width: size * 0.6, height: size * 0.6 }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
        </svg>
      </div>
    );
  }

  // 7. GOOGLE ONE / GOOGLE DRIVE - Official 4-Color Google "G"
  if (name.includes('google') || name.includes('drive')) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-white border border-[#E5E0D8] flex items-center justify-center shrink-0 shadow-xs p-2 ${className}`}
        title="Google"
      >
        <svg style={{ width: size * 0.58, height: size * 0.58 }} viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      </div>
    );
  }

  // 8. NOTION - Official 3D Monogram Cube
  if (name.includes('notion')) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-white border border-[#E5E0D8] flex items-center justify-center text-black shrink-0 shadow-xs p-1.5 ${className}`}
        title="Notion"
      >
        <svg style={{ width: size * 0.6, height: size * 0.6 }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.459 4.208c.746.606 1.026.56 2.429.466l13.203-.793c.28 0 .093-.28-.047-.373L17.848 1.97c-.466-.373-.98-.606-2.473-.513L2.36 2.389c-.466.046-.56.28-.373.466zm.84 4.664v12.785c0 .793.373 1.073 1.213 1.026l14.23-.84c.84-.046.933-.56.933-1.166V7.94c0-.606-.233-.886-.746-.84l-14.883.886c-.56.047-.747.327-.747.886zm12.364.513c.093.42.093.84 0 1.26-.046.28-.233.373-.42.373-.186 0-.28-.093-.373-.28-.466-.747-.933-.933-1.633-.886l-4.153.28 4.2 6.812c.746 1.166 1.446 1.866 2.566 1.773.327-.047.513.093.56.326.046.28-.14.513-.42.56l-3.36.186c-.326.047-.56-.093-.653-.326-.093-.28.047-.466.373-.56.606-.187.886-.467.56-1.027l-3.36-5.46v5.88c0 .7.373.933 1.26.933.28 0 .373.187.327.42-.047.28-.28.373-.607.373l-3.08.187c-.28 0-.373-.187-.327-.42.047-.28.28-.373.607-.373.84-.047 1.166-.373 1.166-1.12V9.897c0-.513-.233-.746-.793-.746l-.513.047c-.233.046-.327-.14-.28-.373.046-.28.233-.373.513-.373l3.453-.233c.327-.047.56.093.7.373l3.406 5.413v-4.993c0-.653-.42-.886-1.166-.886-.233 0-.327-.187-.28-.42.046-.28.28-.373.56-.373z" />
        </svg>
      </div>
    );
  }

  // 9. CANVA - Official Cyan Gradient Badge with Flowing "C"
  if (name.includes('canva')) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-gradient-to-tr from-[#00C4CC] to-[#7D2AE8] flex items-center justify-center text-white font-black shrink-0 shadow-xs ${className}`}
        title="Canva"
      >
        <span className="font-serif italic text-white font-bold leading-none select-none" style={{ fontSize: size * 0.65 }}>
          C
        </span>
      </div>
    );
  }

  // 10. DSTV - Official Deep Blue Diamond with "D"
  if (name.includes('dstv')) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-[#0054A6] flex items-center justify-center text-white shrink-0 shadow-xs font-black p-1.5 ${className}`}
        title="DSTV"
      >
        <span className="text-white font-black tracking-tight select-none" style={{ fontSize: size * 0.42 }}>
          DStv
        </span>
      </div>
    );
  }

  // 11. AMAZON PRIME - Official Amazon Arrow Smile
  if (name.includes('amazon') || name.includes('prime')) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-[#002F6C] flex items-center justify-center text-white shrink-0 shadow-xs p-1.5 ${className}`}
        title="Amazon Prime"
      >
        <div className="flex flex-col items-center justify-center">
          <span className="font-bold text-[11px] leading-tight text-[#00A8E1]">prime</span>
          <svg style={{ width: size * 0.5, height: size * 0.2 }} viewBox="0 0 24 10" fill="none">
            <path
              d="M1 3c6 4 14 4 20 0"
              stroke="#FF9900"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path d="M19 1l3 2.5-3 2.5" fill="#FF9900" />
          </svg>
        </div>
      </div>
    );
  }

  // 12. MICROSOFT / OFFICE 365 - Official 4-Color Windows/Office Grid
  if (name.includes('microsoft') || name.includes('office') || name.includes('365')) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-white border border-[#E5E0D8] flex items-center justify-center shrink-0 shadow-xs p-2 ${className}`}
        title="Microsoft"
      >
        <div className="grid grid-cols-2 gap-0.5" style={{ width: size * 0.5, height: size * 0.5 }}>
          <div className="bg-[#F25022] rounded-2xs" />
          <div className="bg-[#7FBA00] rounded-2xs" />
          <div className="bg-[#00A4EF] rounded-2xs" />
          <div className="bg-[#FFB900] rounded-2xs" />
        </div>
      </div>
    );
  }

  // 13. Smart Favicon Fetch for any other brand
  // Attempts to retrieve the crisp official company icon via Google Favicons API
  const cleanDomain = name.replace(/[^a-z0-9]/g, '') + '.com';
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`;

  if (!imgError) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-white border border-[#E5E0D8] flex items-center justify-center shrink-0 shadow-xs overflow-hidden p-1.5 ${className}`}
        title={providerName}
      >
        <img
          src={faviconUrl}
          alt={providerName}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // 14. Fallback: Styled colored initial avatar
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl bg-[#F0ECE4] border border-[#E5E0D8] flex items-center justify-center text-[#3D5438] font-bold text-sm shrink-0 select-none ${className}`}
      title={providerName}
    >
      {providerName.charAt(0).toUpperCase()}
    </div>
  );
};
