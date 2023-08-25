import Image from 'next/image';
import Link from 'next/link';
import {
  EuiHeader,
  EuiTitle,
  EuiHeaderSectionItemButton,
  useEuiTheme,
  EuiToolTip,
  EuiIcon,
} from '@elastic/eui';
import { imageLoader } from '../../lib/loader';
import ThemeSwitcher from './theme_switcher';
import { headerStyles } from './header.styles';
import Logo from '../../../public/images/logo-eui.svg';

const Header = () => {
  const { euiTheme } = useEuiTheme();
  const href = 'https://github.com/elastic/detection-rules';
  const label = 'EUI GitHub repo';
  const styles = headerStyles(euiTheme);

  return (
    <EuiHeader
      position="fixed"
      sections={[
        {
          items: [
            <Link key="logo-eui" href="/" passHref>
              <a css={styles.logo}>
                <EuiIcon type="logoSecurity" size="l" />
                <EuiTitle size="xxs" css={styles.title}>
                  <span>Elastic Security Detection Rules</span>
                </EuiTitle>
              </a>
            </Link>,
          ],
          borders: 'none',
        },
        {
          items: [
            <ThemeSwitcher key="theme-switcher" />,
            <EuiToolTip content="Github" key="github">
              <EuiHeaderSectionItemButton aria-label={label} href={href}>
                <EuiIcon type="logoGithub" aria-hidden="true" />
              </EuiHeaderSectionItemButton>
            </EuiToolTip>,
          ],
          borders: 'none',
        },
      ]}
    />
  );
};

export default Header;
