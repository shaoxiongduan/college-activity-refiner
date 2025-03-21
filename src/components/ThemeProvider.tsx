"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Define the valid attribute values
type Attribute = 'class' | 'data-theme' | 'data-mode';

// Define the props type here to avoid import issues
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
  attribute?: Attribute | Attribute[];
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  themes?: string[];
  forcedTheme?: string;
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  ...props 
}: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
} 