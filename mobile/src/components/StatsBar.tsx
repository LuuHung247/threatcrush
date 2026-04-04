import React from 'react';
import { View, Text } from 'react-native';
import type { Stats } from '../lib/api';
import { formatNumber, formatUptime } from '../lib/utils';

interface StatsBarProps {
  stats: Stats;
}

function StatItem({ label, value, color = '#e0e0e0' }: { label: string; value: string; color?: string }) {
  return (
    <View className="items-center flex-1">
      <Text style={{ color, fontSize: 18, fontWeight: '700' }}>{value}</Text>
      <Text className="text-dim text-xs mt-1">{label}</Text>
    </View>
  );
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <View
      className="flex-row border border-border rounded-lg p-4"
      style={{ backgroundColor: '#111111' }}
    >
      <StatItem label="Events" value={formatNumber(stats.eventsToday)} />
      <StatItem label="Blocked" value={formatNumber(stats.threatsBlocked)} color="#00ff41" />
      <StatItem label="Uptime" value={formatUptime(stats.uptimeHours)} />
      <StatItem
        label="Modules"
        value={`${stats.modulesActive}/${stats.modulesTotal}`}
      />
    </View>
  );
}
