import { css } from '@emotion/react';

export const ruleListStyles = euiTheme => ({
  grid: css`
    padding-top: ${euiTheme.size.base};
    padding-bottom: ${euiTheme.size.base};

    text-align: center;
    justify-content: center;
    align-content: start;

    min-height: 1000px;
  `,
  callout: css`
    max-width: 800px;
    margin: auto;
    padding-top: ${euiTheme.size.base};
    text-align: center;
  `,
});
