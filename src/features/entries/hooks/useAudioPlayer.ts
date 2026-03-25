import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';

export function useAudioPlayer(audioUri: string | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback(async (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);

      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  }, []);

  const play = useCallback(async () => {
    if (!audioUri) return;

    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
          } else {
            await soundRef.current.playAsync();
            setIsPlaying(true);
          }
          return;
        }
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [audioUri, onPlaybackStatusUpdate]);

  const stop = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      setIsPlaying(false);
      setPosition(0);
    }
  }, []);

  return {
    isPlaying,
    duration,
    position,
    play,
    stop,
  };
}
