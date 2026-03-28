/**
 * useFaceProctor — stable interval version
 * checkFace uses refs for all mutable values so it never changes identity,
 * preventing interval stacking on re-renders.
 */
import { useEffect, useRef, useState } from 'react';
import axiosInstance from '../api/axios';

interface FaceCheckResponse {
  face_count: number;
  status: 'ok' | 'no_face' | 'multiple_faces';
  message: string;
}

interface UseFaceProctoringOptions {
  enabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  intervalMs?: number;
  maxViolations?: number;
  onAutoSubmit?: () => void;
}

export const useFaceProctor = ({
  enabled,
  videoRef,
  intervalMs = 60000,
  maxViolations = 5,
  onAutoSubmit,
}: UseFaceProctoringOptions) => {
  const canvasRef      = useRef<HTMLCanvasElement | null>(null);
  const streamRef      = useRef<MediaStream | null>(null);
  const violationRef   = useRef(0);
  const cameraReadyRef = useRef(false);
  const cameraErrorRef = useRef(false);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  onAutoSubmitRef.current = onAutoSubmit; // always latest

  const [faceStatus, setFaceStatus]         = useState<'ok' | 'no_face' | 'multiple_faces' | 'loading'>('loading');
  const [warningMessage, setWarningMessage] = useState('');
  const [showFaceModal, setShowFaceModal]   = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [cameraError, setCameraError]       = useState(false);

  // ── Start camera only when proctoring is enabled ─────────────────────────
  useEffect(() => {
    if (!enabled) return;  // don't touch camera if proctoring is off

    const canvas = document.createElement('canvas');
    canvas.width  = 640;
    canvas.height = 480;
    canvasRef.current = canvas;

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        const tryAttach = () => {
          const video = videoRef.current;
          if (!video) { requestAnimationFrame(tryAttach); return; }
          video.srcObject = stream;
          video.oncanplay = () => {
            video.play()
              .then(() => { cameraReadyRef.current = true; })
              .catch(() => {
                cameraErrorRef.current = true;
                setCameraError(true);
              });
          };
        };
        requestAnimationFrame(tryAttach);
      })
      .catch(() => {
        if (!cancelled) {
          cameraErrorRef.current = true;
          setCameraError(true);
          setWarningMessage('Camera access denied. Face monitoring is disabled.');
        }
      });

    return () => {
      cancelled = true;
      cameraReadyRef.current = false;
      // Stop all tracks to release the camera
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      const video = videoRef.current;
      if (video) { video.srcObject = null; }
    };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stable checkFace — never recreated, reads everything from refs ────────
  const checkFace = useRef(async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;

    if (!cameraReadyRef.current || cameraErrorRef.current) return;
    if (!video || !canvas) return;
    if (video.readyState < 2 || video.videoWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, 640, 480);

    canvas.toBlob(async (blob) => {
      if (!blob || blob.size < 200) return;

      const form = new FormData();
      form.append('file', blob, 'frame.jpg');

      try {
        const res = await axiosInstance.post<FaceCheckResponse>(
          '/proctor/check-face', form,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        const { status, message } = res.data;
        setFaceStatus(status);

        if (status !== 'ok') {
          setWarningMessage(message);
          setShowFaceModal(true);
          violationRef.current += 1;
          setViolationCount(violationRef.current);
          if (violationRef.current >= maxViolations) {
            onAutoSubmitRef.current?.();
          }
        } else {
          setWarningMessage('');
        }
      } catch (err: any) {
        console.warn('[FaceProctor]', err?.response?.data || err?.message);
      }
    }, 'image/jpeg', 0.8);
  });

  // ── Single stable interval — only depends on enabled & intervalMs ─────────
  useEffect(() => {
    if (!enabled) return;

    // Fire once after 3s (camera warm-up), then every intervalMs
    const initial = setTimeout(() => checkFace.current(), 3000);
    const id = setInterval(() => checkFace.current(), intervalMs);

    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, [enabled, intervalMs]); // checkFace.current is a ref — stable, not a dep

  return { faceStatus, warningMessage, showFaceModal, setShowFaceModal, violationCount, cameraError };
};
