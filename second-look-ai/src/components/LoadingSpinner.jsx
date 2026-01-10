import React, { useState, useEffect } from 'react';

const LoadingSpinner = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
    
    return () => clearInterval(timer);
  }, []);

  const getStepText = () => {
    if (progress < 25) return "Uploading your statement...";
    if (progress < 50) return "Validating file format...";
    if (progress < 75) return "Analyzing transaction patterns...";
    return "Generating AI insights...";
  };

  return (
    <div className="text-center py-8">
      {/* Animated AI Icon */}
      <div className="relative inline-block mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo to-teal rounded-2xl flex items-center justify-center mx-auto">
          <span className="text-2xl text-white">AI</span>
        </div>
        <div className="absolute -inset-2 bg-indigo/20 rounded-3xl blur-lg animate-ping"></div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Processing...</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-teal to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="w-full h-full bg-gradient-to-r from-teal to-green-500 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Step Text */}
      <p className="text-gray-600 font-medium mb-2">{getStepText()}</p>
      
      {/* Animated Dots */}
      <div className="flex justify-center space-x-1">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className="w-2 h-2 bg-teal rounded-full animate-bounce"
            style={{ animationDelay: `${dot * 0.2}s` }}
          ></div>
        ))}
      </div>

      {/* Estimated Time */}
      <p className="text-sm text-gray-500 mt-4">
        This usually takes 10-30 seconds
      </p>
    </div>
  );
};

export default LoadingSpinner;