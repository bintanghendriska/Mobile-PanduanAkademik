import { NavigatorScreenParams } from '@react-navigation/native';
import { Course } from '../types';

export type BottomTabParamList = {
  Home: undefined;
  'Mata Kuliah': undefined;
  Profil: undefined;
  Pengaturan: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Main: NavigatorScreenParams<BottomTabParamList> | undefined;
  CourseDetail: { course: Course };
  EditCourse: { course: Course };
  InformasiKampus: undefined;
};
