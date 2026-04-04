import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    try {
      await login(email.trim(), licenseKey.trim());
      router.replace('/(app)');
    } catch (e) {
      setError('Login failed. Check your credentials.');
    }
  };

  const handleSkip = () => {
    router.replace('/(app)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 justify-center px-8"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <View className="items-center mb-12">
        <Text style={{ color: '#00ff41', fontSize: 36, fontWeight: '800', fontFamily: 'monospace' }}>
          THREATCRUSH
        </Text>
        <Text className="text-dim text-sm mt-2">Personal threat intelligence</Text>
      </View>

      <View className="gap-4">
        <View>
          <Text className="text-dim text-xs mb-1 uppercase tracking-wider">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#666666"
            keyboardType="email-address"
            autoCapitalize="none"
            className="border border-border rounded-lg px-4 py-3 text-txt"
            style={{ backgroundColor: '#111111', color: '#e0e0e0' }}
          />
        </View>

        <View>
          <Text className="text-dim text-xs mb-1 uppercase tracking-wider">License Key</Text>
          <TextInput
            value={licenseKey}
            onChangeText={setLicenseKey}
            placeholder="TC-XXXX-XXXX-XXXX"
            placeholderTextColor="#666666"
            autoCapitalize="none"
            className="border border-border rounded-lg px-4 py-3 text-txt"
            style={{ backgroundColor: '#111111', color: '#e0e0e0' }}
          />
        </View>

        {error ? <Text style={{ color: '#ff4444' }} className="text-sm">{error}</Text> : null}

        <Pressable
          onPress={handleLogin}
          className="rounded-lg py-4 items-center mt-2"
          style={{ backgroundColor: '#00ff41' }}
        >
          <Text style={{ color: '#0a0a0a', fontWeight: '700', fontSize: 16 }}>Sign In</Text>
        </Pressable>

        <Pressable onPress={handleSkip} className="py-3 items-center">
          <Text className="text-dim text-sm">Skip → use demo mode</Text>
        </Pressable>
      </View>

      <Text className="text-dim text-xs text-center mt-8">
        Don't have an account? Enter your email to join the waitlist.
      </Text>
    </KeyboardAvoidingView>
  );
}
