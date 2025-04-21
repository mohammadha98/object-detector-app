import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
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
import { PlaySoundComponent } from '../play-sound/play-sound.component';
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
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonProgressBar,
    IonBackButton,
    IonButtons,
    PlaySoundComponent
  ]
})
export class ResultComponent implements OnInit {
  // Properties for the detected object
  objectName: string = 'Object';
  description: string = '';
  confidence: number = 0.95;
  audioUrl: string = '';
  isPlaying: boolean = false;
  audioElement: HTMLAudioElement | null = null;
  imageFile: File | null = null;

  constructor(
    private voiceService: VoiceService,
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
      this.description = state.description;
      this.audioUrl = state.audioUrl;
      this.imageFile = state.imageFile;
    }
  }


  ngOnInit() {
    if (this.audioUrl) {
      // Create audio element
      this.audioElement = new Audio(this.audioUrl);

      // Add event listeners
      this.audioElement.addEventListener('ended', () => {
        this.isPlaying = false;
      });

      this.audioElement.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        this.isPlaying = false;
      });

      // Auto-play the audio when the component loads
      this.playVoiceFeedback();
    }
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
