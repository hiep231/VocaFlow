import { useState, useRef, useEffect } from "react";
import type { Card } from "@/types";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, RotateCw, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ShadowingDrillProps {
  card: Card;
}

export function ShadowingDrill({ card }: ShadowingDrillProps) {
  const [targetText, setTargetText] = useState("");
  const [isPlayingModel, setIsPlayingModel] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [isPlayingUser, setIsPlayingUser] = useState(false);

  // Refs
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setTargetText(card.example || card.term);

    // Cleanup URL cũ để tránh memory leak
    return () => {
      if (userAudioUrl) URL.revokeObjectURL(userAudioUrl);
    };
  }, [card]);

  // --- TTS Function ---
  const playModelAudio = () => {
    if (isPlayingModel) {
      window.speechSynthesis.cancel();
      setIsPlayingModel(false);
      return;
    }

    if (!targetText) return;

    // Stop user playback if running
    if (userAudioRef.current) {
      userAudioRef.current.pause();
      userAudioRef.current.currentTime = 0;
    }

    const utterance = new SpeechSynthesisUtterance(targetText);
    utterance.lang = "en-US";
    utterance.rate = playbackRate;

    utterance.onstart = () => setIsPlayingModel(true);
    utterance.onend = () => setIsPlayingModel(false);
    utterance.onerror = () => setIsPlayingModel(false);

    window.speechSynthesis.speak(utterance);
  };

  // --- Recording Functions ---
  const startRecording = async () => {
    try {
      window.speechSynthesis.cancel();
      setIsPlayingModel(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let mimeType = "";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      }

      // Tạo recorder
      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);

      // Reset chunks trong Ref
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          // Push vào Ref thay vì biến cục bộ
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Tạo Blob từ Ref
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || "audio/webm",
        });

        if (audioBlob.size > 0) {
          const url = URL.createObjectURL(audioBlob);
          setUserAudioUrl(url);
        }

        // Tắt mic hoàn toàn
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(100); // Lấy mẫu mỗi 100ms
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Không thể truy cập Microphone. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const toggleUserPlayback = () => {
    if (!userAudioRef.current) return;

    window.speechSynthesis.cancel();
    setIsPlayingModel(false);

    if (isPlayingUser) {
      userAudioRef.current.pause();
    } else {
      userAudioRef.current
        .play()
        .catch((e) => console.error("Playback failed:", e));
    }
  };

  const handleDeleteAudio = () => {
    if (userAudioUrl) URL.revokeObjectURL(userAudioUrl);
    setUserAudioUrl(null);
    setIsPlayingUser(false);
  };

  return (
    <div className="w-full max-w-2xl p-6 md:p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-2xl shadow-xl flex flex-col items-center gap-6 relative overflow-hidden">
      {/* Header */}
      <div className="text-center space-y-2 relative z-10">
        <h3 className="text-lg font-semibold text-indigo-500 flex items-center justify-center gap-2">
          <Mic className="w-5 h-5" />
          Shadowing Mode
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Listen, Repeat, and Compare.
        </p>
      </div>

      {/* Target Content */}
      <div className="w-full bg-slate-50 dark:bg-slate-950/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-center relative">
        <div className="absolute top-3 left-3 px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-xs text-slate-500 font-bold uppercase">
          Model
        </div>
        <p className="text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-200 mt-4 leading-relaxed">
          "{targetText}"
        </p>

        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            onClick={playModelAudio}
            variant={isPlayingModel ? "secondary" : "default"}
            size="lg"
            className={cn(
              "rounded-full w-14 h-14 transition-all duration-300 shadow-lg",
              isPlayingModel
                ? "bg-indigo-100 text-indigo-600 animate-pulse border-2 border-indigo-500"
                : "bg-indigo-600 hover:bg-indigo-700"
            )}
          >
            {isPlayingModel ? (
              <Square className="fill-current w-5 h-5" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </Button>

          <div className="flex flex-col gap-1 w-32">
            <span className="text-[10px] uppercase font-bold text-slate-400 text-center">
              Speed: {playbackRate}x
            </span>
            <Slider
              value={[playbackRate]}
              min={0.5}
              max={2.0}
              step={0.1}
              onValueChange={(val) => setPlaybackRate(val[0])}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* User Recording Area */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recorder Button */}
        <div
          className={cn(
            "p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-colors",
            isRecording
              ? "border-red-500 bg-red-50/10"
              : "border-slate-300 dark:border-slate-700 bg-slate-50/30"
          )}
        >
          <div
            className={cn(
              "w-4 h-4 rounded-full bg-red-500 transition-all duration-500",
              isRecording ? "animate-ping opacity-100" : "opacity-20"
            )}
          />

          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="lg"
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "w-full transition-all duration-300",
              isRecording ? "scale-105 shadow-red-500/20 shadow-lg" : ""
            )}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4 mr-2 fill-current" /> Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" /> Start Recording
              </>
            )}
          </Button>
        </div>

        {/* Player Controls */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
          {userAudioUrl ? (
            <>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                Your Voice
              </h4>
              <div className="flex items-center gap-3 w-full">
                <audio
                  ref={userAudioRef}
                  src={userAudioUrl}
                  onEnded={() => setIsPlayingUser(false)}
                  onPause={() => setIsPlayingUser(false)}
                  onPlay={() => setIsPlayingUser(true)}
                  className="hidden"
                />
                <Button
                  onClick={toggleUserPlayback}
                  className="flex-1 bg-slate-900 text-white hover:bg-slate-800"
                >
                  {isPlayingUser ? (
                    <Square className="w-4 h-4 mr-2 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 mr-2 fill-current" />
                  )}
                  {isPlayingUser ? "Stop" : "Play Recording"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteAudio}
                  title="Delete"
                >
                  <RotateCw className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-400 text-sm">
              <div className="bg-slate-100 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Play className="w-5 h-5 opacity-20" />
              </div>
              Record your voice to compare
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
