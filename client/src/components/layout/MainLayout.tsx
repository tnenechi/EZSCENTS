import React from 'react';
import Navbar from './Navbar';
import PromotionsSidebar from '../../features/promotions/components/PromotionsSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, showSidebar = true }) => {
  return (
    <div className="min-h-screen bg-premium-black text-white">
      <Navbar />
      
      <main className="pt-24 pb-12 px-6 lg:px-12 max-w-[1600px] mx-auto">
        <div className={`flex flex-col lg:flex-row gap-12 ${!showSidebar ? 'justify-center' : ''}`}>
          <div className={`flex-1 ${!showSidebar ? 'max-w-4xl' : ''}`}>
            {children}
          </div>
          
          {showSidebar && (
            <div className="hidden lg:block">
              <PromotionsSidebar />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sidebar (optional toggle, but for now just showing at bottom on small screens) */}
      {showSidebar && (
        <div className="lg:hidden px-6 pb-12">
          <PromotionsSidebar />
        </div>
      )}

      <footer className="border-t border-white/10 py-12 px-6 lg:px-12 text-center text-gray-500 text-sm tracking-widest uppercase">
        <p>&copy; {new Date().getFullYear()} {import.meta.env.VITE_BRAND_NAME} Luxury Fragrances. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;
