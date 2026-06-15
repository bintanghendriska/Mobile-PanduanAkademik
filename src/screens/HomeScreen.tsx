import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Animated,
} from 'react-native';
import { Text, Card, Avatar, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useStudent } from '../hooks/useStudent';
import { useCourseStats, useCourses } from '../hooks/useCourses';
import { useIPK } from '../hooks/useGrades';
import { BottomTabParamList, RootStackParamList } from '../navigation/types';
import { CAMPUS_MAPS_URL, CAMPUS_PHONE, CAMPUS_WEBSITE } from '../constants/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface QuickMenu {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  bg: string;
  onPress: () => void;
}

const ANNOUNCEMENTS = [
  {
    icon: 'bullhorn-outline' as const,
    title: 'Pengisian KRS Semester Ganjil',
    desc: 'Batas pengisian KRS diperpanjang hingga 15 Juni 2026.',
    color: '#1A237E',
  },
  {
    icon: 'calendar-range' as const,
    title: 'Jadwal UAS Semester Genap',
    desc: 'UAS dilaksanakan 22 Juni – 3 Juli 2026 secara luring.',
    color: '#00897B',
  },
  {
    icon: 'cash-multiple' as const,
    title: 'Pembayaran UKT Semester Ganjil',
    desc: 'Herregistrasi & UKT: 10 Juli – 5 Agustus 2026.',
    color: '#F57F17',
  },
];

