import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonFooter,
  ModalController,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, close } from 'ionicons/icons';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-camera-modal',
  templateUrl: './camera-modal.component.html',
  styleUrls: ['./camera-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonFooter,
    IonSpinner
  ]
})
export class CameraModalComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef;
  apiService = inject(ApiService);
  router = inject(Router);
  stream: MediaStream | null = null;
  isLoading: boolean = false;
  hasError: boolean = false;

  constructor(private modalController: ModalController) {
    addIcons({
      camera,
      close
    });
  }

  ngOnInit() {
    this.startCamera();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  async startCamera() {
    try {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Browser does not support getUserMedia API');
        return;
      }

      // Get video stream
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use the back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      // Set the stream to the video element
      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }

  stopCamera() {
    if (this.stream) {
      const tracks = this.stream.getTracks();
      tracks.forEach(track => track.stop());
      this.stream = null;
    }
  }

  async captureImage() {
    if (!this.videoElement || !this.stream) {
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    const video = this.videoElement.nativeElement;

    // Create canvas to capture the image
    const canvas = document.createElement('canvas');
    
    // Compress image by reducing dimensions
    // Target max width/height (adjust these values based on your needs)
    const maxWidth = 800;
    const maxHeight = 600;
    
    // Calculate new dimensions while maintaining aspect ratio
    let width = video.videoWidth;
    let height = video.videoHeight;
    
    if (width > height) {
      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width));
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = Math.round(width * (maxHeight / height));
        height = maxHeight;
      }
    }
    
    // Set canvas to the new dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Draw the video frame onto the resized canvas
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, width, height);

    try {
      // Convert canvas to blob with reduced quality (0.7 instead of 0.95)
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, 'image/jpeg', 0.7); // Reduced quality for better compression
      });

      console.log(`Compressed image size: ${Math.round(blob.size / 1024)} KB`);
      const imageFile = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      
      // Send the file to the API service and navigate to result page
      this.apiService.analyzeImage(imageFile).subscribe({
        next: (response) => {
          console.log('API Response:', response);
          this.isLoading = false;
          this.modalController.dismiss();
          
          this.router.navigate(['/result'], { 
            state: { 
              description: response.description,
              audioUrl: response.audio_url,
              imageFile: imageFile
            }
          });
        },
        error: (error) => {
          console.error('Error analyzing image:', error);
          this.isLoading = false;
          this.hasError = true;
        }
      });
    } catch (error) {
      console.error('Error capturing image:', error);
      this.isLoading = false;
      this.hasError = true;
    }
  }

  retryCapture() {
    this.hasError = false;
    this.captureImage();
  }

  closeModal() {
    this.modalController.dismiss();
  }
}