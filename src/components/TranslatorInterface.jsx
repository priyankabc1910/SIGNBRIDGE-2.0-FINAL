// src/components/TranslatorInterface.jsx
import React, { useState, useCallback } from "react";
import CameraInput from "./CameraInput";
import {
  translateTextToSign,
  translateSignToText,
} from "../services/api";

export default function TranslatorInterface({ onBack }) {
  const [mode, setMode] = useState("text"); // "text" | "camera"
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signResult, setSignResult] = useState(null); // text→sign
  const [textResult, setTextResult] = useState(null); // sign→text

  // ---- TEXT → SIGN ----
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
      if (res?.success) {
        setSignResult(res.data);
      } else {
        setError(res?.error || "Translation failed.");
      }
    } catch (e) {
      console.error(e);
      setError("Cannot reach API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // ---- SIGN → TEXT ----
  const handleTranslateLandmarks = useCallback(async (landmarksArray) => {
    setError("");
    setLoading(true);
    setSignResult(null);
    try {
      const res = await translateSignToText(landmarksArray, null);
      if (res?.success) {
        setTextResult(res.data);
      } else {
        setError(res?.error || "Sign recognition failed.");
      }
    } catch (e) {
      console.error(e);
      setError("Cannot reach API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="px-4 py-2 rounded-md bg-gray-700 text-white mb-4"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* INPUT SIDE */}
        <div className="bg-gray-800/60 rounded-xl p-4">
          <div className="flex gap-2 mb-3">
            <button
              className={`px-3 py-2 rounded ${
                mode === "camera"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-200"
              }`}
              onClick={() => setMode("camera")}
            >
              📷 Camera
            </button>
            <button
              className={`px-3 py-2 rounded ${
                mode === "text"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-200"
              }`}
              onClick={() => setMode("text")}
            >
              ⌨️ Text
            </button>
          </div>

          {mode === "text" && (
            <>
              <textarea
                className="w-full h-56 rounded-lg bg-gray-900 text-gray-100 p-4 outline-none"
                placeholder="Type text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                onClick={handleTranslateText}
                disabled={loading}
                className="mt-4 w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-60"
              >
                {loading ? "Translating…" : "Translate to Sign"}
              </button>
            </>
          )}

          {mode === "camera" && (
            <CameraInput onTranslate={handleTranslateLandmarks} />
          )}
        </div>

        {/* OUTPUT SIDE */}
        <div className="bg-gray-800/60 rounded-xl p-4">
          <div className="text-lg font-semibold mb-3">Output</div>

          {error && (
            <div className="mb-3 rounded-md bg-red-600/20 text-red-300 px-3 py-2">
              {error}
            </div>
          )}

          {loading && (
            <div className="rounded-md bg-purple-600/30 text-purple-200 px-3 py-2">
              Processing…
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {/* TEXT → SIGN */}
              {signResult && (
                <div>
                  <div className="text-sm opacity-80 mb-1">
                    For:{" "}
                    <span className="font-mono">
                      {signResult.text || inputText}
                    </span>
                  </div>
                  <div className="text-4xl leading-relaxed">
                    {signResult.signs?.map((s, i) => (
                      <span
                        key={i}
                        title={s.description}
                        className="mr-2"
                      >
                        {s.emoji}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SIGN → TEXT */}
              {textResult && (
                <div className="space-y-1">
                  <div className="text-sm opacity-80">
                    Gesture:{" "}
                    <span className="font-mono">
                      {textResult.gesture || "unknown"}
                    </span>
                  </div>
                  <div className="text-xl font-semibold">
                    Recognized Text:{" "}
                    <span className="font-mono">
                      {textResult.text || "—"}
                    </span>
                  </div>
                  <div className="text-sm opacity-70">
                    Confidence:{" "}
                    {(textResult.confidence ?? 0).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/