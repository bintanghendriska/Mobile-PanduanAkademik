import React from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Text, Card, List, Button, useTheme, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const openURL = (url: string) => {
  Linking.openURL(url).catch(() => Alert.alert('Error', 'Tidak dapat membuka tautan.'));
};

const DividerLine = () => (
  <View style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 2 }} />
);

export default function AcademicInfoScreen() {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Banner */}
      <Surface style={[styles.banner, { backgroundColor: theme.colors.primaryContainer }]} elevation={1}>
        <MaterialCommunityIcons
          name="information"
          size={32}
          color={theme.colors.primary}
        />
        <View style={styles.bannerText}>
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }}
          >
            Informasi & Layanan Kampus
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer, marginTop: 2 }}>
            Akses cepat kalender akademik dan kontak kampus
          </Text>
        </View>
      </Surface>

      <View style={styles.body}>
        {/* Kalender Akademik */}
        <Card mode="contained" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Kalender Akademik 2026/2027</Text>
            {[
              { icon: 'credit-card', title: 'Herregistrasi & Pembayaran UKT', desc: '10 Juli – 5 Agustus 2026' },
              { icon: 'file-document-edit', title: 'Masa Pengisian KRS', desc: '8 Agustus – 25 Agustus 2026' },
              { icon: 'school', title: 'Perkuliahan Semester Ganjil', desc: '1 September – 18 Desember 2026' },
              { icon: 'clipboard-text', title: 'Ujian Tengah Semester (UTS)', desc: 'Oktober 2026' },
              { icon: 'clipboard-check', title: 'Ujian Akhir Semester (UAS)', desc: 'Desember 2026' },
            ].map((item, i, arr) => (
              <View key={item.title}>
                <List.Item
                  title={item.title}
                  description={item.desc}
                  left={() => (
                    <List.Icon icon={item.icon} color={theme.colors.primary} />
                  )}
                  titleStyle={{ fontWeight: '600' }}
                />
                {i < arr.length - 1 && <DividerLine />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Kontak */}
        <Card mode="contained" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Kontak Akademik</Text>
            {[
              {
                icon: 'office-building',
                title: 'Biro Administrasi Akademik',
                desc: 'Email: baa@uir.ac.id | Telp: (0761) 63274',
              },
              {
                icon: 'face-agent',
                title: 'IT Helpdesk & SIA',
                desc: 'Email: helpdesk@uir.ac.id | WA: +628111222333',
              },
              {
                icon: 'laptop',
                title: 'UPT Teknologi Informasi',
                desc: 'Email: ti@uir.ac.id',
              },
            ].map((item, i, arr) => (
              <View key={item.title}>
                <List.Item
                  title={item.title}
                  description={item.desc}
                  left={() => (
                    <List.Icon icon={item.icon} color={theme.colors.secondary} />
                  )}
                  titleStyle={{ fontWeight: '600' }}
                />
                {i < arr.length - 1 && <DividerLine />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Portal Mahasiswa */}
        <Text variant="titleMedium" style={styles.sectionTitle}>Portal Mahasiswa</Text>
        <View style={styles.buttonGrid}>
          {[
            { label: 'Sistem SIA', icon: 'web', url: 'https://sia.uir.ac.id' },
            { label: 'E-Learning', icon: 'laptop', url: 'https://elearning.uir.ac.id' },
          ].map((item) => (
            <Button
              key={item.label}
              mode="outlined"
              icon={item.icon}
              onPress={() => openURL(item.url)}
              style={styles.portalBtn}
            >
              {item.label}
            </Button>
          ))}
        </View>

        <View style={styles.buttonGrid}>
          {[
            { label: 'Web Kampus', icon: 'school', url: 'https://www.uir.ac.id' },
            {
              label: 'Lokasi Kampus',
              icon: 'google-maps',
              url: 'https://maps.google.com/?q=Universitas+Islam+Riau,+Pekanbaru',
            },
          ].map((item) => (
            <Button
              key={item.label}
              mode="outlined"
              icon={item.icon}
              onPress={() => openURL(item.url)}
              style={styles.portalBtn}
            >
              {item.label}
            </Button>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    gap: 14,
  },
  bannerText: { flex: 1 },
  body: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 16, marginBottom: 14 },
  cardTitle: { fontWeight: 'bold', marginBottom: 6 },
  sectionTitle: { fontWeight: 'bold', marginTop: 8, marginBottom: 12 },
  buttonGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  portalBtn: { flex: 1, borderRadius: 10 },
});
