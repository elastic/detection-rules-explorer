import { UseEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';

type EuiTheme = UseEuiTheme['euiTheme'];

export const ruleDetailsStyles = (euiTheme: EuiTheme) => ({
  container: css`
    max-width: 1200px;
    width: 100%;
    margin: auto !important;
  `,
  badge: css`
    margin: 4px;
  `,
  list: css`
    > dt {
      width: 65%;
    }
    > dd {
      width: 35%;
    }
  `,
  callout: css`
    max-width: 1200px;
    margin: auto;
    padding-top: ${euiTheme.size.base};
    text-align: center;
  `,
});
