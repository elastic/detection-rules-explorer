import { css } from '@emotion/react';

export const ruleDetailsStyles = euiTheme => ({
  container: css`
    max-width: 1200px;
    width: 100%;
    margin: auto !important;
    }
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
