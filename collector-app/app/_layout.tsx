import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, Animated, LogBox } from 'react-native';

// Ignore the width animation warning
LogBox.ignoreLogs([
  'Style property \'width\' is not supported by native animated module'
]);

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    if (showSplash) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        })
      ]).start();

      setTimeout(() => {
        setShowSplash(false);
        // After splash, check authentication status
        // For now, always show login first
        setIsAuthenticated(false);
      }, 3000);
    }
  }, [showSplash]);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Animated.View style={[
          styles.splashContent, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
          }
        ]}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>🚛</Text>
          </View>
          <Text style={styles.appName}>SmartWaste</Text>
          <Text style={styles.tagline}>Collector Portal</Text>
          <View style={styles.loadingBar}>
            <View style={[styles.loadingProgress, { width: '100%' }]} />
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Show login screen if not authenticated
        <Stack.Screen name="login" options={{ headerShown: false }} />
      ) : (
        // Show tabs if authenticated
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#1a472a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
    padding: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIcon: {
    fontSize: 50,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#a7ffb3',
    marginBottom: 40,
    fontStyle: 'italic',
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 2,
  },
});