// ui/SuccessMessage.tsx
import React from 'react';

interface SuccessMessageProps {
  isVisible: boolean;
  message: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ isVisible, message }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-600 text-primary px-4 py-2 rounded-lg shadow-lg z-50 animate-fadeIn">
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {message}
      </div>
    </div>
  );
};