export default function HomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { student } = useStudent();
  const { totalMataKuliah, totalSks } = useCourseStats();
  const { courses } = useCourses();
  const ipk = useIPK(courses);

  // Header slide-in
  const headerY = useRef(new Animated.Value(-20)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // Stats count-up
  const matkulAnim = useRef(new Animated.Value(0)).current;
  const sksAnim = useRef(new Animated.Value(0)).current;

  // Menu item stagger: 6 items
  const menuAnims = useRef(
    Array.from({ length: 6 }, () => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.8),
    })),
  ).current;

  // Announcement card stagger
  const cardAnims = useRef(
    ANNOUNCEMENTS.map(() => ({
      opacity: new Animated.Value(0),
      y: new Animated.Value(20),
    })),
  ).current;

  useEffect(() => {
    // Header
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headerY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    // Count-up stats
    Animated.parallel([
      Animated.timing(matkulAnim, { toValue: totalMataKuliah, duration: 900, delay: 300, useNativeDriver: false }),
      Animated.timing(sksAnim, { toValue: totalSks, duration: 900, delay: 300, useNativeDriver: false }),
    ]).start();

    // Menu stagger
    Animated.parallel(
      menuAnims.map((a, i) =>
        Animated.parallel([
          Animated.timing(a.opacity, { toValue: 1, duration: 300, delay: 400 + i * 80, useNativeDriver: true }),
          Animated.spring(a.scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        ]),
      ),
    ).start();

    // Cards stagger
    Animated.parallel(
      cardAnims.map((a, i) =>
        Animated.parallel([
          Animated.timing(a.opacity, { toValue: 1, duration: 350, delay: 850 + i * 100, useNativeDriver: true }),
          Animated.timing(a.y, { toValue: 0, duration: 350, delay: 850 + i * 100, useNativeDriver: true }),
        ]),
      ),
    ).start();
  }, [totalMataKuliah, totalSks]);

  const openURL = async (url: string) => {
    const ok = await Linking.canOpenURL(url);
    if (ok) await Linking.openURL(url);
    else Alert.alert('Error', 'Tidak dapat membuka tautan.');
  };

  const quickMenus: QuickMenu[] = [
    {
      label: 'Daftar\nMatkul',
      icon: 'book-open-variant',
      bg: theme.colors.primaryContainer,
      onPress: () => navigation.navigate('Mata Kuliah'),
    },
    {
      label: 'Profil\nSaya',
      icon: 'account-circle-outline',
      bg: theme.colors.secondaryContainer,
      onPress: () => navigation.navigate('Profil'),
    },
    {
      label: 'Info\nKampus',
      icon: 'information-outline',
      bg: '#E3F2FD',
      onPress: () => navigation.navigate('InformasiKampus'),
    },
    {
      label: 'Lokasi\nKampus',
      icon: 'google-maps',
      bg: '#FFF3E0',
      onPress: () => openURL(CAMPUS_MAPS_URL),
    },
    {
      label: 'Web\nKampus',
      icon: 'web',
      bg: '#E8F5E9',
      onPress: () => openURL(CAMPUS_WEBSITE),
    },
    {
      label: 'Call\nCenter',
      icon: 'phone-in-talk',
      bg: '#FCE4EC',
      onPress: () => openURL(CAMPUS_PHONE),
    },
  ];

  const iconColors: Record<string, string> = {
    [theme.colors.primaryContainer]: theme.colors.primary,
    [theme.colors.secondaryContainer]: theme.colors.secondary,
    '#E3F2FD': '#1565C0',
    '#FFF3E0': '#E65100',
    '#E8F5E9': '#2E7D32',
    '#FCE4EC': '#C62828',
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.primary,
            paddingTop: insets.top + 16,
            opacity: headerOpacity,
            transform: [{ translateY: headerY }],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.studentInfo}>
            <Text style={styles.greet}>Selamat Datang,</Text>
            <Text variant="headlineSmall" style={styles.name} numberOfLines={1}>
              {student.nama}
            </Text>
            <Text style={styles.sub}>{student.jurusan}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profil')}
            style={styles.avatarWrap}
          >
            <Avatar.Image
              size={52}
              source={require('../../assets/profil.jpg')}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>

        {/* Stats Strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{student.semester}</Text>
            <Text style={styles.statLbl}>Semester</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{ipk ?? '–'}</Text>
            <Text style={styles.statLbl}>IPK</Text>
          </View>
          <View style={styles.statDiv} />
          {/* Animated count-up for Matkul */}
          <View style={styles.statItem}>
            <Animated.Text style={styles.statVal}>
              {matkulAnim.interpolate({
                inputRange: [0, Math.max(totalMataKuliah, 1)],
                outputRange: ['0', String(totalMataKuliah)],
                extrapolate: 'clamp',
              })}
            </Animated.Text>
            <Text style={styles.statLbl}>Matkul</Text>
          </View>
          <View style={styles.statDiv} />
          {/* Animated count-up for SKS */}
          <View style={styles.statItem}>
            <Animated.Text style={styles.statVal}>
              {sksAnim.interpolate({
                inputRange: [0, Math.max(totalSks, 1)],
                outputRange: ['0', String(totalSks)],
                extrapolate: 'clamp',
              })}
            </Animated.Text>
            <Text style={styles.statLbl}>SKS</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.body}>
        {/* Quick Menu */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Menu Cepat
        </Text>
        <View style={styles.menuGrid}>
          {quickMenus.map((item, i) => (
            <Animated.View
              key={item.label}
              style={[
                styles.menuItem,
                {
                  backgroundColor: theme.colors.surface,
                  opacity: menuAnims[i].opacity,
                  transform: [{ scale: menuAnims[i].scale }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuTouchable}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color={iconColors[item.bg] ?? theme.colors.primary}
                  />
                </View>
                <Text
                  variant="labelSmall"
                  style={[styles.menuLabel, { color: theme.colors.onSurface }]}
                  numberOfLines={2}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Pengumuman */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Pengumuman Terbaru
        </Text>
        {ANNOUNCEMENTS.map((a, i) => (
          <Animated.View
            key={a.title}
            style={{
              opacity: cardAnims[i].opacity,
              transform: [{ translateY: cardAnims[i].y }],
            }}
          >
            <Card mode="outlined" style={[styles.card, { borderColor: 'rgba(0,0,0,0.07)' }]}>
              <Card.Content style={styles.cardContent}>
                <View style={[styles.announcementIcon, { backgroundColor: a.color + '18' }]}>
                  <MaterialCommunityIcons name={a.icon} size={20} color={a.color} />
                </View>
                <View style={styles.announcementText}>
                  <Text variant="titleSmall" style={{ fontWeight: '700' }}>{a.title}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 2 }}>
                    {a.desc}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  studentInfo: { flex: 1, paddingRight: 12 },
  greet: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  name: { color: '#FFF', fontWeight: 'bold', marginVertical: 2 },
  sub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  avatarWrap: { position: 'relative' },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#69F0AE',
    borderWidth: 2,
    borderColor: '#1A237E',
  },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { color: '#FFF', fontWeight: 'bold', fontSize: 22, lineHeight: 28 },
  statLbl: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },
  statDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  body: { paddingHorizontal: 18, paddingTop: 20 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 14 },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  menuItem: {
    width: '30.5%',
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  menuTouchable: {
    padding: 14,
    alignItems: 'center',
  },
  menuIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  menuLabel: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 15,
  },
  card: { borderRadius: 14, marginBottom: 10 },
  cardContent: { flexDirection: 'row', alignItems: 'flex-start' },
  announcementIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  announcementText: { flex: 1 },
});
