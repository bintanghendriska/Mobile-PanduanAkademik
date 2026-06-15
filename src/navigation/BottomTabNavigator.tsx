import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme, Text as PaperText } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import CoursesScreen from '../screens/CoursesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { BottomTabParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface TabMeta {
  icon: IconName;
  iconActive: IconName;
  label: string;
}

const TAB_META: Record<keyof BottomTabParamList, TabMeta> = {
  Home: { icon: 'home-outline', iconActive: 'home', label: 'Beranda' },
  'Mata Kuliah': {
    icon: 'book-open-outline',
    iconActive: 'book-open-variant',
    label: 'Matkul',
  },
  Profil: {
    icon: 'account-outline',
    iconActive: 'account',
    label: 'Profil',
  },
  Pengaturan: {
    icon: 'cog-outline',
    iconActive: 'cog',
    label: 'Pengaturan',
  },
};

export default function BottomTabNavigator() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const TAB_HEIGHT = 60;
  const BOTTOM_PADDING = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const meta = TAB_META[route.name as keyof BottomTabParamList];
        return {
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? [styles.activeIconWrap, { backgroundColor: theme.colors.primaryContainer }] : styles.iconWrap}>
              <MaterialCommunityIcons
                name={focused ? meta.iconActive : meta.icon}
                size={22}
                color={color}
              />
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <PaperText
              variant="labelSmall"
              style={{
                color,
                fontWeight: focused ? '700' : '500',
                fontSize: 10,
                marginTop: 1,
              }}
            >
              {meta.label}
            </PaperText>
          ),
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.outline,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 0,
            height: TAB_HEIGHT + BOTTOM_PADDING,
            paddingBottom: BOTTOM_PADDING,
            paddingTop: 8,
            elevation: 16,
            shadowColor: theme.dark ? '#000' : '#1A237E',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: theme.dark ? 0.4 : 0.08,
            shadowRadius: 16,
          },
          tabBarItemStyle: {
            paddingTop: 6,
          },
          headerShown: false,
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Mata Kuliah" component={CoursesScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
      <Tab.Screen name="Pengaturan" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  activeIconWrap: {
    width: 52,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
});
