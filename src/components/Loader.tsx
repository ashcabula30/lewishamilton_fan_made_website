import React, { useEffect, useState } from 'react';

interface LoaderProps {
  isLoading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isLoading }) => {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShouldRender(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-[100] bg-[#f8f7f5] flex items-center justify-center transition-all duration-1000 ease-in-out ${!isLoading ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
      <div className="text-[1.4rem] font-bold tracking-[0.2em] animate-pulse text-[#1a1a1a]">
        HAMILTON
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
