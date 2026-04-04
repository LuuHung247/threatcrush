import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ThreatCrush',
  slug: 'threatcrush',
  scheme: 'threatcrush',
  version: '0.1.6',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0a0a0a',
  },
  ios: {
    bundleIdentifier: 'com.threatcrush.mobile',
    supportsTablet: true,
  },
  android: {
    package: 'com.threatcrush.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0a0a0a',
    },
    permissions: ['INTERNET'],
  },
  plugins: ['expo-router', 'expo-secure-store'],
  extra: {
    apiUrl: process.env.THREATCRUSH_API_URL || 'https://threatcrush.com',
  },
});
