import { useState, useRef, useEffect, useMemo } from "react";
import type { Card } from "@/types";
import { Button } from "@/components/ui/button";
import { Play, Mic, Square, ArrowRight, Volume2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShadowingCardProps {
  card: Card;
  onSuccess?: () => void;
}

export function ShadowingCard({ card, onSuccess }: ShadowingCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null); // User's recorded audio
  const [isPlayingModel, setIsPlayingModel] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Parse breakdown if available
  const displayContent = useMemo(() => {
    if (card.breakdown && card.breakdown.length > 0) {
      return card.breakdown;
    }
    return [card.term]; // Fallback if no breakdown
  }, [card]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVisualizer();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startVisualizer = async (stream: MediaStream) => {
    if (!canvasRef.current) return;

    // Init Audio Context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current!;

    // Init Analyser
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    // Connect Source
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    sourceRef.current = source;

    // Draw Loop
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d")!;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = "rgba(255, 255, 255, 0)"; // Transparent clear
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 3;
      canvasCtx.strokeStyle = "#818cf8"; // Indigo-400
      canvasCtx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    // Don't close context here, we might reuse it?
    // Actually typically context is persistent.
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stopVisualizer();

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioUrl(null); // Clear previous

      // Start Visualizer
      startVisualizer(stream);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playModelAudio = () => {
    if (card.audioUrl) {
      const audio = new Audio(card.audioUrl);
      setIsPlayingModel(true);
      audio.onended = () => setIsPlayingModel(false);
      audio.play();
    } else {
      // Fallback TTS
      if ("speechSynthesis" in window) {
        setIsPlayingModel(true);
        const utterance = new SpeechSynthesisUtterance(card.term);
        utterance.lang = "en-US"; // Should ideally come from settings/card language
        utterance.onend = () => setIsPlayingModel(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const playUserAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto p-4 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-sm font-bold text-pink-500 uppercase tracking-widest">
          Shadowing Lab
        </h3>
        <div className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white leading-tight">
          {displayContent.map((chunk, i) => (
            <span key={i} className="block mb-2">
              {chunk}
            </span>
          ))}
        </div>
        {card.definition && (
          <p className="text-slate-500 text-lg font-medium">
            {card.definition}
          </p>
        )}
      </div>

      {/* Visualizer / Interaction Area */}
      <div className="w-full h-48 bg-slate-900 rounded-3xl relative overflow-hidden flex items-center justify-center border border-slate-800 shadow-2xl">
        {/* Canvas always present but active only when recording */}
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="absolute inset-0 w-full h-full z-10"
        />

        {/* Overlay info when not recording */}
        {!isRecording && !audioUrl && (
          <div className="z-20 text-slate-400 flex flex-col items-center gap-2">
            <Mic className="w-8 h-8 opacity-50" />
            <span className="text-sm font-medium">
              Tap Record to visualize your voice
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Player */}
        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-4 flex items-center justify-between border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-full text-indigo-600 dark:text-indigo-300">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="text-sm">
              <p className="font-bold text-slate-700 dark:text-slate-200">
                Native Speaker
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Listen closely to intonation
              </p>
            </div>
          </div>
          <Button
            size="icon"
            variant="secondary"
            onClick={playModelAudio}
            disabled={isPlayingModel}
            className={cn(
              "rounded-full h-10 w-10",
              isPlayingModel && "animate-pulse"
            )}
          >
            <Play className="w-4 h-4 fill-current" />
          </Button>
        </div>

        {/* User Player (shows after recording) */}
        <div
          className={cn(
            "bg-pink-50 dark:bg-pink-900/10 rounded-2xl p-4 flex items-center justify-between border border-pink-100 dark:border-pink-800 transition-opacity duration-300",
            !audioUrl ? "opacity-50 pointer-events-none" : "opacity-100"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 dark:bg-pink-800 rounded-full text-pink-600 dark:text-pink-300">
              <User className="w-5 h-5" />
            </div>
            <div className="text-sm">
              <p className="font-bold text-slate-700 dark:text-slate-200">
                Your Recording
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Compare with model
              </p>
            </div>
          </div>
          <Button
            size="icon"
            variant="secondary"
            onClick={playUserAudio}
            className="rounded-full h-10 w-10 hover:bg-pink-200 dark:hover:bg-pink-800"
          >
            <Play className="w-4 h-4 fill-current" />
          </Button>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center gap-4 mt-2">
        {!isRecording ? (
          <Button
            size="lg"
            onClick={startRecording}
            className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-xl shadow-red-500/30 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
          >
            <Mic className="w-6 h-6 text-white" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={stopRecording}
            className="h-16 w-16 rounded-full bg-slate-800 hover:bg-slate-900 shadow-xl ring-4 ring-red-500/30 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center animate-pulse"
          >
            <Square className="w-6 h-6 text-white fill-white" />
          </Button>
        )}

        {audioUrl && (
          <Button
            size="lg"
            className="h-14 px-8 rounded-2xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/25 ml-4"
            onClick={onSuccess}
          >
            Next Card <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
