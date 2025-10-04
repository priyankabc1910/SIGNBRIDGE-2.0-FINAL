import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TranslationOutput = ({ translation }) => {
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {
    if (translation?.animation && isPlaying) {
      const interval = setInterval(() => {
        setCurrentSignIndex((prev) => {
          if (prev >= translation.animation.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [translation, isPlaying, currentSignIndex]);
  
  const handlePlayAnimation = () => {
    setCurrentSignIndex(0);
    setIsPlaying(true);
  };
  
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };
  
  if (!translation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Translation will appear here
        </p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {translation.type === 'sign-to-text' ? (
        <>
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <p className="text-3xl font-bold dark:text-white mb-4">
                {translation.output}
              </p>
              {translation.confidence && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Confidence: {(translation.confidence * 100).toFixed(1)}%
                </p>
              )}
            </motion.div>
          </div>
          
          <button
            onClick={() => speakText(translation.output)}
            className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            🔊 Speak
          </button>
        </>
      ) : (
        <>
          <div className="flex-1">
            <div className="grid grid-cols-5 gap-4 mb-6">
              {translation.output?.map((sign, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`text-center p-3 rounded-lg ${
                    currentSignIndex === index && isPlaying
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <div className="text-4xl mb-2">{sign.emoji}</div>
                  <p className="text-xs dark:text-gray-300">{sign.character}</p>
                </motion.div>
              ))}
            </div>
            
            <AnimatePresence>
              {isPlaying && translation.animation?.[currentSignIndex] && (
                <motion.div
                  key={currentSignIndex}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="text-center"
                >
                  <div className="text-8xl">
                    {translation.animation[currentSignIndex].sign}
                  </div>
                  <p className="mt-4 text-lg dark:text-gray-300">
                    {translation.animation[currentSignIndex].description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={handlePlayAnimation}
            disabled={isPlaying}
            className="mt-4 px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            {isPlaying ? '⏸ Playing...' : '▶️ Play Animation'}
          </button>
        </>
      )}
    </div>
  );
};

export default TranslationOutput;