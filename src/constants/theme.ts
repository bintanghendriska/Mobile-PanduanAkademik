import {
  MD3LightTheme,
  MD3DarkTheme,
  adaptNavigationTheme,
} from 'react-native-paper';
import {
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';

const { LightTheme: NavLight, DarkTheme: NavDark } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export const CustomLightTheme = {
  ...MD3LightTheme,
  ...NavLight,
  fonts: MD3LightTheme.fonts,
  colors: {
    ...MD3LightTheme.colors,
    ...NavLight.colors,
    primary: '#1A237E',
    primaryContainer: '#E8EAF6',
    onPrimaryContainer: '#1A237E',
    secondary: '#009688',
    secondaryContainer: '#E0F2F1',
    onSecondaryContainer: '#004D40',
    background: '#F8F9FA',
    surface: '#FFFFFF',
  },
};

export const CustomDarkTheme = {
  ...MD3DarkTheme,
  ...NavDark,
  fonts: MD3DarkTheme.fonts,
  colors: {
    ...MD3DarkTheme.colors,
    ...NavDark.colors,
    primary: '#9FA8DA',
    primaryContainer: '#283593',
    onPrimaryContainer: '#FFFFFF',
    secondary: '#80CBC4',
    secondaryContainer: '#004D40',
    onSecondaryContainer: '#FFFFFF',
    background: '#121218',
    surface: '#1E1E24',
  },
};

// React Navigation's Theme type wants `fonts` shaped as { regular, medium,
// bold, heavy }, which is a different shape than Paper's MD3 typescale —
// CustomLightTheme/CustomDarkTheme above use the MD3 shape for PaperProvider.
// These two keep NavLight/NavDark's own `fonts` so NavigationContainer gets
// the shape it expects, while still sharing the same custom color palette.
export const AppNavigationLightTheme = {
  ...NavLight,
  colors: { ...NavLight.colors, ...CustomLightTheme.colors },
};

export const AppNavigationDarkTheme = {
  ...NavDark,
  colors: { ...NavDark.colors, ...CustomDarkTheme.colors },
};

export const CAMPUS_MAPS_URL =
  'https://maps.google.com/?q=Universitas+Islam+Riau,+Pekanbaru';
export const CAMPUS_PHONE = 'tel:+6276178870';
export const CAMPUS_WHATSAPP = 'https://wa.me/6281122334455';
export const CAMPUS_EMAIL = 'mailto:akademik@uir.ac.id';
export const CAMPUS_WEBSITE = 'https://uir.ac.id';

export const DEFAULT_STUDENT = {
  nama: 'Bintang Hendriska Valen',
  nim: '233510676',
  semester: '6',
  jurusan: 'Teknik Informatika (S1) — UIR',
};

export const DEFAULT_SETTINGS = {
  darkMode: false,
  notifikasi: true,
  backgroundSync: true,
};

// Total SKS above this is treated as "over the registration limit" for the
// background-sync deadline-warning notification.
export const MAX_SKS_THRESHOLD = 24;
