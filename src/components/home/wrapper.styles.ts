import { UseEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';

type EuiTheme = UseEuiTheme['euiTheme'];

export const wrapperStyles = (euiTheme: EuiTheme) => ({
  content: css`
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    padding-right: ${euiTheme.size.base};
    padding-bottom: ${euiTheme.size.xxl};
    padding-left: ${euiTheme.size.base};
  `,
});
