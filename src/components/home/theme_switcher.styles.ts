import { UseEuiTheme } from '@elastic/eui';
import { css, keyframes } from '@emotion/react';

const rotate = keyframes`
   0% {
     transform: rotate(0);
   }
   100% {
     transform: rotate(360deg);
   }
 `;

type EuiTheme = UseEuiTheme['euiTheme'];

export const themeSwitcherStyles = (euiTheme: EuiTheme) => ({
  animation: css`
    animation: ${rotate} 0.5s ease;
    transition: all ${euiTheme.animation.extraSlow} ${euiTheme.animation.bounce};
  `,
});
