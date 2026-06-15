import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet, Alert, Animated } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { Course, GradeValue, GRADE_COLOR } from '../types';

interface Props {
  course: Course;
  grade?: GradeValue | null;
  index?: number;
  onPress: () => void;
  onDelete: () => void;
}

export default function CourseCard({ course, grade, index = 0, onPress, onDelete }: Props) {
  const theme = useTheme();
  const swipeRef = useRef<Swipeable>(null);

  // Entrance animation — staggered per card
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = Math.min(index * 60, 400);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDelete = () => {
    Alert.alert(
      'Hapus Mata Kuliah',
      `Hapus "${course.nama}"?`,
      [
        { text: 'Batal', style: 'cancel', onPress: () => swipeRef.current?.close() },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            swipeRef.current?.close();
            onDelete();
          },
        },
      ],
    );
  };

  const renderRightActions = () => (
    <TouchableOpacity
      style={[styles.deleteAction, { backgroundColor: theme.colors.error }]}
      onPress={handleDelete}
      activeOpacity={0.85}
    >
      <MaterialCommunityIcons name="trash-can-outline" size={22} color="#FFF" />
      <Text variant="labelSmall" style={styles.deleteLabel}>Hapus</Text>
    </TouchableOpacity>
  );

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
      >
        <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
          <Surface
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            elevation={1}
          >
            {/* SKS Badge */}
            <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text style={[styles.sksNum, { color: theme.colors.primary }]} variant="titleLarge">
                {course.sks}
              </Text>
              <Text style={[styles.sksLabel, { color: theme.colors.primary }]} variant="labelSmall">
                SKS
              </Text>
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text variant="titleSmall" style={styles.nama} numberOfLines={1}>
                {course.nama}
              </Text>
              <Text variant="bodySmall" style={[styles.kode, { color: theme.colors.primary }]}>
                {course.kode}
              </Text>
              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="account-tie" size={12} color={theme.colors.outline} />
                <Text
                  variant="bodySmall"
                  style={[styles.dosen, { color: theme.colors.outline }]}
                  numberOfLines={1}
                >
                  {' '}{course.dosen}
                </Text>
              </View>
              {(course.hari || course.jam) ? (
                <View style={styles.metaRow}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color={theme.colors.secondary} />
                  <Text
                    variant="bodySmall"
                    style={[styles.jadwal, { color: theme.colors.secondary }]}
                    numberOfLines={1}
                  >
                    {' '}{[course.hari, course.jam].filter(Boolean).join(' • ')}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Grade Badge + Arrow */}
            <View style={styles.right}>
              {grade ? (
                <View style={[styles.gradeBadge, { backgroundColor: GRADE_COLOR[grade] }]}>
                  <Text style={styles.gradeText}>{grade}</Text>
                </View>
              ) : null}
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.colors.outline}
              />
            </View>
          </Surface>
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  badge: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  sksNum: { fontWeight: 'bold', lineHeight: 22 },
  sksLabel: { fontWeight: '700' },
  info: { flex: 1, gap: 2 },
  nama: { fontWeight: 'bold' },
  kode: { fontWeight: '700', fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  dosen: { flex: 1 },
  jadwal: {},
  right: { alignItems: 'center', gap: 4, marginLeft: 4 },
  gradeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gradeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  deleteAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 10,
    gap: 4,
  },
  deleteLabel: { color: '#FFF', fontWeight: '700' },
});
