import React from 'react';
import { ItineraryIcon, ItineraryItem, ItineraryStyle } from '../../types';

const createItineraryId = () => Math.random().toString(36).slice(2, 11);

const DEFAULT_ITINERARY_STYLE: Required<ItineraryStyle> = {
  titleFontFamily: 'Dancing Script',
  titleFontSize: 44,
  timeFontFamily: 'Playfair Display',
  timeFontSize: 16,
  lineColor: '#f5c7c6',
  dotColor: '#f7d9d4',
  iconColor: '#111827',
};

const renderIconSvg = (icon: ItineraryIcon, className: string) => {
  if (icon === 'church') {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 20V8.5L12 5l6 3.5V20M9 20v-4h6v4M10 10h4M12 8v4M4 20h16" />
      </svg>
    );
  }

  if (icon === 'calendar') {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="5" width="16" height="15" rx="2" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeWidth="1.8" d="M8 3.5v4M16 3.5v4M4 9.5h16" />
      </svg>
    );
  }

  if (icon === 'calendarNote') {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="5" y="4.5" width="14" height="15" rx="2" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeWidth="1.8" d="M8 3.5v3M16 3.5v3M5 9h14M9 12.5h6M9 15.5h4" />
      </svg>
    );
  }

  if (icon === 'toast') {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 4v6a4 4 0 0 0 8 0V4M6 20h12M10 20v-4m4 4v-4" />
      </svg>
    );
  }

  if (icon === 'party') {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m5 19 7.5-7.5M10 8l6 6M4 20l4.5-11.5L20 4l-4.5 11.5L4 20Z" />
        <path strokeLinecap="round" strokeWidth="1.8" d="M14 4v2M18 6l-1.4 1.4M19.5 10H17.5" />
      </svg>
    );
  }

  if (icon === 'moon') {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 14.5A7.5 7.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
      </svg>
    );
  }

  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4v4M12 16v4M4 12h4M16 12h4M6.4 6.4l2.8 2.8M14.8 14.8l2.8 2.8M17.6 6.4l-2.8 2.8M9.2 14.8l-2.8 2.8" />
    </svg>
  );
};

export const ITINERARY_ICON_OPTIONS: Array<{ value: ItineraryIcon; label: string }> = [
  { value: 'church', label: 'Ceremonia' },
  { value: 'calendar', label: 'Recepcion' },
  { value: 'calendarNote', label: 'Calendario' },
  { value: 'toast', label: 'Brindis' },
  { value: 'sparkles', label: 'Baile' },
  { value: 'party', label: 'Fiesta' },
  { value: 'moon', label: 'Cierre' },
];

export const renderItineraryIcon = (icon: ItineraryIcon, className = 'h-5 w-5') => renderIconSvg(icon, className);

export const getItineraryStyle = (style?: ItineraryStyle): Required<ItineraryStyle> => ({
  ...DEFAULT_ITINERARY_STYLE,
  ...style,
});

export const createItineraryItem = (overrides?: Partial<ItineraryItem>): ItineraryItem => ({
  id: createItineraryId(),
  time: '09:00 pm',
  title: 'Nuevo momento',
  icon: 'sparkles',
  ...overrides,
});

export const getDefaultItineraryItems = (): ItineraryItem[] => ([
  createItineraryItem({ time: '04:00 pm', title: 'Ceremonia religiosa', icon: 'church' }),
  createItineraryItem({ time: '05:00 pm', title: 'Recepcion', icon: 'calendar' }),
  createItineraryItem({ time: '06:00 pm', title: 'Brindis', icon: 'toast' }),
  createItineraryItem({ time: '07:00 pm', title: 'Baile de novios', icon: 'sparkles' }),
  createItineraryItem({ time: '08:00 pm', title: 'Fiesta', icon: 'party' }),
  createItineraryItem({ time: '01:00 am', title: 'Fin de fiesta', icon: 'moon' }),
]);

interface ItineraryTimelineProps {
  items?: ItineraryItem[];
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  styleConfig?: ItineraryStyle;
  compact?: boolean;
  className?: string;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  items,
  textColor = '#111827',
  fontFamily = 'Inter',
  fontSize = 16,
  fontWeight = '600',
  fontStyle = 'normal',
  styleConfig,
  compact = false,
  className = '',
}) => {
  const resolvedStyle = getItineraryStyle(styleConfig);
  const safeItems = items && items.length > 0 ? items : [];
  const timeFontSize = compact
    ? Math.max(12, Math.round(resolvedStyle.timeFontSize * 0.88))
    : Math.max(14, Math.round(resolvedStyle.timeFontSize * 0.94));
  const eventFontSize = compact
    ? Math.max(11, Math.round(fontSize * 0.84))
    : Math.max(13, Math.round(fontSize * 0.9));
  const itemWidthClass = compact ? 'max-w-[106px]' : 'max-w-[116px]';
  const itemGapClass = compact ? 'gap-4' : 'gap-5';
  const itemRowGapClass = compact ? 'gap-1.5' : 'gap-2';
  const iconSizeClass = compact ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]';
  const dotSizeClass = compact ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const timelineHeightClass = compact ? 'min-h-[320px]' : 'min-h-[340px]';

  return (
    <div className={`relative mx-auto flex h-full w-full max-w-[300px] flex-col ${className}`}>
      {safeItems.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-[28px] border border-dashed border-black/10 bg-white/35 px-6 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Agrega momentos al itinerario.
        </div>
      ) : (
        <div className="relative flex-1">
          <div
            className="absolute bottom-2 left-1/2 top-2 w-[2px] -translate-x-1/2 rounded-full"
            style={{ backgroundColor: resolvedStyle.lineColor }}
          />

          <div className={`relative flex h-full ${timelineHeightClass} flex-col justify-between ${itemGapClass} py-2`}>
            {safeItems.map((item, index) => {
              const isLeft = index % 2 === 0;
              const itemContent = (
                <div className={`${itemWidthClass} space-y-1 ${isLeft ? 'text-right' : 'text-left'}`}>
                  <div className={`flex items-center ${itemRowGapClass} ${isLeft ? 'justify-end' : 'justify-start'}`}>
                    {isLeft && (
                      <span style={{ color: resolvedStyle.iconColor }}>
                        {renderItineraryIcon(item.icon, iconSizeClass)}
                      </span>
                    )}
                    <div className="space-y-1">
                      <p
                        className="leading-none"
                        style={{
                          color: textColor,
                          fontFamily: resolvedStyle.timeFontFamily,
                          fontSize: `${timeFontSize}px`,
                          fontWeight: 800,
                        }}
                      >
                        {item.time}
                      </p>
                      <p
                        className="whitespace-pre-wrap leading-tight"
                        style={{
                          color: textColor,
                          fontFamily,
                          fontSize: `${eventFontSize}px`,
                          fontWeight,
                          fontStyle,
                        }}
                      >
                        {item.title}
                      </p>
                    </div>
                    {!isLeft && (
                      <span style={{ color: resolvedStyle.iconColor }}>
                        {renderItineraryIcon(item.icon, iconSizeClass)}
                      </span>
                    )}
                  </div>
                </div>
              );

              return (
                <div key={item.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
                  <div className="flex justify-end">{isLeft ? itemContent : null}</div>
                  <div className="flex justify-center">
                    <span
                      className={`${dotSizeClass} rounded-full border-2 border-white shadow-[0_0_0_4px_rgba(255,255,255,0.16)]`}
                      style={{ backgroundColor: resolvedStyle.dotColor }}
                    />
                  </div>
                  <div className="flex justify-start">{!isLeft ? itemContent : null}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
