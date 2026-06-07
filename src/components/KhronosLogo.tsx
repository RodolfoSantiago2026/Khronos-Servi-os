import React from 'react';

interface KhronosLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lightText?: boolean;
  useOfficial?: boolean;
}

export default function KhronosLogo({ 
  className = '', 
  iconOnly = false, 
  size = 'md', 
  lightText = false,
  useOfficial = true
}: KhronosLogoProps) {
  // Dimensions based on size selection
  const dimensions = {
    sm: { iconSize: 20, height: 24, width: 68 },
    md: { iconSize: 28, height: 35, width: 99 },
    lg: { iconSize: 44, height: 49, width: 139 },
    xl: { iconSize: 64, height: 70, width: 198 },
  }[size];

  // If using the official logo asset (which is exact and matches user request)
  if (useOfficial && !iconOnly) {
    return (
      <div className={`flex items-center ${className}`}>
        <img 
          src="/khronos-logo.svg" 
          alt="Khronos"
          style={{ 
            height: `${dimensions.height}px`,
            width: 'auto',
            filter: lightText ? 'brightness(0) invert(1)' : 'none'
          }}
          className="select-none pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon: The two stacked yellow chevrons of Grupo Khronos */}
      <svg 
        width={dimensions.iconSize} 
        height={dimensions.iconSize} 
        viewBox="0 0 80 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Top/Right Chevron */}
        <path 
          d="M68 15L25 36L58 52" 
          stroke="#F9B700" 
          strokeWidth="11" 
          strokeLinecap="square" 
          strokeLinejoin="miter"
          strokeMiterlimit="4"
        />
        {/* Bottom/Left Chevron */}
        <path 
          d="M49 29L12 47L39 61" 
          stroke="#F9B700" 
          strokeWidth="11" 
          strokeLinecap="square" 
          strokeLinejoin="miter"
          strokeMiterlimit="4"
        />
      </svg>

      {!iconOnly && (
        <span 
          className={`font-poppins font-black italic leading-none select-none tracking-tighter ${
            lightText ? 'text-white' : 'text-[#CD1C28]'
          }`}
          style={{ 
            fontSize: size === 'sm' ? '1.25rem' : size === 'md' ? '1.75rem' : size === 'lg' ? '2.5rem' : '3.5rem',
            letterSpacing: '-0.06em'
          }}
        >
          Khronos
        </span>
      )}
    </div>
  );
}

