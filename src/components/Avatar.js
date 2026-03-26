// Аватарка: фото или цветной кружок с инициалами
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const COLORS = ['#6C5CE7', '#FD79A8', '#00B894', '#0984E3', '#E17055', '#FDCB6E'];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ photoURL, displayName, size = 40 }) {
  const initials = (displayName || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getColor(displayName),
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: '#DFE6E9' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontWeight: '700' },
});
