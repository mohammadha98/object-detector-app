import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor() { }

  /**
   * Take a photo using the device camera
   * @returns Promise with the captured photo data
   */
  async takePhoto(): Promise<Photo> {
    // Request camera permissions
    const permissionStatus = await Camera.checkPermissions();
    if (permissionStatus.camera !== 'granted') {
      await Camera.requestPermissions();
    }

    // Take the picture
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      saveToGallery: true
    });

    return image;
  }

  /**
   * Select a photo from the device gallery
   * @returns Promise with the selected photo data
   */
  async selectFromGallery(): Promise<Photo> {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });

    return image;
  }
  
  /**
   * Capture an image using either camera or gallery selection
   * Provides a prompt for the user to choose the source
   * @returns Promise with the captured photo data
   */
  async captureImage(): Promise<Photo | null> {
    try {
      // Check if running on web platform
      const platform = await this.getPlatform();
      
      if (platform === 'web') {
        // Web-specific implementation
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Prompt,
          promptLabelHeader: 'Select Image Source',
          promptLabelPhoto: 'Take Photo',
          promptLabelPicture: 'Choose from Gallery',
          webUseInput: true,
          presentationStyle: 'popover'
        });
        return image;
      } else {
        // Native platform implementation
        const permissionStatus = await Camera.checkPermissions();
        if (permissionStatus.camera !== 'granted') {
          await Camera.requestPermissions();
        }

        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Prompt,
          promptLabelHeader: 'Select Image Source',
          promptLabelPhoto: 'Take Photo',
          promptLabelPicture: 'Choose from Gallery'
        });
        return image;
      }
    } catch (error: any) {
      // Handle specific platform errors
      if (error.message?.includes('User denied access')) {
        console.error('Camera access denied by user');
      } else if (error.message?.includes('Camera not available')) {
        console.error('Camera not available on this device or browser');
      } else {
        console.error('Error capturing image:', error);
      }
      return null;
    }
  }

  // Helper method to determine the platform
  private async getPlatform(): Promise<string> {
    if (typeof window !== 'undefined' && window.navigator) {
      return 'web';
    }
    return 'native';
  }

  /**
   * Convert a photo to a base64 string
   * @param photo The photo to convert
   * @returns Promise with the base64 string
   */
  async getPhotoBase64(photo: Photo): Promise<string> {
    // If the photo is already a base64 string, return it
    if (photo.base64String) {
      return `data:image/jpeg;base64,${photo.base64String}`;
    }
    
    // Otherwise, fetch the photo data from the URI
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
