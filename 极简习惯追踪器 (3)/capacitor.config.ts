import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.minimalhabit.app',
  appName: '极简习惯追踪器',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
