import { FunctionComponent, ReactNode } from 'react';
import Header from './header';
import GradientBg from './gradient_bg';
import { useEuiTheme } from '@elastic/eui';
import { wrapperStyles } from './wrapper.styles';

interface WrapperProps {
  children: ReactNode;
}

const Wrapper: FunctionComponent<WrapperProps> = ({ children }) => {
  const { euiTheme } = useEuiTheme();
  const styles = wrapperStyles(euiTheme);

  return (
    <>
      <Header />

      <GradientBg>
        <div css={styles.content}>{children}</div>
      </GradientBg>
    </>
  );
};

export default Wrapper;
