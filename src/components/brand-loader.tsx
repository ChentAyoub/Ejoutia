import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { Brand } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function BrandLoader() {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 800, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, [scale, opacity]);

  return (
    <View style={s.container}>
      <Animated.View style={[s.iconWrapper, { transform: [{ scale }], opacity }]}>
        <Ionicons name="basket" size={48} color={Brand.primary} />
      </Animated.View>
      <Text style={s.text}>Chargement...</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 111, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  text: {
    color: Brand.subText,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
