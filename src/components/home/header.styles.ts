import { UseEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';

type EuiTheme = UseEuiTheme['euiTheme'];

export const headerStyles = (euiTheme: EuiTheme) => ({
  logo: css`
    display: inline-flex;
    flex-wrap: wrap;
    gap: ${euiTheme.size.m};
  `,
  title: css`
    line-height: 1.75; // Measured in the browser
  `,
});
