import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeakingDrillProps {
  term: string;
  onSuccess?: () => void;
}

export function SpeakingDrill({ term, onSuccess }: SpeakingDrillProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<
    | "idle"
    | "listening"
    | "processing"
    | "correct"
    | "incorrect"
    | "unsupported"
  >("idle");
  const recognitionRef = useRef<any>(null);

  // Audio Visualizer Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const successTriggeredRef = useRef(false);

  useEffect(() => {
    // Reset state when term changes
    successTriggeredRef.current = false;
    setStatus("idle");
    setTranscript("");

    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setStatus("listening");
          startVisualizer();
        };

        recognition.onend = () => {
          setIsListening(false);
          stopVisualizer();
          // Only change status to processing if we were actively listening
          // and we haven't already moved to a finished state or reset to idle
          setStatus((prev) => (prev === "listening" ? "processing" : prev));
        };

        recognition.onresult = (event: any) => {
          const result = event.results[0][0].transcript;
          setTranscript(result);
          checkResult(result);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          stopVisualizer();
          // Ignore 'no-speech' error to avoid flickering, just go back to idle
          if (event.error !== "no-speech") {
            setStatus("idle");
          } else {
            setStatus("idle");
          }
        };

        recognitionRef.current = recognition;
      } else {
        setStatus("unsupported");
      }
    }

    return () => {
      stopVisualizer();
      // Abort any running recognition to prevent stale callbacks
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          /* ignore */
        }
        recognitionRef.current = null;
      }
    };
  }, [term]);

  // ... (keeping other functions)

  const playSuccessSound = () => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // "Ting" sound design
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // C6

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio play error", e);
    }
  };

  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      const audioCtx = audioContextRef.current;
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      const analyser = audioCtx.createAnalyser();
      // Increase fftSize to get finer resolution, but we will downsample manually for "bars"
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser); // Connect source to analyser only

      analyserRef.current = analyser;
      sourceRef.current = source;

      drawVisualizer();
    } catch (err) {
      console.error("Error accessing microphone for visualizer:", err);
    }
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current.mediaStream
        .getTracks()
        .forEach((track) => track.stop());
      sourceRef.current = null;
    }
    // Reset canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount; // 32
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw 5 main bars
      const barCount = 5;
      // We'll pick bins index 0 to ~10 where voice energy is usually concentrated
      // But with fftSize 64, bin width is ~689Hz (44100/64).
      // So just taking the first few bins is fine.

      const totalWidth = canvas.width;
      const gap = 12;
      const barWidth = 16;
      const totalBarWidth = barWidth * barCount + gap * (barCount - 1);
      const startX = (totalWidth - totalBarWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        // Average a few bins for stability
        const val = (dataArray[i] + dataArray[i + 1]) / 2;

        // Scale height
        // Max val is 255. Let's make max height ~80% of canvas
        const percent = val / 255;
        // Add a base height so they're visible even when quiet
        const h = canvas.height * 0.8 * percent + 4;

        const x = startX + i * (barWidth + gap);
        const y = (canvas.height - h) / 2; // Center vertically

        // Rounded rect path
        ctx.beginPath();
        // ctx.roundRect(x, y, barWidth, h, 8); // Typescript might complain about roundRect in valid environments
        // Use standard rect + arc or just check if it works. roundRect is relatively new but widely supported.
        // Fallback or ignore TS error if needed.
        // Logic from previous file didn't have special handling, so I'll trust it.
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, h, 8);
        } else {
          ctx.rect(x, y, barWidth, h);
        }

        ctx.fillStyle = "#818cf8"; // Indigo-400
        ctx.fill();
      }
    };

    draw();
  };

  const checkResult = (spokenText: string) => {
    const cleanSpoken = spokenText
      .trim()
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    const cleanTerm = term
      .trim()
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

    // Simple fuzzy match check
    if (cleanSpoken.includes(cleanTerm) || cleanTerm.includes(cleanSpoken)) {
      if (successTriggeredRef.current) return; // Prevent double firing
      successTriggeredRef.current = true;

      setStatus("correct");
      playSuccessSound();
      if (onSuccess) {
        setTimeout(onSuccess, 1500); // Wait a bit before moving on
      }
    } else {
      // Only show incorrect if we haven't already succeeded (rare race case)
      if (!successTriggeredRef.current) {
        setStatus("incorrect");
      }
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript("");
      setStatus("listening");
      recognitionRef.current.start();
    }
  };

  if (status === "unsupported") {
    return (
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-red-200 bg-red-50 rounded-xl text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
        <h4 className="font-bold text-red-900 mb-1">
          Speech Recognition Unavailable
        </h4>
        <p className="text-sm text-red-700">
          Your browser doesn't support speech recognition. <br />
          Please try using <strong>Google Chrome</strong> or{" "}
          <strong>Edge</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto relative group perspective-1000">
      {/* 3D Card Effect */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500 hover:rotate-x-2">
        <div className="text-center mb-8">
          <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-2">
            Speaking Challenge
          </h3>
          <p className="text-4xl font-black text-slate-800 dark:text-white drop-shadow-sm">
            {term}
          </p>
        </div>

        {/* Visualizer / Status Area */}
        <div className="relative h-40 w-full bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center mb-8 border border-slate-200 dark:border-slate-800 group-hover:border-indigo-500/30 transition-colors shadow-inner">
          {/* Canvas Layer - Only visible when listening */}
          <canvas
            ref={canvasRef}
            width={320}
            height={160}
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-300 pointer-events-none",
              status === "listening" ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Status Layer */}
          <div className="relative z-10 text-center px-4 w-full">
            {status === "idle" && (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Mic className="w-8 h-8 opacity-50" />
                <p className="font-medium">Tap mic to speak</p>
              </div>
            )}

            {/* Listening state is handled by canvas, but we can overlay text if needed? 
                        The user asked for "Dancing bars" so the canvas should be the main thing.
                        Maybe hide the text when listening.
                    */}

            {status === "processing" && (
              <div className="flex flex-col items-center gap-2 text-indigo-500">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="font-bold">Checking...</p>
              </div>
            )}

            {status === "correct" && (
              <div className="animate-in zoom-in-50 duration-300 flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="text-green-500 font-black text-xl">Perfect!</p>
                  <p className="text-green-600/60 dark:text-green-400/60 text-sm">
                    Matched: "{transcript}"
                  </p>
                </div>
              </div>
            )}

            {status === "incorrect" && (
              <div className="animate-in shake duration-300 w-full">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-2 text-sm border border-red-100 dark:border-red-900/30">
                  <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase mb-1 px-2">
                    <span>Expected</span>
                    <span>Heard</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex-1 font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded truncate">
                      {term}
                    </span>
                    <span className="text-slate-400">vs</span>
                    <span className="flex-1 font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded truncate">
                      {transcript || "..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            variant={isListening ? "destructive" : "default"}
            className={cn(
              "rounded-full w-20 h-20 p-0 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group relative z-20",
              isListening && "animate-pulse ring-4 ring-red-500/20"
            )}
            onClick={toggleListening}
            disabled={status === "correct" || status === "processing"}
          >
            {isListening ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8 group-hover:text-indigo-200 transition-colors" />
            )}
          </Button>
        </div>

        {status === "incorrect" && (
          <Button
            variant="ghost"
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setStatus("idle")}
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
