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
import { CustomLightTheme, CustomDarkTheme } from './src/constants/theme';
import AppNavigator from './src/navigation/AppNavigator';

// Separate component so it can consume SettingsContext after it's provided
function AppContent() {
  const { settings } = useSettingsContext();
  const theme = settings.darkMode ? CustomDarkTheme : CustomLightTheme;

  return (
    <PaperProvider theme={theme}>
      <StatusBar
        barStyle={settings.darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.primary}
      />
      <NavigationContainer theme={theme}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <StudentProvider>
          <CourseProvider>
            <GradeProvider>
              <AppContent />
            </GradeProvider>
          </CourseProvider>
        </StudentProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
