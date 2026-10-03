import React, { useEffect, useMemo, useRef, useState } from 'react';
import { m as motion, useInView, useReducedMotion } from 'motion/react';

type FooterLogoMatrixProps = {
  isDark: boolean;
  isPaused?: boolean;
};

type ShapePoint = {
  cx: number;
  cy: number;
  fill: string;
};

type ShapeDefinition = {
  label: string;
  points: ShapePoint[];
};

const GRID_ROWS = 13;
const GRID_COLS = 64;
const CELL_SIZE = 14;
const BASE_DOT_RADIUS = 3.35;
const ACTIVE_DOT_RADIUS = 3.9;
const HIDDEN_DOT_RADIUS = 1.75;
const VIEWBOX_WIDTH = GRID_COLS * CELL_SIZE;
const VIEWBOX_HEIGHT = GRID_ROWS * CELL_SIZE;
const LETTER_STEP = 6;
const BRAND_COLORS = ['#fb923c', '#22d3ee', '#f472b6', '#a78bfa', '#fbbf24', '#34d399'];
const HEART_COLORS = ['#f472b6', '#fb7185', '#e879f9', '#f472b6'];

const LETTER_PATTERNS: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  M: ['10001', '11011', '10101', '10001', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100']
};

const HEART_PATTERN = [
  '001100001100',
  '011110011110',
  '111111111111',
  '111111111111',
  '111111111111',
  '011111111110',
  '001111111100',
  '000111111000',
  '000011110000',
  '000001100000'
];

const buildPointsFromPattern = (
  pattern: string[],
  startCol: number,
  startRow: number,
  palette: string[]
): ShapePoint[] => {
  const points: ShapePoint[] = [];

  pattern.forEach((rowPattern, rowIndex) => {
    rowPattern.split('').forEach((cell, colIndex) => {
      if (cell !== '1') return;

      points.push({
        cx: (startCol + colIndex) * CELL_SIZE + CELL_SIZE / 2,
        cy: (startRow + rowIndex) * CELL_SIZE + CELL_SIZE / 2,
        fill: palette[(rowIndex + colIndex) % palette.length]
      });
    });
  });

  return points;
};

const buildWordPoints = (word: string, startCol = 5): ShapePoint[] => {
  const points: ShapePoint[] = [];
  let cursor = startCol;

  word.split('').forEach((letter, letterIndex) => {
    const pattern = LETTER_PATTERNS[letter];
    if (!pattern) return;

    points.push(...buildPointsFromPattern(pattern, cursor, 3, [BRAND_COLORS[letterIndex % BRAND_COLORS.length]]));
    cursor += LETTER_STEP;
  });

  return points;
};

const SHAPES: ShapeDefinition[] = [
  {
    label: 'INVITARTE',
    points: buildWordPoints('INVITARTE')
  },
  {
    label: 'Corazon',
    points: buildPointsFromPattern(HEART_PATTERN, 26, 1, HEART_COLORS)
  }
];

const MAX_POINTS = Math.max(...SHAPES.map((shape) => shape.points.length));
const BASE_DOTS = Array.from({ length: GRID_ROWS * GRID_COLS }, (_, index) => {
  const row = Math.floor(index / GRID_COLS);
  const col = index % GRID_COLS;

  return {
    id: `${col}-${row}`,
    cx: col * CELL_SIZE + CELL_SIZE / 2,
    cy: row * CELL_SIZE + CELL_SIZE / 2
  };
});
const HIDDEN_POINT_ANCHORS = Array.from({ length: MAX_POINTS }, (_, index) => {
  const anchorIndex = Math.round((index / Math.max(1, MAX_POINTS - 1)) * (BASE_DOTS.length - 1));
  const anchor = BASE_DOTS[anchorIndex];

  return {
    cx: anchor.cx,
    cy: anchor.cy,
    fill: 'transparent'
  };
});

const FooterLogoMatrixComponent: React.FC<FooterLogoMatrixProps> = ({ isDark, isPaused = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shapeIndex, setShapeIndex] = useState(0);
  const lastPointTargetsRef = useRef<ShapePoint[]>(HIDDEN_POINT_ANCHORS);
  const isInView = useInView(containerRef, { amount: 0.1 });
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = !isPaused && isInView && !shouldReduceMotion;

  useEffect(() => {
    if (!shouldAnimate) return;

    const timer = window.setInterval(() => {
      setShapeIndex((prev) => (prev + 1) % SHAPES.length);
    }, 5200);

    return () => {
      window.clearInterval(timer);
    };
  }, [shouldAnimate]);

  const activeShape = SHAPES[shapeIndex];
  const baseFill = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(24,24,27,0.14)';
  const baseDotElements = useMemo(
    () =>
      BASE_DOTS.map((dot) => (
        <circle
          key={dot.id}
          cx={dot.cx}
          cy={dot.cy}
          r={BASE_DOT_RADIUS}
          fill={baseFill}
        />
      )),
    [baseFill]
  );
  const activePoints = useMemo(
    () =>
      Array.from({ length: MAX_POINTS }, (_, index) => {
        const point = activeShape.points[index] ?? lastPointTargetsRef.current[index] ?? HIDDEN_POINT_ANCHORS[index];

        return (
          {
            cx: point.cx,
            cy: point.cy,
            fill: activeShape.points[index]?.fill ?? point.fill ?? baseFill
          }
        );
      }),
    [activeShape.points, baseFill]
  );
  useEffect(() => {
    lastPointTargetsRef.current = activePoints.map(({ cx, cy, fill }) => ({ cx, cy, fill }));
  }, [activePoints]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden border-y border-white/6 bg-[#050507]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-40 w-[42rem] -translate-x-1/2 rounded-full bg-white/[0.035] blur-3xl" />
      </div>

      <div className="relative px-3 py-4 sm:px-5 sm:py-5 md:px-8">
        <div className="mb-2.5 flex items-center justify-between gap-4 sm:mb-3">
          <p className={`text-[10px] font-black uppercase tracking-[0.26em] ${isDark ? 'text-stone-400' : 'text-zinc-500'}`}>Identidad visual</p>
          <motion.p
            key={activeShape.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`text-[10px] font-black uppercase tracking-[0.22em] ${isDark ? 'text-stone-300' : 'text-zinc-700'}`}
          >
            {activeShape.label}
          </motion.p>
        </div>

        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          shapeRendering="geometricPrecision"
          textRendering="geometricPrecision"
          className="block h-auto w-full"
          style={{ aspectRatio: `${VIEWBOX_WIDTH} / ${VIEWBOX_HEIGHT}` }}
          aria-hidden="true"
          role="img"
        >
          {baseDotElements}

          {activePoints.map((point, index) => {
            const isVisible = index < activeShape.points.length;

            return (
              <motion.circle
                key={`active-${index}`}
                initial={false}
                animate={{
                  cx: point.cx,
                  cy: point.cy,
                  r: isVisible ? ACTIVE_DOT_RADIUS : HIDDEN_DOT_RADIUS,
                  opacity: isVisible ? 0.94 : 0,
                  fill: point.fill
                }}
                transition={{
                  duration: shouldAnimate ? 1.05 : 0,
                  ease: [0.22, 1, 0.36, 1],
                  delay: shouldAnimate ? (index % 10) * 0.01 : 0
                }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export const FooterLogoMatrix = React.memo(FooterLogoMatrixComponent);
