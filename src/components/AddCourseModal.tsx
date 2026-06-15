import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  HelperText,
  Surface,
  IconButton,
  Divider,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CourseFormData, ValidationErrors } from '../types';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: CourseFormData) => void;
}

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const INITIAL: CourseFormData = {
  nama: '',
  kode: '',
  sks: '',
  dosen: '',
  hari: '',
  jam: '',
  ruangan: '',
  catatan: '',
};

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

export default function AddCourseModal({ visible, onDismiss, onSubmit }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<CourseFormData>(INITIAL);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState(false);

  const change = (field: keyof CourseFormData, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched) setErrors(validate(updated));
  };

  const selectHari = (day: string) => {
    change('hari', form.hari === day ? '' : day);
  };

  const handleSubmit = () => {
    setTouched(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit(form);
    setForm(INITIAL);
    setErrors({});
    setTouched(false);
  };

  const handleDismiss = () => {
    setForm(INITIAL);
    setErrors({});
    setTouched(false);
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleDismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.overlay}>
          <Surface
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.surface,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
            elevation={5}
          >
            {/* Drag Handle */}
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text variant="titleLarge" style={styles.title}>
                Tambah Mata Kuliah
              </Text>
              <IconButton icon="close" size={22} onPress={handleDismiss} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Informasi Dasar */}
              <Text variant="labelMedium" style={[styles.sectionLabel, { color: theme.colors.outline }]}>
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
                    style={styles.input}
                    error={!!errors.sks}
                    maxLength={1}
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
              <Text variant="labelMedium" style={[styles.sectionLabel, { color: theme.colors.outline }]}>
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
                      onPress={() => selectHari(day)}
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
              <Text variant="labelMedium" style={[styles.sectionLabel, { color: theme.colors.outline }]}>
                CATATAN
              </Text>
              <TextInput
                label="Catatan (opsional)"
                value={form.catatan}
                onChangeText={(v) => change('catatan', v)}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              <View style={styles.actions}>
                <Button
                  mode="outlined"
                  onPress={handleDismiss}
                  style={[styles.btn, { marginRight: 10 }]}
                >
                  Batal
                </Button>
                <Button mode="contained" onPress={handleSubmit} style={styles.btn}>
                  Tambahkan
                </Button>
              </View>
            </ScrollView>
          </Surface>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '92%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontWeight: 'bold' },
  sectionLabel: {
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 4,
  },
  input: { marginTop: 2 },
  row: { flexDirection: 'row' },
  hariLabel: { marginBottom: 8 },
  hariRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  hariBtn: {
    borderRadius: 8,
    minWidth: 50,
  },
  divider: { marginVertical: 14 },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 4,
  },
  btn: { flex: 1, borderRadius: 12 },
});
