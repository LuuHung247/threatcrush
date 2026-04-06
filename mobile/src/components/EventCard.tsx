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
    <View  style={{ backgroundColor: '#111111' }}>
      <View >
        <View >
          <ThreatBadge severity={event.severity} />
          <Text >{event.module}</Text>
        </View>
        <Text >{timeAgo(event.timestamp)}</Text>
      </View>
      <Text >{event.message}</Text>
      {event.source && (
        <Text >Source: {event.source}</Text>
      )}
    </View>
  );
}
