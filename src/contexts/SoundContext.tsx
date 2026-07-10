import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";

// Audio Assets (Public URLs for demo purposes)
const SFX = {
  correct: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
  incorrect:
    "https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3",
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  hover: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  complete: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
};

export const BGM_TRACKS = [
  {
    id: "may-lang-thang",
    name: "Mây Lang Thang",
    url: "/mp3/Mây Lang Thang.mp3",
    color: "from-sky-400 to-indigo-500",
  },
  {
    id: "man-hoa",
    name: "Mạn họa",
    url: "/mp3/Mạn họa.mp3",
    color: "from-rose-400 to-pink-500",
  },
  {
    id: "qua-nhung-tieng-ve",
    name: "Qua Những Tiếng Ve",
    url: "/mp3/Qua Những Tiếng Ve.mp3",
    color: "from-emerald-400 to-teal-500",
  },
  {
    id: "gia-cung-nhau-la-duoc",
    name: "Già Cùng Nhau Là Được",
    url: "/mp3/Già Cùng Nhau Là Được.mp3",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "10-ngan-nam",
    name: "10 Ngàn Năm",
    url: "/mp3/10 Ngàn Năm.mp3",
    color: "from-violet-400 to-purple-500",
  },
  {
    id: "khong-tan-tinh-em-dau",
    name: "Không Tán Tỉnh Em Đâu",
    url: "/mp3/Không Tán Tỉnh Em Đâu.mp3",
    color: "from-fuchsia-400 to-pink-500",
  },
  {
    id: "mo",
    name: "Mơ",
    url: "/mp3/Mơ.mp3",
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: "lang-du",
    name: "Lãng Du",
    url: "/mp3/Lãng Du.mp3",
    color: "from-indigo-400 to-blue-500",
  },
  {
    id: "nhu-anh-mo",
    name: "Như Anh Mơ",
    url: "/mp3/Như Anh Mơ.mp3",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: "phieu-bong",
    name: "Phiêu Bồng",
    url: "/mp3/Phiêu Bồng.mp3",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "ghe-qua",
    name: "Ghé Qua",
    url: "/mp3/Ghé Qua.mp3",
    color: "from-red-400 to-rose-500",
  },
  {
    id: "mot-thuo-thanh-binh",
    name: "Một Thuở Thanh Bình",
    url: "/mp3/Một Thuở Thanh Bình.mp3",
    color: "from-teal-400 to-cyan-500",
  },
];

type SFXType = keyof typeof SFX;

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  bgmVolume: number;
  setBGMVolume: (vol: number) => void;
  sfxVolume: number;
  setSFXVolume: (vol: number) => void;
  currentTrackId: string | null;
  isPlaying: boolean;
  playBGM: (trackId: string) => void;
  pauseBGM: () => void;
  resumeBGM: () => void;
  playSFX: (type: SFXType) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("vf_mute");
    return saved ? JSON.parse(saved) : false;
  });

  const [bgmVolume, setBGMVolumeState] = useState(() => {
    const saved = localStorage.getItem("vf_bgm_vol");
    return saved ? parseFloat(saved) : 0.4;
  });

  const [sfxVolume, setSFXVolumeState] = useState(() => {
    const saved = localStorage.getItem("vf_sfx_vol");
    return saved ? parseFloat(saved) : 0.6;
  });

  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRefs = useRef<Record<string, HTMLAudioElement>>({});

  // Initialize SFX
  useEffect(() => {
    Object.entries(SFX).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = "none";
      sfxRefs.current[key] = audio;
    });
  }, []);

  // Persist Settings
  useEffect(() => {
    localStorage.setItem("vf_mute", JSON.stringify(isMuted));
  }, [isMuted]);
  useEffect(() => {
    localStorage.setItem("vf_bgm_vol", bgmVolume.toString());
  }, [bgmVolume]);
  useEffect(() => {
    localStorage.setItem("vf_sfx_vol", sfxVolume.toString());
  }, [sfxVolume]);

  // Handle Play/Pause
  useEffect(() => {
    if (bgmRef.current) {
      if (isPlaying) {
        bgmRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        bgmRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle Volume & Mute
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = isMuted ? 0 : bgmVolume;
    }
  }, [bgmVolume, isMuted]);

  // Handle Track Change
  useEffect(() => {
    if (!currentTrackId) return;

    const track = BGM_TRACKS.find((t) => t.id === currentTrackId);
    if (!track) return;

    if (!bgmRef.current) {
      bgmRef.current = new Audio(track.url);
      bgmRef.current.loop = true;
      bgmRef.current.volume = isMuted ? 0 : bgmVolume;
    } else {
      if (
        bgmRef.current.src &&
        !bgmRef.current.src.endsWith(encodeURI(track.url))
      ) {
        bgmRef.current.src = track.url;
        bgmRef.current.currentTime = 0;
      }
    }

    if (isPlaying) {
      bgmRef.current.play().catch((err) => {
        console.error("Audio play error", err);
        setIsPlaying(false);
      });
    }
  }, [currentTrackId, isPlaying, bgmVolume, isMuted]);

  const setBGMVolume = (vol: number) => setBGMVolumeState(vol);
  const setSFXVolume = (vol: number) => setSFXVolumeState(vol);
  const toggleMute = () => setIsMuted((prev: boolean) => !prev);

  const playBGM = useCallback((trackId: string) => {
    setCurrentTrackId(trackId);
    setIsPlaying(true);
  }, []);

  const pauseBGM = useCallback(() => setIsPlaying(false), []);
  const resumeBGM = useCallback(() => setIsPlaying(true), []);

  const playSFX = useCallback(
    (type: SFXType) => {
      if (isMuted) return;
      const audio = sfxRefs.current[type];
      if (audio) {
        audio.volume = sfxVolume;
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    },
    [isMuted, sfxVolume],
  );

  const value = {
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
    playSFX,
  };

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
