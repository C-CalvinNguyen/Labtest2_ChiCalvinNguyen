import { Component, OnInit } from '@angular/core';
import { DatabaseService, Location } from '../services/database.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {

  // Used to display list of locations
  locations: Location[] = [];

  constructor(private databaseService: DatabaseService) { }

  // Gets locations from databaseService
  ngOnInit() {
    this.databaseService.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.databaseService.getLocations().subscribe(data => {
          this.locations = data;
        });
      }
    });
  }

  // Pass ID to delete Function, calls databaseService.deleteLocation
  async deleteLocation(id) {
    await this.databaseService.deleteLocation(id);
  }

}
