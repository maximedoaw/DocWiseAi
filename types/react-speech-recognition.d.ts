declare module 'react-speech-recognition' {
  import { ReactNode } from 'react';

  export interface SpeechRecognitionOptions {
    transcribing?: boolean;
    clearTranscriptOnListen?: boolean;
    commands?: any[];
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
  }

  export interface SpeechRecognition {
    getRecognition(): any;
    startListening(options?: SpeechRecognitionOptions): Promise<void>;
    stopListening(): Promise<void>;
    abortListening(): Promise<void>;
    browserSupportsSpeechRecognition(): boolean;
    applyPolyfill(speechRecognitionPolyfill: any): void;
  }

  export interface UseSpeechRecognition {
    transcript: string;
    interimTranscript: string;
    finalTranscript: string;
    listening: boolean;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
    isMicrophoneAvailable: boolean;
  }

  export const useSpeechRecognition: () => UseSpeechRecognition;
  
  const SpeechRecognition: SpeechRecognition;
  export default SpeechRecognition;
}
