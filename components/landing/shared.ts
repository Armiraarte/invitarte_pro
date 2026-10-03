import React from 'react';
import { PackageType } from '../../types';

export type IconName =
  | 'spark'
  | 'calendar'
  | 'calendarAdd'
  | 'stars'
  | 'layers'
  | 'map'
  | 'clock'
  | 'music'
  | 'edit'
  | 'tie'
  | 'ticket'
  | 'send'
  | 'message'
  | 'heart'
  | 'diamond'
  | 'grid'
  | 'gallery'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'whatsapp'
  | 'users'
  | 'check'
  | 'close'
  | 'pin'
  | 'shield'
  | 'leaf'
  | 'plus';

export type MotionVariants = Record<string, unknown>;

export type RenderTitleOptions = {
  as?: 'h1' | 'h2' | 'h3' | 'p';
  scale?: 'hero' | 'heroWide' | 'section' | 'feature' | 'card' | 'quote';
  light?: boolean;
  className?: string;
  titleClassName?: string;
};

export type TitleRenderer = (title: string, color: string, options?: RenderTitleOptions) => React.ReactNode;
export type AccentBadgeRenderer = (icon: IconName, color: string, size?: string) => React.ReactNode;
export type IconRenderer = (icon: IconName, className?: string) => React.ReactNode;

export type PackagePricing = {
  amount: string;
  note: string;
  details: string[];
};

export type PackagePricingMap = Record<PackageType, PackagePricing>;
export type PackageHighlightsMap = Record<PackageType, string[]>;
export type PackageHeadlinesMap = Record<PackageType, string>;
export type PackageFeatureCounts = Record<PackageType, number>;

export type PackageFeatureRow = {
  name: string;
  [PackageType.ORO]: 0 | 1;
  [PackageType.PLATINO]: 0 | 1;
  [PackageType.DIAMANTE]: 0 | 1;
};

export type PackageFeatureGroup = {
  title: string;
  rows: PackageFeatureRow[];
};

export type LandingProcessItem = {
  step: string;
  icon: IconName;
  title: string;
  description: string;
};

export type LandingValuePoint = {
  icon: IconName;
  title: string;
  description: string;
};

export type FooterSocialItem = {
  label: string;
  icon: IconName;
  color: string;
  href: string;
};
