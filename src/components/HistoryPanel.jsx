import React from 'react';
import { motion } from 'framer-motion';

const HistoryPanel = ({ history }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 dark:text-white">Translation History</h3>
      
      {history.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No translations yet</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {history.map((item, index) => (
            <motion.div
              key={item.id || index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.type === 'sign-to-text' ? '🤟 → 📝' : '📝 → 🤟'}
                </p>
                <p className="font-medium dark:text-white">{item.input}</p>
                <p className="text-gray-600 dark:text-gray-300">→ {item.output}</p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;