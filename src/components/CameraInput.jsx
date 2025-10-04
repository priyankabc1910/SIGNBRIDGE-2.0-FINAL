



// src/components/CameraInput.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Hands } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
import { motion } from "framer-motion";

export default function CameraInput({ onTranslate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [lastLandmarks, setLastLandmarks] = useState(null);
  const [lastHandedness, setLastHandedness] = useState(null);
  const [flipHandedness, setFlipHandedness] = useState(true);

  useEffect(() => {
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setReady(true);
          videoRef.current.play();
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth || 640;
            canvasRef.current.height = videoRef.current.videoHeight || 480;
          }
        };
      } catch (e) {
        console.error("Camera error", e);
      }
    })();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    if (!ready || !videoRef.current) return;

    const hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
      selfieMode: true,
    });

    hands.onResults((results) => {
      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) return;

      ctx.save();
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.scale(-1, 1);
      ctx.translate(-c.width, 0);
      ctx.drawImage(results.image, 0, 0, c.width, c.height);

      if (results.multiHandLandmarks?.length) {
        const lm = results.multiHandLandmarks[0];
        setLastLandmarks(lm);
        const handed = results.multiHandedness?.[0]?.label || "Right";
        setLastHandedness(handed);
        drawConnectors(ctx, lm, Hands.HAND_CONNECTIONS);
        drawLandmarks(ctx, lm);
      } else {
        setLastLandmarks(null);
        setLastHandedness(null);
      }
      ctx.restore();
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => videoRef.current && hands.send({ image: videoRef.current }),
      width: canvasRef.current?.width || 640,
      height: canvasRef.current?.height || 480,
    });
    camera.start();
    return () => { hands.close(); };
  }, [ready]);

  const handleTranslateClick = useCallback(() => {
    if (!lastLandmarks) return;
    const landmarksArray = lastLandmarks.map(p => ({ x: p.x, y: p.y, z: p.z ?? 0 }));
    const effective = flipHandedness && lastHandedness
      ? (lastHandedness === "Left" ? "Right" : "Left")
      : lastHandedness;
    onTranslate?.(landmarksArray, effective);
  }, [lastLandmarks, lastHandedness, flipHandedness, onTranslate]);

  const detected = !!lastLandmarks;

  return (
    <div className="space-y-3">
      <motion.div
        animate={{
          y: detected ? -3 : 0,
          boxShadow: detected
            ? "0 20px 40px rgba(59,130,246,.25)"
            : "0 8px 24px rgba(0,0,0,.25)"
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative w-full max-w-xl mx-auto rounded-xl overflow-hidden"
      >
        <video ref={videoRef} className="w-full" playsInline muted autoPlay />
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: detected
              ? "inset 0 0 0 2px rgba(59,130,246,.6)"
              : "inset 0 0 0 0 rgba(0,0,0,0)",
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </motion.div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-sm ${detected ? "text-green-400" : "text-red-400"}`}>
          {detected
            ? `Hand detected (${lastHandedness || "Right"}) ✅`
            : "Show your hand to the camera ✋"}
        </span>

        <label className="ml-auto flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={flipHandedness}
            onChange={(e) => setFlipHandedness(e.target.checked)}
          />
          Flip handedness (selfie)
        </label>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTranslateClick}
          disabled={!detected}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
        >
          Translate frame
        </motion.button>
      </div>
    </div>
  );
}
