import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  Share,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  Divider,
  useTheme,
  Surface,
  Avatar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useCourses } from '../hooks/useCourses';
import { useStudent } from '../hooks/useStudent';
import { useGrades } from '../hooks/useGrades';
import { RootStackParamList } from '../navigation/types';
import {
  CAMPUS_MAPS_URL,
  CAMPUS_WHATSAPP,
  CAMPUS_EMAIL,
} from '../constants/theme';
import { GradeValue, GRADE_COLOR, GRADE_POINTS } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseDetail'>;

const ALL_GRADES: GradeValue[] = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'E', 'F'];

function GradePicker({
  visible,
  current,
  onSelect,
  onRemove,
  onDismiss,
}: {
  visible: boolean;
  current: GradeValue | null;
  onSelect: (g: GradeValue) => void;
  onRemove: () => void;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={onDismiss}>
        <Surface style={[styles.pickerSheet, { backgroundColor: theme.colors.surface }]} elevation={5}>
          <Text variant="titleMedium" style={styles.pickerTitle}>
            Pilih Nilai
          </Text>
          <View style={styles.gradeGrid}>
            {ALL_GRADES.map((g) => {
              const isActive = current === g;
              return (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.gradeItem,
                    {
                      backgroundColor: isActive ? GRADE_COLOR[g] : GRADE_COLOR[g] + '20',
                      borderWidth: isActive ? 0 : 1.5,
                      borderColor: GRADE_COLOR[g] + '60',
                    },
                  ]}
                  onPress={() => onSelect(g)}
                >
                  <Text
                    style={[
                      styles.gradeItemText,
                      { color: isActive ? '#FFF' : GRADE_COLOR[g] },
                    ]}
                  >
                    {g}
                  </Text>
                  <Text style={[styles.gradePoint, { color: isActive ? 'rgba(255,255,255,0.8)' : GRADE_COLOR[g] + 'AA' }]}>
                    {GRADE_POINTS[g].toFixed(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {current && (
            <Button
              mode="text"
              textColor={theme.colors.error}
              onPress={onRemove}
              style={{ marginTop: 8 }}
            >
              Hapus Nilai
            </Button>
          )}
        </Surface>
      </TouchableOpacity>
    </Modal>
  );
}

export default function CourseDetailScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { course } = route.params;
  const { deleteCourse } = useCourses();
  const { student } = useStudent();
  const { getGrade, setGrade, removeGrade } = useGrades();

  const [gradePickerVisible, setGradePickerVisible] = useState(false);
  const currentGrade = getGrade(course.id);

  const openURL = async (url: string) => {
    const ok = await Linking.canOpenURL(url);
    if (ok) await Linking.openURL(url);
    else Alert.alert('Error', 'Tidak dapat membuka tautan ini.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `Informasi Mata Kuliah:\n\n` +
          `Nama: ${course.nama}\n` +
          `Kode: ${course.kode}\n` +
          `SKS: ${course.sks} SKS\n` +
          `Dosen: ${course.dosen}\n` +
          (course.hari ? `Jadwal: ${course.hari}${course.jam ? ', ' + course.jam : ''}\n` : '') +
          (course.ruangan ? `Ruangan: ${course.ruangan}\n` : '') +
          (course.catatan ? `Catatan: ${course.catatan}\n` : '') +
          `\nDibagikan via Panduan Akademik`,
      });
    } catch {
      Alert.alert('Error', 'Gagal membagikan informasi.');
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Halo, saya ${student.nama} (${student.nim}) ingin bertanya mengenai mata kuliah ${course.nama} (${course.kode}).`,
    );
    openURL(`${CAMPUS_WHATSAPP}?text=${msg}`);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Pertanyaan: ${course.nama} (${course.kode})`);
    const body = encodeURIComponent(
      `Halo,\n\nSaya ${student.nama} (NIM: ${student.nim}) ingin berkonsultasi mengenai mata kuliah ${course.nama} yang diampu ${course.dosen}.\n\nTerima kasih.`,
    );
    openURL(`${CAMPUS_EMAIL}?subject=${subject}&body=${body}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Hapus Mata Kuliah',
      `Anda yakin ingin menghapus "${course.nama}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await removeGrade(course.id);
            await deleteCourse(course.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const infoRows = [
    { icon: 'identifier' as const, label: 'Kode Mata Kuliah', value: course.kode },
    { icon: 'counter' as const, label: 'Jumlah SKS', value: `${course.sks} SKS` },
    { icon: 'account-tie' as const, label: 'Dosen Pengampu', value: course.dosen },
    ...(course.hari ? [{ icon: 'calendar-week' as const, label: 'Hari', value: course.hari }] : []),
    ...(course.jam ? [{ icon: 'clock-outline' as const, label: 'Jam', value: course.jam }] : []),
    ...(course.ruangan ? [{ icon: 'door' as const, label: 'Ruangan', value: course.ruangan }] : []),
    {
      icon: 'calendar-plus' as const,
      label: 'Ditambahkan',
      value: new Date(course.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      }),
    },
  ];

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero */}
        <Surface style={[styles.banner, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
          <Avatar.Text
            size={60}
            label={course.kode.substring(0, 2)}
            style={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.bannerText}>
            <Text
              variant="headlineSmall"
              style={[styles.bannerTitle, { color: theme.colors.onPrimaryContainer }]}
            >
              {course.nama}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
              {course.kode} • {course.sks} SKS
            </Text>
          </View>
        </Surface>

        <View style={styles.body}>
          {/* Nilai Card */}
          <Surface
            style={[styles.gradeCard, { backgroundColor: currentGrade ? GRADE_COLOR[currentGrade] + '15' : theme.colors.surface }]}
            elevation={1}
          >
            <View style={styles.gradeCardRow}>
              <MaterialCommunityIcons
                name="school-outline"
                size={20}
                color={currentGrade ? GRADE_COLOR[currentGrade] : theme.colors.outline}
              />
              <View style={styles.gradeCardText}>
                <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                  Nilai Mata Kuliah
                </Text>
                <Text
                  variant="titleMedium"
                  style={{
                    fontWeight: 'bold',
                    color: currentGrade ? GRADE_COLOR[currentGrade] : theme.colors.onSurface,
                  }}
                >
                  {currentGrade
                    ? `${currentGrade}  (${GRADE_POINTS[currentGrade].toFixed(1)})`
                    : 'Belum dinilai'}
                </Text>
              </View>
              <Button
                mode={currentGrade ? 'tonal' : 'contained'}
                onPress={() => setGradePickerVisible(true)}
                style={styles.setNilaiBtn}
                compact
                labelStyle={{ fontSize: 12 }}
              >
                {currentGrade ? 'Ubah' : 'Set Nilai'}
              </Button>
            </View>
          </Surface>

          {/* Info Card */}
          <Surface style={[styles.infoCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <Text variant="titleSmall" style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>
              Informasi Mata Kuliah
            </Text>
            <Divider style={styles.divider} />
            {infoRows.map((row, i) => (
              <View key={row.label}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name={row.icon}
                    size={17}
                    color={theme.colors.primary}
                    style={styles.infoIcon}
                  />
                  <View style={styles.infoText}>
                    <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                      {row.label}
                    </Text>
                    <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                      {row.value}
                    </Text>
                  </View>
                </View>
                {i < infoRows.length - 1 && <Divider style={{ opacity: 0.4 }} />}
              </View>
            ))}

            {course.catatan ? (
              <>
                <Divider style={styles.divider} />
                <Text variant="labelSmall" style={[styles.sectionLabel, { color: theme.colors.outline }]}>
                  CATATAN
                </Text>
                <Text variant="bodyMedium" style={{ lineHeight: 22, color: theme.colors.onSurface, marginTop: 6 }}>
                  {course.catatan}
                </Text>
              </>
            ) : null}
          </Surface>

          {/* Actions */}
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => navigation.navigate('EditCourse', { course })}
            style={styles.actionBtn}
            contentStyle={styles.actionContent}
          >
            Edit Mata Kuliah
          </Button>

          <Button
            mode="outlined"
            icon="share-variant"
            onPress={handleShare}
            style={styles.actionBtn}
            contentStyle={styles.actionContent}
          >
            Bagikan Info Mata Kuliah
          </Button>

          {/* Contact */}
          <Text variant="titleSmall" style={[styles.sectionLabel, { marginTop: 8, marginBottom: 12 }]}>
            Hubungi & Navigasi
          </Text>
          <View style={styles.contactGrid}>
            <Button
              mode="elevated"
              icon="whatsapp"
              onPress={handleWhatsApp}
              style={styles.contactBtn}
              buttonColor="#E8F5E9"
              textColor="#2E7D32"
            >
              WhatsApp
            </Button>
            <Button
              mode="elevated"
              icon="email-outline"
              onPress={handleEmail}
              style={styles.contactBtn}
            >
              Email
            </Button>
          </View>
          <Button
            mode="elevated"
            icon="google-maps"
            onPress={() => openURL(CAMPUS_MAPS_URL)}
            style={[styles.actionBtn, { marginTop: 0 }]}
            buttonColor="#FFF3E0"
            textColor="#E65100"
            contentStyle={styles.actionContent}
          >
            Lokasi Kampus di Maps
          </Button>

          {/* Delete */}
          <Divider style={[styles.divider, { marginTop: 12 }]} />
          <Button
            mode="outlined"
            icon="trash-can-outline"
            onPress={handleDelete}
            style={[styles.actionBtn, { borderColor: theme.colors.error }]}
            textColor={theme.colors.error}
            contentStyle={styles.actionContent}
          >
            Hapus Mata Kuliah
          </Button>
        </View>
      </ScrollView>

      <GradePicker
        visible={gradePickerVisible}
        current={currentGrade}
        onSelect={async (g) => {
          await setGrade(course.id, g);
          setGradePickerVisible(false);
        }}
        onRemove={async () => {
          await removeGrade(course.id);
          setGradePickerVisible(false);
        }}
        onDismiss={() => setGradePickerVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 16,
  },
  bannerText: { flex: 1 },
  bannerTitle: { fontWeight: 'bold', marginBottom: 4 },
  body: { padding: 16, gap: 12 },
  gradeCard: { borderRadius: 16, padding: 16 },
  gradeCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gradeCardText: { flex: 1 },
  setNilaiBtn: { borderRadius: 10 },
  infoCard: { borderRadius: 16, padding: 16 },
  sectionLabel: { fontWeight: 'bold' },
  divider: { marginVertical: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  infoIcon: { marginRight: 12, marginTop: 2 },
  infoText: { flex: 1 },
  actionBtn: { borderRadius: 14, marginTop: 4 },
  actionContent: { paddingVertical: 4 },
  contactGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  contactBtn: { flex: 1, borderRadius: 12 },

  // Grade Picker
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerSheet: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
  },
  pickerTitle: { fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  gradeItem: {
    width: 64,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    gap: 2,
  },
  gradeItemText: { fontSize: 16, fontWeight: '800' },
  gradePoint: { fontSize: 10, fontWeight: '600' },
});
