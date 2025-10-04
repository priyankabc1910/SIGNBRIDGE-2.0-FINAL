import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TextInput = ({ onTextSubmit }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onTextSubmit(text);
    }
  };
  
  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or speak your message here..."
        className="flex-1 w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        rows={10}
      />
      
      <div className="mt-4 flex space-x-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Translate to Sign
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleVoiceInput}
          disabled={isListening}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300'
          }`}
        >
          {isListening ? '🎤 Listening...' : '🎤 Voice'}
        </motion.button>
      </div>
    </form>
  );
};

export default TextInput;