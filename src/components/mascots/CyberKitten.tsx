import React from 'react';
import { MascotType, MascotExpression, MascotAccessory } from '../../types/game';

interface CyberKittenProps {
  type: MascotType;
  name?: string;
  expression?: MascotExpression;
  accessory?: MascotAccessory;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isFloating?: boolean;
  className?: string;
}

export const CyberKitten: React.FC<CyberKittenProps> = ({
  type = 'lumi',
  name,
  expression = 'happy',
  accessory = 'none',
  size = 'md',
  isFloating = false,
  className = '',
}) => {
  // Dimensions map
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-44 h-44',
    xl: 'w-60 h-60',
  };

  // Color schemes:
  // Lumi: Ice/Celestial blue & silver glossy cyberpunk palette
  // Nova: Lavender/Lilac & soft cosmic violet & pearl palette
  const colors = type === 'lumi' 
    ? {
        body: '#e0f2fe',
        bodyGrad: ['#bae6fd', '#38bdf8', '#0284c7'],
        earInner: '#f472b6',
        belly: '#f8fafc',
        eyes: '#0284c7',
        eyeHighlight: '#ffffff',
        blush: 'rgba(244, 114, 182, 0.45)',
        halo: '#38bdf8',
        accent: '#38bdf8',
      }
    : {
        body: '#f3e8ff',
        bodyGrad: ['#e9d5ff', '#c084fc', '#9333ea'],
        earInner: '#fb7185',
        belly: '#faf5ff',
        eyes: '#9333ea',
        eyeHighlight: '#ffffff',
        blush: 'rgba(251, 113, 133, 0.45)',
        halo: '#c084fc',
        accent: '#c084fc',
      };

  const renderEyes = () => {
    switch (expression) {
      case 'excited':
        // Star eyes
        return (
          <g>
            {/* Left Eye Star */}
            <path
              d="M 38 48 Q 42 45 42 40 Q 42 45 46 48 Q 42 51 42 56 Q 42 51 38 48 Z"
              fill="#fbbf24"
              className="animate-pulse"
            />
            {/* Right Eye Star */}
            <path
              d="M 58 48 Q 62 45 62 40 Q 62 45 66 48 Q 62 51 62 56 Q 62 51 58 48 Z"
              fill="#fbbf24"
              className="animate-pulse"
            />
          </g>
        );

      case 'heart_eyes':
        // Soft glowing heart eyes for Secret Chemistry
        return (
          <g>
            <path
              d="M 36 46 A 4 4 0 0 1 42 44 A 4 4 0 0 1 48 46 Q 48 51 42 56 Q 36 51 36 46 Z"
              fill="#ec4899"
              filter="drop-shadow(0 0 4px #f43f5e)"
            />
            <path
              d="M 56 46 A 4 4 0 0 1 62 44 A 4 4 0 0 1 68 46 Q 68 51 62 56 Q 56 51 56 46 Z"
              fill="#ec4899"
              filter="drop-shadow(0 0 4px #f43f5e)"
            />
          </g>
        );

      case 'surprised':
        // Big round wide anime eyes with light highlights
        return (
          <g>
            <circle cx="41" cy="48" r="7" fill={colors.eyes} />
            <circle cx="63" cy="48" r="7" fill={colors.eyes} />
            {/* Big sparkle */}
            <circle cx="43" cy="45" r="3" fill="#ffffff" />
            <circle cx="65" cy="45" r="3" fill="#ffffff" />
            <circle cx="39" cy="51" r="1.5" fill="#ffffff" />
            <circle cx="61" cy="51" r="1.5" fill="#ffffff" />
          </g>
        );

      case 'bluffing':
      case 'smug':
        // Sly wink & knowing half-closed eye
        return (
          <g>
            {/* Left Eye: sly curved closed wink */}
            <path d="M 36 50 Q 42 44 48 50" stroke={colors.eyes} strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Right Eye: half-lidded smug gaze */}
            <path d="M 56 46 Q 63 42 70 46" stroke={colors.eyes} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="63" cy="50" r="4.5" fill={colors.eyes} />
            <circle cx="64" cy="48" r="1.8" fill="#ffffff" />
          </g>
        );

      case 'confused':
        // Swirl spiral eyes
        return (
          <g>
            <circle cx="41" cy="48" r="6" stroke={colors.eyes} strokeWidth="2" fill="none" strokeDasharray="3,2" />
            <circle cx="63" cy="48" r="6" stroke={colors.eyes} strokeWidth="2" fill="none" strokeDasharray="3,2" />
            <circle cx="41" cy="48" r="2" fill={colors.eyes} />
            <circle cx="63" cy="48" r="2" fill={colors.eyes} />
          </g>
        );

      case 'complicity':
        // Both eyes curved joyful winks with star sparkles
        return (
          <g>
            <path d="M 35 48 Q 42 42 49 48" stroke={colors.eyes} strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 55 48 Q 62 42 69 48" stroke={colors.eyes} strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="42" cy="40" r="1.5" fill="#fde047" />
            <circle cx="62" cy="40" r="1.5" fill="#fde047" />
          </g>
        );

      case 'happy':
      default:
        // Classic large anime eyes with dual gloss highlight
        return (
          <g>
            <ellipse cx="41" cy="48" rx="6" ry="7" fill={colors.eyes} />
            <ellipse cx="63" cy="48" rx="6" ry="7" fill={colors.eyes} />
            {/* Top highlight */}
            <circle cx="43" cy="45" r="2.5" fill="#ffffff" />
            <circle cx="65" cy="45" r="2.5" fill="#ffffff" />
            {/* Lower secondary sparkle */}
            <circle cx="39" cy="51" r="1.2" fill="#ffffff" opacity="0.85" />
            <circle cx="61" cy="51" r="1.2" fill="#ffffff" opacity="0.85" />
          </g>
        );
    }
  };

  const renderMouth = () => {
    switch (expression) {
      case 'excited':
      case 'heart_eyes':
        return (
          <path d="M 48 57 Q 52 64 56 57 Z" fill="#f43f5e" />
        );
      case 'surprised':
        return (
          <ellipse cx="52" cy="58" rx="3" ry="4.5" fill="#475569" />
        );
      case 'bluffing':
      case 'smug':
        return (
          <path d="M 48 56 Q 54 58 58 54" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />
        );
      case 'confused':
        return (
          <path d="M 48 58 Q 52 55 56 59" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />
        );
      default:
        // Cute cat :3 mouth
        return (
          <path d="M 47 57 Q 50 60 52 57 Q 54 60 57 57" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />
        );
    }
  };

  const renderAccessory = () => {
    switch (accessory) {
      case 'cyber_visor':
        return (
          <g filter="drop-shadow(0 0 6px rgba(56, 189, 248, 0.8))">
            <path
              d="M 30 42 Q 52 38 74 42 L 72 52 Q 52 58 32 52 Z"
              fill="rgba(56, 189, 248, 0.45)"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            {/* Visor digital HUD line */}
            <line x1="36" y1="46" x2="68" y2="46" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 2" opacity="0.8" />
          </g>
        );

      case 'neon_headphones':
        return (
          <g>
            {/* Headband arch */}
            <path d="M 24 45 Q 52 14 80 45" stroke="#ec4899" strokeWidth="4" fill="none" strokeLinecap="round" />
            {/* Left earphone */}
            <ellipse cx="23" cy="46" rx="5" ry="8" fill="#a855f7" stroke="#f472b6" strokeWidth="2" />
            {/* Right earphone */}
            <ellipse cx="81" cy="46" rx="5" ry="8" fill="#a855f7" stroke="#f472b6" strokeWidth="2" />
          </g>
        );

      case 'star_clip':
        return (
          <g transform="translate(68, 26)">
            <polygon
              points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2"
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="1"
            />
          </g>
        );

      case 'halo':
        return (
          <ellipse
            cx="52"
            cy="16"
            rx="20"
            ry="5"
            fill="none"
            stroke="#fef08a"
            strokeWidth="2.5"
            filter="drop-shadow(0 0 6px #fde047)"
          />
        );

      case 'angel_wings':
        return (
          <g opacity="0.85">
            {/* Left wing */}
            <path
              d="M 26 55 C 10 50, 4 65, 14 75 C 20 72, 24 65, 26 55"
              fill="rgba(255, 255, 255, 0.75)"
              stroke="#c084fc"
              strokeWidth="1.5"
            />
            {/* Right wing */}
            <path
              d="M 78 55 C 94 50, 100 65, 90 75 C 84 72, 80 65, 78 55"
              fill="rgba(255, 255, 255, 0.75)"
              stroke="#c084fc"
              strokeWidth="1.5"
            />
          </g>
        );

      case 'bell_collar':
        return (
          <g>
            <path d="M 38 72 Q 52 80 66 72" stroke="#e11d48" strokeWidth="3" fill="none" />
            <circle cx="52" cy="76" r="3.5" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      <div className={`${sizeClasses[size]} ${isFloating ? 'animate-float' : ''} transition-transform duration-300`}>
        <svg viewBox="0 0 104 104" className="w-full h-full drop-shadow-md overflow-visible">
          <defs>
            {/* Body gradient */}
            <linearGradient id={`catGrad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.bodyGrad[0]} />
              <stop offset="60%" stopColor={colors.bodyGrad[1]} />
              <stop offset="100%" stopColor={colors.bodyGrad[2]} />
            </linearGradient>

            {/* Futuristic cyber antenna glow */}
            <filter id="cyberGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Holographic aura background */}
          <circle cx="52" cy="52" r="44" fill={colors.accent} opacity="0.12" filter="url(#cyberGlow)" />

          {/* Wings if selected (rendered behind body) */}
          {accessory === 'angel_wings' && renderAccessory()}

          {/* Cyber Tail with pulse tip */}
          <path
            d="M 28 78 Q 12 85 10 70 Q 8 60 18 64"
            fill="none"
            stroke={colors.bodyGrad[1]}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="18" cy="64" r="3" fill="#ffffff" filter="drop-shadow(0 0 3px #38bdf8)" />

          {/* Ears (Pointy anime cat ears) */}
          {/* Left Ear */}
          <path
            d="M 28 42 L 20 18 Q 28 16 40 28 Z"
            fill={`url(#catGrad-${type})`}
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.5"
          />
          <path d="M 28 38 L 24 23 Q 29 22 36 29 Z" fill={colors.earInner} opacity="0.8" />

          {/* Right Ear */}
          <path
            d="M 76 42 L 84 18 Q 76 16 64 28 Z"
            fill={`url(#catGrad-${type})`}
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.5"
          />
          <path d="M 76 38 L 80 23 Q 75 22 68 29 Z" fill={colors.earInner} opacity="0.8" />

          {/* Cat Cyber Antenna in the center */}
          <path d="M 52 24 L 52 16" stroke={colors.accent} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="52" cy="14" r="3" fill="#ffffff" stroke={colors.accent} strokeWidth="1.5" className="animate-pulse" />

          {/* Cat Head / Body (Chibi rounded form) */}
          <ellipse
            cx="52"
            cy="52"
            rx="30"
            ry="27"
            fill={`url(#catGrad-${type})`}
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="1.5"
          />

          {/* Soft White Cheeks / Muzzle */}
          <ellipse cx="52" cy="58" rx="16" ry="12" fill={colors.belly} opacity="0.9" />

          {/* Cyber Micro-tattoos on forehead */}
          <path d="M 50 28 L 54 28 M 52 26 L 52 30" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />

          {/* Cheerful anime blush */}
          <ellipse cx="32" cy="56" rx="5" ry="3" fill={colors.blush} />
          <ellipse cx="72" cy="56" rx="5" ry="3" fill={colors.blush} />

          {/* Whiskers (Glossy silver) */}
          <path d="M 22 56 L 14 54 M 22 60 L 13 62" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 82 56 L 90 54 M 82 60 L 91 62" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.5" strokeLinecap="round" />

          {/* Eyes & Mouth */}
          {renderEyes()}
          {renderMouth()}

          {/* Cute tiny nose */}
          <polygon points="52,54 50,52 54,52" fill="#f43f5e" />

          {/* Accessories overlay */}
          {accessory !== 'angel_wings' && renderAccessory()}
        </svg>
      </div>

      {name && (
        <div className="mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900/80 border border-purple-500/30 text-purple-200 tracking-wide backdrop-blur-md">
          {name}
        </div>
      )}
    </div>
  );
};
