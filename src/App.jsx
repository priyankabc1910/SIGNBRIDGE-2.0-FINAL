

 // src/App.jsx
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import TranslatorInterface from './components/TranslatorInterface';
import './App.css';

function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [initialMode, setInitialMode] = useState('text');

  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedFontSize = localStorage.getItem('fontSize') || 'normal';
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';

    setDarkMode(savedDarkMode);
    setFontSize(savedFontSize);
    setHighContrast(savedHighContrast);

    if (savedDarkMode) document.documentElement.classList.add('dark');
    if (savedHighContrast) document.documentElement.classList.add('high-contrast');
    document.documentElement.style.fontSize = getFontSizeValue(savedFontSize);
  }, []);

  const getFontSizeValue = (size) => {
    switch (size) {
      case 'small': return '14px';
      case 'large': return '18px';
      case 'extra-large': return '20px';
      default: return '16px';
    }
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', next);
    document.documentElement.classList.toggle('dark');
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    document.documentElement.style.fontSize = getFontSizeValue(size);
  };

  const toggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    localStorage.setItem('highContrast', next);
    document.documentElement.classList.toggle('high-contrast');
  };

  const accessibilityControls = {
    darkMode,
    toggleDarkMode,
    fontSize,
    changeFontSize,
    highContrast,
    toggleHighContrast
  };

  const handleStart = (mode = 'text') => {
    setInitialMode(mode);
    setIsStarted(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-slate-100'}`}>
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <LandingPage
            key="landing"
            onStart={handleStart}
            {...accessibilityControls}
          />
        ) : (
          <TranslatorInterface
            key="translator"
            onBack={() => setIsStarted(false)}
            initialMode={initialMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
