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
  IonProgressBar,
  IonBackButton,
  IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, imageOutline, volumeHigh, share } from 'ionicons/icons';
import { VoiceService } from '../../services/voice.service';
import { Router } from '@angular/router';

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
  // Properties for the detected object
  description: string = '';
  fullDescription: string = ''; // Store the full description
  audioUrl: string = '';
  isPlaying: boolean = false;
  audioElement: HTMLAudioElement | null = null;
  imageFile: File | null = null;
  private typingInterval: any; // Interval for typing effect
  private typingSpeed = 50; // Milliseconds per character

  constructor(
    private router: Router
  ) {
    // Initialize icons
    addIcons({
      camera,
      imageOutline,
      volumeHigh,
      share
    });

    // Get the navigation state data
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      description: string;
      audioUrl: string;
      imageFile: File;
    };

    if (state) {
      this.fullDescription = state.description; // Store full description
      this.audioUrl = state.audioUrl;
      this.imageFile = state.imageFile;
    } else {
      // Handle case where state is missing, maybe navigate back or show error
      console.error('Result component loaded without state.');
      this.fullDescription = 'No description available.'; // Default or error message
    }
  }


  ngOnInit() {
    if (this.audioUrl) {
      this.audioElement = new Audio(this.audioUrl);
      this.audioElement.addEventListener('ended', () => {
        this.isPlaying = false;
      });
      this.audioElement.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        this.isPlaying = false;
      });
      // Wait for audio metadata to load to get duration
      this.audioElement.addEventListener('loadedmetadata', () => {
        if (this.audioElement && this.audioElement.duration && this.fullDescription.length > 0) {
          // Calculate typingSpeed so that the typing effect matches the audio duration
          this.typingSpeed = (this.audioElement.duration * 1000) / this.fullDescription.length;
        }
        this.startTypingEffect();
        this.playVoiceFeedback();
      });
    } else {
      this.startTypingEffect();
    }
  }

  ngOnDestroy() {
    // Clear the interval when the component is destroyed
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    // Stop audio if playing
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }

  // Start the typing effect for the description
  startTypingEffect() {
    let index = 0;
    this.description = ''; // Start with empty description

    this.typingInterval = setInterval(() => {
      if (index < this.fullDescription.length) {
        this.description += this.fullDescription.charAt(index);
        index++;
      } else {
        clearInterval(this.typingInterval); // Stop when done
      }
    }, this.typingSpeed);
  }

  // Play audio description
  playVoiceFeedback() {
    if (!this.audioElement || this.isPlaying) return;

    this.isPlaying = true;
    this.audioElement.play().catch(error => {
      console.error('Error playing audio:', error);
      this.isPlaying = false;
    });
  }

  // Navigate back to capture screen
  captureAgain() {
    console.log('Navigating back to capture screen');
    this.router.navigate(['/home']);
  }

}
