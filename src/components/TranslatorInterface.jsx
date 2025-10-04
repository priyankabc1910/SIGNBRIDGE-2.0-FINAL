
// src/components/TranslatorInterface.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraInput from "./CameraInput";
import { translateTextToSign, translateSignToText } from "../services/api";

export default function TranslatorInterface({ onBack, initialMode = "text" }) {
  // "text" | "camera" | "voice"
  const [mode, setMode] = useState(initialMode);

  // Text -> Sign
  const [inputText, setInputText] = useState("");
  const [signResult, setSignResult] = useState(null);

  // Sign -> Text
  const [textResult, setTextResult] = useState(null);

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Voice
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => setMode(initialMode), [initialMode]);

  const tabBtn = (active) =>
    [
      "px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
      active
        ? "bg-blue-600 text-white"
        : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
    ].join(" ");

  // -------- Text -> Sign --------
  const handleTranslateText = async () => {
    if (!inputText.trim()) {
      setError("Please type some text.");
      return;
    }
    setError("");
    setLoading(true);
    setTextResult(null);
    try {
      const res = await translateTextToSign(inputText.trim());
      if (res?.success) setSignResult(res.data);
      else setError(res?.error || "Translation failed.");
    } catch (e) {
      console.error(e);
      setError("Cannot reach API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // -------- Sign (camera) -> Text --------
  const handleTranslateLandmarks = useCallback(async (landmarksArray, handedness) => {
    setError("");
    setLoading(true);
    setSignResult(null);
    try {
      const res = await translateSignToText(landmarksArray, null, handedness);
      if (res?.success) setTextResult(res.data);
      else setError(res?.error || "Sign recognition failed.");
    } catch (e) {
      console.error(e);
      setError("Cannot reach API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  // -------- Voice -> Text -> Sign (Web Speech API) --------
  const ensureRecognizer = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    if (!recognitionRef.current) {
      const rec = new SR();
      rec.lang = "en-IN";          // adjust as needed
      rec.interimResults = false;  // final results only
      rec.maxAlternatives = 1;

      rec.onstart = () => setListening(true);
      rec.onerror = (e) => {
        console.error("Speech error:", e);
        setError("Voice recognition error: " + e.error);
        setListening(false);
      };
      rec.onend = () => setListening(false);
      rec.onresult = async (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        setInputText(transcript);
        if (transcript.trim()) {
          setLoading(true);
          setError("");
          setSignResult(null);
          setTextResult(null);
          try {
            const res = await translateTextToSign(transcript.trim());
            if (res?.success) setSignResult(res.data);
            else setError(res?.error || "Voice translation failed.");
          } catch {
            setError("Cannot reach API after voice input.");
          } finally {
            setLoading(false);
          }
        }
      };
      recognitionRef.current = rec;
    }
    return recognitionRef.current;
  };

  const handleStartVoice = () => {
    setMode("voice");
    setError("");
    const rec = ensureRecognizer();
    if (!rec) {
      setError("Voice recognition not supported in this browser. Try Chrome or Edge.");
      return;
    }
    try { rec.start(); } catch { /* ignore double start */ }
  };

  const handleStopVoice = () => {
    const rec = recognitionRef.current;
    if (rec && listening) {
      try { rec.stop(); } catch { /* ignore */ }
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && listening) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [listening]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6"
    >
      <motion.button
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        className="px-4 py-2 rounded-md bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white mb-4"
      >
        ← Back
      </motion.button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* =========== INPUT PANEL =========== */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 bg-white text-gray-900 dark:bg-gray-800/60 dark:text-gray-100 shadow-sm"
        >
          <div className="flex gap-2 mb-3">
            <button className={tabBtn(mode === "camera")} onClick={() => setMode("camera")}>
              📷 Camera
            </button>
            <button className={tabBtn(mode === "text")} onClick={() => setMode("text")}>
              ⌨️ Text
            </button>
            <button
              className={tabBtn(mode === "voice")}
              onClick={handleStartVoice}
              title="Speak and auto-translate to signs"
            >
              🎙 Voice
            </button>
            {mode === "voice" && (
              <button
                className={`px-3 py-2 rounded ${listening ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"}`}
                onClick={handleStopVoice}
                title="Stop listening"
              >
                ⏹ Stop
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {mode === "text" ? (
              <motion.div
                key="text"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <textarea
                  className="w-full h-56 rounded-lg p-4 outline-none border
                             bg-white text-gray-900 border-gray-200
                             dark:bg-gray-900 dark:text-gray-100 dark:border-transparent"
                  placeholder="Type text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTranslateText}
                  disabled={loading}
                  className="mt-4 w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-60"
                >
                  {loading ? "Translating…" : "Translate to Sign"}
                </motion.button>
              </motion.div>
            ) : mode === "camera" ? (
              <motion.div
                key="camera"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <CameraInput onTranslate={handleTranslateLandmarks} />
              </motion.div>
            ) : (
              <motion.div
                key="voice"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <div className="rounded-lg p-4 border
                                bg-gray-50 text-gray-900 border-gray-200
                                dark:bg-gray-900 dark:text-gray-100 dark:border-transparent">
                  <div className="font-medium mb-2">Voice Input</div>
                  <p className="text-sm opacity-80">
                    Click <strong>🎙 Voice</strong>, allow microphone permission, and speak.
                    Your speech will be transcribed and auto-translated to signs.
                  </p>
                  <div className="mt-3 text-sm">
                    <span className="opacity-70">Recognized text: </span>
                    <span className="font-mono">
                      {inputText || (listening ? "Listening…" : "—")}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* =========== OUTPUT PANEL =========== */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 bg-white text-gray-900 dark:bg-gray-800/60 dark:text-gray-100 shadow-sm"
        >
          <div className="text-lg font-semibold mb-3">Output</div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-3 rounded-md px-3 py-2
                           bg-red-100 text-red-800
                           dark:bg-red-600/20 dark:text-red-300"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading */}
          <AnimatePresence>
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-md px-3 py-2
                           bg-indigo-100 text-indigo-800
                           dark:bg-purple-600/30 dark:text-purple-200"
              >
                Processing…
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          {!loading && !error && (
            <div className="space-y-4">
              {/* Text -> Sign (incl. voice) */}
              <AnimatePresence>
                {signResult && (
                  <motion.div
                    key="signres"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="text-sm opacity-80 mb-1">
                      For: <span className="font-mono">{signResult.text || inputText}</span>
                    </div>
                    <motion.div
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.05 } },
                      }}
                      className="text-4xl leading-relaxed"
                    >
                      {signResult.signs?.map((s, i) => (
                        <motion.span
                          key={i}
                          title={s.description}
                          className="mr-2 inline-block"
                          initial={{ y: 6, opacity: 0, rotate: -6 }}
                          animate={{ y: 0, opacity: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        >
                          {s.emoji}
                        </motion.span>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sign -> Text */}
              <AnimatePresence>
                {textResult && (
                  <motion.div
                    key="textres"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-1"
                  >
                    <div className="text-sm opacity-80">
                      Gesture: <span className="font-mono">{textResult.gesture || "unknown"}</span>
                    </div>
                    <div className="text-xl font-semibold">
                      Recognized Text:{" "}
                      <motion.span className="font-mono rounded px-2 py-0.5 bg-gray-100 text-gray-900 dark:bg-black/20 dark:text-gray-100">
                        {textResult.text || "—"}
                      </motion.span>
                    </div>
                    <div className="text-sm opacity-70">
                      Confidence: {(textResult.confidence ?? 0).toFixed(2)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
