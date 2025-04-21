import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonButton, 
  IonIcon, 
  IonSpinner,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { VoiceService } from '../../services/voice.service';
import { addIcons } from 'ionicons';
import { volumeHigh, download } from 'ionicons/icons';

@Component({
  selector: 'app-play-sound',
  templateUrl: './play-sound.component.html',
  styleUrls: ['./play-sound.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
    IonSpinner,

  ]
})
export class PlaySoundComponent implements OnInit {
  @Input() audioBase64: string = '';
  @Input() label: string = '';
  
  isPlaying: boolean = false;
  audioUrl: string | null = null;

  constructor(private voiceService: VoiceService) {
    addIcons({
      volumeHigh,
      download
    });
  }

  ngOnInit() {
    // Create audio URL when component initializes if we have base64 data
    if (this.audioBase64) {
      this.audioUrl = this.voiceService.base64ToAudioUrl(this.audioBase64, 'audio/mp3');
      console.log('Audio URL created:', this.audioUrl ? 'Success' : 'Failed');
    }
  }

  async playAudio() {
    if (!this.audioBase64) {
      console.error('No audio data available');
      return;
    }

    try {
      console.log('Attempting to play audio, data starts with:', this.audioBase64.substring(0, 20) + '...');
      this.isPlaying = true;
      await this.voiceService.playBase64Audio(this.audioBase64);
      console.log('Audio playback completed successfully');
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      this.isPlaying = false;
    }
  }

  downloadAudio() {
    if (!this.audioBase64) {
      console.error('No audio data available');
      return;
    }

    try {
      const fileName = this.label ? `${this.label}.mp3` : 'audio.mp3';
      this.voiceService.downloadBase64Audio(this.audioBase64, fileName, 'audio/mp3');
    } catch (error) {
      console.error('Error downloading audio:', error);
    }
  }

  ngOnDestroy() {
    // Clean up the audio URL when component is destroyed
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
  }
}
