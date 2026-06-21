import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';

import { SettingsProvider, useSettingsContext } from './src/contexts/SettingsContext';
import { StudentProvider } from './src/contexts/StudentContext';
import { CourseProvider } from './src/contexts/CourseContext';
import { GradeProvider } from './src/contexts/GradeContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import {
  CustomLightTheme,
  CustomDarkTheme,
  AppNavigationLightTheme,
  AppNavigationDarkTheme,
} from './src/constants/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { useBackgroundSync } from './src/hooks/useBackgroundSync';
import { useForegroundSync } from './src/hooks/useForegroundSync';
// Importing this triggers TaskManager.defineTask() at module load — must
// happen before the task could ever be invoked by the OS.
import './src/tasks/backgroundSyncTask';

// Separate component so it can consume SettingsContext after it's provided
function AppContent() {
  const { settings } = useSettingsContext();
  const theme = settings.darkMode ? CustomDarkTheme : CustomLightTheme;
  const navTheme = settings.darkMode ? AppNavigationDarkTheme : AppNavigationLightTheme;

  useBackgroundSync();
  useForegroundSync();

  return (
    <PaperProvider theme={theme}>
      <StatusBar
        barStyle={settings.darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.primary}
      />
      <NavigationContainer theme={navTheme}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NetworkProvider>
        <SettingsProvider>
          <StudentProvider>
            <CourseProvider>
              <GradeProvider>
                <AppContent />
              </GradeProvider>
            </CourseProvider>
          </StudentProvider>
        </SettingsProvider>
      </NetworkProvider>
    </GestureHandlerRootView>
  );
}
