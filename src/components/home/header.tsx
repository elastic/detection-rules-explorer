import Link from 'next/link';
import {
  EuiHeader,
  EuiTitle,
  EuiHeaderSectionItemButton,
  useEuiTheme,
  EuiToolTip,
  EuiIcon,
} from '@elastic/eui';
import ThemeSwitcher from './theme_switcher';
import { headerStyles } from './header.styles';

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
            // Next 13+ Link renders its own <a>; the old nested anchor
            // produced invalid <a><a> markup once passHref stopped cloning.
            <Link key="logo-eui" href="/" css={styles.logo}>
              <EuiIcon type="logoSecurity" size="l" />
              <EuiTitle size="xxs" css={styles.title}>
                <span>Elastic Security Detection Rules</span>
              </EuiTitle>
            </Link>,
          ],
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
        },
      ]}
    />
  );
};

export default Header;
