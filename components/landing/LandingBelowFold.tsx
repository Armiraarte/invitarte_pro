import React from 'react';
import { BenefitsSection, type LandingBenefit } from './BenefitsSection';
import { ExperienceSection } from './ExperienceSection';
import { FaqSection } from './FaqSection';
import { PlatformSection, PriceSection, QrControlSection } from './SystemSections';
import { TemplatesCatalog } from './TemplatesCatalog';
import type { AccentBadgeRenderer, LandingProcessItem, MotionVariants } from './shared';

export type LandingBelowFoldProps = {
  benefits: LandingBenefit[];
  processItems: LandingProcessItem[];
  displayFont: React.CSSProperties;
  fadeInUp: MotionVariants;
  staggerGroup: MotionVariants;
  renderAccentBadge: AccentBadgeRenderer;
  price: string;
  invitationFeatures: readonly string[];
  onStart: () => void;
  onUseTemplate: (templateId: string) => void;
};

const LandingBelowFoldComponent: React.FC<LandingBelowFoldProps> = ({
  benefits,
  processItems,
  displayFont,
  fadeInUp,
  staggerGroup,
  renderAccentBadge,
  price,
  invitationFeatures,
  onStart,
  onUseTemplate
}) => {
  const motionProps = { displayFont, fadeInUp, staggerGroup };

  return (
    <>
      <BenefitsSection benefits={benefits} renderAccentBadge={renderAccentBadge} {...motionProps} />
      <ExperienceSection processItems={processItems} renderAccentBadge={renderAccentBadge} {...motionProps} />
      <PlatformSection {...motionProps} />
      <TemplatesCatalog onUseTemplate={onUseTemplate} {...motionProps} />
      <QrControlSection {...motionProps} />
      <PriceSection price={price} invitationFeatures={invitationFeatures} onStart={onStart} {...motionProps} />
      <FaqSection price={price} {...motionProps} />
    </>
  );
};

export const LandingBelowFold = React.memo(LandingBelowFoldComponent);
