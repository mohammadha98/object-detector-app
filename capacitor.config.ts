import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'object-identifier-app',
  webDir: 'www',
  plugins: {
    Camera: {
      // Camera plugin configuration
      // Allow users to save copies of photos to their photo gallery
      presentationStyle: 'fullscreen',
      // Preserve original image metadata when saving to gallery
      saveToGallery: true
    }
  },
  android: {
    // Android specific configuration
    // permissions: [
    //   'android.permission.CAMERA',
    //   'android.permission.READ_EXTERNAL_STORAGE',
    //   'android.permission.WRITE_EXTERNAL_STORAGE'
    // ]
  }
};

export default config;
