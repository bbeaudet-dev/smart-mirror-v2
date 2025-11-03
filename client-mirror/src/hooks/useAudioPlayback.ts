import { useRef, useCallback } from 'react';
import ApiClient from '../services/apiClient';

/**
 * Hook for fetching and preparing audio messages
 * Handles API calls to get audio+text together
 */
export const useAudioPlayback = () => {
  const currentVoiceRef = useRef<string>('ash');

  /**
   * Get motion response with audio and text
   */
  const getMotionResponse = useCallback(async (voice?: string) => {
    const selectedVoice = voice || currentVoiceRef.current;
    const response = await ApiClient.getMotionWithText(selectedVoice) as any;

    if (response.success && response.text && response.audio) {
      // Convert base64 audio to blob
      const audioBuffer = Uint8Array.from(atob(response.audio), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      currentVoiceRef.current = selectedVoice;

      return {
        text: response.text,
        audio,
        type: 'motion' as const,
      };
    }
    return null;
  }, []);

  /**
   * Get welcome response with audio and text
   */
  const getWelcomeResponse = useCallback(async (voice?: string) => {
    const selectedVoice = voice || currentVoiceRef.current;
    const response = await ApiClient.getWelcomeWithText(selectedVoice) as any;

    if (response.success && response.text && response.audio) {
      const audioBuffer = Uint8Array.from(atob(response.audio), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return {
        text: response.text,
        audio,
        type: 'welcome' as const,
      };
    }
    return null;
  }, []);

  /**
   * Get sendoff response with audio and text
   */
  const getSendoffResponse = useCallback(async (voice?: string) => {
    const selectedVoice = voice || currentVoiceRef.current;
    const response = await ApiClient.getSendoffWithText(selectedVoice) as any;

    if (response.success && response.text && response.audio) {
      const audioBuffer = Uint8Array.from(atob(response.audio), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return {
        text: response.text,
        audio,
        type: 'sendoff' as const,
      };
    }
    return null;
  }, []);

  /**
   * Prepare audio from base64 string (for AI responses)
   */
  const prepareAudioFromBase64 = useCallback((base64Audio: string, text: string) => {
    const audioBuffer = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBuffer], { type: 'audio/opus' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    return {
      text,
      audio,
      type: 'ai-response' as const,
    };
  }, []);

  return {
    getMotionResponse,
    getWelcomeResponse,
    getSendoffResponse,
    prepareAudioFromBase64,
    getCurrentVoice: () => currentVoiceRef.current,
  };
};

