// frontend/src/components/onboarding/ConversationalPageLayout.tsx

import { useEffect, useRef } from 'react';

interface ConversationalPageLayoutProps {
  children: React.ReactNode;
}

/**
 * ConversationalPageLayout
 * 
 * Purpose: Provides a container that strictly enforces the "no nested scrolling" rule.
 * Ensures a smooth, single-page scrolling experience and manages auto-scrolling as new content is added.
 * 
 * Key Features:
 * - No internal scroll: The main content area has overflow: visible
 * - Page-level scroll: The body or top-level page div is the only scrollable element
 * - Auto-scroll: Smoothly scrolls to the bottom when new children are added
 */
export const ConversationalPageLayout: React.FC<ConversationalPageLayoutProps> = ({ children }) => {
  const feedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when children change
  useEffect(() => {
    if (feedRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }, [children]);

  return (
    <div id="onboarding-page" className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center py-5 md:py-6">
            <img src="/pathlight-logo.png" alt="PathLight" className="w-8 h-8 md:w-10 md:h-10 mr-2.5" />
            <h1 className="text-[20px] md:text-[24px] font-bold text-[#002B45] tracking-tight" style={{ letterSpacing: '-0.5%' }}>
              PathLight
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content - No internal scrolling */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div 
          id="onboarding-feed" 
          ref={feedRef}
          className="max-w-4xl mx-auto space-y-6"
          style={{ overflow: 'visible' }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};