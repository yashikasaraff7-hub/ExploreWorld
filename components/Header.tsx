import React from 'react';
import { Compass } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500">
          <Compass className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">WanderLust AI</h1>
        </div>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
          Your Smart Travel Assistant
        </div>
      </div>
    </header>
  );
};

export default Header;