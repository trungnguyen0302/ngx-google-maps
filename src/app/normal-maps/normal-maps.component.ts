import { Component, OnInit, ViewChild, ElementRef, NgZone, Output, EventEmitter } from '@angular/core';
import { MouseEvent, MapsAPILoader } from '@agm/core';
declare var google: any;
import { Marker } from './normal-maps.model';

@Component({
  selector: 'normal-maps',
  templateUrl: './normal-maps.component.html',
  styleUrls: ['./normal-maps.component.scss']
})

export class NormalMapsComponent implements OnInit {
  @Output() location = new EventEmitter<{lat: number, lng: number}>();
  zoom = 8;
  lat: number;
  lng: number;
  infoWindow: string;
  markers: Marker[] = [];
  dir = null;
  distance: string;
  duration: string;
  position = 0;
  startElementFocus = true;

  @ViewChild('start') public startElement: ElementRef;
  @ViewChild('end') public endElement: ElementRef;

  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {}

  ngOnInit() {
    this.setCurrentPosition();
    this.loadLocation();
  }

  private setCurrentPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }

  loadLocation() {
    this.mapsAPILoader.load().then(() => {
      this.changeStart();
      this.changeEnd();
    });
  }

  changeStart() {
    const start = new google.maps.places.Autocomplete( this.startElement.nativeElement, { types: ['address'] });
    start.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place: google.maps.places.PlaceResult = start.getPlace();
        if (place.geometry === undefined || place.geometry === null) { return; }
        this.lat = place.geometry.location.lat();
        this.lng = place.geometry.location.lng();
        this.infoWindow = this.startElement.nativeElement.value;
        this.addMarker(0);
        this.getDirection();
      });
    });
  }

  changeEnd() {
    const end = new google.maps.places.Autocomplete( this.endElement.nativeElement, { types: ['address'] });
    end.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place: google.maps.places.PlaceResult = end.getPlace();
        if (place.geometry === undefined || place.geometry === null) { return; }
        this.lat = place.geometry.location.lat();
        this.lng = place.geometry.location.lng();
        this.infoWindow = this.endElement.nativeElement.value;
        this.addMarker(1);
        this.getDirection();
      });
    });
  }

  getDirection() {
    if (this.markers[0] !== undefined && this.markers[1] !== undefined) {
      this.dir = {
        origin: { lat: this.markers[0].lat, lng: this.markers[0].lng },
        destination: { lat: this.markers[1].lat, lng: this.markers[1].lng }
      };

      this.getDistance();
    }
  }

  async getDistance() {
    const origin = new google.maps.LatLng(this.markers[0].lat, this.markers[0].lng);
    const destination = new google.maps.LatLng(this.markers[1].lat, this.markers[1].lng);
    const request = {
      origins: [origin],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING
    };

    const response = await this.getDistanceMatrix(request);
    const result = response.rows[0].elements[0];
    this.distance = result.distance.text;
    this.duration = result.duration.text;
  }

  private getDistanceMatrix(data) {
    const service = new google.maps.DistanceMatrixService();
    return new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
      service.getDistanceMatrix(data, (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK) {
          resolve(response);
        } else {
          reject(response);
        }
      });
    });
  }

  private addMarker(position: number) {
    const item: Marker = {
      lat: this.lat,
      lng: this.lng,
      infoWindow: this.infoWindow,
      draggable: true
    };

    if (position === 0) {
      this.addStart(item);
    } else {
      this.addEnd(item);
    }

    this.markers = this.markers;
  }

  private addStart(item: Marker) {
    item.label = 'A';
    if (this.markers.length > 0) {
      this.markers[0] = item;
    } else {
      this.markers.push(item);
    }
  }

  private addEnd(item: Marker) {
    item.label = 'B';
    if (this.markers.length === 2) {
      this.markers[1] = item;
    } else {
      this.markers.push(item);
    }
  }

  clickedMarker(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`);
  }

  markerDragEnd(m: Marker, $event: MouseEvent) {
    console.log('dragEnd', m, $event);
  }

  async mapClicked($event) {
    this.lat = $event.coords.lat;
    this.lng = $event.coords.lng;
    await this.getInfoWindow();
    this.addMarker(this.position);
    this.updateInput();
    this.markers = this.markers;
    this.getDirection();
    this.location.emit({lat: this.lat, lng: this.lng});
  }

  async getInfoWindow() {
    const result = await this.geocodeLatLng();
    this.infoWindow = result.formatted_address;
  }

  private geocodeLatLng(): Promise<google.maps.GeocoderResult> {
    const geocoder = new google.maps.Geocoder;
    const latlng = {lat: this.lat, lng: this.lng};
    return new Promise<google.maps.GeocoderResult>((resolve, reject) => {
      geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
          resolve(results[0]);
        } else {
          reject();
        }
      });
    });
  }

  updateInput() {
    if (this.position === 0) {
      this.endElement.nativeElement.focus();
      this.startElement.nativeElement.value = this.infoWindow;
    } else {
      this.endElement.nativeElement.value = this.infoWindow;
    }
  }
}
