// Полноэкранный просмотр изображений
import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Text,
} from 'react-native';

export default function ImageModalScreen({ route, navigation }) {
  const { imageUrl } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <View style={styles.closeIcon}>
          <Text style={styles.closeIconText}>✕</Text>
        </View>
      </TouchableOpacity>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
  },
  closeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  image: {
    flex: 1,
    width: '100%',
  },
});
