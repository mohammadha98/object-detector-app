import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonFooter,
  ModalController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, close } from 'ionicons/icons';

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
    IonFooter
  ]
})
export class CameraModalComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef;
  
  stream: MediaStream | null = null;
  
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
  
  captureImage() {
    if (!this.videoElement || !this.stream) {
      return;
    }
    
    const video = this.videoElement.nativeElement;
    
    // Create canvas to capture the image
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg');
    
    // Close the modal and return the image data
    this.modalController.dismiss({
      imageData: imageData
    });
  }
  
  closeModal() {
    this.modalController.dismiss();
  }
}