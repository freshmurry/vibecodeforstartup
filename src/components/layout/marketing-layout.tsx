import React from 'react';
import { Navbar } from '../navbar';
import { Footer } from '../footer';
import { ThemeToggle } from '../theme-toggle';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar>
        <ThemeToggle />
      </Navbar>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// Pages that should use marketing layout
const marketingPages = ['/resources', '/pricing', '/learn', '/enterprise', '/'];

export function shouldUseMarketingLayout(pathname: string): boolean {
  return marketingPages.some(page => pathname === page || pathname.startsWith(page + '/'));
}