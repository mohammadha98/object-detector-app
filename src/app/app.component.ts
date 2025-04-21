import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { IonApp, IonRouterOutlet, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { PlaySoundComponent } from './pages/play-sound/play-sound.component';

interface AudioData {
  label: string;
  audio_base64: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonApp, 
    IonRouterOutlet,
    CommonModule,

  ],
})
export class AppComponent implements OnInit {




  ngOnInit() {

  }
}
