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
  IonCardContent 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, cameraOutline, imagesOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
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
  constructor() {
    // Initialize icons
    addIcons({
      camera,
      cameraOutline,
      imagesOutline
    });
  }


async captureImage() {

}
}
