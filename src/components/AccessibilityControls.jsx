import React from 'react';
import { motion } from 'framer-motion';

const AccessibilityControls = ({ 
  darkMode, 
  toggleDarkMode, 
  fontSize, 
  changeFontSize, 
  highContrast, 
  toggleHighContrast,
  compact = false 
}) => {
  if (compact) {
    return (
      <div className="flex space-x-2">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button
          onClick={toggleHighContrast}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          aria-label="Toggle high contrast"
        >
          {highContrast ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50"
    >
      <h3 className="font-semibold mb-3 dark:text-white">Accessibility</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm dark:text-gray-300">Dark Mode</span>
          <button
            onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full transition-colors ${
              darkMode ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <motion.div
              animate={{ x: darkMode ? 24 : 0 }}
              className="w-6 h-6 bg-white rounded-full shadow"
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm dark:text-gray-300">High Contrast</span>
          <button
            onClick={toggleHighContrast}
            className={`w-12 h-6 rounded-full transition-colors ${
              highContrast ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <motion.div
              animate={{ x: highContrast ? 24 : 0 }}
              className="w-6 h-6 bg-white rounded-full shadow"
            />
          </button>
        </div>
        
        <div>
          <span className="text-sm dark:text-gray-300">Font Size</span>
          <div className="flex space-x-1 mt-1">
            {['small', 'normal', 'large', 'extra-large'].map((size) => (
              <button
                key={size}
                onClick={() => changeFontSize(size)}
                className={`px-2 py-1 text-xs rounded ${
                  fontSize === size 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {size === 'small' ? 'S' : size === 'normal' ? 'M' : size === 'large' ? 'L' : 'XL'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AccessibilityControls;