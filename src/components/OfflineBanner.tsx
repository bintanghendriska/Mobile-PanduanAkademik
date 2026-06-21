import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNetwork } from '../hooks/useNetwork';

// Renders nothing while online — only appears to explain why data on screen
// might be stale and why "Sync from Server" won't work right now.
export default function OfflineBanner() {
  const { isOnline } = useNetwork();
  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <MaterialCommunityIcons name="wifi-off" size={14} color="#FFF" />
      <Text variant="labelSmall" style={styles.text}>
        Mode Offline — menampilkan data tersimpan
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#B71C1C',
    paddingVertical: 6,
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 8,
  },
  text: { color: '#FFF', fontWeight: '600' },
});
