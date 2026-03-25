import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getEmotionInfo } from '../utils/emotions';

export default function EmotionBadge({ emotion, size = 'md' }) {
  if (!emotion) return null;
  const info = getEmotionInfo(emotion);
  const small = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: info.bgColor }, small && styles.badgeSm]}>
      <Text style={small ? styles.emojiSm : styles.emoji}>{info.emoji}</Text>
      <Text style={[styles.label, { color: info.color }, small && styles.labelSm]}>
        {info.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  badgeSm: { paddingHorizontal: 7, paddingVertical: 3 },
  emoji: { fontSize: 16 },
  emojiSm: { fontSize: 12 },
  label: { fontSize: 13, fontWeight: '600' },
  labelSm: { fontSize: 11 },
});
