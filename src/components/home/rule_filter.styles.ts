import { css } from '@emotion/react';

export const ruleFilterStyles = () => ({
  aligned: css`
    vertical-align: middle;
    margin-right: 3px;
  `,
  combo: css`
    padding-top: 5px;
    width: 100%;
  `,
  panel: css`
    margin: 10px;
    padding: 10px;

    width: 300px;
    flex-grow: 0;

    text-align: center;
    justify-content: center;
    align-content: start;
  `,
});
