// src/components/CameraInput.jsx
import React, { useRef, useEffect, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";

export default function CameraInput({ onTranslate, onTranslateSequence }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [sequence, setSequence] = useState([]);

  useEffect(()=>{
    const hands = new Hands({
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
    });
    hands.setOptions({ maxNumHands:1, modelComplexity:1 });
    hands.onResults(res=>{
      const c = canvasRef.current;
      if(!c) return;
      const ctx = c.getContext("2d");
      ctx.clearRect(0,0,c.width,c.height);
      if(res.multiHandLandmarks){
        for(const lm of res.multiHandLandmarks){
          drawConnectors(ctx,lm,Hands.HAND_CONNECTIONS);
          drawLandmarks(ctx,lm);
          if(capturing){
            const gesture = guessGesture(lm);
            if(gesture!=="unknown")
              setSequence(seq => [...seq, gesture]);
          }
        }
      }
    });
    const cam = new Camera(videoRef.current,{
      onFrame:async()=>{await hands.send({image:videoRef.current});},
      width:640,height:480
    });
    cam.start(); setReady(true);
    return ()=>hands.close();
  },[capturing]);

  function guessGesture(lm){
    const yThumb=lm[4].y, yIndex=lm[8].y, yMiddle=lm[12].y;
    if(yIndex<lm[0].y-0.1 && yMiddle>yIndex+0.02) return "pointing_up";
    if(yThumb<lm[0].y-0.08) return "thumbs_up";
    if(yThumb>lm[0].y+0.08) return "thumbs_down";
    if(yIndex<lm[0].y-0.05 && yMiddle<lm[0].y-0.05) return "open_palm";
    return "unknown";
  }

  async function handleStop(){
    setCapturing(false);
    if(sequence.length && onTranslateSequence){
      const res = await fetch("/api/translation/sign-sequence-to-text",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({gestures:sequence})
      });
      const json = await res.json();
      onTranslateSequence(json.data);
      setSequence([]);
    }
  }

  return (
    <div className="space-y-3">
      <video ref={videoRef} className="rounded-xl border" autoPlay muted />
      <canvas ref={canvasRef} width="640" height="480" className="rounded-xl border" />
      <div className="flex gap-3">
        <button onClick={()=>setCapturing(true)} disabled={!ready} className="px-4 py-2 bg-blue-600 text-white rounded">
          ▶️ Start Capture
        </button>
        <button onClick={handleStop} disabled={!capturing} className="px-4 py-2 bg-green-600 text-white rounded">
          ⏹ Stop & Translate
        </button>
      </div>
    </div>
  );
}




