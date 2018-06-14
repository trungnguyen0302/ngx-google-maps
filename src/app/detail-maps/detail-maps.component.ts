import { Component, OnInit, ViewChild, ElementRef, NgZone, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MouseEvent, MapsAPILoader } from '@agm/core';
declare var google: any;
import { Marker } from './detail-maps.model';

@Component({
  selector: 'detail-maps',
  templateUrl: './detail-maps.component.html',
  styleUrls: ['./detail-maps.component.scss']
})

export class DetailMapsComponent implements OnInit, OnChanges {
  @Input() start: Marker;
  @Input() current: Marker;
  @Input() end: Marker;

  @Input() travelMode?: google.maps.TravelMode;
  zoom = 8;
  markers: Marker[] = [];
  completedMarkers: Marker[] = [];
  completed = null;
  processingMarkers: Marker[] = [];
  processing = null;
  totalDistance: string;
  totalDuration: string;
  currentDistance: string;
  currentDuration: string;

  renderRedOptions = {
    polylineOptions: {
      strokeColor: '#f00',
      strokeOpacity: 0.6,
      strokeWeight: 5,
    },
    markerOptions: {
      zIndex: 1
    },
    suppressMarkers: true
  };

  renderGreenOptions = {
    polylineOptions: {
      strokeColor: '#0f0',
      strokeOpacity: 0.6,
      strokeWeight: 5,
    },
    markerOptions: {
      zIndex: 2
    },
    suppressMarkers: true
  };

  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {}

  async ngOnInit() {
    await this.updateInfoWindow();
    this.updateLocation();
    this.setCurrentPosition();
    this.loadLocation();
  }

  async updateInfoWindow() {
    this.start.infoWindow = await this.getInfoWindow(this.start.lat, this.start.lng);
    this.end.infoWindow = await this.getInfoWindow(this.end.lat, this.end.lng);
    this.current.infoWindow = await this.getInfoWindow(this.current.lat, this.current.lng);
  }

  updateLocation() {
    this.markers = [this.start, this.end];
    this.completedMarkers = [this.start, this.current];
    this.processingMarkers = [this.current, this.end];
  }

  async ngOnChanges(changes: SimpleChanges) {
    this.current.infoWindow = await this.getInfoWindow(this.current.lat, this.current.lng);
    this.updateLocation();
    this.getDirection();
  }

  private setCurrentPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.zoom = 12;
      });
    }
  }

  loadLocation() {
    this.mapsAPILoader.load().then(() => {
      this.getDirection();
    });
  }

  getDirection() {
    this.completed = {
      origin: { lat: this.completedMarkers[0].lat, lng: this.completedMarkers[0].lng },
      destination: { lat: this.completedMarkers[1].lat, lng: this.completedMarkers[1].lng }
    };

    this.getDistance(this.completedMarkers);

    this.processing = {
      origin: { lat: this.processingMarkers[0].lat, lng: this.processingMarkers[0].lng },
      destination: { lat: this.processingMarkers[1].lat, lng: this.processingMarkers[1].lng }
    };
  }



  async getDistance(markers: Marker[]) {
    const origin = new google.maps.LatLng(markers[0].lat, markers[0].lng);
    const destination = new google.maps.LatLng(markers[1].lat, markers[1].lng);
    const request = {
      origins: [origin],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING
    };

    const response = await this.getDistanceMatrix(request);
    const result = response.rows[0].elements[0];
    this.totalDistance = result.distance.text;
    this.totalDuration = result.duration.text;
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

  async getInfoWindow(lat: number, lng: number) {
    const result = await this.geocodeLatLng(lat, lng);
    return result.formatted_address;
  }

  private geocodeLatLng(lat: number, lng: number): Promise<google.maps.GeocoderResult> {
    const geocoder = new google.maps.Geocoder();
    const latlng = {lat: lat, lng: lng};
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
}
