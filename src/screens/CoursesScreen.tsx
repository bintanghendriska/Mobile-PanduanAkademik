import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  FAB,
  Searchbar,
  Chip,
  useTheme,
  Button,
  Menu,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useCourses, useFilteredAndSortedCourses } from '../hooks/useCourses';
import { useGrades } from '../hooks/useGrades';
import { useNetwork } from '../hooks/useNetwork';
import CourseCard from '../components/CourseCard';
import AddCourseModal from '../components/AddCourseModal';
import EmptyState from '../components/EmptyState';
import LoadingIndicator from '../components/LoadingIndicator';
import OfflineBanner from '../components/OfflineBanner';
import { BottomTabParamList, RootStackParamList } from '../navigation/types';
import { CourseFormData, SortOption } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Mata Kuliah'>,
  NativeStackScreenProps<RootStackParamList>
>;

const SKS_OPTIONS = [2, 3, 4];

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Terbaru',
  oldest: 'Terlama',
  nama_asc: 'Nama A–Z',
  nama_desc: 'Nama Z–A',
  sks_desc: 'SKS Terbanyak',
  sks_asc: 'SKS Tersedikit',
};

export default function CoursesScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    loading,
    addCourse,
    deleteCourse,
    refreshCourses,
    error,
    syncing,
    syncFromServer,
    postCourseToServer,
  } = useCourses();
  const { getGrade } = useGrades();
  const { isOnline } = useNetwork();

  const [searchQuery, setSearchQuery] = useState('');
  const [sksFilter, setSksFilter] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const filtered = useFilteredAndSortedCourses(searchQuery, sksFilter, sortOption);

  // Pull-to-refresh re-reads local storage AND merges in anything new from
  // the server, so a single gesture covers both refresh paths.
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshCourses();
    try {
      await syncFromServer();
    } catch {
      // syncError is already surfaced via context state; refresh shouldn't crash on it
    }
    setRefreshing(false);
  }, [refreshCourses, syncFromServer]);

  const handleSyncPress = async () => {
    if (!isOnline) {
      Alert.alert('Tidak Ada Koneksi', 'Sambungkan ke internet untuk sinkronisasi dengan server.');
      return;
    }
    try {
      const { addedCount } = await syncFromServer();
      Alert.alert(
        'Sinkronisasi Selesai',
        addedCount > 0
          ? `${addedCount} mata kuliah baru ditemukan dari server.`
          : 'Tidak ada data baru. Data lokal sudah terbaru.',
      );
    } catch {
      Alert.alert('Sinkronisasi Gagal', 'Tidak dapat terhubung ke server. Coba lagi nanti.');
    }
  };

  const handleAddCourse = async (formData: CourseFormData) => {
    const payload = {
      nama: formData.nama.trim(),
      kode: formData.kode.trim().toUpperCase(),
      sks: Number(formData.sks),
      dosen: formData.dosen.trim(),
      hari: formData.hari.trim(),
      jam: formData.jam.trim(),
      ruangan: formData.ruangan.trim(),
      catatan: formData.catatan.trim(),
    };
    await addCourse(payload);
    setShowModal(false);

    // Simulate submitting the new course to the server; purely informational —
    // local save above already succeeded regardless of this outcome.
    if (!isOnline) {
      Alert.alert('Tersimpan Secara Lokal', 'Anda sedang offline — akan dikirim ke server saat sinkronisasi berikutnya.');
      return;
    }
    try {
      const { serverId } = await postCourseToServer(payload);
      Alert.alert('Tersimpan ke Server (Simulasi)', `Server memberikan ID #${serverId} untuk "${payload.nama}".`);
    } catch {
      Alert.alert('Info', 'Mata kuliah tersimpan lokal, namun gagal dikirim ke server.');
    }
  };

  if (loading && !refreshing) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header area with safe area for Dynamic Island */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Text variant="headlineSmall" style={[styles.pageTitle, { color: theme.colors.onBackground }]}>
          Mata Kuliah
        </Text>
        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={[styles.syncBtn, { backgroundColor: theme.colors.secondaryContainer }]}
            onPress={handleSyncPress}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size={14} color={theme.colors.secondary} />
            ) : (
              <MaterialCommunityIcons
                name={isOnline ? 'cloud-sync-outline' : 'cloud-off-outline'}
                size={18}
                color={isOnline ? theme.colors.secondary : theme.colors.outline}
              />
            )}
          </TouchableOpacity>
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={[styles.sortBtn, { backgroundColor: theme.colors.primaryContainer }]}
                onPress={() => setSortMenuVisible(true)}
              >
                <MaterialCommunityIcons
                  name="sort-variant"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text variant="labelSmall" style={{ color: theme.colors.primary, marginLeft: 4 }}>
                  {SORT_LABELS[sortOption]}
                </Text>
              </TouchableOpacity>
            }
          >
          <Text variant="labelMedium" style={styles.menuHeader}>Urutkan</Text>
          <Divider />
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <Menu.Item
              key={key}
              onPress={() => {
                setSortOption(key);
                setSortMenuVisible(false);
              }}
              title={SORT_LABELS[key]}
              leadingIcon={sortOption === key ? 'check' : undefined}
            />
          ))}
          </Menu>
        </View>
      </View>

      <OfflineBanner />

      {/* Error */}
      {!!error && (
        <View style={[styles.errorStrip, { backgroundColor: '#FFEBEE' }]}>
          <Text variant="bodySmall" style={{ color: '#B71C1C', flex: 1 }}>{error}</Text>
          <Button compact textColor="#B71C1C" onPress={refreshCourses}>Coba Lagi</Button>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchWrap}>
        <Searchbar
          placeholder="Cari nama, kode, dosen..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
          elevation={0}
        />
      </View>

      {/* SKS Filter Chips */}
      <View style={styles.chips}>
        <Text variant="labelSmall" style={[styles.filterLabel, { color: theme.colors.outline }]}>
          Filter:
        </Text>
        {SKS_OPTIONS.map((sks) => (
          <Chip
            key={sks}
            selected={sksFilter === sks}
            onPress={() => setSksFilter((p) => (p === sks ? null : sks))}
            style={styles.chip}
            compact
          >
            {sks} SKS
          </Chip>
        ))}
        {sksFilter !== null && (
          <Chip onPress={() => setSksFilter(null)} compact icon="close">
            Reset
          </Chip>
        )}
      </View>

      <Text variant="labelSmall" style={[styles.count, { color: theme.colors.outline }]}>
        {filtered.length} mata kuliah
      </Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filtered.length === 0 && styles.listEmpty,
        ]}
        renderItem={({ item, index }) => (
          <CourseCard
            course={item}
            grade={getGrade(item.id)}
            index={index}
            onPress={() => navigation.navigate('CourseDetail', { course: item })}
            onDelete={() => deleteCourse(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="book-open-page-variant-outline"
            title={searchQuery || sksFilter ? 'Tidak ada hasil' : 'Belum ada mata kuliah'}
            description={
              searchQuery || sksFilter
                ? 'Coba ubah filter atau kata kunci.'
                : 'Tambahkan mata kuliah pertama Anda dengan tombol + di bawah.'
            }
            actionLabel={!searchQuery && !sksFilter ? 'Tambah Mata Kuliah' : undefined}
            onAction={!searchQuery && !sksFilter ? () => setShowModal(true) : undefined}
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            bottom: insets.bottom + 80,
          },
        ]}
        color="#FFF"
        onPress={() => setShowModal(true)}
      />

      <AddCourseModal
        visible={showModal}
        onDismiss={() => setShowModal(false)}
        onSubmit={handleAddCourse}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  pageTitle: { fontWeight: 'bold' },
  topBarActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  syncBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 2,
  },
  menuHeader: { paddingHorizontal: 16, paddingVertical: 8, opacity: 0.6 },
  errorStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  searchbar: { borderRadius: 14 },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 4,
  },
  filterLabel: { marginRight: 2 },
  chip: { height: 30 },
  count: { paddingHorizontal: 16, marginBottom: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 140 },
  listEmpty: { flexGrow: 1 },
  fab: { position: 'absolute', right: 20, borderRadius: 18 },
});
