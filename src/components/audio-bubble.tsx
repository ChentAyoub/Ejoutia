import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brand, Shadow } from '../constants/theme';

interface AudioBubbleProps {
  duration?: number;
  isMine: boolean;
}

const BAR_COUNT = 32;

function generateBarHeights(count: number): number[] {
  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    heights.push(4 + Math.random() * 18);
  }
  return heights;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioBubble({ duration = 12, isMine }: AudioBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const barHeights = useRef<number[]>(generateBarHeights(BAR_COUNT)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const increment = 1 / (duration * 10);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + increment;
          if (next >= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, increment]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const elapsed = Math.floor(progress * duration);
  const displayTime = isPlaying ? formatTime(elapsed) : formatTime(duration);

  const playButtonBg = isMine
    ? 'rgba(255,255,255,0.25)'
    : Brand.surface;

  const playIconColor = isMine
    ? '#FFFFFF'
    : Brand.text;

  const durationColor = isMine
    ? '#FFFFFF'
    : Brand.subText;

  const innerContent = (
    <>
      <TouchableOpacity
        onPress={handlePlayPause}
        activeOpacity={0.7}
        style={[styles.playButton, { backgroundColor: playButtonBg }]}
      >
        <Text style={[styles.playIcon, { color: playIconColor }]}>
          {isPlaying ? '⏸' : '▶'}
        </Text>
      </TouchableOpacity>

      <View style={styles.waveformContainer}>
        {barHeights.map((height, index) => {
          const isPlayed = index / barHeights.length <= progress;

          let barColor: string;
          if (isPlayed) {
            barColor = isMine ? '#FFFFFF' : Brand.primary;
          } else {
            barColor = isMine ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)';
          }

          return (
            <View
              key={index}
              style={[
                styles.bar,
                {
                  height,
                  backgroundColor: barColor,
                },
              ]}
            />
          );
        })}
      </View>

      <Text style={[styles.durationText, { color: durationColor }]}>
        {displayTime}
      </Text>
    </>
  );

  if (isMine) {
    return (
      <LinearGradient
        colors={[Brand.primary, Brand.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, styles.bubbleMine]}
      >
        {innerContent}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.container, styles.bubbleTheirs]}>
      {innerContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
    maxWidth: 260,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleMine: {
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: Brand.surfaceLight,
    borderBottomLeftRadius: 6,
    ...Shadow.sm,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  playIcon: {
    fontSize: 14,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 28,
  },
  bar: {
    width: 2.5,
    borderRadius: 1.5,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 10,
  },
});
