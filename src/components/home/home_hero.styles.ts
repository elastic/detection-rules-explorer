import { css } from '@emotion/react';

export const homeHeroStyles = euiTheme => ({
  container: css`
    max-width: 1000px;
    margin: auto !important;

    @media (max-width: ${euiTheme.breakpoint.m}px) {
      text-align: center;

      > .euiFlexItem:first-of-type {
        order: 2;
      }
    }

    text-align: center;
  `,
  title: css`
    @media (min-width: ${euiTheme.breakpoint.m}px) {
      padding-top: ${euiTheme.size.base};
    }
  `,
  description: css`
    @media (max-width: ${euiTheme.breakpoint.m}px) {
      align-self: center;
    }
  `,
  search: css`
    width: 500px;
    margin: auto;
  `,
  grid: css`
    justify-content: center;
    justify-items: center;
  `,
});
