declare namespace google.maps {
  export interface Map {
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    addListener(eventName: string, handler: (...args: any[]) => void): any;
  }
  export class Map {
    constructor(element: HTMLElement, options?: any);
  }

  export interface Marker {
    setPosition(latLng: LatLng | LatLngLiteral): void;
    getPosition(): LatLng | null | undefined;
    addListener(eventName: string, handler: (...args: any[]) => void): any;
  }
  export class Marker {
    constructor(options?: any);
  }

  export class Geocoder {
    geocode(request: any, callback?: (results: any[], status: any) => void): Promise<any>;
  }

  export namespace Animation {
    export const DROP: any;
  }

  export class Point {
    constructor(x: number, y: number);
  }

  export namespace places {
    export class Autocomplete {
      constructor(inputField: HTMLInputElement, opts?: any);
      addListener(eventName: string, handler: (...args: any[]) => void): any;
      getPlace(): any;
    }
  }

  export interface MapMouseEvent {
    latLng: LatLng | null;
  }

  export interface LatLng {
    lat(): number;
    lng(): number;
  }

  export interface LatLngLiteral {
    lat: number;
    lng: number;
  }
}
