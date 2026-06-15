import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  HelperText,
  useTheme,
  Divider,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useCourses } from '../hooks/useCourses';
import { RootStackParamList } from '../navigation/types';
import { CourseFormData, ValidationErrors } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditCourse'>;

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function validate(f: CourseFormData): ValidationErrors {
  const e: ValidationErrors = {};
  if (!f.nama.trim()) e.nama = 'Nama mata kuliah wajib diisi.';
  if (!f.kode.trim()) e.kode = 'Kode mata kuliah wajib diisi.';
  if (!f.sks.trim()) {
    e.sks = 'SKS wajib diisi.';
  } else if (isNaN(Number(f.sks)) || Number(f.sks) < 1 || Number(f.sks) > 6) {
    e.sks = 'SKS harus angka antara 1–6.';
  }
  if (!f.dosen.trim()) e.dosen = 'Nama dosen wajib diisi.';
  return e;
}

export default function EditCourseScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { course } = route.params;
  const { updateCourse } = useCourses();

  const [form, setForm] = useState<CourseFormData>({
    nama: course.nama,
    kode: course.kode,
    sks: String(course.sks),
    dosen: course.dosen,
    hari: course.hari ?? '',
    jam: course.jam ?? '',
    ruangan: course.ruangan ?? '',
    catatan: course.catatan,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);

  const change = (field: keyof CourseFormData, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (Object.keys(errors).length > 0) setErrors(validate(updated));
  };

  const toggleHari = (day: string) => {
    change('hari', form.hari === day ? '' : day);
  };

  const handleSave = async () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      await updateCourse(course.id, {
        nama: form.nama.trim(),
        kode: form.kode.trim().toUpperCase(),
        sks: Number(form.sks),
        dosen: form.dosen.trim(),
        hari: form.hari.trim(),
        jam: form.jam.trim(),
        ruangan: form.ruangan.trim(),
        catatan: form.catatan.trim(),
      });
      Alert.alert('Berhasil', 'Data mata kuliah diperbarui.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Informasi Dasar */}
        <Text variant="labelMedium" style={[styles.groupLabel, { color: theme.colors.outline }]}>
          INFORMASI DASAR *
        </Text>

        <TextInput
          label="Nama Mata Kuliah"
          value={form.nama}
          onChangeText={(v) => change('nama', v)}
          mode="outlined"
          style={styles.input}
          error={!!errors.nama}
        />
        <HelperText type="error" visible={!!errors.nama}>{errors.nama}</HelperText>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <TextInput
              label="Kode MK"
              value={form.kode}
              onChangeText={(v) => change('kode', v)}
              mode="outlined"
              style={styles.input}
              error={!!errors.kode}
              autoCapitalize="characters"
            />
            <HelperText type="error" visible={!!errors.kode}>{errors.kode}</HelperText>
          </View>
          <View style={{ width: 90 }}>
            <TextInput
              label="SKS"
              value={form.sks}
              onChangeText={(v) => change('sks', v)}
              mode="outlined"
              keyboardType="numeric"
              maxLength={1}
              style={styles.input}
              error={!!errors.sks}
            />
            <HelperText type="error" visible={!!errors.sks}>{errors.sks}</HelperText>
          </View>
        </View>

        <TextInput
          label="Nama Dosen Pengampu"
          value={form.dosen}
          onChangeText={(v) => change('dosen', v)}
          mode="outlined"
          style={styles.input}
          error={!!errors.dosen}
        />
        <HelperText type="error" visible={!!errors.dosen}>{errors.dosen}</HelperText>

        <Divider style={styles.divider} />

        {/* Jadwal */}
        <Text variant="labelMedium" style={[styles.groupLabel, { color: theme.colors.outline }]}>
          JADWAL (OPSIONAL)
        </Text>

        <Text variant="bodySmall" style={[styles.hariLabel, { color: theme.colors.outline }]}>
          Hari Kuliah
        </Text>
        <View style={styles.hariRow}>
          {HARI_LIST.map((day) => {
            const active = form.hari === day;
            return (
              <Button
                key={day}
                mode={active ? 'contained' : 'outlined'}
                onPress={() => toggleHari(day)}
                style={styles.hariBtn}
                compact
                labelStyle={{ fontSize: 11 }}
              >
                {day.slice(0, 3)}
              </Button>
            );
          })}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <TextInput
              label="Jam (cth: 08.00–10.00)"
              value={form.jam}
              onChangeText={(v) => change('jam', v)}
              mode="outlined"
              style={styles.input}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              label="Ruangan"
              value={form.ruangan}
              onChangeText={(v) => change('ruangan', v)}
              mode="outlined"
              style={styles.input}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Catatan */}
        <Text variant="labelMedium" style={[styles.groupLabel, { color: theme.colors.outline }]}>
          CATATAN
        </Text>
        <TextInput
          label="Catatan (opsional)"
          value={form.catatan}
          onChangeText={(v) => change('catatan', v)}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={[styles.btn, { marginRight: 10 }]}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.btn}
            loading={saving}
            disabled={saving}
          >
            Simpan Perubahan
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  groupLabel: { letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  input: { marginTop: 2 },
  row: { flexDirection: 'row' },
  divider: { marginVertical: 16 },
  hariLabel: { marginBottom: 8 },
  hariRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  hariBtn: { borderRadius: 8, minWidth: 52 },
  actions: { flexDirection: 'row', marginTop: 24 },
  btn: { flex: 1, borderRadius: 12 },
});
