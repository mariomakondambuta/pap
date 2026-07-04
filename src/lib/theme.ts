import { createContext, useContext } from 'react';

export type ThemeMode = 'public' | 'buyer' | 'seller';

export const ThemeContext = createContext<ThemeMode>('public');

export function useThemeMode(): ThemeMode {
  return useContext(ThemeContext);
}
