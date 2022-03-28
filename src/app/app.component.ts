import { Component } from '@angular/core';

// Imports
import { CapacitorGoogleMaps } from '@capacitor-community/capacitor-googlemaps-native';
import { appGlobal } from './const';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    CapacitorGoogleMaps.initialize({
      key: appGlobal.mapsKey
    });
  }
}
