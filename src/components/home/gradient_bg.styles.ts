import { css } from '@emotion/react';

/** The seven radial-gradient stops, pre-transparentized by the caller. */
export interface GradientColors {
  topLeft: string;
  centerTop: string;
  topRight: string;
  centerMiddleLeft: string;
  centerMiddleRight: string;
  bottomRight: string;
  bottomLeft: string;
}

export const gradientBgStyles = (backgroundColors: GradientColors) => ({
  gradientBg: css`
    position: relative;
    padding-top: 48px; // top nav
    min-height: 100vh;
    background:
      radial-gradient(
        circle 600px at top left,
        ${backgroundColors.topLeft},
        transparent
      ),
      radial-gradient(
        circle 800px at 600px 200px,
        ${backgroundColors.centerTop},
        transparent
      ),
      radial-gradient(
        circle 800px at top right,
        ${backgroundColors.topRight},
        transparent
      ),
      radial-gradient(
        circle 800px at left center,
        ${backgroundColors.centerMiddleLeft},
        transparent
      ),
      radial-gradient(
        circle 800px at right center,
        ${backgroundColors.centerMiddleRight},
        transparent
      ),
      radial-gradient(
        circle 800px at right bottom,
        ${backgroundColors.bottomRight},
        transparent
      ),
      radial-gradient(
        circle 800px at left bottom,
        ${backgroundColors.bottomLeft},
        transparent
      );
  `,
});
