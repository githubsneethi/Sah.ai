import React from 'react';
import { LightbulbIcon } from './Icons';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-end gap-3 justify-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500">
          <LightbulbIcon className="w-6 h-6 text-white" />
      </div>
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-2">
        <span className="text-gray-500 text-sm">Sah.ai is thinking...</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;