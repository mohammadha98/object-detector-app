import { Component, inject } from '@angular/core';
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
  ModalController,
  LoadingController,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, cameraOutline, imagesOutline } from 'ionicons/icons';
import { CameraService } from '../../services/camera.service';
import { Platform } from '@ionic/angular/standalone';
import { CameraModalComponent } from '../../pages/camera-modal/camera-modal.component';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

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
    IonCardContent,
    IonSpinner
  ],
})
export class HomePage {
  isLoading = false;
  router = inject(Router);

  constructor(
    private cameraService: CameraService,
    private platform: Platform,
    private modalController: ModalController,
    private apiService: ApiService,
    private loadingController: LoadingController
  ) {
    // Initialize icons
    addIcons({
      camera,
      cameraOutline,
      imagesOutline
    });
  }

  async handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.isLoading = true;

      try {
        // Send the file to the API for analysis
        const result = await this.apiService.analyzeImage(file).subscribe({
          next: (response) => {
            console.log('Analysis result:', result);
            this.router.navigate(['/result'], {
              state: {
                description: response.description,
                audioUrl: response.audio_url,
                imageFile: file
              }
            });
          },
          error: (error) => {
            console.error('Error analyzing image:', error);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } catch (error) {
        console.error('Error analyzing image:', error);
        this.isLoading = false;
      }
    }
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
    } catch (error: any) {
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
