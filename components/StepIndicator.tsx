
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => (
  <div className="flex items-center justify-center mb-10">
    {[1, 2, 3].map((step) => (
      <React.Fragment key={step}>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
          currentStep >= step ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-gray-300 text-gray-400'
        }`}>
          {step}
        </div>
        {step < 3 && (
          <div className={`w-12 h-1 transition-colors duration-500 ${currentStep > step ? 'bg-indigo-600' : 'bg-gray-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);
