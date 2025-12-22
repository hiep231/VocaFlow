import { useState, useEffect, useCallback } from "react";

interface useTextToSpeechProps {
  text: string;
  rate?: number;
  voiceLang?: string;
}

export const useTextToSpeech = ({ 
  text, 
  rate = 0.8, 
  voiceLang = "en" 
}: useTextToSpeechProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      console.warn("Browser does not support text-to-speech.");
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Try to find a voice that matches preference (e.g., 'en-US' or generic 'en')
      // Prefer Google English or Microsoft English if available for better quality
      const preferredVoice = voices.find(
        (v) => v.lang.includes(voiceLang) && (v.name.includes("Google") || v.name.includes("Premium") || v.name.includes("English"))
      ) || voices.find((v) => v.lang.includes(voiceLang)) || voices[0];
      
      setVoice(preferredVoice || null);
    };

    loadVoices();
    
    // Voices might load asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [voiceLang]);

  const speak = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      console.warn("Browser does not support text-to-speech.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [text, rate, voice, isSpeaking]);

  return { speak, isSpeaking };
};
