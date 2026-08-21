import {
  FunctionComponent,
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { defaultTheme, enableTheme, getTheme } from '../lib/theme';

/**
 * React context for storing theme-related data and callbacks.
 * `colorMode` is `light` or `dark` and will be consumed by
 * various downstream components, including `EuiProvider`.
 */
interface ThemeContextValue {
  colorMode: string;
  setColorMode: (value: string) => void;
}

export const GlobalProvider = createContext<ThemeContextValue>({
  colorMode: defaultTheme,
  setColorMode: () => undefined,
});

interface ThemeProps {
  children: ReactNode;
}

export const Theme: FunctionComponent<ThemeProps> = ({ children }) => {
  const [colorMode, setColorMode] = useState(defaultTheme);

  // on initial mount in the browser, use any theme from local storage
  useEffect(() => {
    setColorMode(getTheme());
  }, []);

  // enable the correct theme when colorMode changes
  useEffect(() => enableTheme(colorMode), [colorMode]);

  return (
    <GlobalProvider.Provider value={{ colorMode, setColorMode }}>
      {children}
    </GlobalProvider.Provider>
  );
};

export const useTheme = () => {
  return useContext(GlobalProvider);
};
