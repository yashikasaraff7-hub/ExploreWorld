import React, { useEffect, useState } from 'react';
import { Plane, Map as MapIcon, Sun, Camera, Coffee, Compass } from 'lucide-react';

interface LoadingScreenProps {
  message: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const [loadingStep, setLoadingStep] = useState(0);
  const steps = [
    "Scouting the best locations...",
    "Checking local weather reports...",
    "Finding top-rated restaurants...",
    "Looking for hidden gems...",
    "Creating your personalized itinerary..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-100/80 dark:bg-slate-950/90 backdrop-blur-lg animate-fade-in transition-all duration-500">
      <div className="relative w-40 h-40 mb-10">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 border-4 border-slate-300 dark:border-slate-700 rounded-full opacity-30"></div>
        <div className="absolute inset-0 border-4 border-t-blue-500 border-r-blue-400 border-b-transparent border-l-transparent rounded-full animate-spin duration-[2s]"></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-4 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center animate-pulse-slow">
           <Compass className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-bounce" style={{ animationDuration: '3s' }} />
        </div>
      </div>
      
      <div className="text-center space-y-4 max-w-md px-6">
        <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 animate-pulse">
          {message}
        </h3>
        
        <div className="h-8 overflow-hidden relative">
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg transition-all duration-500 transform">
               {steps[loadingStep]}
            </p>
        </div>
      </div>

      <div className="absolute bottom-12 flex gap-8 text-slate-400 dark:text-slate-600 opacity-50">
        <MapIcon className="w-6 h-6 animate-bounce delay-0" />
        <Sun className="w-6 h-6 animate-bounce delay-100" />
        <Camera className="w-6 h-6 animate-bounce delay-200" />
        <Coffee className="w-6 h-6 animate-bounce delay-300" />
      </div>
    </div>
  );
};

export default LoadingScreen;