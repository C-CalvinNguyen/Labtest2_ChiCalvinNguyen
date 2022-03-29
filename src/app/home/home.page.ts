import { Component, ElementRef, ViewChild } from '@angular/core';
import { CapacitorGoogleMaps } from '@capacitor-community/capacitor-googlemaps-native';
import { Geolocation } from '@capacitor/geolocation';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  // Used to display map
  @ViewChild('map') mapView: ElementRef;

  // Used to save current marker ID
  currentMarker: any;

  // Used for state of tracking
  isTracking = false;

  // Used to save current geolocation.watchPosition ID
  currentWatch: any;

  // Used to save geolocation only once when pressing tracking button
  savedTracking = false;

  constructor(private databaseService: DatabaseService) {}

  // When view opens create map
  ionViewDidEnter() {
    this.createMap();
  }

  // Create CapacitorGoogleMap, and set dimensions to div and has default latitude, longitude etc
  createMap() {
    const boundRect = this.mapView.nativeElement.getBoundingClientRect() as DOMRect;
    console.log('boundingRect', boundRect);

    CapacitorGoogleMaps.create({
      width: Math.round(boundRect.width),
      height: Math.round(boundRect.height),
      x: Math.round(boundRect.x),
      y: Math.round(boundRect.y),
      latitude: 38.685516,
      longitude: -101.073324,
      zoom: 12,
      liteMode: true
    });
  }

  // Called when pressing "Track Position Button"
  trackPosition(){

    // If it is not currently tracking, set tracking to true
    if (this.isTracking === false) {
      this.isTracking = true;

      Geolocation.requestPermissions().then(async permission => {
        console.log(permission);

        // Track the user
        const tempWatch = await Geolocation.watchPosition({enableHighAccuracy: true, maximumAge: 10000}, (pos, err) => {

          // If the data hasnt been saved this time, save it once
          if (this.savedTracking === false) {
            this.databaseService.addLocation(new Date(pos.timestamp).toString(), pos.timestamp, pos.coords.latitude, pos.coords.longitude);
            this.savedTracking = true;
          }

          // If there is a current marker set, delete it
          if (this.currentMarker) {
            CapacitorGoogleMaps.removeMarker({id: this.currentMarker});
          }

          // Set camera to new position
          CapacitorGoogleMaps.setCamera({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            zoom: 15,
            bearing: 0
          });

          // Add marker to new position
          CapacitorGoogleMaps.addMarker({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          }).then((value: any) => {
            this.currentMarker = value.marker.id;
          });
        });

        // set current watchPosition ID to this.currentWatch
        this.currentWatch = tempWatch;

      });
    } else {
      // If isTracking is TRUE, clear watch when user presses "Stop Tracking"
      // sets savedTracking and isTracking to false, so we can add data again.
      Geolocation.clearWatch({id: this.currentWatch});
      this.isTracking = false;
      this.savedTracking = false;
    }
  }

  // When view leaves, delete map
  ionViewDidLeave() {
    CapacitorGoogleMaps.close();
  }

}
