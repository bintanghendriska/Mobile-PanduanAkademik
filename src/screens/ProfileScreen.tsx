import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStudent } from '../hooks/useStudent';
import { Student } from '../types';

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { student, updateStudent, loading } = useStudent();

  const [form, setForm] = useState<Omit<Student, 'jurusan'>>({
    nama: student.nama,
    nim: student.nim,
    semester: student.semester,
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ nama: student.nama, nim: student.nim, semester: student.semester });
  }, [student]);

  const handleSave = async () => {
    if (!form.nama.trim()) {
      Alert.alert('Error', 'Nama tidak boleh kosong.');
      return;
    }
    if (!form.nim.trim()) {
      Alert.alert('Error', 'NIM tidak boleh kosong.');
      return;
    }
    setSaving(true);
    try {
      await updateStudent(form);
      setEditing(false);
      Alert.alert('Berhasil', 'Profil berhasil diperbarui.');
    } catch {
      Alert.alert('Error', 'Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ nama: student.nama, nim: student.nim, semester: student.semester });
    setEditing(false);
  };

  const infoItems = [
    { label: 'Nama Lengkap', value: student.nama, icon: 'account' as const },
    { label: 'NIM', value: student.nim, icon: 'card-account-details-outline' as const },
    { label: 'Semester', value: student.semester, icon: 'calendar-month' as const },
    { label: 'Program Studi', value: student.jurusan, icon: 'school-outline' as const },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* Profile Header — padded for Dynamic Island / notch */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.colors.primary,
              paddingTop: insets.top + 28,
            },
          ]}
        >
          <View style={styles.avatarWrap}>
            <Image
              source={require('../../assets/profil.jpg')}
              style={styles.avatar}
            />
          </View>
          <Text variant="headlineSmall" style={styles.headerName}>{student.nama}</Text>
          <Text style={styles.headerSub}>{student.jurusan}</Text>
          <View style={styles.nimBadge}>
            <MaterialCommunityIcons name="card-account-details-outline" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.nimText}> NIM: {student.nim}</Text>
          </View>

          {/* Stat Row */}
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{student.semester}</Text>
              <Text style={styles.statLabel}>Semester</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>S1</Text>
              <Text style={styles.statLabel}>Jenjang</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>Aktif</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Info Card */}
          {!editing && (
            <Card mode="contained" style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>Data Mahasiswa</Text>
                <Divider style={styles.divider} />
                {infoItems.map((item, i) => (
                  <View key={item.label}>
                    <View style={styles.infoRow}>
                      <View style={[styles.infoIconWrap, { backgroundColor: theme.colors.primaryContainer }]}>
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={17}
                          color={theme.colors.primary}
                        />
                      </View>
                      <View style={styles.infoText}>
                        <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                          {item.label}
                        </Text>
                        <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                          {item.value}
                        </Text>
                      </View>
                    </View>
                    {i < infoItems.length - 1 && <Divider style={{ opacity: 0.4 }} />}
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          {/* Edit Form */}
          {editing && (
            <Card mode="contained" style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>Edit Profil</Text>
                <Divider style={styles.divider} />

                <TextInput
                  label="Nama Lengkap *"
                  value={form.nama}
                  onChangeText={(v) => setForm((f) => ({ ...f, nama: v }))}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="NIM *"
                  value={form.nim}
                  onChangeText={(v) => setForm((f) => ({ ...f, nim: v }))}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                />
                <TextInput
                  label="Semester"
                  value={form.semester}
                  onChangeText={(v) => setForm((f) => ({ ...f, semester: v }))}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </Card.Content>
            </Card>
          )}

          {/* Buttons */}
          {!editing ? (
            <Button
              mode="contained"
              icon="pencil"
              onPress={() => setEditing(true)}
              style={styles.btn}
              contentStyle={styles.btnContent}
              loading={loading}
            >
              Edit Profil
            </Button>
          ) : (
            <View style={styles.editActions}>
              <Button
                mode="outlined"
                onPress={handleCancel}
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
                Simpan
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarWrap: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  headerName: { color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, textAlign: 'center' },
  nimBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  nimText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  statRow: {
    flexDirection: 'row',
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: 12,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  body: { padding: 16 },
  card: { borderRadius: 16, marginBottom: 14 },
  cardTitle: { fontWeight: 'bold', marginBottom: 4 },
  divider: { marginVertical: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: { flex: 1 },
  input: { marginBottom: 10 },
  btn: { borderRadius: 12, flex: 1 },
  btnContent: { paddingVertical: 4 },
  editActions: { flexDirection: 'row' },
});
