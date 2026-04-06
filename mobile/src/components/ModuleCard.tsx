import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { Module } from '../lib/api';

interface ModuleCardProps {
  module: Module;
  onToggle: () => void;
}

export function ModuleCard({ module: mod, onToggle }: ModuleCardProps) {
  const statusColor = mod.status === 'running' ? '#00ff41' : mod.status === 'error' ? '#ff4444' : '#666666';

  return (
    <Pressable
      onPress={onToggle}
      
      style={{ backgroundColor: '#111111' }}
    >
      <View >
        <View >
          <View
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor }}
          />
          <Text >{mod.name}</Text>
        </View>
        <View
          
          style={{ backgroundColor: mod.enabled ? '#00ff4122' : '#66666622' }}
        >
          <Text style={{ color: mod.enabled ? '#00ff41' : '#666666', fontSize: 12, fontWeight: '600' }}>
            {mod.enabled ? 'ON' : 'OFF'}
          </Text>
        </View>
      </View>
      <Text >{mod.description}</Text>
      {mod.enabled && (
        <Text >{mod.eventsToday} events today</Text>
      )}
    </Pressable>
  );
}
