import React from 'react';

type CountdownBoxStyle = {
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  shadow?: boolean;
};

interface CountdownDisplayProps {
  parts: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  textColor?: string;
  scale?: number;
  itemGap?: number;
  statusLabel?: string;
  title?: string;
  titleFontSize?: number;
  titleFontFamily?: string;
  titleFontWeight?: string | number;
  titleFontStyle?: string;
  titleTextColor?: string;
  panelStyle?: CountdownBoxStyle;
  tileStyle?: CountdownBoxStyle;
  className?: string;
  style?: React.CSSProperties;
}

const COUNTDOWN_UNITS = [
  { key: 'days', label: 'Dias' },
  { key: 'hours', label: 'Hrs' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Seg' },
] as const;

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  parts,
  fontSize = 18,
  fontFamily = 'Inter',
  fontWeight = 700,
  fontStyle = 'normal',
  textColor = '#1a1a1a',
  scale = 100,
  itemGap,
  statusLabel,
  title,
  titleFontSize,
  titleFontFamily,
  titleFontWeight = 800,
  titleFontStyle = 'normal',
  titleTextColor,
  panelStyle,
  tileStyle,
  className,
  style,
}) => {
  const safeScale = Math.max(40, Math.min(320, scale)) / 100;
  const baseFontSize = Math.max(10, fontSize) * safeScale;
  const numberFontSize = Math.max(20, Math.round(baseFontSize * 2.1));
  const labelFontSize = Math.max(7, Math.round(baseFontSize * 0.58));
  const statusFontSize = Math.max(7, Math.round(baseFontSize * 0.62));
  const gapSize = itemGap !== undefined
    ? Math.max(0, itemGap)
    : Math.max(10, Math.round(baseFontSize * 0.65));
  const statusGapSize = Math.max(4, Math.round(baseFontSize * 0.28));
  const useStyledLayout = !!title || !!panelStyle || !!tileStyle;

  if (!useStyledLayout) {
    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          width: 'fit-content',
          flexDirection: 'column',
          alignItems: 'center',
          gap: statusGapSize,
          color: textColor,
          fontFamily,
          fontStyle,
          ...style,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            width: 'fit-content',
            alignItems: 'flex-start',
            gap: gapSize,
          }}
        >
          {COUNTDOWN_UNITS.map((unit) => (
            <div
              key={unit.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 'fit-content',
              }}
            >
              <span
                style={{
                  fontSize: numberFontSize,
                  fontWeight,
                  lineHeight: 0.92,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.06em',
                }}
              >
                {parts[unit.key]}
              </span>
              <span
                style={{
                  marginTop: Math.max(4, Math.round(baseFontSize * 0.18)),
                  fontSize: labelFontSize,
                  fontWeight: 800,
                  lineHeight: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  opacity: 0.68,
                }}
              >
                {unit.label}
              </span>
            </div>
          ))}
        </div>

        {statusLabel ? (
          <p
            style={{
              margin: 0,
              fontSize: statusFontSize,
              fontWeight: 800,
              lineHeight: 1.2,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              opacity: 0.7,
              textAlign: 'center',
            }}
          >
            {statusLabel}
          </p>
        ) : null}
      </div>
    );
  }

  const resolvedPanelStyle: Required<CountdownBoxStyle> = {
    width: panelStyle?.width ?? 0,
    height: panelStyle?.height ?? 0,
    backgroundColor: panelStyle?.backgroundColor ?? 'rgba(255,255,255,0.64)',
    borderColor: panelStyle?.borderColor ?? '#e8d6ad',
    borderWidth: panelStyle?.borderWidth ?? 1,
    borderRadius: panelStyle?.borderRadius ?? 32,
    opacity: panelStyle?.opacity ?? 100,
    shadow: panelStyle?.shadow ?? true,
  };
  const resolvedTileStyle: Required<CountdownBoxStyle> = {
    width: tileStyle?.width ?? 66,
    height: tileStyle?.height ?? 76,
    backgroundColor: tileStyle?.backgroundColor ?? 'rgba(255,255,255,0.78)',
    borderColor: tileStyle?.borderColor ?? '#f1e2bd',
    borderWidth: tileStyle?.borderWidth ?? 1,
    borderRadius: tileStyle?.borderRadius ?? 24,
    opacity: tileStyle?.opacity ?? 100,
    shadow: tileStyle?.shadow ?? true,
  };
  const resolvedTitleFontSize = Math.max(11, titleFontSize ?? Math.round(fontSize * 0.78));
  const resolvedNumberFontSize = Math.max(20, Math.min(Math.round(fontSize * 1.35), 34));
  const resolvedLabelFontSize = Math.max(8, Math.round(fontSize * 0.42));

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        width: 'fit-content',
        flexDirection: 'column',
        alignItems: 'center',
        gap: Math.max(10, Math.round(baseFontSize * 0.4)),
        color: textColor,
        fontFamily,
        fontStyle,
        ...style,
      }}
    >
      {title ? (
        <p
          style={{
            margin: 0,
            color: titleTextColor ?? textColor,
            fontFamily: titleFontFamily ?? fontFamily,
            fontSize: resolvedTitleFontSize,
            fontWeight: titleFontWeight,
            fontStyle: titleFontStyle,
            textTransform: 'uppercase',
            letterSpacing: '0.24em',
            textAlign: 'center',
          }}
        >
          {title}
        </p>
      ) : null}

      <div
        style={{
          display: 'inline-flex',
          width: 'fit-content',
          alignItems: 'center',
          justifyContent: 'center',
          gap: gapSize,
          padding: '16px 12px',
          backgroundColor: resolvedPanelStyle.backgroundColor,
          borderColor: resolvedPanelStyle.borderColor,
          borderWidth: resolvedPanelStyle.borderWidth,
          borderStyle: 'solid',
          borderRadius: resolvedPanelStyle.borderRadius,
          boxShadow: resolvedPanelStyle.shadow ? '0 16px 36px rgba(120,113,108,0.12)' : 'none',
          opacity: resolvedPanelStyle.opacity / 100,
          transform: `scale(${safeScale})`,
          transformOrigin: 'center top',
        }}
      >
        {COUNTDOWN_UNITS.map((unit) => (
          <div
            key={unit.key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 'fit-content',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: resolvedTileStyle.width,
                height: resolvedTileStyle.height,
                backgroundColor: resolvedTileStyle.backgroundColor,
                borderColor: resolvedTileStyle.borderColor,
                borderWidth: resolvedTileStyle.borderWidth,
                borderStyle: 'solid',
                borderRadius: resolvedTileStyle.borderRadius,
                boxShadow: resolvedTileStyle.shadow ? '0 12px 28px rgba(120,113,108,0.14)' : 'none',
                opacity: resolvedTileStyle.opacity / 100,
                color: textColor,
                fontFamily,
                fontStyle,
                fontWeight,
                fontSize: resolvedNumberFontSize,
                lineHeight: 0.92,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.06em',
              }}
            >
              {parts[unit.key]}
            </div>
            <span
              style={{
                marginTop: 8,
                color: textColor,
                fontFamily,
                fontSize: resolvedLabelFontSize,
                fontWeight,
                fontStyle,
                lineHeight: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                textAlign: 'center',
              }}
            >
              {unit.label}
            </span>
          </div>
        ))}
      </div>

      {statusLabel ? (
        <p
          style={{
            margin: 0,
            fontSize: statusFontSize,
            fontWeight: 800,
            lineHeight: 1.2,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            opacity: 0.7,
            textAlign: 'center',
          }}
        >
          {statusLabel}
        </p>
      ) : null}
    </div>
  );
};
