import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS } from '../src/utils/constants';

const SplashScreen = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateYAnim = React.useRef(new Animated.Value(20)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const dotsAnim = React.useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3)
  ]).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    dotsAnim.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1000,
            delay: i * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    const timer = setTimeout(() => {
      router.replace('/story');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.starsContainer}>
          {[...Array(20)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.star,
                {
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                },
              ]}
            />
          ))}
        </View>

        <Animated.View
          style={[
            styles.planetContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <PixelPlanet />
        </Animated.View>

        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            },
          ]}
        >
          <Text style={styles.title}>学了么？</Text>
          <Text style={styles.subtitle}>Learnflow Monster</Text>
        </Animated.View>

        <View style={styles.dotsContainer}>
          {dotsAnim.map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: anim,
                  transform: [
                    {
                      scale: anim.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [1, 1.5],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const PixelPlanet = () => (
  <View style={styles.planet}>
    <View style={styles.planetBody}>
      <View style={[styles.planetLayer, { top: 0, left: 8, width: 56, height: 8 }]} />
      <View style={[styles.planetLayer, { top: 8, left: 0, width: 72, height: 56 }]} />
      <View style={[styles.planetLayer, { top: 64, left: 8, width: 56, height: 8 }]} />
      
      <View style={[styles.continent, { top: 16, left: 16, width: 16, height: 8 }]} />
      <View style={[styles.continent, { top: 24, left: 12, width: 20, height: 12 }]} />
      <View style={[styles.continent, { top: 28, left: 44, width: 12, height: 12 }]} />
      <View style={[styles.continent, { top: 40, left: 40, width: 20, height: 8 }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 20,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#FFE66D',
  },
  planetContainer: {
    marginBottom: 48,
  },
  planet: {
    width: 120,
    height: 120,
  },
  planetBody: {
    position: 'relative',
    width: 72,
    height: 72,
    top: 24,
    left: 24,
  },
  planetLayer: {
    position: 'absolute',
    backgroundColor: '#5D9BFA',
  },
  continent: {
    position: 'absolute',
    backgroundColor: '#3AE374',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  subtitle: {
    color: '#5D9BFA',
    fontSize: 16,
    fontFamily: 'Courier',
    letterSpacing: 2,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: '#5D9BFA',
  },
});

export default SplashScreen;
