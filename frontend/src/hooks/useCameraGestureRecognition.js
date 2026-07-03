import { useCallback, useEffect, useRef, useState } from "react";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";
const COOLDOWN_MS = 1800;
const STABLE_FRAMES = 7;

const CATEGORY_TO_GESTURE = {
  Open_Palm: "OPEN_PALM",
  Thumb_Up: "THUMBS_UP",
  Victory: "V_SIGN",
  Closed_Fist: "PALM_DOWN",
};

const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
];

function gestureLabel(code) {
  return {
    OPEN_PALM: "打开手掌",
    SWIPE_LEFT: "向左挥动",
    SWIPE_RIGHT: "向右挥动",
    THUMBS_UP: "点赞",
    V_SIGN: "V 手势",
    PALM_DOWN: "握拳/下压",
  }[code] || code;
}

function getSwipeGesture(history) {
  if (history.length < 4) return null;
  const first = history[0];
  const last = history[history.length - 1];
  const dx = last.x - first.x;
  const dy = Math.abs(last.y - first.y);
  if (Math.abs(dx) < 0.22 || dy > 0.22) return null;
  return dx < 0 ? "SWIPE_LEFT" : "SWIPE_RIGHT";
}

export default function useCameraGestureRecognition({ onGesture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognizerRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const runningRef = useRef(false);
  const lastVideoTimeRef = useRef(-1);
  const lastTriggerRef = useRef(0);
  const stableRef = useRef({ code: "", count: 0 });
  const wristHistoryRef = useRef([]);

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [detected, setDetected] = useState(null);
  const [supported] = useState(() => Boolean(navigator.mediaDevices?.getUserMedia));

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
  }, []);

  const drawLandmarks = useCallback((landmarks) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 360;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    if (!landmarks?.length) return;

    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(34, 211, 238, 0.78)";
    HAND_CONNECTIONS.forEach(([a, b]) => {
      const start = landmarks[a];
      const end = landmarks[b];
      if (!start || !end) return;
      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    });

    ctx.fillStyle = "rgba(167, 139, 250, 0.95)";
    landmarks.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  const maybeTriggerGesture = useCallback(
    async (code, raw = {}) => {
      if (!code) return;
      const now = Date.now();
      if (now - lastTriggerRef.current < COOLDOWN_MS) return;

      if (stableRef.current.code === code) {
        stableRef.current.count += 1;
      } else {
        stableRef.current = { code, count: 1 };
      }

      const isSwipe = code === "SWIPE_LEFT" || code === "SWIPE_RIGHT";
      if (!isSwipe && stableRef.current.count < STABLE_FRAMES) return;

      lastTriggerRef.current = now;
      stableRef.current = { code: "", count: 0 };
      setDetected({ code, label: gestureLabel(code), confidence: raw.confidence || 0, rawName: raw.rawName || "", at: new Date().toISOString() });
      await onGesture?.(code, { source: "camera", ...raw });
    },
    [onGesture],
  );

  const detectLoop = useCallback(async () => {
    if (!runningRef.current || !recognizerRef.current || !videoRef.current) return;
    const video = videoRef.current;
    if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const result = recognizerRef.current.recognizeForVideo(video, performance.now());
      const landmarks = result.landmarks?.[0] || [];
      drawLandmarks(landmarks);

      const best = result.gestures?.[0]?.[0];
      const rawName = best?.categoryName || "";
      const confidence = best?.score || 0;
      let code = confidence >= 0.62 ? CATEGORY_TO_GESTURE[rawName] : null;

      if (landmarks[0]) {
        const now = Date.now();
        wristHistoryRef.current = [...wristHistoryRef.current, { x: landmarks[0].x, y: landmarks[0].y, at: now }].filter((item) => now - item.at < 650);
        code = getSwipeGesture(wristHistoryRef.current) || code;
        if (code === "SWIPE_LEFT" || code === "SWIPE_RIGHT") wristHistoryRef.current = [];
      }

      if (code) await maybeTriggerGesture(code, { rawName, confidence });
    }
    rafRef.current = window.requestAnimationFrame(detectLoop);
  }, [drawLandmarks, maybeTriggerGesture]);

  const start = useCallback(async () => {
    if (!supported) {
      setError("当前浏览器不支持摄像头访问，请使用 Chrome 或 Edge。");
      setStatus("error");
      return;
    }
    if (!window.isSecureContext) {
      setError("浏览器只允许在安全上下文中使用摄像头。请用 http://localhost:5173 打开本站，或配置 HTTPS。");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      recognizerRef.current =
        recognizerRef.current ||
        (await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        }));

      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 960, height: 540, facingMode: "user" }, audio: false });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      runningRef.current = true;
      lastTriggerRef.current = 0;
      wristHistoryRef.current = [];
      setStatus("running");
      rafRef.current = window.requestAnimationFrame(detectLoop);
    } catch (err) {
      stop();
      setStatus("error");
      setError(err?.message || "摄像头手势识别启动失败，请检查浏览器权限或网络。");
    }
  }, [detectLoop, stop, supported]);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, canvasRef, status, error, detected, supported, start, stop };
}
