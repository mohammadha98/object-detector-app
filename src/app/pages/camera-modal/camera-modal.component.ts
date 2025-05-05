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
import { camera, close, checkmarkCircle } from 'ionicons/icons';
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
  @ViewChild('canvasElement') canvasElement!: ElementRef;
  apiService = inject(ApiService);
  router = inject(Router);
  stream: MediaStream | null = null;
  isLoading: boolean = false;
  hasError: boolean = false;
  
  // Stability detection properties
  private stabilityCheckInterval: any;
  private stableStartTime: number | null = null;
  private previousImageData: ImageData | null = null;
  private stabilityThreshold = 5; // Percentage of pixels that can change while still considering the image stable
  private requiredStableTime = 5000; // 5 seconds in milliseconds
  isStable: boolean = false;
  stableTimeElapsed: number = 0;
  stableProgress: number = 0;

  constructor(private modalController: ModalController) {
    addIcons({
      camera,
      close,
      checkmarkCircle
    });
  }

  ngOnInit() {
    this.startCamera();
  }

  ngOnDestroy() {
    this.stopCamera();
    this.stopStabilityCheck();
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
        
        // Wait for video to be ready before starting stability check
        this.videoElement.nativeElement.onloadedmetadata = () => {
          this.startStabilityCheck();
        };
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

  /**
   * Starts checking for camera feed stability
   * Analyzes frames at regular intervals to detect if the image is stable
   */
  startStabilityCheck() {
    // Clear any existing interval
    this.stopStabilityCheck();
    
    // Reset stability tracking
    this.stableStartTime = null;
    this.previousImageData = null;
    this.isStable = false;
    this.stableTimeElapsed = 0;
    this.stableProgress = 0;
    
    // Start checking for stability every 200ms
    this.stabilityCheckInterval = setInterval(() => {
      this.checkImageStability();
    }, 200);
  }
  
  /**
   * Stops the stability check interval
   */
  stopStabilityCheck() {
    if (this.stabilityCheckInterval) {
      clearInterval(this.stabilityCheckInterval);
      this.stabilityCheckInterval = null;
    }
  }
  
  /**
   * Checks if the current camera frame is stable compared to the previous frame
   * If stable for the required time, logs a message and updates UI
   */
  checkImageStability() {
    if (!this.videoElement || !this.canvasElement) return;
    
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Ensure video is playing and has dimensions
    if (video.readyState !== video.HAVE_ENOUGH_DATA || !video.videoWidth) return;
    
    // Set canvas dimensions to match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data for analysis
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // If we have a previous frame to compare with
    if (this.previousImageData) {
      const isCurrentlyStable = this.compareFrames(this.previousImageData, currentImageData);
      
      const currentTime = Date.now();
      
      if (isCurrentlyStable) {
        // If we just became stable, record the start time
        if (this.stableStartTime === null) {
          this.stableStartTime = currentTime;
        }
        
        // Calculate how long we've been stable
        const stableTime = currentTime - this.stableStartTime;
        this.stableTimeElapsed = stableTime;
        this.stableProgress = Math.min(100, (stableTime / this.requiredStableTime) * 100);
        
        // If stable for required time
        if (stableTime >= this.requiredStableTime && !this.isStable) {
          console.log('Camera feed has been stable for 5 seconds');
          this.captureImage();
          this.isStable = true;
          
          // Optional: Auto-capture when stable
          // this.captureImage();
        }
      } else {
        // Reset stability tracking if movement detected
        this.stableStartTime = null;
        this.stableTimeElapsed = 0;
        this.stableProgress = 0;
        this.isStable = false;
      }
    }
    
    // Save current frame for next comparison
    this.previousImageData = currentImageData;
  }
  
  /**
   * Compares two frames to determine if the image is stable
   * @param previous Previous frame's ImageData
   * @param current Current frame's ImageData
   * @returns true if the frames are similar enough to be considered stable
   */
  compareFrames(previous: ImageData, current: ImageData): boolean {
    // Skip pixels for performance (check every 10th pixel)
    const pixelStep = 10;
    const data1 = previous.data;
    const data2 = current.data;
    
    let diffPixels = 0;
    let totalPixelsChecked = 0;
    
    // Compare pixels (RGBA values)
    for (let i = 0; i < data1.length; i += 4 * pixelStep) {
      totalPixelsChecked++;
      
      // Calculate difference in RGB values (ignore alpha)
      const diffR = Math.abs(data1[i] - data2[i]);
      const diffG = Math.abs(data1[i + 1] - data2[i + 1]);
      const diffB = Math.abs(data1[i + 2] - data2[i + 2]);
      
      // If any color channel has changed significantly
      if (diffR > 25 || diffG > 25 || diffB > 25) {
        diffPixels++;
      }
    }
    
    // Calculate percentage of pixels that changed
    const percentChanged = (diffPixels / totalPixelsChecked) * 100;
    
    // Image is stable if percentage of changed pixels is below threshold
    return percentChanged < this.stabilityThreshold;
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