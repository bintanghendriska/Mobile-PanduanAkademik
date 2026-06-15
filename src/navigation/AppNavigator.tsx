import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';

import BottomTabNavigator from './BottomTabNavigator';
import SplashScreen from '../screens/SplashScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import EditCourseScreen from '../screens/EditCourseScreen';
import AcademicInfoScreen from '../screens/AcademicInfoScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{ title: 'Detail Mata Kuliah' }}
      />
      <Stack.Screen
        name="EditCourse"
        component={EditCourseScreen}
        options={{ title: 'Edit Mata Kuliah' }}
      />
      <Stack.Screen
        name="InformasiKampus"
        component={AcademicInfoScreen}
        options={{ title: 'Informasi Kampus' }}
      />
    </Stack.Navigator>
  );
}
