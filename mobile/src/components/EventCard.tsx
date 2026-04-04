import React from 'react';
import { View, Text } from 'react-native';
import type { ThreatEvent } from '../lib/api';
import { ThreatBadge } from './ThreatBadge';
import { timeAgo } from '../lib/utils';

interface EventCardProps {
  event: ThreatEvent;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <View className="border-b border-border px-4 py-3" style={{ backgroundColor: '#111111' }}>
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2">
          <ThreatBadge severity={event.severity} />
          <Text className="text-dim text-xs">{event.module}</Text>
        </View>
        <Text className="text-dim text-xs">{timeAgo(event.timestamp)}</Text>
      </View>
      <Text className="text-txt text-sm">{event.message}</Text>
      {event.source && (
        <Text className="text-dim text-xs mt-1">Source: {event.source}</Text>
      )}
    </View>
  );
}
