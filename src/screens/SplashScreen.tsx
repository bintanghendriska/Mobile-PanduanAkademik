import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

function LoadingDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
          Animated.delay((2 - i) * 150),
        ]),
      ),
    );
    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={dotStyles.row}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            dotStyles.dot,
            {
              opacity: dot,
              transform: [
                {
                  scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.7)' },
});

export default function SplashScreen({ navigation }: Props) {
  // ── Animation values ──────────────────────────────────────────────
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.8)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Background rings expand
    const ringAnim = Animated.parallel([
      Animated.timing(ring1, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ring2, {
        toValue: 1,
        duration: 1200,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    // Logo spring bounce
    const logoAnim = Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 300, delay: 200, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 60, delay: 200, useNativeDriver: true } as Animated.SpringAnimationConfig & { delay: number }),
    ]);

    // Glow pulse loop
    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.15, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.8, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );

    // Title slide up
    const titleAnim = Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 400, delay: 600, useNativeDriver: true }),
      Animated.timing(titleY, { toValue: 0, duration: 400, delay: 600, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
    ]);

    // Subtitle slide up
    const subtitleAnim = Animated.parallel([
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, delay: 800, useNativeDriver: true }),
      Animated.timing(subtitleY, { toValue: 0, duration: 400, delay: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]);

    // Footer + dots
    const footerAnim = Animated.parallel([
      Animated.timing(footerOpacity, { toValue: 1, duration: 500, delay: 1100, useNativeDriver: true }),
      Animated.timing(dotsOpacity, { toValue: 1, duration: 400, delay: 1200, useNativeDriver: true }),
    ]);

    Animated.parallel([ringAnim, logoAnim, titleAnim, subtitleAnim, footerAnim]).start();
    glowAnim.start();

    const timer = setTimeout(() => navigation.replace('Main'), 3000);
    return () => {
      clearTimeout(timer);
      glowAnim.stop();
    };
  }, [navigation]);

  const ring1Scale = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const ring2Scale = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.15] });
  const ring1Opacity = ring1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 0.3, 0] });
  const ring2Opacity = ring2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.2, 0] });

  return (
    <View style={styles.container}>
      {/* Decorative background ring 1 */}
      <Animated.View
        style={[
          styles.ring,
          styles.ring1,
          { opacity: ring1Opacity, transform: [{ scale: ring1Scale }] },
        ]}
      />
      {/* Decorative background ring 2 */}
      <Animated.View
        style={[
          styles.ring,
          styles.ring2,
          { opacity: ring2Opacity, transform: [{ scale: ring2Scale }] },
        ]}
      />

      {/* Center content */}
      <View style={styles.center}>
        {/* Glow ring behind logo */}
        <Animated.View
          style={[
            styles.glow,
            { transform: [{ scale: glowPulse }] },
          ]}
        />

        {/* Logo */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
        </Animated.View>

        {/* App name */}
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleY }],
            marginTop: 24,
          }}
        >
          <Text variant="headlineMedium" style={styles.appName}>
            Panduan Akademik
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View
          style={{
            opacity: subtitleOpacity,
            transform: [{ translateY: subtitleY }],
            marginTop: 8,
          }}
        >
          <Text variant="bodyMedium" style={styles.subtitle}>
            Kelola mata kuliah dengan mudah
          </Text>
        </Animated.View>

        {/* Loading dots */}
        <Animated.View style={[{ marginTop: 40 }, { opacity: dotsOpacity }]}>
          <LoadingDots />
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <Text variant="labelSmall" style={styles.footerUniv}>
          Universitas Islam Riau — Teknik Informatika
        </Text>
        <Text variant="labelSmall" style={styles.footerVersion}>
          v2.0.0
        </Text>
      </Animated.View>
    </View>
  );
}

const RING_SIZE = 600;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A237E',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    top: '50%',
    left: '50%',
    marginTop: -RING_SIZE / 2 - 60,
    marginLeft: -RING_SIZE / 2,
  },
  ring1: {
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ring2: {
    borderColor: 'rgba(255,255,255,0.15)',
    width: RING_SIZE * 1.3,
    height: RING_SIZE * 1.3,
    borderRadius: (RING_SIZE * 1.3) / 2,
    marginTop: -RING_SIZE * 1.3 / 2 - 60,
    marginLeft: -RING_SIZE * 1.3 / 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(159,168,218,0.25)',
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 26,
  },
  appName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 36,
    alignItems: 'center',
    gap: 4,
  },
  footerUniv: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  footerVersion: {
    color: 'rgba(255,255,255,0.3)',
  },
});
