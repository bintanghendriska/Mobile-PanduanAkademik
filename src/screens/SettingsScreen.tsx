import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  List,
  Switch,
  Card,
  Divider,
  Button,
  useTheme,
  Avatar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '../hooks/useSettings';
import { asyncStorageService } from '../storage/asyncStorage';
import { mmkvStorage } from '../storage/mmkvStorage';
import { notificationService } from '../services/notificationService';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, toggleDarkMode, toggleNotifikasi, toggleBackgroundSync } = useSettings();

  const handleNotifikasi = async () => {
    const willEnable = !settings.notifikasi;
    toggleNotifikasi();
    if (willEnable) {
      await notificationService.scheduleDaily();
    } else {
      await notificationService.cancelAll();
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Hapus Semua Data',
      'Ini akan menghapus semua mata kuliah dan profil yang telah tersimpan. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await asyncStorageService.clear();
            mmkvStorage.clearAll();
            Alert.alert(
              'Berhasil',
              'Semua data telah dihapus. Restart aplikasi untuk melihat perubahan.',
            );
          },
        },
      ],
    );
  };

  const settingItems = [
    {
      title: 'Mode Gelap',
      description: 'Ganti tampilan ke tema gelap',
      icon: 'weather-night' as const,
      value: settings.darkMode,
      onToggle: toggleDarkMode,
    },
    {
      title: 'Notifikasi Harian',
      description: 'Pengingat akademik setiap hari pukul 08.00',
      icon: 'bell-outline' as const,
      value: settings.notifikasi,
      onToggle: handleNotifikasi,
    },
    {
      title: 'Sinkronisasi Latar Belakang',
      description: 'Cek mata kuliah baru dari server setiap ±30 menit',
      icon: 'cloud-sync-outline' as const,
      value: settings.backgroundSync,
      onToggle: toggleBackgroundSync,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 48 }}
    >
      {/* Header — padded for Dynamic Island / notch */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.primary,
            paddingTop: insets.top + 24,
          },
        ]}
      >
        <Avatar.Icon
          size={52}
          icon="cog"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          color="#FFF"
        />
        <Text variant="headlineSmall" style={styles.headerTitle}>Pengaturan</Text>
        <Text style={styles.headerSub}>Sesuaikan tampilan dan preferensi aplikasi</Text>
      </View>

      <View style={styles.body}>
        {/* Tampilan & Preferensi */}
        <Text variant="labelLarge" style={[styles.groupLabel, { color: theme.colors.outline }]}>
          TAMPILAN & PREFERENSI
        </Text>
        <Card mode="contained" style={styles.card}>
          {settingItems.map((item, idx) => (
            <View key={item.title}>
              <List.Item
                title={item.title}
                description={item.description}
                left={() => (
                  <View style={[styles.settingIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                )}
                right={() => (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    color={theme.colors.primary}
                  />
                )}
                titleStyle={{ fontWeight: '600' }}
                style={styles.listItem}
              />
              {idx < settingItems.length - 1 && <Divider />}
            </View>
          ))}
        </Card>

        {/* Informasi Aplikasi */}
        <Text variant="labelLarge" style={[styles.groupLabel, { color: theme.colors.outline }]}>
          INFORMASI APLIKASI
        </Text>
        <Card mode="contained" style={styles.card}>
          {[
            { label: 'Versi Aplikasi', value: '2.0.0', icon: 'information-outline' as const },
            { label: 'Platform', value: 'React Native (Expo)', icon: 'cellphone' as const },
            { label: 'Developer', value: 'Bintang Hendriska Valen', icon: 'account-outline' as const },
            { label: 'Program Studi', value: 'Teknik Informatika – UIR Pekanbaru', icon: 'school-outline' as const },
          ].map((item, idx, arr) => (
            <View key={item.label}>
              <List.Item
                title={item.label}
                left={() => (
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={18}
                    color={theme.colors.outline}
                    style={styles.infoIcon}
                  />
                )}
                right={() => (
                  <Text
                    variant="bodySmall"
                    style={[styles.infoValue, { color: theme.colors.outline }]}
                    numberOfLines={1}
                  >
                    {item.value}
                  </Text>
                )}
                style={styles.listItem}
              />
              {idx < arr.length - 1 && <Divider />}
            </View>
          ))}
        </Card>

        {/* Zona Berbahaya */}
        <Text variant="labelLarge" style={[styles.groupLabel, { color: theme.colors.error }]}>
          ZONA BERBAHAYA
        </Text>
        <Button
          mode="outlined"
          icon="trash-can-outline"
          onPress={handleClearData}
          style={[styles.dangerBtn, { borderColor: theme.colors.error }]}
          textColor={theme.colors.error}
          contentStyle={styles.dangerBtnContent}
        >
          Hapus Semua Data Aplikasi
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 6,
  },
  headerTitle: { color: '#FFF', fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, textAlign: 'center' },
  body: { padding: 16 },
  groupLabel: { marginBottom: 8, marginTop: 16, letterSpacing: 0.5 },
  card: { borderRadius: 16, marginBottom: 4, overflow: 'hidden' },
  listItem: { paddingVertical: 4 },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    alignSelf: 'center',
  },
  infoIcon: { alignSelf: 'center', marginHorizontal: 8 },
  infoValue: { alignSelf: 'center', fontSize: 11, flexShrink: 1 },
  dangerBtn: { borderRadius: 12, marginTop: 8 },
  dangerBtnContent: { paddingVertical: 4 },
});
