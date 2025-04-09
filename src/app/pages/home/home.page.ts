import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonCard, 
  IonCardContent,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, cameraOutline, imagesOutline } from 'ionicons/icons';
import { CameraService } from '../../services/camera.service';
import { Platform } from '@ionic/angular/standalone';
import { CameraModalComponent } from '../../pages/camera-modal/camera-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton, 
    IonIcon, 
    IonCard, 
    IonCardContent
  ],
})
export class HomePage {
  constructor(
    private cameraService: CameraService,
    private platform: Platform,
    private modalController: ModalController
  ) {
    // Initialize icons
    addIcons({
      camera,
      cameraOutline,
      imagesOutline
    });
  }

  async captureImage() {
    try {
      if (this.platform.is('capacitor')) {
        // Use the camera service for mobile platforms
        const image = await this.cameraService.captureImage();
        
        // Handle the captured image
        if (image) {
          console.log('Image captured successfully');
          // TODO: Handle the captured image data
          return image;
        }
      } else {
        // For web platform, use the Web API with Angular modal
        return await this.captureImageWeb();
      }
      return null;
    } catch (error:any) {
      console.error('Error capturing image:', error);
      return null;
    }
  }

  private async captureImageWeb(): Promise<string | null> {
    try {
      // Open camera modal component
      const modal = await this.modalController.create({
        component: CameraModalComponent,
        cssClass: 'camera-modal'
      });
      
      await modal.present();
      
      // Get the data from the modal when it's dismissed
      const { data } = await modal.onDidDismiss();
      
      // Return the captured image data if available
      return data?.imageData || null;
    } catch (error) {
      console.error('Error accessing camera:', error);
      return null;
    }
  }
}
