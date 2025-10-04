

import React from "react";
import { motion, MotionConfig } from "framer-motion";

export default function LandingPage({
  onStart,
  darkMode,
  toggleDarkMode,
  highContrast,
  toggleHighContrast,
  fontSize,
  changeFontSize,
}) {
  const ease = [0.22, 1, 0.36, 1];

  const cardVariants = {
    initial: { opacity: 0, y: 12, scale: 1 },
    animate: { opacity: 1, y: 0, scale: 1 },
  };

  const hoverClickable = {
    whileHover: { y: -4, scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 220, damping: 18 },
  };

  // Shared classes so text is always visible in both themes
  const cardBase =
    "rounded-2xl p-6 w-full h-48 md:h-56 shadow-sm " +
    "bg-white text-gray-900 " +
    "dark:bg-gray-800/60 dark:text-gray-100";

  const subtitleText = "mt-2 text-sm text-gray-600 dark:text-gray-300";

  return (
    <MotionConfig transition={{ duration: 0.5, ease }}>
      <div className="min-h-screen relative overflow-hidden">
        {/* Decorative background wash (doesn't override theme colors) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: darkMode ? 0.22 : 0.32 }}
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(1000px 520px at 15% -10%, rgba(56,189,248,.28), transparent 60%), radial-gradient(1000px 520px at 85% -10%, rgba(139,92,246,.28), transparent 60%)",
          }}
        />

        {/* Top bar: title + accessibility controls (unchanged behavior) */}
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-2xl font-semibold"
          >
            <span className="mr-2">✨</span> SignBridge 2.0{" "}
            <span className="ml-2">✨</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-black/10 dark:bg-white/10 rounded-xl px-4 py-2 backdrop-blur"
          >
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
              <span>Dark</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={toggleHighContrast}
              />
              <span>High contrast</span>
            </label>

            <div className="flex items-center gap-1 text-sm">
              <span className="opacity-70 pr-1">Font</span>
              {["S", "M", "L", "XL"].map((s, i) => {
                const sizes = ["small", "normal", "large", "extra-large"];
                const active = sizes[i] === fontSize;
                return (
                  <button
                    key={s}
                    onClick={() => changeFontSize(sizes[i])}
                    className={
                      "px-2 py-1 rounded transition-colors " +
                      (active
                        ? "bg-blue-600 text-white"
                        : "bg-black/10 text-gray-800 dark:bg-white/10 dark:text-gray-200")
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Hero */}
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              Sign Language Translator
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 text-base md:text-lg text-gray-700 dark:text-gray-200"
          >
            Breaking communication barriers with AI-powered sign language translation.
          </motion.p>

          {/* Cards row: first two clickable; Accessible is a static big box */}
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.06 }}
            className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Sign → Text (clickable) */}
            <motion.button
              variants={cardVariants}
              {...hoverClickable}
              onClick={() => onStart("camera")}
              className={`text-left ${cardBase} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label="Start Sign to Text"
            >
              <div className="text-3xl mb-3">🤟</div>
              <div className="font-semibold text-lg mb-1">Sign to Text</div>
              <div className={subtitleText}>
                Translate sign gestures into text in near real-time.
              </div>
            </motion.button>

            {/* Text → Sign (clickable) */}
            <motion.button
              variants={cardVariants}
              {...hoverClickable}
              onClick={() => onStart("text")}
              className={`text-left ${cardBase} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label="Start Text to Sign"
            >
              <div className="text-3xl mb-3">💬</div>
              <div className="font-semibold text-lg mb-1">Text to Sign</div>
              <div className={subtitleText}>
                Convert text into sign sequences & animations.
              </div>
            </motion.button>

            {/* Accessible (STATIC BIG BOX) */}
            <motion.div
              variants={cardVariants}
              className={`md:col-span-2 ${cardBase} cursor-default select-none`}
            >
              <div className="flex items-start gap-4 h-full">
                <div className="text-3xl">♿</div>
                <div className="text-left">
                  <div className="font-semibold text-lg mb-1">Accessible</div>
                  <p className={subtitleText}>
                    Built with inclusivity in mind: dark mode, high-contrast, and font-size
                    controls remain exactly as you set them. This card is static and won’t
                    navigate anywhere.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Main CTA */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart("text")}
            className="mt-10 inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold
                       bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
          >
            Start Translating
          </motion.button>
        </div>
      </div>
    </MotionConfig>
  );
}
