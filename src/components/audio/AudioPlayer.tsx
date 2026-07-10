import { useState } from "react";
import { useSound, BGM_TRACKS } from "@/contexts/SoundContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AudioPlayer() {
  const {
    isMuted,
    toggleMute,
    bgmVolume,
    setBGMVolume,
    sfxVolume,
    setSFXVolume,
    currentTrackId,
    isPlaying,
    playBGM,
    pauseBGM,
    resumeBGM,
  } = useSound();

  const [isOpen, setIsOpen] = useState(false);
  const currentTrack = BGM_TRACKS.find((t) => t.id === currentTrackId);

  const togglePlayback = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPlaying) pauseBGM();
    else if (currentTrack) resumeBGM();
    else playBGM(BGM_TRACKS[0].id);
  };

  const playNextTrack = (e: React.MouseEvent) => {
    e.preventDefault();
    const idx = BGM_TRACKS.findIndex((t) => t.id === currentTrackId);
    const nextIdx = (idx + 1) % BGM_TRACKS.length;
    playBGM(BGM_TRACKS[nextIdx].id);
  };

  return (
    <div className="fixed bottom-6 right-3 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg transition-all duration-300",
              isPlaying
                ? "bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700 animate-pulse-slow"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            )}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : isPlaying ? (
              <Headphones className="h-5 w-5" />
            ) : (
              <Music className="h-5 w-5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-80 p-0 rounded-2xl overflow-hidden shadow-2xl border-slate-200 dark:border-slate-800 mr-4 mb-2"
          align="end"
          forceMount
        >
          {/* Header */}
          <div
            className={cn(
              "p-6 text-white relative overflow-hidden transition-colors duration-500 bg-gradient-to-br",
              currentTrack ? currentTrack.color : "from-slate-700 to-slate-900"
            )}
          >
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-1">
                {currentTrack ? currentTrack.name : "Select Music"}
              </h4>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
                {isPlaying ? "Now Playing" : "Paused"}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="p-5 bg-white dark:bg-slate-950 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-slate-500 hover:text-indigo-600"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  className="rounded-full h-10 w-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform"
                  onClick={togglePlayback}
                >
                  {isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" className="ml-1" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={playNextTrack}
                  className="dark:text-slate-500"
                >
                  <SkipForward size={20} />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Music Volume</span>
                  <span>{Math.round(bgmVolume * 100)}%</span>
                </div>
                <Slider
                  value={[bgmVolume]}
                  max={1}
                  step={0.01}
                  onValueChange={(val) => setBGMVolume(val[0])}
                  className="[&_.relative]:h-1.5"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>SFX Volume</span>
                  <span>{Math.round(sfxVolume * 100)}%</span>
                </div>
                <Slider
                  value={[sfxVolume]}
                  max={1}
                  step={0.01}
                  onValueChange={(val) => setSFXVolume(val[0])}
                  className="[&_.relative]:h-1.5"
                />
              </div>
            </div>

            <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase">
                Playlist
              </p>
              {BGM_TRACKS.map((track) => (
                <button
                  key={track.id}
                  onClick={(e) => {
                    e.preventDefault();
                    playBGM(track.id);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group focus:outline-none",
                    currentTrackId === track.id
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <span>{track.name}</span>
                  {currentTrackId === track.id && (
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
