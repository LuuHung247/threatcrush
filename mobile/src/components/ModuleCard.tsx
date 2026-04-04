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
      className="border border-border rounded-lg p-4 mb-3"
      style={{ backgroundColor: '#111111' }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor }}
          />
          <Text className="text-txt font-bold text-base">{mod.name}</Text>
        </View>
        <View
          className="rounded-full px-3 py-1"
          style={{ backgroundColor: mod.enabled ? '#00ff4122' : '#66666622' }}
        >
          <Text style={{ color: mod.enabled ? '#00ff41' : '#666666', fontSize: 12, fontWeight: '600' }}>
            {mod.enabled ? 'ON' : 'OFF'}
          </Text>
        </View>
      </View>
      <Text className="text-dim text-sm mb-1">{mod.description}</Text>
      {mod.enabled && (
        <Text className="text-dim text-xs">{mod.eventsToday} events today</Text>
      )}
    </Pressable>
  );
}
