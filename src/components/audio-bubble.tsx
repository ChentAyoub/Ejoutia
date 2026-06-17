import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";

interface AudioBubbleProps {
  duration?: number; // seconds, default 12
  isMine: boolean;
}

export default function AudioBubble({ duration = 12, isMine }: AudioBubbleProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fake waveform data (random heights for visual effect)
  const bars = useRef(
    Array.from({ length: 28 }, () => 0.2 + Math.random() * 0.8)
  ).current;

  // Animated values for waveform bars
  const barAnims = useRef(
    bars.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (playing) {
      // Animate bars sequentially
      const anims = barAnims.map((anim, i) =>
        Animated.sequence([
          Animated.delay(i * 30),
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim, {
                toValue: 1,
                duration: 300 + Math.random() * 200,
                useNativeDriver: false,
              }),
              Animated.timing(anim, {
                toValue: 0,
                duration: 300 + Math.random() * 200,
                useNativeDriver: false,
              }),
            ])
          ),
        ])
      );
      Animated.parallel(anims).start();

      // Fake progress
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 1) {
            setPlaying(false);
            return 0;
          }
          return p + 1 / (duration * 10);
        });
      }, 100);
    } else {
      barAnims.forEach((anim) => anim.stopAnimation());
      barAnims.forEach((anim) => anim.setValue(0));
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const elapsed = Math.floor(progress * duration);
  const remaining = duration - elapsed;

  return (
    <View
      style={[
        styles.container,
        isMine ? styles.mine : styles.theirs,
      ]}
    >
      {/* Play/Pause button */}
      <TouchableOpacity
        style={[styles.playBtn, isMine ? styles.playBtnMine : styles.playBtnTheirs]}
        onPress={() => {
          if (!playing) setProgress(0);
          setPlaying(!playing);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.playIcon}>
          {playing ? "⏸" : "▶️"}
        </Text>
      </TouchableOpacity>

      {/* Waveform + time */}
      <View style={styles.waveArea}>
        <View style={styles.waveform}>
          {bars.map((height, i) => {
            const isPlayed = i / bars.length <= progress;
            return (
              <Animated.View
                key={i}
                style={[
                  styles.bar,
                  {
                    height: barAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [height * 20, height * 28],
                    }),
                    backgroundColor: isPlayed
                      ? isMine ? "#fff" : "#ff6f00"
                      : isMine ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.15)",
                  },
                ]}
              />
            );
          })}
        </View>
        <Text style={[styles.time, isMine ? styles.timeMine : styles.timeTheirs]}>
          {playing ? formatTime(elapsed) : formatTime(duration)}
        </Text>
      </View>

      {/* Mic icon */}
      <Text style={styles.micIcon}>🎙️</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 18,
    margin: 4,
    minWidth: 220,
    maxWidth: 280,
    gap: 8,
  },
  mine: {
    backgroundColor: "#ff6f00",
  },
  theirs: {
    backgroundColor: "#f0f0f0",
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtnMine: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  playBtnTheirs: {
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  playIcon: {
    fontSize: 16,
  },
  waveArea: {
    flex: 1,
    gap: 4,
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1.5,
    height: 30,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    minHeight: 4,
  },
  time: {
    fontSize: 11,
    fontWeight: "500",
  },
  timeMine: {
    color: "rgba(255,255,255,0.8)",
  },
  timeTheirs: {
    color: "#999",
  },
  micIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
});
