import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  start = {lat: 10.833005196244207, lng: 106.60854060961879};
  current = {lat: 10.801911233020885, lng: 106.6445933275653};
  end = {lat: 10.79701280099909, lng: 106.6726422619954};
  ngOnInit() {

  }

  updateLocation(item: {lat: number, lng: number}) {
    this.current = item;
    console.log(this.current);
  }
}
