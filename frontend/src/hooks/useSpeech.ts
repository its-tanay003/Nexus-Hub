
import { useState, useEffect, useCallback, useRef } from 'react';

// Polyfill for types
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export const useSpeech = (language: 'en' | 'hi' = 'en') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const Recognition = SpeechRecognition || webkitSpeechRecognition;

    if (Recognition) {
      const recognition = new Recognition();
      recognition.continuous = false; // Stop after one sentence
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
      };

      recognition.onerror = (event: any) => {
          console.error("Speech Error:", event.error);
          setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    // Cleanup function to abort recognition when component unmounts or language changes
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      // Automatically stop the assistant from speaking if user starts listening
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Recognition already started or failed to start", e);
      }
    } else {
      alert("Voice input not supported in this browser.");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel current speech to avoid queue buildup
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;

    // Optional: Select a better voice if available
    const voices = window.speechSynthesis.getVoices();
    // Prioritize Google voices or Natural voices if available
    const preferredVoice = voices.find(v => 
        (v.name.includes('Google') || v.name.includes('Natural')) && 
        v.lang.includes(language === 'hi' ? 'hi' : 'en')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [language]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    speak,
    isSpeaking
  };
};
