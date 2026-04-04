import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEventsStore } from '../../src/stores/events';
import { StatsBar } from '../../src/components/StatsBar';
import { EventCard } from '../../src/components/EventCard';

export default function DashboardScreen() {
  const { events, modules, stats } = useEventsStore();
  const recentEvents = events.slice(0, 5);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="py-4">
          <Text style={{ color: '#00ff41', fontSize: 24, fontWeight: '800', fontFamily: 'monospace' }}>
            THREATCRUSH
          </Text>
          <Text className="text-dim text-xs mt-1">THREAT INTELLIGENCE DASHBOARD</Text>
        </View>

        {/* Big threat counter */}
        <View
          className="items-center py-8 mb-4 border border-border rounded-lg"
          style={{ backgroundColor: '#111111' }}
        >
          <Text className="text-dim text-xs uppercase tracking-widest mb-2">Threats Blocked</Text>
          <Text
            style={{
              color: '#00ff41',
              fontSize: 64,
              fontWeight: '800',
              fontFamily: 'monospace',
              textShadowColor: '#00ff4140',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 20,
            }}
          >
            {stats.threatsBlocked}
          </Text>
          <Text className="text-dim text-xs mt-1">today</Text>
        </View>

        {/* Stats */}
        <View className="mb-4">
          <StatsBar stats={stats} />
        </View>

        {/* Module status grid */}
        <View className="mb-4">
          <Text className="text-txt font-bold text-sm mb-3 uppercase tracking-wider">Module Status</Text>
          <View className="flex-row flex-wrap gap-2">
            {modules.map((mod) => (
              <View
                key={mod.id}
                className="flex-row items-center gap-1.5 border border-border rounded px-3 py-2"
                style={{ backgroundColor: '#111111' }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: mod.status === 'running' ? '#00ff41' : '#ff4444',
                  }}
                />
                <Text className="text-txt text-xs">{mod.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent events */}
        <View className="mb-8">
          <Text className="text-txt font-bold text-sm mb-3 uppercase tracking-wider">Recent Events</Text>
          <View className="border border-border rounded-lg overflow-hidden">
            {recentEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
