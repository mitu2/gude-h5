'use client';

import { HeroUIProvider } from '@heroui/react';
import { ReactNode } from 'react';

interface HeroUIClientProviderProps {
  children: ReactNode;
}

export default function HeroUIClientProvider({ children }: HeroUIClientProviderProps) {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}