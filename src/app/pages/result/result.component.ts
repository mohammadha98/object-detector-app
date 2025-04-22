import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBackButton,
  IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, imageOutline, volumeHigh, share } from 'ionicons/icons';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonBackButton,
    IonButtons,
  ]
})
export class ResultComponent implements OnInit, OnDestroy {
  description: string = '';
  fullDescription: string = '';
  audioUrl: string = '';
  isPlaying: boolean = false;
  audioElement: HTMLAudioElement | null = null;
  imageFile: File | null = null;
  private typingInterval: any;
  private typingSpeed = 50;
  private navigationSubscription: any;

  constructor(
    private router: Router
  ) {
    addIcons({
      camera,
      imageOutline,
      volumeHigh,
      share
    });

    // Subscribe to router events to detect when component is reused
    this.navigationSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.initializeData();
      });
  }

  private initializeData() {
    // Reset previous state
    this.reset();
    
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      description: string;
      audioUrl: string;
      imageFile: File;
    };
  
    if (state) {
      this.fullDescription = state.description;
      // Append a unique query parameter to the audio URL to prevent caching
      this.audioUrl = `${state.audioUrl}?t=${new Date().getTime()}`;
      this.imageFile = state.imageFile;
      this.setupAudio();
    } else {
      console.error('Result component loaded without state.');
      this.fullDescription = 'No description available.';
    }
  }

  private setupAudio() {
    // Ensure any existing audio element is properly cleaned up
    if (this.audioElement) {
      // Remove all event listeners to prevent memory leaks
      this.audioElement.removeEventListener('ended', () => {});
      this.audioElement.removeEventListener('error', () => {});
      this.audioElement.removeEventListener('loadedmetadata', () => {});
      
      // Stop playback and reset
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement.load();
      this.audioElement = null;
    }
    
    // Revoke any existing object URLs to prevent memory leaks
    if (this.audioUrl && this.audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.audioUrl);
    }
    
    if (this.audioUrl) {
      // Create a completely new audio element with the new URL
      this.audioElement = new Audio(this.audioUrl);
      
      // Add event listeners to the new audio element
      const endedHandler = () => {
        this.isPlaying = false;
      };
      
      const errorHandler = (e: Event) => {
        console.error('Audio playback error:', e);
        this.isPlaying = false;
      };
      
      const metadataHandler = () => {
        if (this.audioElement && this.audioElement.duration && this.fullDescription.length > 0) {
          this.typingSpeed = (this.audioElement.duration * 1000) / this.fullDescription.length;
        }
        this.startTypingEffect();
        this.playVoiceFeedback();
      };
      
      this.audioElement.addEventListener('ended', endedHandler);
      this.audioElement.addEventListener('error', errorHandler);
      this.audioElement.addEventListener('loadedmetadata', metadataHandler);
    } else {
      this.startTypingEffect();
    }
  }

  ngOnInit() {
    this.initializeData();
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
    this.reset();
  }

  startTypingEffect() {
    let index = 0;
    this.description = '';

    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }

    this.typingInterval = setInterval(() => {
      if (index < this.fullDescription.length) {
        this.description += this.fullDescription.charAt(index);
        index++;
      } else {
        clearInterval(this.typingInterval);
      }
    }, this.typingSpeed);
  }

  playVoiceFeedback() {
    if (!this.audioElement || this.isPlaying) return;

    this.isPlaying = true;
    this.audioElement.play().catch(error => {
      console.error('Error playing audio:', error);
      this.isPlaying = false;
    });
  }

  reset() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    if (this.audioElement) {
      // Remove all event listeners to prevent memory leaks
      this.audioElement.removeEventListener('ended', () => {});
      this.audioElement.removeEventListener('error', () => {});
      this.audioElement.removeEventListener('loadedmetadata', () => {});
      
      // Stop playback and reset
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement.load();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }
    
    // Revoke any existing object URLs to prevent memory leaks
    if (this.audioUrl && this.audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.audioUrl);
    }
    
    this.description = '';
    this.isPlaying = false;
    this.audioUrl = '';
  }

  captureAgain() {
    console.log('Navigating back to capture screen');
    this.reset();
    this.router.navigate(['/home']);
  }
}
