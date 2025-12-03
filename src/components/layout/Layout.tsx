import { ReactNode } from 'react';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

// Apple Blue Glassmorphism background
const styles = {
  gradientBg: {
    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #e0f2fe 60%, #f0f9ff 100%)',
    minHeight: '100vh',
  },
};

export function Layout({ children }: LayoutProps) {
  return (
    <div style={styles.gradientBg}>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
