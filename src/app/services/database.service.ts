import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Location {
  id: number;
  geoTimestamp: string;
  latitude: string;
  longitude: string;
};

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  locations = new BehaviorSubject([]);

  private db: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private platform: Platform, private sqlitePorter: SQLitePorter,
    private sqlite: SQLite, private http: HttpClient) {

      this.platform.ready().then(() => {
        this.sqlite.create({
          name: 'locations.db',
          location: 'default'
        })
        .then((db: SQLiteObject) => {
          this.db = db;
          this.dumpData();
        });
      });

    }

  dumpData() {
    this.http.get('assets/dump.sql', {responseType:'text'})
    .subscribe(sql => {
      this.sqlitePorter.importSqlToDb(this.db, sql)
      .then(_ => {
        this.loadLocations();
        this.dbReady.next(true);
      })
      .catch(err => console.error(err));
    });
  }

  getDatabaseState() {
    return this.dbReady.asObservable();
  }

  getLocations(): Observable<Location[]> {
    return this.locations.asObservable();
  }

  loadLocations() {
    return this.db.executeSql('SELECT * FROM location', []).then(data => {
      const locations: Location[] = [];

      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          locations.push({
            id: data.rows.item(i).id,
            geoTimestamp: data.rows.item(i).geoTimestamp,
            latitude: data.rows.item(i).latitude,
            longitude: data.rows.item(i).longitude
          });
        }
      }
      this.locations.next(locations);
    });
  }

  addLocation(timeStamp, latitude, longitude) {
    const data = [timeStamp, latitude, longitude];
    return this.db.executeSql('INSERT INTO location (geoTimestamp, latitude, longitude) VALUES (?, ?, ?)', data).then(tempData => {
      console.log('added data', tempData);
      this.loadLocations();
    });
  }

  deleteLocation(id) {
    return this.db.executeSql('DELETE FROM location WHERE id = ?', [id]).then(tempData => {
      console.log('deleted data', tempData);
      this.loadLocations();
    });
  }
}
