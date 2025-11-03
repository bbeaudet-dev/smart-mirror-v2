import { useRef, useCallback, useState } from 'react';

export interface QueuedMessage {
  text: string;
  type: 'ai-response' | 'outfit-analysis' | 'general' | 'motion' | 'welcome' | 'sendoff';
  audio: HTMLAudioElement;
}

interface UseAudioQueueOptions {
  onMessage?: (message: string, type: QueuedMessage['type']) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  onSendoffComplete?: () => void;
}

/**
 * Hook for managing audio message queue
 * Handles sequential playback of messages with synchronized text display
 */
export const useAudioQueue = (options: UseAudioQueueOptions = {}) => {
  const { onMessage, onSpeakingChange, onSendoffComplete } = options;

  const messageQueueRef = useRef<QueuedMessage[]>([]);
  const isProcessingQueueRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const playSendoffRef = useRef<(() => Promise<void>) | null>(null);

  // Process message queue sequentially
  const processMessageQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || messageQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;
    const message = messageQueueRef.current.shift();

    if (!message) {
      isProcessingQueueRef.current = false;
      return;
    }

    // Display message text
    onMessage?.(message.text, message.type);

    // Set speaking state
    setIsSpeaking(true);
    onSpeakingChange?.(true);
    currentAudioRef.current = message.audio;

    try {
      await message.audio.play();

      // When audio ends, handle cleanup and next message
      message.audio.onended = () => {
        URL.revokeObjectURL(message.audio.src);
        setIsSpeaking(false);
        onSpeakingChange?.(false);
        currentAudioRef.current = null;

        // Special handling for different message types
        if (message.type === 'sendoff') {
          onSendoffComplete?.();
        } else if (message.type === 'ai-response' && playSendoffRef.current) {
          // Queue sendoff after AI message
          setTimeout(() => {
            playSendoffRef.current?.();
          }, 100);
        }

        // Clear message text and process next
        setTimeout(() => {
          onMessage?.('', message.type);
          isProcessingQueueRef.current = false;
          processMessageQueue();
        }, 100);
      };
    } catch (error) {
      console.error('Error playing queued audio:', error);
      setIsSpeaking(false);
      onSpeakingChange?.(false);
      currentAudioRef.current = null;
      isProcessingQueueRef.current = false;
      processMessageQueue();
    }
  }, [onMessage, onSpeakingChange, onSendoffComplete]);

  // Queue a message for playback
  const queueMessage = useCallback(
    (text: string, type: QueuedMessage['type'], audio: HTMLAudioElement) => {
      messageQueueRef.current.push({ text, type, audio });
      processMessageQueue();
    },
    [processMessageQueue]
  );

  // Set the sendoff function reference (to avoid circular dependency)
  const setSendoffFunction = useCallback((fn: () => Promise<void>) => {
    playSendoffRef.current = fn;
  }, []);

  return {
    queueMessage,
    isSpeaking,
    setSendoffFunction,
  };
};

