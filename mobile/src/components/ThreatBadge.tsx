import React from 'react';
import { View, Text } from 'react-native';
import type { Severity } from '../config';
import { getSeverityColor } from '../lib/utils';

interface ThreatBadgeProps {
  severity: Severity;
}

export function ThreatBadge({ severity }: ThreatBadgeProps) {
  const color = getSeverityColor(severity);
  const label = severity.toUpperCase();

  return (
    <View
      style={{ backgroundColor: color + '22', borderColor: color, borderWidth: 1 }}
      className="rounded px-2 py-0.5"
    >
      <Text style={{ color, fontSize: 10, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}
