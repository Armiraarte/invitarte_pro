import React from 'react';
import type { IconName } from './shared';

export const renderLandingIcon = (icon: IconName, className = 'h-5 w-5') => {
  const shared = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.85,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  };

  switch (icon) {
    case 'spark':
      return (
        <svg {...shared}>
          <path d="M12 2.75L13.9 10.1L21.25 12L13.9 13.9L12 21.25L10.1 13.9L2.75 12L10.1 10.1L12 2.75Z" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...shared}>
          <path d="M7 3.5V6" />
          <path d="M17 3.5V6" />
          <rect x="4" y="5.5" width="16" height="14" rx="3" />
          <path d="M4 9.5H20" />
        </svg>
      );
    case 'calendarAdd':
      return (
        <svg {...shared}>
          <path d="M7 3.5V6" />
          <path d="M17 3.5V6" />
          <rect x="4" y="5.5" width="16" height="14" rx="3" />
          <path d="M4 9.5H20" />
          <path d="M12 12.5V17.5" />
          <path d="M9.5 15H14.5" />
        </svg>
      );
    case 'stars':
      return (
        <svg {...shared}>
          <path d="M6.5 4.5L7.3 7.2L10 8L7.3 8.8L6.5 11.5L5.7 8.8L3 8L5.7 7.2L6.5 4.5Z" />
          <path d="M16 3L17.2 7.3L21.5 8.5L17.2 9.7L16 14L14.8 9.7L10.5 8.5L14.8 7.3L16 3Z" />
          <path d="M13.5 14L14.2 16.3L16.5 17L14.2 17.7L13.5 20L12.8 17.7L10.5 17L12.8 16.3L13.5 14Z" />
        </svg>
      );
    case 'layers':
      return (
        <svg {...shared}>
          <path d="M12 4L21 8.5L12 13L3 8.5L12 4Z" />
          <path d="M5.5 12.2L12 15.5L18.5 12.2" />
          <path d="M5.5 16L12 19.3L18.5 16" />
        </svg>
      );
    case 'map':
      return (
        <svg {...shared}>
          <path d="M9 19L3.75 21V6L9 4L15 6L20.25 4V19L15 21L9 19Z" />
          <path d="M9 4V19" />
          <path d="M15 6V21" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12L15.5 14" />
        </svg>
      );
    case 'music':
      return (
        <svg {...shared}>
          <path d="M16.5 4.5V15" />
          <path d="M9 7.5V18" />
          <path d="M16.5 6.5L9 9" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="14.5" cy="15" r="2" />
        </svg>
      );
    case 'edit':
      return (
        <svg {...shared}>
          <path d="M4 20H8L18.25 9.75L14.25 5.75L4 16V20Z" />
          <path d="M12.75 7.25L16.75 11.25" />
        </svg>
      );
    case 'tie':
      return (
        <svg {...shared}>
          <path d="M9.5 3.5H14.5L13 7.25H11L9.5 3.5Z" />
          <path d="M11 7.25H13L14 12L12 20L10 12L11 7.25Z" />
        </svg>
      );
    case 'ticket':
      return (
        <svg {...shared}>
          <path d="M4 8.5A2.5 2.5 0 016.5 6H17.5A2.5 2.5 0 0120 8.5V10A2 2 0 0018 12A2 2 0 0020 14V15.5A2.5 2.5 0 0117.5 18H6.5A2.5 2.5 0 014 15.5V14A2 2 0 006 12A2 2 0 004 10V8.5Z" />
          <path d="M12 7.5V16.5" />
        </svg>
      );
    case 'send':
      return (
        <svg {...shared}>
          <path d="M21 3L10 14" />
          <path d="M21 3L14 21L10 14L3 10L21 3Z" />
        </svg>
      );
    case 'message':
      return (
        <svg {...shared}>
          <path d="M5 6.5H19A2.5 2.5 0 0121.5 9V14A2.5 2.5 0 0119 16.5H11L7 20V16.5H5A2.5 2.5 0 012.5 14V9A2.5 2.5 0 015 6.5Z" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...shared}>
          <path d="M12 20S4 15.2 4 9.5A4.5 4.5 0 018.5 5C10.1 5 11.3 5.7 12 6.7C12.7 5.7 13.9 5 15.5 5A4.5 4.5 0 0120 9.5C20 15.2 12 20 12 20Z" />
        </svg>
      );
    case 'diamond':
      return (
        <svg {...shared}>
          <path d="M8 4.5H16L20.5 10L12 19.5L3.5 10L8 4.5Z" />
          <path d="M8 4.5L12 19.5L16 4.5" />
          <path d="M3.5 10H20.5" />
        </svg>
      );
    case 'grid':
      return (
        <svg {...shared}>
          <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
          <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
          <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
          <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
        </svg>
      );
    case 'gallery':
      return (
        <svg {...shared}>
          <rect x="3.5" y="5" width="17" height="14" rx="3" />
          <path d="M7.5 14L10.5 11L13.2 13.7L16.5 10.5L20.5 14.5" />
          <circle cx="8.25" cy="9" r="1.2" />
        </svg>
      );
    case 'users':
      return (
        <svg {...shared}>
          <path d="M8.5 11.5A3 3 0 108.5 5.5A3 3 0 008.5 11.5Z" />
          <path d="M15.75 10A2.25 2.25 0 1015.75 5.5A2.25 2.25 0 0015.75 10Z" />
          <path d="M4.5 18C4.5 15.93 6.29 14.25 8.5 14.25C10.71 14.25 12.5 15.93 12.5 18" />
          <path d="M13.25 17C13.52 15.54 14.84 14.5 16.4 14.5C18.16 14.5 19.6 15.83 19.6 17.5" />
        </svg>
      );
    case 'check':
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M8.5 12.3L10.9 14.7L15.8 9.8" />
        </svg>
      );
    case 'close':
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.2 9.2L14.8 14.8" />
          <path d="M14.8 9.2L9.2 14.8" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...shared}>
          <path d="M12 20C12 20 17.5 14.8 17.5 10.4A5.5 5.5 0 106.5 10.4C6.5 14.8 12 20 12 20Z" />
          <circle cx="12" cy="10.25" r="1.9" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...shared}>
          <path d="M12 3.5L18.5 6V11.4C18.5 15.3 15.85 18.74 12 20.5C8.15 18.74 5.5 15.3 5.5 11.4V6L12 3.5Z" />
          <path d="M9.4 12.1L11.15 13.85L14.8 10.2" />
        </svg>
      );
    case 'leaf':
      return (
        <svg {...shared}>
          <path d="M18.5 5.5C13.6 5.5 9.6 8.2 8 12.7C7.35 14.55 7.2 16.45 7.4 18.5C9.45 18.8 11.45 18.62 13.3 17.95C17.8 16.35 20.5 12.35 20.5 7.5V5.5H18.5Z" />
          <path d="M7 19C8.8 15.65 11.55 13.2 15.5 11.5" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...shared}>
          <path d="M12 5V19" />
          <path d="M5 12H19" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...shared}>
          <rect x="4" y="4" width="16" height="16" rx="4.5" />
          <circle cx="12" cy="12" r="3.35" />
          <circle cx="16.9" cy="7.2" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...shared}>
          <path d="M13.35 20V12.4H15.9L16.3 9.45H13.35V7.55C13.35 6.7 13.75 5.9 15.05 5.9H16.4V3.3C16.4 3.3 15.2 3.1 14.05 3.1C11.65 3.1 10.05 4.55 10.05 7.2V9.45H7.75V12.4H10.05V20" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...shared}>
          <path d="M14.4 4.2C14.9 5.65 16.15 6.9 17.75 7.35V9.85C16.45 9.82 15.25 9.42 14.4 8.82V14.1C14.4 16.95 12.18 19.2 9.35 19.2C6.52 19.2 4.3 16.98 4.3 14.15C4.3 11.58 6.18 9.47 8.65 9.1V11.72C7.6 12.02 6.85 12.98 6.85 14.15C6.85 15.54 7.96 16.65 9.35 16.65C10.72 16.65 11.85 15.52 11.85 14.15V4.2H14.4Z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...shared}>
          <path d="M20 11.8C20 16.05 16.55 19.5 12.3 19.5C10.98 19.5 9.74 19.18 8.62 18.57L4.5 19.5L5.48 15.54C4.84 14.42 4.5 13.13 4.5 11.8C4.5 7.55 7.95 4.1 12.2 4.1C16.55 4.1 20 7.55 20 11.8Z" />
          <path d="M9.1 8.9C8.92 8.5 8.72 8.48 8.4 8.48C8.12 8.48 7.84 8.48 7.55 8.78C7.25 9.08 6.42 9.84 6.42 11.33C6.42 12.82 7.58 14.27 7.74 14.48C7.88 14.67 9.95 17.78 13.05 19.02C15.62 20.03 16.14 19.83 16.62 19.78C17.1 19.72 18.2 19.06 18.42 18.42C18.64 17.79 18.64 17.25 18.58 17.13C18.52 17.02 18.34 16.96 18.06 16.82C17.78 16.68 16.44 16.02 16.19 15.91C15.94 15.82 15.76 15.78 15.58 16.04C15.4 16.32 14.88 16.95 14.72 17.13C14.56 17.3 14.4 17.33 14.12 17.19C13.84 17.04 12.95 16.75 11.89 15.8C11.07 15.08 10.5 14.18 10.34 13.92C10.2 13.66 10.33 13.52 10.45 13.37C10.58 13.24 10.73 13 10.86 12.84C11 12.67 11.06 12.55 11.15 12.35C11.23 12.16 11.2 11.97 11.12 11.83C11.04 11.68 10.43 10.22 10.17 9.64C9.94 9.13 9.69 8.99 9.1 8.9Z" />
        </svg>
      );
    default:
      return null;
  }
};
