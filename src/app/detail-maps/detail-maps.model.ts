export interface Marker {
  lat: number;
  lng: number;
  label?: string;
  infoWindow?: string;
  draggable?: boolean;
}

export interface RenderOptions  {
  polylineOptions?: PolylineOptions;
}

export interface PolylineOptions {
  strokeColor?: string;
  strokeOpacity?: string;
  strokeWeight?: string;
}
